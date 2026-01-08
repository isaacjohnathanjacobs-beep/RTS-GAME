import * as THREE from 'three';

export default class Enemy {
    constructor(game, characterModel, animations) {
        this.game = game;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);

        this.health = 100;
        this.maxHealth = 100;
        this.speed = 2;
        this.attackRange = 2;
        this.attackDamage = 10;
        this.attackCooldown = 1.5;
        this.timeSinceLastAttack = 0;

        this.state = 'idle';

        this.setupCharacter(characterModel, animations);
    }

    setupCharacter(characterModel, animations) {
        this.character = characterModel.clone();
        this.character.scale.set(0.01, 0.01, 0.01);

        this.character.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    child.material = child.material.clone();
                    child.material.color.setHex(0xff0000);
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

        const healthBarGeometry = new THREE.PlaneGeometry(2, 0.2);
        const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        this.healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        this.healthBar.position.y = 3;
        this.character.add(this.healthBar);

        const healthBarBgGeometry = new THREE.PlaneGeometry(2, 0.2);
        const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        this.healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
        this.healthBarBg.position.z = -0.01;
        this.healthBar.add(this.healthBarBg);
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

    update(deltaTime, player) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        if (this.health <= 0) {
            this.state = 'dead';
            this.playAnimation('Dead');
            return;
        }

        if (!player) return;

        const distanceToPlayer = this.position.distanceTo(player.position);

        this.timeSinceLastAttack += deltaTime;

        if (distanceToPlayer < this.attackRange) {
            this.state = 'attacking';
            this.attack(player);
        } else if (distanceToPlayer < 30) {
            this.state = 'chasing';
            this.chasePlayer(player, deltaTime);
        } else {
            this.state = 'idle';
            this.playAnimation('Idle_3');
        }

        this.character.position.copy(this.position);
        this.character.rotation.y = this.rotation.y;

        if (this.healthBar) {
            this.healthBar.lookAt(this.game.camera.position);
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.scale.x = healthPercent;
        }
    }

    chasePlayer(player, deltaTime) {
        this.playAnimation('Running');

        const direction = new THREE.Vector3()
            .subVectors(player.position, this.position)
            .normalize();

        this.position.add(direction.multiplyScalar(this.speed * deltaTime));

        this.rotation.y = Math.atan2(direction.x, direction.z);
    }

    attack(player) {
        this.playAnimation('Combat_Stance');

        if (this.timeSinceLastAttack >= this.attackCooldown) {
            player.takeDamage(this.attackDamage);
            this.timeSinceLastAttack = 0;
            console.log('Enemy attacked player!');
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log('Enemy took', amount, 'damage. Health:', this.health);

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        console.log('Enemy died!');
        this.playAnimation('Dead');
    }

    remove() {
        this.game.scene.remove(this.character);
    }
}
