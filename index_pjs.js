import "regenerator-runtime/runtime";
import UI, { emojis } from "./view";
import { ApiPromise, WsProvider } from "@polkadot/api";
window.onload = () => {
    const loadTime = performance.now();
    const ui = new UI({ containerId: "messages" }, { loadTime });
    ui.showSyncing();
    void (async () => {
        try {
            const provider = new WsProvider("wss://rpc.polkadot.io");
            const api = await ApiPromise.create({ provider });
            const header = await api.rpc.chain.getHeader();
            const chainName = await api.rpc.system.chain();
            // Show chain constants - from chain spec
            ui.log(`${emojis.seedling} client ready`, true);
            ui.log(`${emojis.info} Connected to ${chainName}: syncing will start at block #${header.number}`);
            ui.log(`${emojis.chequeredFlag} Genesis hash is ${api.genesisHash.toHex()}`);
            ui.log(`${emojis.banknote} ExistentialDeposit is ${api.consts.balances.existentialDeposit.toHuman()}`);
            // Show how many peers we are syncing with
            const health = await api.rpc.system.health();
            const peers = health.peers.toNumber() === 1 ? "1 peer" : `${health.peers} peers`;
            ui.log(`${emojis.stethoscope} Chain is syncing with ${peers}`);
            // Check the state of syncing every 2s and update the syncing state message
            //
            // Resolves the first time the chain is fully synced so we can wait before
            // adding subscriptions. Carries on pinging to keep the UI consistent
            // in case syncing stops or starts.
            const wait = (ms) => new Promise((res) => {
                setTimeout(res, ms);
            });
            const waitForChainToSync = async () => {
                const health = await api.rpc.system.health();
                if (health.isSyncing.eq(false)) {
                    ui.showSynced();
                }
                else {
                    ui.showSyncing();
                    await wait(2000);
                    await waitForChainToSync();
                }
            };
            await waitForChainToSync();
            ui.log(`${emojis.newspaper} Subscribing to new block headers`);
            await api.rpc.chain.subscribeNewHeads((lastHeader) => {
                ui.log(`${emojis.brick} New block #${lastHeader.number} has hash ${lastHeader.hash}`);
            });
        }
        catch (error) {
            ui.error(error);
        }
    })();
};
