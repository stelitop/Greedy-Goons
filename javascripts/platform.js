class Platform {

    northBridge;
    southBridge;
    westBridge;
    eastBridge;
    loot;

    constructor() {
        this.northBridge = this.southBridge = this.westBridge = this.eastBridge = null;
        this.loot = null;
    }
}

export default { Platform }