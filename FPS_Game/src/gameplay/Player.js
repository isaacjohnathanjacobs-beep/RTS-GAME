import * as THREE from 'three';
import SpellSystem from '../utils/SpellSystem.js';

export default class Player {
    constructor(game, characterModel, animations) {
        this.game = game;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.health = 100;
        this.maxHealth = 100;
        this.mana = 100;
        this.maxMana = 100;
        this.manaRegen = 10; // mana per second

        this.speed = 5;
        this.sprintSpeed = 8;
        this.jumpForce = 8;
        this.gravity = -20;

        this.isGrounded = false;
        this.isSprinting = false;
        this.isCasting = false;

        this.cameraDistance = 5;
        this.cameraHeight = 2;
        this.cameraAngle = { x: 0, y: 0 };

        this.mouseSensitivity = 0.002;

        // Magic system
        this.availableSpells = ['fireball', 'iceShard', 'lightning', 'arcane', 'shadowBolt'];
        this.currentSpellIndex = 0;
        this.currentSpell = this.availableSpells[0];
        this.spellCooldowns = {};
        this.lastCastTime = 0;

        // Initialize cooldowns
        this.availableSpells.forEach(spell => {
            this.spellCooldowns[spell] = 0;
        });

        this.setupCharacter(characterModel, animations);
        this.createMagicAura();
    }

