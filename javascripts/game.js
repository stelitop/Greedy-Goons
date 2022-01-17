import Platform from "../javascripts/platform.js"
import Bridge from "../javascripts/bridge.js"
import Loot from "../javascripts/loot.js"

class Game {
    platforms

    constructor() {
        this.platforms = [
            [new Platform.Platform(), new Platform.Platform(), new Platform.Platform(), new Platform.Platform()],
            [new Platform.Platform(), new Platform.Platform(), new Platform.Platform(), new Platform.Platform()],
            [new Platform.Platform(), new Platform.Platform(), new Platform.Platform(), new Platform.Platform()],
            [new Platform.Platform(), new Platform.Platform(), new Platform.Platform(), new Platform.Platform()]
        ]   

        this.fillBridges();

        this.platforms[2][3].southBridge = new Bridge.Bridge();
    }

    /**
     * Sets a bridge between two platforms with coordinates (x1, y1) and (x2, y2)
     * @param {0 | 1 | 2 | 3} x1 
     * @param {0 | 1 | 2 | 3} y1 
     * @param {0 | 1 | 2 | 3} x2 
     * @param {0 | 1 | 2 | 3} y2 
     * @param {Bridge} bridge 
     * @returns {boolean} True if |dx| + |dy| = 1 and all coordinates are in the range [0, 4), false otherwise.
     */
    setBridge(x1, y1, x2, y2, bridge) {
        if (Math.abs(x1 - x2) + Math.abs(y1 - y2) != 1) return false;
        if (x1 < 0 || x2 < 0 || y1 < 0 || y2 < 0 || x1 >= 4 || x2 >= 4 || y1 >= 4 || y2 >= 4) return false;

        if (x1 - x2 == -1) {
            this.platforms[x1][y1].eastBridge = this.platforms[x2][y2].westBridge = bridge;
        } else if (x1 - x2 == 1) {
            this.platforms[x1][y1].westBridge = this.platforms[x2][y2].eastBridge = bridge;
        } else if (y1 - y2 == -1) {
            this.platforms[x1][y1].southBridge = this.platforms[x2][y2].northBridge = bridge;
        } else if (y1 - y2 == 1) {
            this.platforms[x1][y1].northBridge = this.platforms[x2][y2].southBridge = bridge;
        } else return false;

        return true;
    }

    /**
     * Sets bridges between every two orthogonally adjacent platforms
     */
    fillBridges() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.setBridge(i, j, i, j+1, new Bridge.Bridge());
                this.setBridge(j, i, j+1, i, new Bridge.Bridge());
            }
        }
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    drawDev(canvas) {
        const tileSz = 81;
        canvas.width = canvas.height = tileSz*9;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillStyle = "#000000";
                ctx.fillRect((2*i+1)*tileSz, (2*j+1)*tileSz, tileSz, tileSz);
                
                if (this.platforms[i][j].loot != null) {
                    if (this.platforms[i][j].loot.rarity == "Common") ctx.fillStyle = "#808080";
                    else if (this.platforms[i][j].loot.rarity == "Rare") ctx.fillStyle = "#0094FF";
                    else if (this.platforms[i][j].loot.rarity == "Epic") ctx.fillStyle = "#B200FF";
                    else if (this.platforms[i][j].loot.rarity == "Legendary") ctx.fillStyle = "#FF6A00";
                    
                    ctx.fillRect((2*i+4/3)*tileSz, (2*j+4/3)*tileSz, (1/3)*tileSz, (1/3)*tileSz);
                }

                ctx.fillStyle = "#000000";
                if (this.platforms[i][j].northBridge != null) ctx.fillRect((2*i+4/3)*tileSz, (2*j)*tileSz, (1/3)*tileSz, tileSz);
                if (this.platforms[i][j].southBridge != null) ctx.fillRect((2*i+4/3)*tileSz, (2*j+2)*tileSz, (1/3)*tileSz, tileSz);
                if (this.platforms[i][j].westBridge != null) ctx.fillRect((2*i)*tileSz, (2*j+4/3)*tileSz, tileSz, (1/3)*tileSz);
                if (this.platforms[i][j].eastBridge != null) ctx.fillRect((2*i+2)*tileSz, (2*j+4/3)*tileSz, tileSz, (1/3)*tileSz);
            }
        }
    }

    /**
     * 
     * @param {Array<Loot>} lootOptions 
     */
    fillLoot(lootOptions) {
        const weights = {
            "Common": 0.60,
            "Rare": 0.20,
            "Epic": 0.13,
            "Legendary": 0.07
        }
        var amounts = {
            "Common": 7,
            "Rare": 3,
            "Epic": 2,
            "Legendary": 1
        }
        let lootByRarity = {
            "Common": [],
            "Rare": [],
            "Epic": [],
            "Legendary": []
        }
        for (let i = 0; i < 3; i++) {
            let r = Math.random();
            let compound = 0;
            for (let key in weights) {
                compound += weights[key];
                if (compound > r) {
                    amounts[key]++;
                    break;
                }
            }
        }

        for (let i = 0; i < lootOptions.length; i++) {
            lootByRarity[lootOptions[i].rarity].push(lootOptions[i]);
        }
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let total = 0;
                for (let key in amounts) total += amounts[key];    
                const selector = Math.floor(Math.random()*total);  
                let compound = 0;          
                let selectedRarity = null;
                for (let key in amounts) {
                    compound += amounts[key];
                    if (compound > selector) {
                        selectedRarity = key;
                        amounts[key]--;
                        break;
                    }
                }
                let choice = Math.floor(Math.random()*lootByRarity[selectedRarity].length);
                this.platforms[i][j].loot = lootByRarity[selectedRarity][choice];
            }
        }
    }

    collapseBridges() {
        this.fillBridges();
        var edges = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                edges.push([i*4+j, i*4+j+1]);
                edges.push([j*4+i, j*4+i+4]);
            }
        }
        //edges.sort((a, b) => 0.5 - Math.random()); //not very random currently ngl, should do random insert
        for (let i = edges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = edges[i];
            edges[i] = edges[j];
            edges[j] = temp;
        }
        //alert(edges);
        // Kruskal's Algorithm
        let group = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        let getGroup = function(el) {
            if (group[el] == el) return el;
            return getGroup(group[el]);
        }

        //alert(edges);

        let spanning = [];
        for (let i = 0; i < edges.length; i++) {
            //console.log(edges[i][0] + " " + edges[i][1]);
            if (getGroup(edges[i][0]) != getGroup(edges[i][1])) {
                //alert(getGroup(edges[i][0]) + " " + getGroup(edges[i][1]))
                group[getGroup(edges[i][0])] = getGroup(edges[i][1]);
                //alert(getGroup(edges[i][0]) + " " + getGroup(edges[i][1]))
                spanning.push(edges[i]);
                edges.splice(i, 1);
                i--;
                if (spanning.length == 15) {
                    break;
                }
            } else {
                //...
            }
        }

        for (let i = 0; i < edges.length; i++) {
            const chance = 0.30;
            if (Math.random() < chance) {
                edges.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < edges.length; i++) {

            let x1 = Math.floor(edges[i][0]/4), y1 = edges[i][0]%4, x2 = Math.floor(edges[i][1]/4), y2 = edges[i][1]%4;
            //alert(x1 + " " + y1 + " " + x2 + " " + y2)
            this.setBridge(x1, y1, x2, y2, null);
        }
    }
}

export default { Game }

let x = new Game();
x.fillLoot(Loot.testLoot);
x.collapseBridges();
x.drawDev(document.getElementById("gamecanvas"));
//alert(JSON.stringify(x))