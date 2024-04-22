import "regenerator-runtime/runtime";
import UI, { emojis } from "./view";
import { dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { chainSpec } from "polkadot-api/chains/polkadot";
import { start } from "polkadot-api/smoldot";
const { name } = JSON.parse(chainSpec);
window.onload = () => {
    const loadTime = performance.now();
    const ui = new UI({ containerId: "messages" }, { loadTime });
    ui.showSyncing();
    void (async () => {
        try {
            const smoldot = start();
            const chain = await smoldot.addChain({ chainSpec });
            const client = createClient(getSmProvider(chain));
            // To interact with the chain, you need to get the `TypedApi`, which includes
            // all the types for every call in that chain:
            const dotApi = client.getTypedApi(dot);
            const runtime = await dotApi.runtime.latest();
            const latestHeader = await client.getBlockHeader();
            // // Show chain constants - from chain spec
            ui.log(`${emojis.seedling} client ready`, true);
            ui.log(`${emojis.info} Connected to ${name}: syncing will start at block #${latestHeader.number}`);
            // ui.log(
            //   `${emojis.chequeredFlag} Genesis hash is ${api.genesisHash.toHex()}`,
            // )
            ui.log(`${emojis.banknote} ExistentialDeposit is ${dotApi.constants.Balances.ExistentialDeposit(runtime)}`);
            ui.log(`${emojis.newspaper} Subscribing to new block headers`);
            client.finalizedBlock$.subscribe((finalizedBlock) => {
                ui.showSynced();
                ui.log(`${emojis.brick} New block #${finalizedBlock.number} has hash ${finalizedBlock.hash} `);
            });
        }
        catch (error) {
            ui.error(error);
        }
    })();
};