    setupCharacter(characterModel, animations) {
        this.character = characterModel.clone();
        this.character.scale.set(0.01, 0.01, 0.01);
        this.character.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Give character a magical glow
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.emissive = new THREE.Color(0x4b0082);
                    child.material.emissiveIntensity = 0.2;
                }
            }
        });

        this.game.scene.add(this.character);

        this.mixer = new THREE.AnimationMixer(this.character);
        this.animations = {};
        this.currentAnimation = null;

        for (const [name, clip] of Object.entries(animations)) {
            this.animations[name] = this.mixer.clipAction(clip);
        }

        this.playAnimation('Idle_3');
    }

    createMagicAura() {
        // Create magical aura around player
        const auraGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0x9370db,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        this.magicAura = new THREE.Mesh(auraGeometry, auraMaterial);
        this.character.add(this.magicAura);
        this.magicAura.position.y = 100; // Move up relative to character
    }

    playAnimation(name) {
        if (this.currentAnimation === name) return;

        const newAnimation = this.animations[name];
        if (!newAnimation) return;

        if (this.currentAnimation) {
            const oldAnimation = this.animations[this.currentAnimation];
            if (oldAnimation) {
                oldAnimation.fadeOut(0.3);
            }
        }

        newAnimation.reset().fadeIn(0.3).play();
        this.currentAnimation = name;
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateCamera();
        this.updateAnimation();
        this.updateMana(deltaTime);
        this.updateCooldowns(deltaTime);
        this.updateMagicAura(deltaTime);

        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        this.updateHUD();
    }

    updateMana(deltaTime) {
        // Regenerate mana over time
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * deltaTime);
        }
    }

    updateCooldowns(deltaTime) {
        // Update all spell cooldowns
        for (const spell in this.spellCooldowns) {
            if (this.spellCooldowns[spell] > 0) {
                this.spellCooldowns[spell] -= deltaTime;
            }
        }
    }

    updateMagicAura(deltaTime) {
        if (this.magicAura) {
            // Pulse the aura
            const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 1;
            this.magicAura.scale.set(pulse, pulse, pulse);

            // Rotate the aura
            this.magicAura.rotation.y += deltaTime;

            // Change color based on current spell
            const spellInfo = SpellSystem.getSpellInfo(this.currentSpell);
            if (spellInfo) {
                this.magicAura.material.color.setHex(spellInfo.color);
            }
        }
    }

    handleInput(deltaTime) {
        const input = this.game.inputManager;

        if (input.locked) {
            const mouseDelta = input.getMouseDelta();
            this.cameraAngle.y -= mouseDelta.x * this.mouseSensitivity;
            this.cameraAngle.x -= mouseDelta.y * this.mouseSensitivity;
            this.cameraAngle.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraAngle.x));
        }

        const moveDirection = new THREE.Vector3(0, 0, 0);

        if (input.isKeyPressed('KeyW')) moveDirection.z -= 1;
        if (input.isKeyPressed('KeyS')) moveDirection.z += 1;
        if (input.isKeyPressed('KeyA')) moveDirection.x -= 1;
        if (input.isKeyPressed('KeyD')) moveDirection.x += 1;

        if (moveDirection.length() > 0) {
            moveDirection.normalize();

            const rotatedDirection = moveDirection.clone();
            rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngle.y);

            this.isSprinting = input.isKeyPressed('ShiftLeft');
            const currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

            this.velocity.x = rotatedDirection.x * currentSpeed;
            this.velocity.z = rotatedDirection.z * currentSpeed;

            const targetRotation = Math.atan2(rotatedDirection.x, rotatedDirection.z);
            this.rotation.y = THREE.MathUtils.lerp(this.rotation.y, targetRotation, 0.1);
        } else {
            this.velocity.x *= 0.9;
            this.velocity.z *= 0.9;
        }

        if (input.isKeyPressed('Space') && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        if (input.isMouseButtonPressed(2)) {
            this.isCasting = true;
        } else {
            this.isCasting = false;
        }

        if (input.isMouseButtonPressed(0)) {
            this.castSpell();
        }

        // Spell switching with number keys
        if (input.isKeyPressed('Digit1')) this.switchSpell(0);
        if (input.isKeyPressed('Digit2')) this.switchSpell(1);
        if (input.isKeyPressed('Digit3')) this.switchSpell(2);
        if (input.isKeyPressed('Digit4')) this.switchSpell(3);
        if (input.isKeyPressed('Digit5')) this.switchSpell(4);

        // Mouse wheel for spell switching
        if (input.isKeyPressed('KeyQ')) {
            this.switchSpell((this.currentSpellIndex - 1 + this.availableSpells.length) % this.availableSpells.length);
        }
        if (input.isKeyPressed('KeyE')) {
            this.switchSpell((this.currentSpellIndex + 1) % this.availableSpells.length);
        }

        if (input.isKeyPressed('Escape')) {
            input.exitPointerLock();
            this.game.setState('menu');
        }
    }

    updatePhysics(deltaTime) {
        this.velocity.y += this.gravity * deltaTime;

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        this.character.position.copy(this.position);
        this.character.rotation.y = this.rotation.y;
    }

    updateCamera() {
        const camera = this.game.camera;

        const distance = this.isAiming ? this.cameraDistance * 0.6 : this.cameraDistance;

        const cameraOffset = new THREE.Vector3(
            Math.sin(this.cameraAngle.y) * Math.cos(this.cameraAngle.x) * distance,
            this.cameraHeight + Math.sin(this.cameraAngle.x) * distance,
            Math.cos(this.cameraAngle.y) * Math.cos(this.cameraAngle.x) * distance
        );

        camera.position.copy(this.position).add(cameraOffset);
        camera.lookAt(this.position.clone().add(new THREE.Vector3(0, this.cameraHeight - 0.5, 0)));
    }

    updateAnimation() {
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);

        if (!this.isGrounded) {
            this.playAnimation('Lean_Forward_Sprint_inplace');
        } else if (this.isCasting && speed > 0.1) {
            this.playAnimation('Walk_Forward_While_Shooting');
        } else if (this.isSprinting && speed > 0.1) {
            this.playAnimation('Running');
        } else if (speed > 0.1) {
            this.playAnimation('Walking');
        } else if (this.isCasting) {
            this.playAnimation('Combat_Stance');
        } else {
            this.playAnimation('Idle_7'); // More mystical idle pose
        }
    }

    switchSpell(index) {
        if (index >= 0 && index < this.availableSpells.length) {
            this.currentSpellIndex = index;
            this.currentSpell = this.availableSpells[index];
            const spellInfo = SpellSystem.getSpellInfo(this.currentSpell);
            console.log('Switched to spell:', spellInfo.name);
        }
    }

    castSpell() {
        const spellInfo = SpellSystem.getSpellInfo(this.currentSpell);

        // Check mana
        if (this.mana < spellInfo.manaCost) {
            console.log('Not enough mana!');
            return;
        }

        // Check cooldown
        if (this.spellCooldowns[this.currentSpell] > 0) {
            console.log('Spell on cooldown!');
            return;
        }

        // Consume mana
        this.mana -= spellInfo.manaCost;

        // Set cooldown
        this.spellCooldowns[this.currentSpell] = spellInfo.cooldown;

        // Create spell projectile
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(new THREE.Euler(this.cameraAngle.x, this.cameraAngle.y, 0));

        const spawnPosition = this.position.clone().add(new THREE.Vector3(0, 1.5, 0));

        // Add hand offset for more realistic casting
        const handOffset = new THREE.Vector3(0.5, 0, -0.5);
        handOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        spawnPosition.add(handOffset);

        const projectile = SpellSystem.createSpellProjectile(
            this.game.scene,
            this.currentSpell,
            spawnPosition,
            direction
        );

        if (!this.game.spells) this.game.spells = [];
        this.game.spells.push(projectile);

        console.log(`Cast ${spellInfo.name}! Mana: ${Math.floor(this.mana)}/${this.maxMana}`);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        console.log('Player died!');
        this.playAnimation('Dead');
    }

    updateHUD() {
        document.getElementById('health').textContent = Math.floor(this.health);
        const spellInfo = SpellSystem.getSpellInfo(this.currentSpell);
        const manaText = `${Math.floor(this.mana)}/${this.maxMana}`;
        const spellText = spellInfo ? spellInfo.name : 'None';
        document.getElementById('mana').textContent = manaText;
        document.getElementById('currentSpell').textContent = spellText;
    }
}
