import * as THREE from 'three';
import { GAME_CONSTANTS, UNIT_COMMANDS, BUILDING_TYPES } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * AI Controller - Manages AI player behavior
 * Different personalities determine how the AI plays
 */
export class AIController {
    constructor(game, team, personality = 'balanced') {
        this.game = game;
        this.team = team;
        this.personality = personality;

        // AI state
        this.updateInterval = 1.0; // Update AI decisions every second
        this.timeSinceLastUpdate = 0;
        this.state = 'building'; // building, attacking, defending, expanding

        // Personality traits (overridden by specific personalities)
        this.traits = {
            aggression: 0.5,        // 0-1: How quickly to attack
            economy: 0.5,           // 0-1: Focus on resource gathering
            expansion: 0.5,         // 0-1: How quickly to expand
            defense: 0.5,           // 0-1: How defensive to be
            workerCount: 5,         // Target number of workers
            fighterCount: 10,       // Target number of fighters
            attackThreshold: 5,     // Minimum fighters before attacking
        };

        this.applyPersonality(personality);

        console.log(`AI Controller created for team ${team} with personality: ${personality}`, this.traits);
    }

    applyPersonality(personality) {
        switch (personality) {
            case 'aggressive':
                this.traits = {
                    aggression: 0.9,
                    economy: 0.3,
                    expansion: 0.4,
                    defense: 0.2,
                    workerCount: 3,
                    fighterCount: 15,
                    attackThreshold: 3,
                };
                break;

            case 'defensive':
                this.traits = {
                    aggression: 0.2,
                    economy: 0.6,
                    expansion: 0.3,
                    defense: 0.9,
                    workerCount: 6,
                    fighterCount: 8,
                    attackThreshold: 10,
                };
                break;

            case 'economic':
                this.traits = {
                    aggression: 0.3,
                    economy: 0.9,
                    expansion: 0.7,
                    defense: 0.4,
                    workerCount: 10,
                    fighterCount: 5,
                    attackThreshold: 8,
                };
                break;

            case 'balanced':
            default:
                this.traits = {
                    aggression: 0.5,
                    economy: 0.5,
                    expansion: 0.5,
                    defense: 0.5,
                    workerCount: 5,
                    fighterCount: 10,
                    attackThreshold: 5,
                };
                break;
        }
    }

    update(deltaTime) {
        this.timeSinceLastUpdate += deltaTime;

        if (this.timeSinceLastUpdate >= this.updateInterval) {
            this.timeSinceLastUpdate = 0;
            this.makeDecisions();
        }
    }

    makeDecisions() {
        // Count current units
        const myUnits = this.getMyUnits();
        const workers = myUnits.filter(u => u.type === 'worker');
        const fighters = myUnits.filter(u => u.type === 'fighter');
        const myBuildings = this.getMyBuildings();
        const townHall = myBuildings.find(b => b.type === BUILDING_TYPES.TOWN_HALL);

        if (!townHall) {
            console.log('AI: No town hall, cannot make decisions');
            return;
        }

        // Decision priority based on personality
        const decisions = [];

        // 1. Train workers if below target
        if (workers.length < this.traits.workerCount) {
            decisions.push({
                priority: this.traits.economy * 10,
                action: () => this.trainWorker(townHall)
            });
        }

        // 2. Train fighters if below target
        if (fighters.length < this.traits.fighterCount) {
            decisions.push({
                priority: this.traits.aggression * 8,
                action: () => this.trainFighter(townHall)
            });
        }

        // 3. Build barracks if we don't have one
        const barracks = myBuildings.find(b => b.type === BUILDING_TYPES.BARRACKS);
        if (!barracks && this.canAfford(GAME_CONSTANTS.BARRACKS_COST)) {
            decisions.push({
                priority: 7,
                action: () => this.buildBarracks()
            });
        }

        // 4. Assign idle workers to gather resources
        const idleWorkers = workers.filter(w => w.getStatus() === 'Idle');
        if (idleWorkers.length > 0) {
            decisions.push({
                priority: this.traits.economy * 9,
                action: () => this.assignWorkersToResources(idleWorkers)
            });
        }

        // 5. Attack if we have enough fighters
        if (fighters.length >= this.traits.attackThreshold) {
            decisions.push({
                priority: this.traits.aggression * 6,
                action: () => this.attackEnemy(fighters)
            });
        }

        // 6. Defend if under attack
        const enemyUnits = this.getEnemyUnits();
        const enemiesNearBase = enemyUnits.filter(e => {
            const dist = MathUtils.distance2D(e.position, townHall.position);
            return dist < 30;
        });

        if (enemiesNearBase.length > 0) {
            decisions.push({
                priority: this.traits.defense * 15,
                action: () => this.defendBase(fighters, enemiesNearBase)
            });
        }

        // Sort by priority and execute highest priority action
        decisions.sort((a, b) => b.priority - a.priority);

        if (decisions.length > 0) {
            decisions[0].action();
        }
    }

