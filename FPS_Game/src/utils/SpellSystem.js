import * as THREE from 'three';

export default class SpellSystem {
    static spells = {
        fireball: {
            name: 'Fireball',
            manaCost: 10,
            damage: 30,
            speed: 40,
            size: 0.3,
            color: 0xff4500,
            trailColor: 0xff8c00,
            cooldown: 0.5,
            effect: 'explosion',
            particleCount: 20
        },
        iceShard: {
            name: 'Ice Shard',
            manaCost: 8,
            damage: 20,
            speed: 50,
            size: 0.25,
            color: 0x00ffff,
            trailColor: 0x87ceeb,
            cooldown: 0.3,
            effect: 'freeze',
            particleCount: 15
        },
        lightning: {
            name: 'Lightning Bolt',
            manaCost: 15,
            damage: 40,
            speed: 80,
            size: 0.2,
            color: 0xffff00,
            trailColor: 0xffffff,
            cooldown: 0.8,
            effect: 'chain',
            particleCount: 25
        },
        arcane: {
            name: 'Arcane Missile',
            manaCost: 5,
            damage: 15,
            speed: 60,
            size: 0.2,
            color: 0x9370db,
            trailColor: 0xba55d3,
            cooldown: 0.2,
            effect: 'homing',
            particleCount: 10
        },
        shadowBolt: {
            name: 'Shadow Bolt',
            manaCost: 12,
            damage: 35,
            speed: 45,
            size: 0.35,
            color: 0x4b0082,
            trailColor: 0x000000,
            cooldown: 0.6,
            effect: 'poison',
            particleCount: 18
        }
    };

    static createSpellProjectile(scene, spellType, position, direction) {
        const spell = this.spells[spellType];
        if (!spell) return null;

        // Create main projectile
        const geometry = new THREE.SphereGeometry(spell.size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: spell.color,
            emissive: spell.color,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        });
        const projectile = new THREE.Mesh(geometry, material);
        projectile.position.copy(position);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(spell.size * 1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: spell.trailColor,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        projectile.add(glow);

        // Add point light for illumination
        const light = new THREE.PointLight(spell.color, 2, 10);
        projectile.add(light);

        // Store spell data
        projectile.userData = {
            velocity: direction.normalize().multiplyScalar(spell.speed),
            lifetime: 5,
            spellType: spellType,
            damage: spell.damage,
            effect: spell.effect,
            particles: []
        };

        scene.add(projectile);
        return projectile;
    }

    static createSpellParticles(scene, position, spellType) {
        const spell = this.spells[spellType];
        if (!spell) return;

        const particles = [];

        for (let i = 0; i < spell.particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: spell.trailColor,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.copy(position);

            const angle = (Math.PI * 2 * i) / spell.particleCount;
            const speed = Math.random() * 5 + 3;
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * 3 + 1,
                    Math.sin(angle) * speed
                ),
                lifetime: Math.random() * 0.5 + 0.5
            };

            scene.add(particle);
            particles.push(particle);
        }

        return particles;
    }

    static createExplosionEffect(scene, position, spellType) {
        const spell = this.spells[spellType];
        if (!spell) return;

        // Create explosion sphere
        const explosionGeometry = new THREE.SphereGeometry(1, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: spell.color,
            transparent: true,
            opacity: 0.6
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);

        explosion.userData = {
            maxScale: 3,
            growthRate: 10,
            lifetime: 0.3
        };

        scene.add(explosion);
        return explosion;
    }

    static applySpellEffect(target, spellType, damage) {
        if (!target || !target.takeDamage) return;

        const spell = this.spells[spellType];
        target.takeDamage(damage);

        // Apply special effects
        switch (spell.effect) {
            case 'freeze':
                if (target.speed) {
                    target.originalSpeed = target.speed;
                    target.speed *= 0.5;
                    setTimeout(() => {
                        if (target.originalSpeed) {
                            target.speed = target.originalSpeed;
                        }
                    }, 2000);
                }
                break;

            case 'poison':
                if (!target.poisoned) {
                    target.poisoned = true;
                    const poisonDamage = damage * 0.2;
                    const poisonInterval = setInterval(() => {
                        if (target.health > 0) {
                            target.takeDamage(poisonDamage);
                        } else {
                            clearInterval(poisonInterval);
                            target.poisoned = false;
                        }
                    }, 500);

                    setTimeout(() => {
                        clearInterval(poisonInterval);
                        target.poisoned = false;
                    }, 3000);
                }
                break;

            case 'chain':
                // Chain lightning could hit nearby enemies
                // This would need access to the enemies array
                console.log('Chain lightning effect!');
                break;

            case 'explosion':
                // AOE damage
                console.log('Explosion effect!');
                break;

            case 'homing':
                // Already homes in on target during flight
                break;
        }
    }

    static updateSpellProjectile(projectile, deltaTime, scene) {
        if (!projectile.userData) return;

        projectile.position.add(
            projectile.userData.velocity.clone().multiplyScalar(deltaTime)
        );

        projectile.userData.lifetime -= deltaTime;

        // Rotate for visual effect
        projectile.rotation.x += deltaTime * 5;
        projectile.rotation.y += deltaTime * 3;

        // Pulse effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 1;
        if (projectile.children[0]) {
            projectile.children[0].scale.set(pulse, pulse, pulse);
        }

        // Create trail particles
        if (Math.random() < 0.3) {
            const trailParticle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: this.spells[projectile.userData.spellType].trailColor,
                    transparent: true,
                    opacity: 0.6
                })
            );
            trailParticle.position.copy(projectile.position);
            trailParticle.userData = { lifetime: 0.3 };
            scene.add(trailParticle);

            setTimeout(() => {
                scene.remove(trailParticle);
            }, 300);
        }

        return projectile.userData.lifetime > 0;
    }

    static getSpellList() {
        return Object.keys(this.spells);
    }

    static getSpellInfo(spellType) {
        return this.spells[spellType];
    }
}
