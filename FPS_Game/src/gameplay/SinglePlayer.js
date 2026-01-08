import * as THREE from 'three';
import Player from './Player.js';
import Enemy from './Enemy.js';

export default class SinglePlayer {
    constructor(game) {
        this.game = game;
        this.player = null;
        this.enemies = [];
        this.environment = null;
        this.active = false;
        this.wave = 1;
        this.enemiesKilled = 0;
    }

    enter() {
        this.active = true;
        this.setupEnvironment();
        this.setupPlayer();
        this.spawnEnemies(3);

        document.getElementById('crosshair').style.display = 'block';
        document.getElementById('hud').style.display = 'block';

        this.game.inputManager.requestPointerLock();
    }

    exit() {
        this.active = false;
        this.cleanup();
    }

    setupEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c3e,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);

        const gridHelper = new THREE.GridHelper(200, 40, 0x000000, 0x444444);
        this.game.scene.add(gridHelper);

        for (let i = 0; i < 20; i++) {
            const boxGeometry = new THREE.BoxGeometry(
                Math.random() * 3 + 2,
                Math.random() * 4 + 2,
                Math.random() * 3 + 2
            );
            const boxMaterial = new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(
                Math.random() * 80 - 40,
                boxGeometry.parameters.height / 2,
                Math.random() * 80 - 40
            );
            box.castShadow = true;
            box.receiveShadow = true;
            this.game.scene.add(box);
        }

        for (let i = 0; i < 10; i++) {
            const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
            const cylinderMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513
            });
            const tree = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            tree.position.set(
                Math.random() * 100 - 50,
                4,
                Math.random() * 100 - 50
            );
            tree.castShadow = true;

            const foliageGeometry = new THREE.ConeGeometry(3, 6, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 8;
            tree.add(foliage);

            this.game.scene.add(tree);
        }
    }

    setupPlayer() {
        this.player = new Player(
            this.game,
            this.game.assets.character,
            this.game.assets.animations
        );
        this.player.position.set(0, 0, 0);
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            const enemy = new Enemy(
                this.game,
                this.game.assets.character,
                this.game.assets.animations
            );

            const angle = (Math.PI * 2 * i) / count;
            const distance = 20 + Math.random() * 20;
            enemy.position.set(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            );

            this.enemies.push(enemy);
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        if (this.player) {
            this.player.update(deltaTime);
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.player);

            if (enemy.health <= 0) {
                enemy.remove();
                this.enemies.splice(i, 1);
                this.enemiesKilled++;
            }
        }

        this.updateBullets(deltaTime);

        if (this.enemies.length === 0) {
            this.wave++;
            console.log('Wave', this.wave, 'starting!');
            this.spawnEnemies(3 + this.wave);
        }

        if (this.player && this.player.health <= 0) {
            this.gameOver();
        }
    }

    updateBullets(deltaTime) {
        if (!this.game.bullets) return;

        for (let i = this.game.bullets.length - 1; i >= 0; i--) {
            const bullet = this.game.bullets[i];

            bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(deltaTime));
            bullet.userData.lifetime -= deltaTime;

            if (bullet.userData.lifetime <= 0) {
                this.game.scene.remove(bullet);
                this.game.bullets.splice(i, 1);
                continue;
            }

            for (let j = 0; j < this.enemies.length; j++) {
                const enemy = this.enemies[j];
                const distance = bullet.position.distanceTo(enemy.position);

                if (distance < 1) {
                    enemy.takeDamage(25);
                    this.game.scene.remove(bullet);
                    this.game.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    gameOver() {
        alert(`Game Over! Wave: ${this.wave}, Enemies Killed: ${this.enemiesKilled}`);
        this.game.setState('menu');
    }

    cleanup() {
        if (this.player) {
            this.game.scene.remove(this.player.character);
            this.player = null;
        }

        for (const enemy of this.enemies) {
            enemy.remove();
        }
        this.enemies = [];

        const objectsToRemove = [];
        this.game.scene.traverse((object) => {
            if (object.isMesh || object.isGroup) {
                if (object !== this.game.scene) {
                    objectsToRemove.push(object);
                }
            }
        });

        for (const object of objectsToRemove) {
            this.game.scene.remove(object);
        }

        if (this.game.bullets) {
            this.game.bullets = [];
        }

        this.wave = 1;
        this.enemiesKilled = 0;

        document.getElementById('crosshair').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
    }
}
