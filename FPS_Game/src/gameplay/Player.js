import * as THREE from 'three';

export default class Player {
    constructor(game, characterModel, animations) {
        this.game = game;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 30;
        this.maxAmmo = 90;

        this.speed = 5;
        this.sprintSpeed = 8;
        this.jumpForce = 8;
        this.gravity = -20;

        this.isGrounded = false;
        this.isSprinting = false;
        this.isAiming = false;

        this.cameraDistance = 5;
        this.cameraHeight = 2;
        this.cameraAngle = { x: 0, y: 0 };

        this.mouseSensitivity = 0.002;

        this.setupCharacter(characterModel, animations);
    }

    setupCharacter(characterModel, animations) {
        this.character = characterModel.clone();
        this.character.scale.set(0.01, 0.01, 0.01);
        this.character.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
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

        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        this.updateHUD();
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
            this.isAiming = true;
        } else {
            this.isAiming = false;
        }

        if (input.isMouseButtonPressed(0)) {
            this.shoot();
        }

        if (input.isKeyPressed('KeyR')) {
            this.reload();
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
        } else if (this.isAiming && speed > 0.1) {
            this.playAnimation('Walk_Forward_While_Shooting');
        } else if (this.isSprinting && speed > 0.1) {
            this.playAnimation('Running');
        } else if (speed > 0.1) {
            this.playAnimation('Walking');
        } else if (this.isAiming) {
            this.playAnimation('Combat_Stance');
        } else {
            this.playAnimation('Idle_3');
        }
    }

    shoot() {
        if (this.ammo > 0) {
            this.ammo--;
            this.createBullet();
            console.log('Shot fired! Ammo:', this.ammo);
        }
    }

    createBullet() {
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(new THREE.Euler(this.cameraAngle.x, this.cameraAngle.y, 0));

        bullet.position.copy(this.position).add(new THREE.Vector3(0, 1.5, 0));
        bullet.userData.velocity = direction.multiplyScalar(50);
        bullet.userData.lifetime = 3;

        this.game.scene.add(bullet);

        if (!this.game.bullets) this.game.bullets = [];
        this.game.bullets.push(bullet);
    }

    reload() {
        if (this.ammo < this.maxAmmo) {
            this.ammo = this.maxAmmo;
            console.log('Reloaded!');
        }
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
        document.getElementById('health').textContent = this.health;
        document.getElementById('ammo').textContent = `${this.ammo}/${this.maxAmmo}`;
    }
}
