import { Unit } from './Unit.js';
import { GAME_CONSTANTS, UNIT_TYPES, UNIT_COMMANDS, ANIMATION_STATES } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Fighter extends Unit {
    constructor(game, position, team = 0) {
        super(game, position, team);

        this.type = UNIT_TYPES.FIGHTER;
        this.maxHealth = GAME_CONSTANTS.FIGHTER_HP;
        this.health = this.maxHealth;

        // Combat properties
        this.damage = GAME_CONSTANTS.FIGHTER_DAMAGE;
        this.attackRange = GAME_CONSTANTS.FIGHTER_ATTACK_RANGE;
        this.attackSpeed = GAME_CONSTANTS.FIGHTER_ATTACK_SPEED;
        this.attackCooldown = 0;
        this.targetEnemy = null;
        this.pathRecalcCooldown = 0; // Prevent recalculating path too often

        this.updateHealthBar();
    }

    setCommand(command, target = null) {
        super.setCommand(command, target);

        if (command === UNIT_COMMANDS.ATTACK && target) {
            this.attackTarget(target);
        }
    }

    attackTarget(target) {
        this.targetEnemy = target;
        this.currentCommand = UNIT_COMMANDS.ATTACK;
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // Update path recalculation cooldown
        if (this.pathRecalcCooldown > 0) {
            this.pathRecalcCooldown -= deltaTime;
        }

        // Handle combat
        if (this.currentCommand === UNIT_COMMANDS.ATTACK) {
            this.updateCombat(deltaTime);
        } else {
            // Auto-attack nearby enemies
            this.scanForEnemies();
        }

        super.update(deltaTime);
    }

    updateCombat(deltaTime) {
        if (!this.targetEnemy || !this.targetEnemy.alive) {
            this.targetEnemy = null;
            this.currentCommand = null;
            if (this.animationController) {
                this.animationController.setState(ANIMATION_STATES.IDLE);
            }
            return;
        }

        const distance = MathUtils.distance2D(this.position, this.targetEnemy.position);

        if (distance <= this.attackRange) {
            // In range - attack
            this.stop();
            this.performAttack(deltaTime);
        } else {
            // Out of range - move closer
            if (!this.path && !this.targetPosition) {
                this.moveTo(this.targetEnemy.position);
                this.pathRecalcCooldown = 0.5; // Wait 0.5 seconds before recalculating
            } else if (this.targetPosition && this.pathRecalcCooldown <= 0) {
                // Only update path if enough time has passed
                const targetDistance = MathUtils.distance2D(this.targetPosition, this.targetEnemy.position);
                if (targetDistance > 5) { // Increased threshold to reduce recalculations
                    this.moveTo(this.targetEnemy.position);
                    this.pathRecalcCooldown = 0.5; // Wait 0.5 seconds before recalculating
                }
            }
        }
    }

    performAttack(deltaTime) {
        if (this.attackCooldown <= 0) {
            // Face the enemy
            if (this.model && this.targetEnemy) {
                const angle = MathUtils.angleToTarget(this.position, this.targetEnemy.position);
                this.model.rotation.y = angle;
            }

            // Play attack animation
            if (this.animationController) {
                this.animationController.setState(ANIMATION_STATES.ATTACK, { force: true });
            }

            // Deal damage
            if (this.targetEnemy.takeDamage) {
                this.targetEnemy.takeDamage(this.damage);
            }

            this.attackCooldown = this.attackSpeed;
        } else {
            // Wait in combat stance
            if (this.animationController && this.animationController.getState() !== ANIMATION_STATES.COMBAT_STANCE) {
                this.animationController.setState(ANIMATION_STATES.COMBAT_STANCE);
            }
        }
    }

    scanForEnemies() {
        // Auto-detect enemies within range
        const scanRange = this.attackRange * 1.5;

        for (const unit of this.game.units) {
            if (unit.team !== this.team && unit.alive) {
                const distance = MathUtils.distance2D(this.position, unit.position);
                if (distance <= scanRange) {
                    this.attackTarget(unit);
                    return;
                }
            }
        }
    }

    takeDamage(damage) {
        super.takeDamage(damage);

        // When hit, if not already fighting, find attacker
        if (this.currentCommand !== UNIT_COMMANDS.ATTACK) {
            this.scanForEnemies();
        }
    }

    getInfo() {
        const info = super.getInfo();
        info.type = 'Fighter';
        info.damage = this.damage;
        info.status = this.getStatus();
        return info;
    }

    getStatus() {
        if (!this.alive) return 'Dead';
        if (this.currentCommand === UNIT_COMMANDS.ATTACK) {
            if (this.targetEnemy && this.targetEnemy.alive) {
                const distance = MathUtils.distance2D(this.position, this.targetEnemy.position);
                if (distance <= this.attackRange) {
                    return 'Fighting';
                } else {
                    return 'Engaging';
                }
            }
        }
        if (this.path || this.targetPosition) return 'Moving';
        return 'Idle';
    }
}
