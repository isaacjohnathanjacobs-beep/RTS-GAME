import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class ResourceManager {
    constructor() {
        this.fbxLoader = new FBXLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.loadedModels = {};
        this.loadedAnimations = {};
        this.loadedTextures = {};
    }

    async loadCharacterModel() {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                './Meshy_AI_Character_output.fbx',
                (fbx) => {
                    // Make sure the base model is NEVER visible or added to scene (it's just a template)
                    fbx.visible = false;
                    fbx.traverse((child) => {
                        child.visible = false;
                    });

                    // Important: Store it but never add to scene
                    this.loadedModels.character = fbx;
                    console.log('Character model loaded (template only, not added to scene)');
                    resolve(fbx);
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('Error loading character model:', error);
                    reject(error);
                }
            );
        });
    }

    async loadAnimation(name, path) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                path,
                (fbx) => {
                    if (fbx.animations && fbx.animations.length > 0) {
                        this.loadedAnimations[name] = fbx.animations[0];
                        console.log(`Animation ${name} loaded`);
                        resolve(fbx.animations[0]);
                    } else {
                        reject(new Error(`No animations found in ${path}`));
                    }
                },
                undefined,
                (error) => {
                    console.error(`Error loading animation ${name}:`, error);
                    reject(error);
                }
            );
        });
    }

    async loadAllAnimations() {
        const animations = [
            { name: 'idle', path: './Meshy_AI_Animation_Idle_3_frame_rate_60.fbx' },
            { name: 'walk', path: './Meshy_AI_Animation_Walking_frame_rate_60.fbx' },
            { name: 'run', path: './Meshy_AI_Animation_Running_frame_rate_60.fbx' },
            { name: 'combat_stance', path: './Meshy_AI_Animation_Combat_Stance_frame_rate_60.fbx' },
            { name: 'attack_axe', path: './Meshy_AI_Animation_Axe_Spin_Attack_frame_rate_60.fbx' },
            { name: 'attack_slash', path: './Meshy_AI_Animation_Left_Slash_frame_rate_60.fbx' },
            { name: 'attack_charged', path: './Meshy_AI_Animation_Charged_Slash_frame_rate_60.fbx' },
            { name: 'death', path: './Meshy_AI_Animation_Dead_frame_rate_60.fbx' },
            { name: 'death_backward', path: './Meshy_AI_Animation_dying_backwards_frame_rate_60.fbx' },
            { name: 'death_shot', path: './Meshy_AI_Animation_Shot_and_Slow_Fall_Backward_frame_rate_60.fbx' },
        ];

        const promises = animations.map(anim => this.loadAnimation(anim.name, anim.path));
        await Promise.all(promises);
        console.log('All animations loaded');
    }

    async loadTextures() {
        const texturePromises = [
            this.loadTexture('metallic', './Meshy_AI_texture_0_metallic.png'),
            this.loadTexture('normal', './Meshy_AI_texture_0_normal.png'),
            this.loadTexture('roughness', './Meshy_AI_texture_0_roughness.png'),
        ];

        await Promise.all(texturePromises);
        console.log('All textures loaded');
    }

    async loadTexture(name, path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    this.loadedTextures[name] = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Error loading texture ${name}:`, error);
                    reject(error);
                }
            );
        });
    }

    getModel(name) {
        return this.loadedModels[name];
    }

    getAnimation(name) {
        return this.loadedAnimations[name];
    }

    getTexture(name) {
        return this.loadedTextures[name];
    }

    cloneCharacter() {
        if (!this.loadedModels.character) {
            console.error('Character model not loaded');
            return null;
        }

        const clone = this.loadedModels.character.clone();

        let meshCount = 0;

        // Make clone visible and clone materials to avoid sharing
        clone.visible = true;
        clone.traverse((child) => {
            child.visible = true; // Set all children visible
            if (child.isMesh) {
                meshCount++;
                // Clone material to avoid sharing between instances
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => m.clone());
                    } else {
                        child.material = child.material.clone();
                    }
                }
            }
        });

        console.log(`Character cloned successfully - contains ${meshCount} meshes, scale:`, clone.scale);
        return clone;
    }

    async loadAll() {
        console.log('Loading all resources...');
        await this.loadCharacterModel();
        await this.loadAllAnimations();
        await this.loadTextures();
        console.log('All resources loaded successfully');
    }
}
