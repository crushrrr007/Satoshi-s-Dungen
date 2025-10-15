// ============================================
// PHASER GAME SCENES
// ============================================

function preload() {
    // Create all game textures
    createAllTextures(this);
}

function create() {
    // Store scene reference globally
    window.currentScene = this;
    this.isPaused = false;
    this.perksPending = false;

    // Reset run stats
    resetRunStats();

    // Draw dungeon floor
    drawDungeonFloor(this);

    // Create player
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5);
    
    try {
        this.player.postFX.addGlow(0xffa500, 2, 0, false, 0.1, 10);
    } catch(e) {
        // Glow not supported
    }

    // Create groups
    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.boss = null;

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Particle systems
    this.particles = createParticleSystems(this);

    // Graphics for health bars
    this.graphics = this.add.graphics();

    // Game timers
    setupGameTimers(this);

    // Overlap detection
    this.physics.add.overlap(this.player, this.powerups, collectPowerup, null, this);
    this.physics.add.overlap(this.player, this.projectiles, hitByProjectile, null, this);

    // Click to attack
    this.input.on('pointerdown', (pointer) => {
        if (!this.isPaused && !this.perksPending) {
            attackEnemy(this, pointer);
        }
    });

    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
        spawnEnemy(this);
    }

    updateUI();
}

function setupGameTimers(scene) {
    // Enemy spawn timer
    scene.time.addEvent({
        delay: GAME_CONFIG.enemySpawnInterval,
        callback: () => {
            if (!scene.isPaused) spawnEnemy(scene);
        },
        loop: true
    });

    // Level up timer
    scene.time.addEvent({
        delay: GAME_CONFIG.levelDuration,
        callback: () => {
            if (!scene.isPaused) {
                gameState.level++;
                soundManager.levelup();
                scene.cameras.main.flash(500, 0, 255, 0);
                checkAchievements();
                
                // Perk selection
                if (gameState.level % GAME_CONFIG.perkInterval === 0) {
                    offerPerk(scene);
                }
                
                // Boss spawn
                if (gameState.level % GAME_CONFIG.bossInterval === 0) {
                    spawnBoss(scene);
                }
                
                updateUI();
            }
        },
        loop: true
    });

    // Regeneration perk timer
    scene.time.addEvent({
        delay: 2000,
        callback: () => {
            if (!scene.isPaused && hasPerk('shield') && gameState.health < gameState.maxHealth) {
                gameState.health = Math.min(gameState.health + 1, gameState.maxHealth);
                updateUI();
            }
        },
        loop: true
    });
}

function update() {
    if (!this.player || this.isPaused || this.perksPending) return;

    // Pause toggle
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        togglePause(this);
    }

    // Player movement
    this.player.body.setVelocity(0);
    
    if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-gameState.moveSpeed);
        this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(gameState.moveSpeed);
        this.player.flipX = false;
    }
    
    if (this.cursors.up.isDown) {
        this.player.body.setVelocityY(-gameState.moveSpeed);
    } else if (this.cursors.down.isDown) {
        this.player.body.setVelocityY(gameState.moveSpeed);
    }

    // Mining
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        mine(this);
    }

    // Clear and redraw health bars
    this.graphics.clear();

    // Update enemies
    updateEnemies(this);

    // Update boss
    if (this.boss && this.boss.active) {
        updateBoss(this);
    }
}

function updateEnemies(scene) {
    scene.enemies.children.entries.forEach(enemy => {
        if (!enemy || !enemy.active) return;

        const type = enemy.getData('type');
        const speed = enemy.getData('speed');
        
        // Different AI behaviors
        if (type === 'shooter') {
            const dist = Phaser.Math.Distance.Between(
                scene.player.x, scene.player.y, 
                enemy.x, enemy.y
            );
            
            if (dist > 200) {
                scene.physics.moveToObject(enemy, scene.player, speed);
            } else if (dist < 150) {
                scene.physics.moveToObject(enemy, scene.player, -speed);
            }
            
            // Shoot projectile
            if (Math.random() < 0.01) {
                shootProjectile(scene, enemy, scene.player);
            }
        } else {
            scene.physics.moveToObject(enemy, scene.player, speed);
        }

        drawHealthBar(scene.graphics, enemy);

        // Collision with player
        if (Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.x, enemy.y) < 30) {
            const dodged = hasPerk('dodge') && Math.random() < 0.15;
            if (!dodged) {
                takeDamage(enemy.getData('damage'), scene);
                scene.particles.hit.emitParticleAt(scene.player.x, scene.player.y, 5);
            }
            enemy.destroy();
        }
    });
}

function updateBoss(scene) {
    const phase = scene.boss.getData('phase') || 1;
    const health = scene.boss.getData('health');
    const maxHealth = scene.boss.getData('maxHealth');
    const healthPercent = health / maxHealth;

    // Phase transitions
    if (healthPercent < 0.5 && phase === 1) {
        scene.boss.setData('phase', 2);
        for (let i = 0; i < 3; i++) spawnEnemy(scene);
    }

    if (healthPercent < 0.25 && phase === 2) {
        scene.boss.setData('phase', 3);
    }

    // Phase 3: shoot projectiles
    if (phase === 3 && Math.random() < 0.02) {
        shootProjectile(scene, scene.boss, scene.player);
    }

    scene.physics.moveToObject(scene.boss, scene.player, 40);
    drawHealthBar(scene.graphics, scene.boss);

    // Collision with player
    if (Phaser.Math.Distance.Between(scene.player.x, scene.player.y, scene.boss.x, scene.boss.y) < 40) {
        const dodged = hasPerk('dodge') && Math.random() < 0.15;
        if (!dodged) {
            takeDamage(15, scene);
            scene.particles.hit.emitParticleAt(scene.player.x, scene.player.y, 8);
        }
    }
}

function togglePause(scene) {
    scene.isPaused = !scene.isPaused;
    
    if (scene.isPaused) {
        scene.physics.pause();
        showPauseMenu();
    } else {
        scene.physics.resume();
        document.getElementById('pause-menu')?.remove();
    }
}

function drawDungeonFloor(scene) {
    const tiles = scene.add.graphics();
    const tileSize = 40;
    
    for (let x = 0; x < 800; x += tileSize) {
        for (let y = 0; y < 600; y += tileSize) {
            const color = ((x/tileSize) + (y/tileSize)) % 2 === 0 ? 0x1a1a2e : 0x16213e;
            tiles.fillStyle(color, 1);
            tiles.fillRect(x, y, tileSize, tileSize);
            tiles.lineStyle(1, 0x0a0a15, 0.5);
            tiles.strokeRect(x, y, tileSize, tileSize);
        }
    }
}