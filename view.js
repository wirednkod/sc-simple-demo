export const emojis = {
    banknote: "💵",
    brick: "🧱",
    chain: "🔗",
    chequeredFlag: "🏁",
    clock: "🕒",
    info: "ℹ️",
    newspaper: "🗞️",
    seedling: "🌱",
    stethoscope: "🩺",
    tick: "✅",
};
export default class UI {
    options;
    model;
    container;
    syncState;
    syncMessage;
    constructor(options, model) {
        this.options = options;
        this.model = model;
        const container = document.getElementById(this.options.containerId);
        if (container === null) {
            throw Error("Could not find the container. Did you change the Html?");
        }
        this.container = container;
    }
    timeElapsed = (from, till) => {
        return ((till - from) / 1000).toFixed(2);
    };
    timestampHtml = (withTime) => {
        const timestampDiv = document.createElement("time");
        if (!withTime) {
            return timestampDiv;
        }
        const time = performance.now();
        timestampDiv.appendChild(document.createTextNode(`${new Date().toLocaleTimeString()} (${this.timeElapsed(this.model.loadTime, time)}s)`));
        return timestampDiv;
    };
    messageHtml = (message, withTime) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.appendChild(this.timestampHtml(withTime));
        messageDiv.appendChild(document.createTextNode(message));
        return messageDiv;
    };
    errorHtml = (message) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add("error");
        messageDiv.appendChild(document.createTextNode(message));
        return messageDiv;
    };
    displayMessage = (message) => {
        this.container.appendChild(message);
    };
    error = (error) => {
        this.displayMessage(this.errorHtml(error.message));
        throw error;
    };
    log = (message, withTime) => {
        this.displayMessage(this.messageHtml(message, withTime));
    };
    insertAtTopOfContainer = (el) => {
        if (this.container.firstChild == null) {
            this.container.appendChild(el);
        }
        else {
            this.container.insertBefore(el, this.container.firstChild);
        }
    };
    ensureClassOn = (el, className) => {
        if (!el.classList.contains(className)) {
            el.classList.add(className);
        }
    };
    showSyncing = () => {
        if (!this.syncMessage) {
            // message container
            const syncState = document.createElement("div");
            syncState.classList.add("message");
            //contents - empty timestamp and pulsing message
            syncState.appendChild(this.timestampHtml());
            const syncMessage = document.createElement("em");
            syncMessage.classList.add("pulse");
            syncMessage.innerHTML = `${emojis.chain} Chain is syncing...`;
            syncState.appendChild(syncMessage);
            this.syncMessage = syncMessage;
            this.syncState = syncState;
            this.insertAtTopOfContainer(this.syncState);
        }
        else {
            // Cover case that we change from synced state back to syncing.
            this.syncMessage.innerHTML = `${emojis.chain} Chain is syncing...`;
            this.ensureClassOn(this.syncMessage, "pulse");
        }
    };
    showSynced = () => {
        if (!this.syncState || !this.syncMessage) {
            throw new Error("There is no sync state UI to update. You should have called `showSyncing()` first.");
        }
        this.syncMessage.classList.remove("pulse");
        this.syncMessage.innerHTML = `${emojis.tick} Chain synced!`;
    };
}
