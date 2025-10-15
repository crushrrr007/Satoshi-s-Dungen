// ============================================
// GAME LOGIC (Mining, Combat, Powerups)
// ============================================

function mine(scene) {
    if (!scene.player) return;
    
    const amount = gameState.miningPower * (hasPerk('vampire') ? 1.5 : 1);
    gameState.hashPower += amount;
    gameState.score += Math.floor(amount / 2) * (hasPerk('fortune') ? 2 : 1);
    gameState.totalMines++;

    soundManager.mine();
    scene.particles.mining.emitParticleAt(scene.player.x, scene.player.y, 8);

    scene.tweens.add({
        targets: scene.player,
        alpha: 0.5,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 100,
        yoyo: true
    });

    // Vampiric perk - heal on mining
    if (hasPerk('vampire') && gameState.health < gameState.maxHealth) {
        gameState.health = Math.min(gameState.health + 2, gameState.maxHealth);
    }

    checkAchievements();
    updateUI();
}

function attackEnemy(scene, pointer) {
    const cost = gameState.attackCost;
    if (gameState.hashPower < cost) return;

    let hitSomething = false;

    // Attack regular enemies
    scene.enemies.children.entries.forEach(enemy => {
        if (enemy && enemy.active && enemy.getBounds().contains(pointer.x, pointer.y)) {
            hitSomething = true;
            gameState.hashPower -= cost;

            const isCrit = hasPerk('crit') && Math.random() < 0.25;
            const damage = gameState.attackDamage * (isCrit ? 2 : 1);
            const currentHealth = enemy.getData('health');
            const newHealth = currentHealth - damage;
            enemy.setData('health', newHealth);

            soundManager.attack();
            scene.particles.attack.emitParticleAt(enemy.x, enemy.y, 10);

            scene.tweens.add({
                targets: enemy,
                alpha: 0.3,
                scaleX: enemy.scaleX * 1.3,
                scaleY: enemy.scaleY * 1.3,
                duration: 100,
                yoyo: true
            });

            // Show crit text
            if (isCrit) {
                showFloatingText(scene, enemy.x, enemy.y - 30, 'CRIT!', '#ff0000');
            }

            // Enemy died
            if (newHealth <= 0) {
                killEnemy(scene, enemy);
            }

            // Chain lightning perk
            if (hasPerk('chain')) {
                applyChainLightning(scene, enemy, damage);
            }

            updateUI();
        }
    });

    // Attack boss
    if (scene.boss && scene.boss.active && scene.boss.getBounds().contains(pointer.x, pointer.y)) {
        hitSomething = true;
        attackBoss(scene, scene.boss);
    }
}

function killEnemy(scene, enemy) {
    soundManager.kill();
    gameState.score += 50 * (hasPerk('fortune') ? 2 : 1);
    gameState.kills++;
    
    // Life steal perk
    if (hasPerk('lifesteal')) {
        gameState.health = Math.min(gameState.health + 5, gameState.maxHealth);
    }

    scene.particles.kill.emitParticleAt(enemy.x, enemy.y, 20);
    
    // Drop power-up chance
    if (Math.random() < GAME_CONFIG.powerupDropChance) {
        spawnPowerup(scene, enemy.x, enemy.y);
    }
    
    checkAchievements();
    enemy.destroy();
}

function applyChainLightning(scene, sourceEnemy, damage) {
    scene.enemies.children.entries.forEach(other => {
        if (other && other.active && other !== sourceEnemy) {
            const dist = Phaser.Math.Distance.Between(
                sourceEnemy.x, sourceEnemy.y, 
                other.x, other.y
            );
            if (dist < 100) {
                const otherHealth = other.getData('health');
                other.setData('health', otherHealth - damage * 0.5);
                scene.particles.attack.emitParticleAt(other.x, other.y, 5);
                
                if (otherHealth - damage * 0.5 <= 0) {
                    killEnemy(scene, other);
                }
            }
        }
    });
}

function attackBoss(scene, boss) {
    gameState.hashPower -= gameState.attackCost;

    const isCrit = hasPerk('crit') && Math.random() < 0.25;
    const damage = gameState.attackDamage * (isCrit ? 2 : 1);
    const currentHealth = boss.getData('health');
    const newHealth = currentHealth - damage;
    boss.setData('health', newHealth);

    soundManager.attack();
    scene.cameras.main.shake(100, 0.005);
    scene.particles.bossHit.emitParticleAt(boss.x, boss.y, 15);

    scene.tweens.add({
        targets: boss,
        alpha: 0.3,
        duration: 100,
        yoyo: true
    });

    if (newHealth <= 0) {
        killBoss(scene, boss);
    }

    updateUI();
}

function killBoss(scene, boss) {
    soundManager.kill();
    soundManager.levelup();
    gameState.score += 500 * (hasPerk('fortune') ? 2 : 1);
    gameState.bossesKilled++;

    scene.cameras.main.flash(1000, 255, 215, 0);
    scene.particles.bossKill.emitParticleAt(boss.x, boss.y, 50);

    const nameTag = boss.getData('nameTag');
    if (nameTag) nameTag.destroy();
    
    // Boss always drops power-up
    spawnPowerup(scene, boss.x, boss.y);
    
    checkAchievements();
    boss.destroy();
    scene.boss = null;
}

