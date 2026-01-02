import * as THREE from 'three';
import { ResourceManager } from './ResourceManager.js';
import { InputManager } from './InputManager.js';
import { PathfindingSystem } from '../systems/PathfindingSystem.js';
import { SelectionSystem } from '../systems/SelectionSystem.js';
import { AIController } from '../systems/AIController.js';
import { Worker } from '../entities/Worker.js';
import { Fighter } from '../entities/Fighter.js';
import { Building } from '../entities/Building.js';
import { HUD } from '../ui/HUD.js';
import { Minimap } from '../ui/Minimap.js';
import { GAME_CONSTANTS, BUILDING_TYPES } from '../utils/Constants.js';

export class Game {
    constructor(aiPersonality = 'balanced') {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.ground = null;

        this.resourceManager = new ResourceManager();
        this.inputManager = null;
        this.pathfinding = null;
        this.selectionSystem = null;
        this.hud = null;
        this.minimap = null;
        this.aiController = null;
        this.aiPersonality = aiPersonality;

        this.units = [];
        this.buildings = [];
        this.controlGroups = {};

        this.resources = {
            gold: 500,
            wood: 200,
            food: 3,
            maxFood: 50,
        };

        this.lastTime = 0;
        this.running = false;
    }

    async init() {
        console.log('Initializing game...');

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 40, 40);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Create lighting
        this.createLighting();

        // Create ground
        this.createGround();

        // Load resources
        await this.loadResources();

        // Initialize systems
        this.pathfinding = new PathfindingSystem(GAME_CONSTANTS.WORLD_SIZE, GAME_CONSTANTS.GRID_SIZE);
        this.selectionSystem = new SelectionSystem(this);
        this.inputManager = new InputManager(this);
        this.hud = new HUD(this);
        this.minimap = new Minimap(this);

        // Initialize AI controller for enemy team
        this.aiController = new AIController(this, 1, this.aiPersonality);
        console.log(`AI initialized with personality: ${this.aiPersonality}`);

