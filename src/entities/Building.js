import * as THREE from 'three';
import { GAME_CONSTANTS, BUILDING_TYPES } from '../utils/Constants.js';

export class Building {
    constructor(game, type, position, team = 0) {
        this.game = game;
        this.type = type;
        this.position = position.clone();
        this.team = team;

        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.selected = false;
        this.alive = true;

        // Building-specific
        this.trainQueue = [];
        this.trainingProgress = 0;
        this.resourceType = null;

        this.model = null;
        this.selectionRing = null;

        this.initializeByType();
        this.createModel();
        this.createSelectionRing();
    }

    initializeByType() {
        switch (this.type) {
            case BUILDING_TYPES.TOWN_HALL:
                this.maxHealth = GAME_CONSTANTS.TOWN_HALL_HP;
                this.canTrain = ['worker'];
                break;
            case BUILDING_TYPES.BARRACKS:
                this.maxHealth = GAME_CONSTANTS.BARRACKS_HP;
                this.canTrain = ['fighter'];
                break;
            case BUILDING_TYPES.GOLD_MINE:
                this.resourceType = 'gold';
                break;
            case BUILDING_TYPES.FOREST:
                this.resourceType = 'wood';
                break;
        }
        this.health = this.maxHealth;
    }

    createModel() {
        let geometry, material;

        switch (this.type) {
            case BUILDING_TYPES.TOWN_HALL:
                geometry = new THREE.BoxGeometry(8, 6, 8);
                material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                break;
            case BUILDING_TYPES.BARRACKS:
                geometry = new THREE.BoxGeometry(6, 5, 6);
                material = new THREE.MeshStandardMaterial({ color: 0x696969 });
                break;
            case BUILDING_TYPES.GOLD_MINE:
                geometry = new THREE.CylinderGeometry(3, 3, 2, 8);
                material = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
                break;
            case BUILDING_TYPES.FOREST:
                geometry = new THREE.ConeGeometry(2, 5, 8);
                material = new THREE.MeshStandardMaterial({ color: 0x228B22 });
                break;
            default:
                geometry = new THREE.BoxGeometry(4, 4, 4);
                material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        }

        this.model = new THREE.Mesh(geometry, material);
        this.model.position.copy(this.position);
        this.model.position.y = this.model.geometry.parameters.height / 2 || 2;
        this.model.castShadow = true;
        this.model.receiveShadow = true;

        // Add a roof for buildings
        if (this.type === BUILDING_TYPES.TOWN_HALL || this.type === BUILDING_TYPES.BARRACKS) {
            const roofGeometry = new THREE.ConeGeometry(
                this.model.geometry.parameters.width * 0.7,
                3,
                4
            );
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = this.model.geometry.parameters.height / 2 + 1.5;
            roof.rotation.y = Math.PI / 4;
            this.model.add(roof);
        }

        this.game.scene.add(this.model);
    }

    createSelectionRing() {
        const size = this.type === BUILDING_TYPES.TOWN_HALL ? 10 : 8;
        const geometry = new THREE.RingGeometry(size * 0.6, size * 0.7, 32);
        const material = new THREE.MeshBasicMaterial({
            color: GAME_CONSTANTS.SELECTION_RING_COLOR,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
        });
        this.selectionRing = new THREE.Mesh(geometry, material);
        this.selectionRing.rotation.x = -Math.PI / 2;
        this.selectionRing.position.set(this.position.x, 0.1, this.position.z);
        this.selectionRing.visible = false;
        this.game.scene.add(this.selectionRing);
    }

    setSelected(selected) {
        this.selected = selected;
        if (this.selectionRing) {
            this.selectionRing.visible = selected;
        }
    }

    trainUnit(unitType) {
        if (!this.canTrain || !this.canTrain.includes(unitType)) {
            console.warn(`Cannot train ${unitType} at ${this.type}`);
            return false;
        }

        // Add to queue
        this.trainQueue.push(unitType);
        return true;
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Process training queue
        if (this.trainQueue.length > 0) {
            this.trainingProgress += deltaTime;

            const trainingTime = 5; // 5 seconds to train a unit
            if (this.trainingProgress >= trainingTime) {
                const unitType = this.trainQueue.shift();
                this.spawnUnit(unitType);
                this.trainingProgress = 0;
            }
        }
    }

    spawnUnit(unitType) {
        // Spawn unit near the building
        const spawnOffset = new THREE.Vector3(5, 0, 0);
        const spawnPos = this.position.clone().add(spawnOffset);

        if (unitType === 'worker') {
            this.game.createWorker(spawnPos, this.team);
        } else if (unitType === 'fighter') {
            this.game.createFighter(spawnPos, this.team);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    }

    destroy() {
        this.alive = false;

        if (this.model) {
            this.game.scene.remove(this.model);
        }
        if (this.selectionRing) {
            this.game.scene.remove(this.selectionRing);
        }

        // Remove from game buildings
        const index = this.game.buildings.indexOf(this);
        if (index > -1) {
            this.game.buildings.splice(index, 1);
        }
    }

    getInfo() {
        return {
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            team: this.team,
            position: this.position,
            trainQueue: this.trainQueue,
            trainingProgress: this.trainingProgress,
        };
    }
}
