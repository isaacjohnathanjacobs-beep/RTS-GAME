import { Unit } from './Unit.js';
import { GAME_CONSTANTS, UNIT_TYPES, UNIT_COMMANDS, RESOURCE_TYPES, ANIMATION_STATES } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Worker extends Unit {
    constructor(game, position, team = 0) {
        super(game, position, team);

        this.type = UNIT_TYPES.WORKER;
        this.maxHealth = GAME_CONSTANTS.WORKER_HP;
        this.health = this.maxHealth;

        // Worker-specific properties
        this.carryingResource = null;
        this.carryAmount = 0;
        this.targetResource = null;
        this.gatherProgress = 0;

        this.updateHealthBar();
    }

    getUnitColor() {
        // Workers are blue (player) or light red (enemy)
        return this.team === 0 ? 0x3399ff : 0xff6666;
    }

    setCommand(command, target = null) {
        super.setCommand(command, target);

        if (command === UNIT_COMMANDS.GATHER && target) {
            this.startGathering(target);
        } else if (command === UNIT_COMMANDS.BUILD && target) {
            this.startBuilding(target);
        }
    }

    startGathering(resource) {
        this.targetResource = resource;
        this.currentCommand = UNIT_COMMANDS.GATHER;
        this.moveTo(resource.position);
    }

    startBuilding(buildingPosition) {
        this.currentCommand = UNIT_COMMANDS.BUILD;
        this.moveTo(buildingPosition);
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Handle gathering
        if (this.currentCommand === UNIT_COMMANDS.GATHER && this.targetResource) {
            const distance = MathUtils.distance2D(this.position, this.targetResource.position);

            if (this.carryAmount >= GAME_CONSTANTS.CARRY_CAPACITY) {
                // Return resources to town hall
                this.returnResources();
            } else if (distance < 2) {
                // Gather resources
                this.gatherResources(deltaTime);
            } else if (!this.path) {
                // Move to resource
                this.moveTo(this.targetResource.position);
            }
        }

        // Handle returning resources
        if (this.carryingResource && this.carryAmount > 0) {
            const townHall = this.findNearestTownHall();
            if (townHall) {
                const distance = MathUtils.distance2D(this.position, townHall.position);
                if (distance < GAME_CONSTANTS.RESOURCE_RETURN_DISTANCE) {
                    this.dropOffResources(townHall);
                }
            }
        }

        super.update(deltaTime);
    }

    gatherResources(deltaTime) {
        if (!this.targetResource) return;

        this.gatherProgress += deltaTime;

        if (this.gatherProgress >= 1 / GAME_CONSTANTS.GATHER_RATE) {
            this.carryAmount += 1;
            this.gatherProgress = 0;

            if (!this.carryingResource) {
                this.carryingResource = this.targetResource.resourceType;
            }

            // Show gathering animation
            if (this.animationController && this.animationController.getState() !== ANIMATION_STATES.IDLE) {
                this.animationController.setState(ANIMATION_STATES.IDLE);
            }
        }
    }

    returnResources() {
        const townHall = this.findNearestTownHall();
        if (townHall) {
            this.moveTo(townHall.position);
        }
    }

    dropOffResources(townHall) {
        if (this.carryingResource && this.carryAmount > 0) {
            // Add resources to player's stockpile
            if (this.carryingResource === RESOURCE_TYPES.GOLD) {
                this.game.resources.gold += this.carryAmount;
            } else if (this.carryingResource === RESOURCE_TYPES.WOOD) {
                this.game.resources.wood += this.carryAmount;
            }

            this.carryAmount = 0;
            this.carryingResource = null;

            // Continue gathering if still commanded
            if (this.currentCommand === UNIT_COMMANDS.GATHER && this.targetResource) {
                this.moveTo(this.targetResource.position);
            }
        }
    }

    findNearestTownHall() {
        let nearest = null;
        let nearestDistance = Infinity;

        for (const building of this.game.buildings) {
            if (building.type === 'town_hall' && building.team === this.team) {
                const distance = MathUtils.distance2D(this.position, building.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = building;
                }
            }
        }

        return nearest;
    }

    getInfo() {
        const info = super.getInfo();
        info.type = 'Worker';
        info.carrying = this.carryingResource ? `${this.carryingResource}: ${this.carryAmount}` : 'None';
        info.status = this.getStatus();
        return info;
    }

    getStatus() {
        if (!this.alive) return 'Dead';
        if (this.carryAmount > 0) return 'Returning Resources';
        if (this.currentCommand === UNIT_COMMANDS.GATHER) return 'Gathering';
        if (this.currentCommand === UNIT_COMMANDS.BUILD) return 'Building';
        if (this.path || this.targetPosition) return 'Moving';
        return 'Idle';
    }
}