        // Create initial game state
        this.setupInitialState();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        console.log('Game initialized successfully');
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.4);
        this.scene.add(hemiLight);
    }

    createGround() {
        // Create textured ground
        const groundGeometry = new THREE.PlaneGeometry(
            GAME_CONSTANTS.WORLD_SIZE,
            GAME_CONSTANTS.WORLD_SIZE,
            50,
            50
        );

        // Add some noise to make it look more natural
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 0.5;
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c32,
            roughness: 0.8,
            metalness: 0.2,
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(GAME_CONSTANTS.WORLD_SIZE, 50, 0x888888, 0x444444);
        gridHelper.position.y = 0.1;
        this.scene.add(gridHelper);
    }

    async loadResources() {
        const loadingText = document.getElementById('loading-text');

        // Skip FBX loading - we're using simple geometric shapes now
        loadingText.textContent = 'Preparing game assets...';

        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));

        loadingText.textContent = 'Ready!';
        console.log('Using simple geometric shapes for units - no FBX loading required');
    }

    setupInitialState() {
        // Create player town hall
        const townHall = new Building(
            this,
            BUILDING_TYPES.TOWN_HALL,
            new THREE.Vector3(0, 0, 0),
            0
        );
        this.buildings.push(townHall);

        // Create starting workers
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const radius = 10;
            const pos = new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.createWorker(pos, 0);
        }

        // Create resource nodes
        this.createResourceNode(BUILDING_TYPES.GOLD_MINE, new THREE.Vector3(-30, 0, -20));
        this.createResourceNode(BUILDING_TYPES.GOLD_MINE, new THREE.Vector3(30, 0, 20));
        this.createResourceNode(BUILDING_TYPES.FOREST, new THREE.Vector3(-40, 0, 30));
        this.createResourceNode(BUILDING_TYPES.FOREST, new THREE.Vector3(40, 0, -30));

        // Create enemy base
        const enemyTownHall = new Building(
            this,
            BUILDING_TYPES.TOWN_HALL,
            new THREE.Vector3(60, 0, 60),
            1
        );
        this.buildings.push(enemyTownHall);

        // Create some enemy fighters
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const radius = 15;
            const pos = new THREE.Vector3(
                60 + Math.cos(angle) * radius,
                0,
                60 + Math.sin(angle) * radius
            );
            this.createFighter(pos, 1);
        }

        console.log('Initial game state created');

        // Debug: Log what's in the scene
        console.log(`Scene contains ${this.scene.children.length} objects`);
        console.log(`Units array contains ${this.units.length} units`);
        this.units.forEach((u, i) => {
            console.log(`Unit ${i}: type=${u.type}, hasModel=${!!u.model}, modelVisible=${u.model?.visible}, position=`, u.position);
        });
    }

    createWorker(position, team) {
        const worker = new Worker(this, position, team);
        this.units.push(worker);
        return worker;
    }

    createFighter(position, team) {
        const fighter = new Fighter(this, position, team);
        this.units.push(fighter);
        return fighter;
    }

    createResourceNode(type, position) {
        const resource = new Building(this, type, position, 2);
        this.buildings.push(resource);
        return resource;
    }

    createBuilding(type, position, team) {
        const building = new Building(this, type, position, team);
        this.buildings.push(building);
        console.log(`Building created: ${type} for team ${team}`);
        return building;
    }

    trainUnit(unitType) {
        const building = this.selectionSystem.getSelectedBuilding();
        if (!building) return;

        let cost, foodCost;
        if (unitType === 'worker') {
            cost = GAME_CONSTANTS.WORKER_COST;
            foodCost = GAME_CONSTANTS.WORKER_FOOD;
        } else if (unitType === 'fighter') {
            cost = GAME_CONSTANTS.FIGHTER_COST;
            foodCost = GAME_CONSTANTS.FIGHTER_FOOD;
        } else {
            return;
        }

        // Check resources
        if (this.resources.gold >= cost.gold &&
            this.resources.wood >= cost.wood &&
            this.resources.food + foodCost <= this.resources.maxFood) {

            // Deduct resources
            this.resources.gold -= cost.gold;
            this.resources.wood -= cost.wood;
            this.resources.food += foodCost;

            // Add to training queue
            building.trainUnit(unitType);

            console.log(`Training ${unitType}`);
        } else {
            console.log('Not enough resources');
            this.hud.showMessage('Not enough resources!', 2000);
        }
    }

    buildBuilding(buildingType) {
        let cost;
        if (buildingType === BUILDING_TYPES.BARRACKS) {
            cost = GAME_CONSTANTS.BARRACKS_COST;
        } else {
            return;
        }

        if (this.resources.gold >= cost.gold && this.resources.wood >= cost.wood) {
            this.resources.gold -= cost.gold;
            this.resources.wood -= cost.wood;

            // Create building at a preset location (simplified)
            const building = new Building(
                this,
                buildingType,
                new THREE.Vector3(15, 0, -15),
                0
            );
            this.buildings.push(building);

            console.log(`Building ${buildingType}`);
        } else {
            console.log('Not enough resources');
            this.hud.showMessage('Not enough resources!', 2000);
        }
    }

    adjustCameraZoom(delta) {
        const zoomSpeed = 5;
        const newY = this.camera.position.y + delta * zoomSpeed;
        const newZ = this.camera.position.z + delta * zoomSpeed * 0.5;

        this.camera.position.y = Math.max(
            GAME_CONSTANTS.CAMERA_MIN_ZOOM,
            Math.min(GAME_CONSTANTS.CAMERA_MAX_ZOOM, newY)
        );

        this.camera.position.z = Math.max(
            GAME_CONSTANTS.CAMERA_MIN_ZOOM * 0.5,
            Math.min(GAME_CONSTANTS.CAMERA_MAX_ZOOM * 0.5, newZ)
        );

        this.camera.lookAt(this.camera.position.x, 0, this.camera.position.z - 20);
    }

    update(deltaTime) {
        // Update input
        this.inputManager.update(deltaTime);

        // Update AI
        if (this.aiController) {
            this.aiController.update(deltaTime);
        }

        // Update units
        for (const unit of this.units) {
            unit.update(deltaTime);
        }

        // Update buildings
        for (const building of this.buildings) {
            building.update(deltaTime);
        }

        // Update UI
        this.hud.update();
        this.minimap.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameLoop(currentTime) {
        if (!this.running) return;

        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();

        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';

        console.log('Game started!');
        this.hud.showMessage('Game Started! Gather resources and build your army!', 3000);

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
