import "regenerator-runtime/runtime"
import UI, { emojis } from "./view"

import { dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { chainSpec } from "polkadot-api/chains/polkadot";
import { start } from "polkadot-api/smoldot";

window.onload = () => {
  const loadTime = performance.now()
  const ui = new UI({ containerId: "messages" }, { loadTime })
  ui.showSyncing()
  void (async () => {
    try {
      const smoldot = start();
      const chain = await smoldot.addChain({ chainSpec });

      const client = createClient(
        getSmProvider(chain)
      );

      // To interact with the chain, you need to get the `TypedApi`, which includes
      // all the types for every call in that chain:
      const dotApi = client.getTypedApi(dot);

      console.log("-- ",);

      // const header = await api.rpc.chain.getHeader()
      // const chainName = await api.rpc.system.chain()

      // // Show chain constants - from chain spec
      ui.log(`${emojis.seedling} client ready`, true)
      // ui.log(
      //   `${emojis.info} Connected to ${chainName}: syncing will start at block #${header.number}`,
      // )
      // ui.log(
      //   `${emojis.chequeredFlag} Genesis hash is ${api.genesisHash.toHex()}`,
      // )
      ui.log(
        `${emojis.banknote
        } ExistentialDeposit is ${dotApi.constants.Balances.ExistentialDeposit.toString()}`,
      )


      // Show how many peers we are syncing with
      // const health = await api.rpc.system.health()
      // const peers =
      //   health.peers.toNumber() === 1 ? "1 peer" : `${health.peers} peers`

      // ui.log(`${emojis.stethoscope} Chain is syncing with ${peers}`)

      ui.log(`${emojis.newspaper} Subscribing to new block headers`)
      client.finalizedBlock$.subscribe((finalizedBlock: { number: any; hash: any; }) => {
        ui.showSynced()
        ui.log(
          `${emojis.brick} New block #${finalizedBlock.number} has hash ${finalizedBlock.hash}`,
        )
      }
      );
    } catch (error) {
      ui.error(<Error>error)
    }
  })()
}