function collectPowerup(player, powerup) {
    const scene = powerup.scene;
    const type = powerup.getData('type');
    
    soundManager.powerup();
    scene.particles.powerup.emitParticleAt(powerup.x, powerup.y, 10);
    gameState.powerupsCollected++;

    switch(type) {
        case 'health':
            gameState.health = Math.min(gameState.health + 30, gameState.maxHealth);
            showFloatingText(scene, player.x, player.y, '+30 HP', '#00ff00');
            break;
            
        case 'shield':
            player.setData('shield', true);
            player.setTint(0x00ffff);
            scene.time.delayedCall(5000, () => {
                player.setData('shield', false);
                player.clearTint();
            });
            showFloatingText(scene, player.x, player.y, 'SHIELD!', '#00ffff');
            break;
            
        case 'double':
            const oldPower = gameState.miningPower;
            gameState.miningPower *= 2;
            scene.time.delayedCall(10000, () => {
                gameState.miningPower = oldPower;
            });
            showFloatingText(scene, player.x, player.y, '2X MINING!', '#ffff00');
            break;
            
        case 'score':
            const bonus = 200 * (hasPerk('fortune') ? 2 : 1);
            gameState.score += bonus;
            showFloatingText(scene, player.x, player.y, '+' + bonus, '#00ff00');
            break;
            
        case 'laser':
            scene.enemies.children.entries.forEach(enemy => {
                if (enemy && enemy.active) {
                    const health = enemy.getData('health');
                    enemy.setData('health', health - 50);
                    scene.particles.attack.emitParticleAt(enemy.x, enemy.y, 5);
                    if (health - 50 <= 0) {
                        killEnemy(scene, enemy);
                    }
                }
            });
            showFloatingText(scene, player.x, player.y, 'ZAP!', '#ff00ff');
            break;
    }

    powerup.destroy();
    updateUI();
}

function hitByProjectile(player, projectile) {
    const scene = projectile.scene;
    const shielded = player.getData('shield');
    const dodged = hasPerk('dodge') && Math.random() < 0.15;
    
    if (!shielded && !dodged) {
        takeDamage(10, scene);
        scene.particles.hit.emitParticleAt(player.x, player.y, 5);
    }
    
    projectile.destroy();
}

function takeDamage(amount, scene) {
    gameState.health -= amount;
    gameState.damageTaken += amount;

    if (gameState.health <= 0) {
        gameState.health = 0;
        gameOver(scene);
        return;
    }

    soundManager.hit();
    scene.cameras.main.shake(200, 0.01);
    scene.player.setTint(0xff0000);
    setTimeout(() => scene.player.clearTint(), 100);

    updateUI();
}

function gameOver(scene) {
    scene.physics.pause();
    
    // Stop all timers and clear entities
    scene.time.removeAllEvents();
    scene.enemies.clear(true, true);
    scene.powerups.clear(true, true);
    scene.projectiles.clear(true, true);
    if (scene.boss) scene.boss.destroy();
    
    // Create game over UI
    const bg = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.95);
    bg.setDepth(1000);

    const gameOverText = scene.add.text(400, 150, 'GAME OVER', {
        fontSize: '56px',
        fill: '#ff0000',
        fontFamily: 'Press Start 2P',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5);
    gameOverText.setDepth(1001);

    const stats = [
        `Final Score: ${gameState.score}`,
        `Level Reached: ${gameState.level}`,
        `Enemies Defeated: ${gameState.kills}`,
        `Bosses Killed: ${gameState.bossesKilled}`,
        `Power-ups Collected: ${gameState.powerupsCollected}`
    ];

    stats.forEach((stat, i) => {
        const statText = scene.add.text(400, 250 + i * 30, stat, {
            fontSize: '12px',
            fill: '#ffa500',
            fontFamily: 'Press Start 2P',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        statText.setDepth(1001);
    });

    // Buttons
    createGameOverButtons(scene);
}

function createGameOverButtons(scene) {
    const submitBtn = scene.add.text(400, 450, '📊 Submit to Leaderboard', {
        fontSize: '11px',
        fill: '#000',
        fontFamily: 'Press Start 2P',
        backgroundColor: '#ffa500',
        padding: { x: 20, y: 15 }
    }).setOrigin(0.5).setInteractive();
    submitBtn.setDepth(1001);

    submitBtn.on('pointerover', () => {
        submitBtn.setScale(1.1);
        submitBtn.setBackgroundColor('#ff8c00');
    });
    submitBtn.on('pointerout', () => {
        submitBtn.setScale(1);
        submitBtn.setBackgroundColor('#ffa500');
    });
    submitBtn.on('pointerdown', () => submitScore(gameState.score));

    const shopBtn = scene.add.text(250, 520, '⚡ Upgrade Shop', {
        fontSize: '10px',
        fill: '#000',
        fontFamily: 'Press Start 2P',
        backgroundColor: '#00ff00',
        padding: { x: 15, y: 12 }
    }).setOrigin(0.5).setInteractive();
    shopBtn.setDepth(1001);

    shopBtn.on('pointerover', () => {
        shopBtn.setScale(1.1);
        shopBtn.setBackgroundColor('#00cc00');
    });
    shopBtn.on('pointerout', () => {
        shopBtn.setScale(1);
        shopBtn.setBackgroundColor('#00ff00');
    });
    shopBtn.on('pointerdown', () => showUpgradeShop());

    const restartBtn = scene.add.text(550, 520, '🔄 Play Again', {
        fontSize: '10px',
        fill: '#000',
        fontFamily: 'Press Start 2P',
        backgroundColor: '#00ffff',
        padding: { x: 15, y: 12 }
    }).setOrigin(0.5).setInteractive();
    restartBtn.setDepth(1001);

    restartBtn.on('pointerover', () => {
        restartBtn.setScale(1.1);
        restartBtn.setBackgroundColor('#00cccc');
    });
    restartBtn.on('pointerout', () => {
        restartBtn.setScale(1);
        restartBtn.setBackgroundColor('#00ffff');
    });
    restartBtn.on('pointerdown', () => location.reload());
}