    // === AI Actions ===

    trainWorker(townHall) {
        const cost = GAME_CONSTANTS.WORKER_COST;
        const resources = this.getMyResources();

        if (resources.gold >= cost.gold) {
            console.log(`AI (${this.personality}): Training worker`);
            townHall.trainUnit('worker');
        }
    }

    trainFighter(building) {
        const cost = GAME_CONSTANTS.FIGHTER_COST;
        const resources = this.getMyResources();

        if (resources.gold >= cost.gold && resources.wood >= cost.wood) {
            console.log(`AI (${this.personality}): Training fighter`);
            building.trainUnit('fighter');
        }
    }

    buildBarracks() {
        const cost = GAME_CONSTANTS.BARRACKS_COST;
        const resources = this.getMyResources();

        if (resources.gold >= cost.gold && resources.wood >= cost.wood) {
            console.log(`AI (${this.personality}): Building barracks`);

            const townHall = this.getMyBuildings().find(b => b.type === BUILDING_TYPES.TOWN_HALL);
            if (townHall) {
                const buildPos = new THREE.Vector3(
                    townHall.position.x + 15,
                    0,
                    townHall.position.z + 10
                );

                // Deduct resources manually since AI doesn't use UI
                this.game.resources.gold -= cost.gold;
                this.game.resources.wood -= cost.wood;

                const barracks = this.game.createBuilding(BUILDING_TYPES.BARRACKS, buildPos, this.team);
            }
        }
    }

    assignWorkersToResources(workers) {
        const resources = this.game.buildings.filter(b =>
            b.resourceType && (b.resourceType === 'gold' || b.resourceType === 'wood')
        );

        if (resources.length === 0) return;

        workers.forEach(worker => {
            // Find closest resource node
            let closestResource = null;
            let closestDistance = Infinity;

            resources.forEach(resource => {
                const dist = MathUtils.distance2D(worker.position, resource.position);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestResource = resource;
                }
            });

            if (closestResource) {
                worker.setCommand(UNIT_COMMANDS.GATHER, closestResource);
            }
        });

        console.log(`AI (${this.personality}): Assigned ${workers.length} workers to gather resources`);
    }

    attackEnemy(fighters) {
        const enemyUnits = this.getEnemyUnits();
        const enemyBuildings = this.getEnemyBuildings();

        // Prioritize enemy units, then buildings
        const targets = [...enemyUnits, ...enemyBuildings];

        if (targets.length === 0) return;

        // Find closest target to our base
        const myBase = this.getMyBuildings().find(b => b.type === BUILDING_TYPES.TOWN_HALL);
        if (!myBase) return;

        targets.sort((a, b) => {
            const distA = MathUtils.distance2D(a.position, myBase.position);
            const distB = MathUtils.distance2D(b.position, myBase.position);
            return distA - distB;
        });

        const target = targets[0];

        // Send fighters to attack
        fighters.forEach(fighter => {
            if (fighter.currentCommand !== UNIT_COMMANDS.ATTACK) {
                fighter.setCommand(UNIT_COMMANDS.ATTACK, target);
            }
        });

        console.log(`AI (${this.personality}): Attacking with ${fighters.length} fighters`);
    }

    defendBase(fighters, enemies) {
        if (enemies.length === 0) return;

        // Attack closest enemy
        const target = enemies[0];

        fighters.forEach(fighter => {
            fighter.setCommand(UNIT_COMMANDS.ATTACK, target);
        });

        console.log(`AI (${this.personality}): Defending base against ${enemies.length} enemies`);
    }

    // === Helper Functions ===

    getMyUnits() {
        return this.game.units.filter(u => u.team === this.team && u.alive);
    }

    getEnemyUnits() {
        return this.game.units.filter(u => u.team !== this.team && u.alive);
    }

    getMyBuildings() {
        return this.game.buildings.filter(b => b.team === this.team && b.alive);
    }

    getEnemyBuildings() {
        return this.game.buildings.filter(b => b.team !== this.team && b.team !== 2 && b.alive);
    }

    getMyResources() {
        // For now, AI shares resources with game
        // In multiplayer, each team would have separate resources
        return this.game.resources;
    }

    canAfford(cost) {
        const resources = this.getMyResources();
        return resources.gold >= (cost.gold || 0) && resources.wood >= (cost.wood || 0);
    }
}
