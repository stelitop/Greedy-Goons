class Loot {
    name;
    goldValue;
    rarity;

    /**
     * 
     * @param {String} name 
     * @param {Number} goldValue 
     * @param {"Common" | "Rare" | "Epic" | "Legendary"} rarity 
     */
    constructor(name, goldValue, rarity) {
        this.name = name;
        this.goldValue = goldValue;
        this.rarity = rarity;
    }
}

const testLoot = [
    new Loot("Common Loot", 50, "Common"),
    new Loot("Rare Loot", 250, "Rare"),
    new Loot("Epic Loot", 1250, "Epic"),
    new Loot("Legendary Loot", 6250, "Legendary")
]

export default { Loot, testLoot }