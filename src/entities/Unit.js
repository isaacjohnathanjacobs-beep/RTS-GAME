import * as THREE from 'three';
import { AnimationController } from '../systems/AnimationController.js';
import { ANIMATION_STATES, GAME_CONSTANTS, UNIT_COMMANDS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Unit {
    constructor(game, position, team = 0) {
        this.game = game;
        this.team = team;
        this.position = position.clone();
        this.targetPosition = null;
        this.path = null;
        this.pathIndex = 0;

        // Unit properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.speed = GAME_CONSTANTS.MOVE_SPEED;
        this.rotationSpeed = GAME_CONSTANTS.ROTATION_SPEED;
        this.selected = false;
        this.alive = true;

        // Command system
        this.currentCommand = null;
        this.commandTarget = null;

        // Create 3D model
        this.model = null;
        this.animationController = null;
        this.selectionRing = null;
        this.healthBar = null;

        this.createModel();
        this.createSelectionRing();
        this.createHealthBar();
    }

    createModel() {
        // Create a simple geometric shape for the unit
        const group = new THREE.Group();

        // Body - capsule shape (cylinder with spheres on top/bottom)
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.getUnitColor(),
            roughness: 0.7,
            metalness: 0.3,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.getUnitColor(),
            roughness: 0.6,
            metalness: 0.2,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        group.position.copy(this.position);
        this.model = group;
        this.bodyMesh = body; // Store reference for animations
        this.game.scene.add(this.model);

        console.log('Simple model created for unit:', this.type || 'Unit');

        // Simple rotation animation instead of complex FBX animations
        this.animationController = {
            setState: (state) => { this.currentAnimState = state; },
            update: (deltaTime) => {
                // Idle bob animation
                if (this.currentAnimState === ANIMATION_STATES.IDLE && this.bodyMesh) {
                    this.bodyMesh.position.y = 0.75 + Math.sin(Date.now() * 0.003) * 0.05;
                }
            },
            getState: () => this.currentAnimState,
            dispose: () => {}
        };
        this.currentAnimState = ANIMATION_STATES.IDLE;
    }

    getUnitColor() {
        // Default color (will be overridden by Worker/Fighter)
        return this.team === 0 ? 0x4444ff : 0xff4444;
    }

    createSelectionRing() {
        const geometry = new THREE.RingGeometry(0.8, 1, 32);
        const material = new THREE.MeshBasicMaterial({
            color: GAME_CONSTANTS.SELECTION_RING_COLOR,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
        });
        this.selectionRing = new THREE.Mesh(geometry, material);
        this.selectionRing.rotation.x = -Math.PI / 2;
        this.selectionRing.visible = false;
        this.game.scene.add(this.selectionRing);
    }

    createHealthBar() {
        // Create a simple health bar above the unit
        const barWidth = 2;
        const barHeight = 0.2;

        const geometry = new THREE.PlaneGeometry(barWidth, barHeight);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        this.healthBar = new THREE.Mesh(geometry, material);
        this.healthBar.position.y = 3;
        this.game.scene.add(this.healthBar);
    }

    setSelected(selected) {
        this.selected = selected;
        if (this.selectionRing) {
            this.selectionRing.visible = selected;
        }
    }

    setCommand(command, target = null) {
        this.currentCommand = command;
        this.commandTarget = target;

        if (command === UNIT_COMMANDS.MOVE && target) {
            this.moveTo(target);
        } else if (command === UNIT_COMMANDS.STOP) {
            this.stop();
        }
    }

    moveTo(position) {
        this.targetPosition = position.clone();
        const path = this.game.pathfinding.findPath(this.position, this.targetPosition);

        if (path && path.length > 1) {
            this.path = path;
            this.pathIndex = 1; // Start from second waypoint (first is current position)
            if (this.animationController) {
                this.animationController.setState(ANIMATION_STATES.WALK);
            }
        } else {
            // Direct movement if no path or very close
            this.path = null;
            this.targetPosition = position.clone();
        }
    }

    stop() {
        this.targetPosition = null;
        this.path = null;
        this.pathIndex = 0;
        if (this.animationController) {
            this.animationController.setState(ANIMATION_STATES.IDLE);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        this.updateHealthBar();
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }

    die() {
        this.alive = false;
        this.stop();
        if (this.animationController) {
            this.animationController.setState(ANIMATION_STATES.DEATH);
        }
        // Remove unit after death animation
        setTimeout(() => this.destroy(), 2000);
    }

    updateHealthBar() {
        if (!this.healthBar) return;

        const healthPercent = this.health / this.maxHealth;
        this.healthBar.scale.x = healthPercent;

        // Color based on health
        if (healthPercent > 0.6) {
            this.healthBar.material.color.setHex(0x00ff00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.material.color.setHex(0xffff00); // Yellow
        } else {
            this.healthBar.material.color.setHex(0xff0000); // Red
        }
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Update movement
        if (this.path && this.pathIndex < this.path.length) {
            const waypoint = this.path[this.pathIndex];
            const distance = MathUtils.distance2D(this.position, waypoint);

            if (distance < 0.5) {
                this.pathIndex++;
                if (this.pathIndex >= this.path.length) {
                    this.path = null;
                    this.pathIndex = 0;
                    if (this.animationController) {
                        this.animationController.setState(ANIMATION_STATES.IDLE);
                    }
                }
            } else {
                this.moveTowards(waypoint, deltaTime);
            }
        } else if (this.targetPosition) {
            const distance = MathUtils.distance2D(this.position, this.targetPosition);
            if (distance < 0.5) {
                this.stop();
            } else {
                this.moveTowards(this.targetPosition, deltaTime);
            }
        }

        // Update animation
        if (this.animationController) {
            this.animationController.update(deltaTime);
        }

        // Update visuals
        if (this.model) {
            this.model.position.copy(this.position);
        }
        if (this.selectionRing) {
            this.selectionRing.position.set(this.position.x, 0.1, this.position.z);
        }
        if (this.healthBar) {
            this.healthBar.position.set(this.position.x, this.position.y + 3, this.position.z);
            this.healthBar.lookAt(this.game.camera.position);
        }
    }

    moveTowards(target, deltaTime) {
        const direction = MathUtils.direction2D(this.position, target);
        const moveDistance = this.speed * deltaTime;

        this.position.x += direction.x * moveDistance;
        this.position.z += direction.z * moveDistance;

        // Rotate towards movement direction
        if (this.model) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            const currentRotation = this.model.rotation.y;
            const rotationDiff = targetRotation - currentRotation;

            // Normalize angle difference
            let normalizedDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
            const rotationChange = Math.sign(normalizedDiff) * Math.min(Math.abs(normalizedDiff), this.rotationSpeed * deltaTime);

            this.model.rotation.y += rotationChange;
        }
    }

    destroy() {
        if (this.model) {
            this.game.scene.remove(this.model);
        }
        if (this.selectionRing) {
            this.game.scene.remove(this.selectionRing);
        }
        if (this.healthBar) {
            this.game.scene.remove(this.healthBar);
        }
        if (this.animationController) {
            this.animationController.dispose();
        }

        // Remove from game units
        const index = this.game.units.indexOf(this);
        if (index > -1) {
            this.game.units.splice(index, 1);
        }
    }

    getInfo() {
        return {
            type: 'Unit',
            health: this.health,
            maxHealth: this.maxHealth,
            team: this.team,
            position: this.position,
        };
    }
}
