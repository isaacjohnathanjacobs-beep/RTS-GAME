import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import MainMenu from '../menu/MainMenu.js';
import SinglePlayer from '../gameplay/SinglePlayer.js';
import Multiplayer from '../multiplayer/Multiplayer.js';
import MapEditor from '../mapeditor/MapEditor.js';
import InputManager from './InputManager.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.currentState = null;
        this.states = {
            menu: null,
            singlePlayer: null,
            multiplayer: null,
            mapEditor: null
        };

        this.assets = {
            character: null,
            animations: {},
            textures: {}
        };

        this.inputManager = new InputManager();
    }

    async init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();

        await this.loadAssets();

        this.states.menu = new MainMenu(this);
        this.states.singlePlayer = new SinglePlayer(this);
        this.states.multiplayer = new Multiplayer(this);
        this.states.mapEditor = new MapEditor(this);

        this.setState('menu');

        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // Mystical purple-blue gradient sky
        this.scene.background = new THREE.Color(0x1a0a2e);
        this.scene.fog = new THREE.Fog(0x2d1b4e, 50, 400);

        // Mystical purple ambient light
        const ambientLight = new THREE.AmbientLight(0x9370db, 0.5);
        this.scene.add(ambientLight);

        // Moonlight effect
        const directionalLight = new THREE.DirectionalLight(0xb19cd9, 0.7);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
    }

    async loadAssets() {
        const loadingElement = document.getElementById('loading');
        loadingElement.textContent = 'Loading Game Assets...';

        const fbxLoader = new FBXLoader();
        const textureLoader = new THREE.TextureLoader();

        try {
            this.assets.character = await this.loadFBX(fbxLoader, '/assets/models/Meshy_AI_Character_output.fbx');

            const animationFiles = [
                'Idle_3', 'Idle_7', 'Idle_11', 'Walking', 'Running',
                'Lean_Forward_Sprint_inplace', 'Combat_Stance',
                'Walk_Forward_While_Shooting', 'Rifle_Charge_inplace',
                'Standard_Forward_Charge_inplace', 'Left_Slash',
                'Charged_Slash', 'Axe_Spin_Attack', 'Dead',
                'dying_backwards', 'Fall_Dead_from_Abdominal_Injury',
                'Shot_and_Slow_Fall_Backward'
            ];

            for (const animName of animationFiles) {
                const anim = await this.loadFBX(fbxLoader, `/assets/animations/Meshy_AI_Animation_${animName}_frame_rate_60.fbx`);
                this.assets.animations[animName] = anim.animations[0];
            }

            this.assets.textures.metallic = await this.loadTexture(textureLoader, '/assets/textures/Meshy_AI_texture_0_metallic.png');
            this.assets.textures.normal = await this.loadTexture(textureLoader, '/assets/textures/Meshy_AI_texture_0_normal.png');
            this.assets.textures.roughness = await this.loadTexture(textureLoader, '/assets/textures/Meshy_AI_texture_0_roughness.png');

            loadingElement.style.display = 'none';
        } catch (error) {
            console.error('Error loading assets:', error);
            loadingElement.textContent = 'Error loading assets. Check console for details.';
        }
    }

    loadFBX(loader, path) {
        return new Promise((resolve, reject) => {
            loader.load(path, resolve, undefined, reject);
        });
    }

    loadTexture(loader, path) {
        return new Promise((resolve, reject) => {
            loader.load(path, resolve, undefined, reject);
        });
    }

    setState(stateName) {
        if (this.currentState) {
            this.currentState.exit();
        }

        this.currentState = this.states[stateName];
        if (this.currentState) {
            this.currentState.enter();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (this.currentState) {
            this.currentState.update(deltaTime);
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
