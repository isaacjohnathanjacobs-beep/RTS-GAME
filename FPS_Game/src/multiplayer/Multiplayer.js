import * as THREE from 'three';
import { io } from 'socket.io-client';
import Player from '../gameplay/Player.js';

export default class Multiplayer {
    constructor(game) {
        this.game = game;
        this.player = null;
        this.otherPlayers = {};
        this.socket = null;
        this.playerId = null;
        this.isHost = false;
        this.active = false;
    }

    host() {
        console.log('Hosting game...');
        this.isHost = true;
        this.connect('http://localhost:3001');
    }

    join(serverAddress) {
        console.log('Joining game at', serverAddress);
        this.isHost = false;
        const url = serverAddress.startsWith('http') ? serverAddress : `http://${serverAddress}`;
        this.connect(url);
    }

    connect(serverUrl) {
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Connected to server!');
            this.playerId = this.socket.id;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.cleanup();
            this.game.setState('menu');
        });

        this.socket.on('playerConnected', (data) => {
            console.log('Player connected:', data.id);
            this.addOtherPlayer(data.id, data.position);
        });

        this.socket.on('playerDisconnected', (playerId) => {
            console.log('Player disconnected:', playerId);
            this.removeOtherPlayer(playerId);
        });

        this.socket.on('playerUpdate', (data) => {
            this.updateOtherPlayer(data);
        });

        this.socket.on('playerShot', (data) => {
            this.handleOtherPlayerShot(data);
        });

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (id !== this.playerId) {
                    this.addOtherPlayer(id, players[id].position);
                }
            });
        });
    }

    enter() {
        this.active = true;
        this.setupEnvironment();
        this.setupPlayer();

        document.getElementById('crosshair').style.display = 'block';
        document.getElementById('hud').style.display = 'block';

        this.game.inputManager.requestPointerLock();

        if (this.socket && this.socket.connected) {
            this.socket.emit('playerJoined', {
                position: this.player.position
            });
        }
    }

    exit() {
        this.active = false;
        if (this.socket) {
            this.socket.disconnect();
        }
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

        for (let i = 0; i < 15; i++) {
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
    }

    setupPlayer() {
        this.player = new Player(
            this.game,
            this.game.assets.character,
            this.game.assets.animations
        );

        const spawnX = Math.random() * 20 - 10;
        const spawnZ = Math.random() * 20 - 10;
        this.player.position.set(spawnX, 0, spawnZ);
    }

    addOtherPlayer(playerId, position) {
        if (this.otherPlayers[playerId]) return;

        const otherPlayer = {
            character: this.game.assets.character.clone(),
            position: new THREE.Vector3(position.x, position.y, position.z),
            rotation: new THREE.Euler(0, 0, 0),
            mixer: null,
            currentAnimation: null,
            animations: {}
        };

        otherPlayer.character.scale.set(0.01, 0.01, 0.01);
        otherPlayer.character.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.color.setHex(0x0000ff);
                }
            }
        });

        otherPlayer.mixer = new THREE.AnimationMixer(otherPlayer.character);

        for (const [name, clip] of Object.entries(this.game.assets.animations)) {
            otherPlayer.animations[name] = otherPlayer.mixer.clipAction(clip);
        }

        this.game.scene.add(otherPlayer.character);
        this.otherPlayers[playerId] = otherPlayer;
    }

    removeOtherPlayer(playerId) {
        const player = this.otherPlayers[playerId];
        if (player) {
            this.game.scene.remove(player.character);
            delete this.otherPlayers[playerId];
        }
    }

    updateOtherPlayer(data) {
        const player = this.otherPlayers[data.id];
        if (player) {
            player.position.set(data.position.x, data.position.y, data.position.z);
            player.rotation.y = data.rotation;
            player.character.position.copy(player.position);
            player.character.rotation.y = player.rotation;

            if (data.animation && data.animation !== player.currentAnimation) {
                const newAnim = player.animations[data.animation];
                if (newAnim) {
                    if (player.currentAnimation) {
                        const oldAnim = player.animations[player.currentAnimation];
                        if (oldAnim) oldAnim.fadeOut(0.3);
                    }
                    newAnim.reset().fadeIn(0.3).play();
                    player.currentAnimation = data.animation;
                }
            }
        }
    }

    handleOtherPlayerShot(data) {
        console.log('Other player shot:', data);

        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        bullet.position.set(data.position.x, data.position.y, data.position.z);

        const direction = new THREE.Vector3(data.direction.x, data.direction.y, data.direction.z);
        bullet.userData.velocity = direction.multiplyScalar(50);
        bullet.userData.lifetime = 3;

        this.game.scene.add(bullet);

        if (!this.game.bullets) this.game.bullets = [];
        this.game.bullets.push(bullet);
    }

    update(deltaTime) {
        if (!this.active) return;

        if (this.player) {
            this.player.update(deltaTime);

            if (this.socket && this.socket.connected) {
                this.socket.emit('playerUpdate', {
                    position: this.player.position,
                    rotation: this.player.rotation.y,
                    animation: this.player.currentAnimation
                });
            }
        }

        for (const playerId in this.otherPlayers) {
            const player = this.otherPlayers[playerId];
            if (player.mixer) {
                player.mixer.update(deltaTime);
            }
        }

        this.updateBullets(deltaTime);

        if (this.player && this.player.health <= 0) {
            this.respawn();
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
            }
        }
    }

    respawn() {
        const spawnX = Math.random() * 20 - 10;
        const spawnZ = Math.random() * 20 - 10;
        this.player.position.set(spawnX, 0, spawnZ);
        this.player.health = this.player.maxHealth;
        this.player.ammo = this.player.maxAmmo;
    }

    cleanup() {
        if (this.player) {
            this.game.scene.remove(this.player.character);
            this.player = null;
        }

        for (const playerId in this.otherPlayers) {
            this.removeOtherPlayer(playerId);
        }

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

        document.getElementById('crosshair').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
    }
}
