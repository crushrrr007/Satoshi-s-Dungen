// ============================================
// ENTITY CREATION (Sprites, Enemies, Boss)
// ============================================

// Create all game textures
function createAllTextures(scene) {
    createPlayerTexture(scene);
    createEnemyTextures(scene);
    createBossTexture(scene);
    createPowerupTextures(scene);
    createProjectileTexture(scene);
}

function createPlayerTexture(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Body
    g.fillStyle(0xffa500, 1);
    g.fillRect(6, 8, 12, 14);
    
    // Head
    g.fillStyle(0xffcc99, 1);
    g.fillRect(8, 4, 8, 6);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(10, 6, 2, 2);
    g.fillRect(14, 6, 2, 2);
    
    // Pickaxe handle
    g.fillStyle(0x8b4513, 1);
    g.fillRect(4, 12, 2, 8);
    
    // Pickaxe head
    g.fillStyle(0x808080, 1);
    g.fillRect(2, 10, 4, 3);
    
    // Hat
    g.fillStyle(0xff6600, 1);
    g.fillRect(6, 2, 12, 3);
    
    g.generateTexture('player', 24, 24);
    g.destroy();
}

function createEnemyTextures(scene) {
    ENEMY_TYPES.forEach(enemyType => {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Body
        g.fillStyle(enemyType.color, 1);
        g.fillRect(3, 3, 14, 14);
        
        // Eyes
        g.fillStyle(0x000000, 1);
        g.fillRect(5, 5, 2, 2);
        g.fillRect(13, 5, 2, 2);
        
        // Mouth (for some enemy types)
        if (enemyType.type === 'chaser' || enemyType.type === 'shooter') {
            g.fillRect(7, 12, 6, 2);
        }
        
        g.generateTexture(enemyType.key, 20, 20);
        g.destroy();
    });
}

function createBossTexture(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Body
    g.fillStyle(0x8b0000, 1);
    g.fillRect(6, 10, 28, 30);
    
    // Head
    g.fillStyle(0xff0000, 1);
    g.fillRect(10, 6, 20, 16);
    
    // Eyes (glowing)
    g.fillStyle(0xffff00, 1);
    g.fillRect(14, 10, 4, 6);
    g.fillRect(22, 10, 4, 6);
    
    // Eye pupils
    g.fillStyle(0x000000, 1);
    g.fillRect(16, 12, 2, 3);
    g.fillRect(24, 12, 2, 3);
    
    // Crown
    g.fillStyle(0xffd700, 1);
    g.fillRect(8, 2, 24, 4);
    g.fillRect(10, 0, 4, 4);
    g.fillRect(18, 0, 4, 4);
    g.fillRect(26, 0, 4, 4);
    
    g.generateTexture('boss', 40, 40);
    g.destroy();
}

function createPowerupTextures(scene) {
    POWERUP_TYPES.forEach(powerup => {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Outer circle
        g.fillStyle(powerup.color, 1);
        g.fillCircle(10, 10, 8);
        
        // Inner circle (white)
        g.fillStyle(0xffffff, 1);
        g.fillCircle(10, 10, 4);
        
        g.generateTexture(powerup.key, 20, 20);
        g.destroy();
    });
}

function createProjectileTexture(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff0000, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('projectile', 8, 8);
    g.destroy();
}

// Spawn enemy
function spawnEnemy(scene) {
    if (!scene.enemies) return;
    
    // Random edge spawn
    const edge = Phaser.Math.Between(0, 3);
    let x, y;
    
    switch(edge) {
        case 0: x = 0; y = Phaser.Math.Between(50, 550); break;
        case 1: x = 800; y = Phaser.Math.Between(50, 550); break;
        case 2: x = Phaser.Math.Between(50, 750); y = 0; break;
        case 3: x = Phaser.Math.Between(50, 750); y = 600; break;
    }

    // Choose enemy type based on level
    const maxTypeIndex = Math.min(ENEMY_TYPES.length - 1, 2 + Math.floor(gameState.level / 5));
    const typeIndex = Math.floor(Math.random() * (maxTypeIndex + 1));
    const enemyConfig = ENEMY_TYPES[typeIndex];

    const enemy = scene.physics.add.sprite(x, y, enemyConfig.key);
    enemy.setScale(1.2);
    
    // Add glow effect
    try {
        enemy.postFX.addGlow(enemyConfig.color, 1, 0, false, 0.1, 10);
    } catch(e) {
        // Glow not supported
    }

    // Stats
    const baseSpeed = 50 + gameState.level * 5;
    const baseHP = 20 + gameState.level * 5;
    
    enemy.setData('type', enemyConfig.type);
    enemy.setData('speed', baseSpeed * enemyConfig.speedMult);
    enemy.setData('health', baseHP * enemyConfig.hpMult);
    enemy.setData('maxHealth', baseHP * enemyConfig.hpMult);
    enemy.setData('damage', 3 + gameState.level);
    enemy.setInteractive();

    scene.enemies.add(enemy);
}

// Spawn boss
function spawnBoss(scene) {
    if (scene.boss && scene.boss.active) return;

    scene.boss = scene.physics.add.sprite(400, 50, 'boss');
    scene.boss.setScale(2);
    
    try {
        scene.boss.postFX.addGlow(0xff0000, 4, 0, false, 0.2, 20);
    } catch(e) {
        // Glow not supported
    }

    const health = 200 + gameState.level * 50;
    scene.boss.setData('health', health);
    scene.boss.setData('maxHealth', health);
    scene.boss.setData('damage', 15);
    scene.boss.setData('phase', 1);
    scene.boss.setInteractive();

    // Effects
    scene.cameras.main.shake(500, 0.01);
    scene.cameras.main.flash(500, 255, 0, 0);

    // Boss name tag
    const bossText = scene.add.text(400, 20, '👑 BOSS 👑', {
        fontSize: '16px',
        fill: '#ff0000',
        fontFamily: 'Press Start 2P',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);

    scene.boss.setData('nameTag', bossText);
}

// Spawn powerup
function spawnPowerup(scene, x, y) {
    if (!scene.powerups) return;
    
    const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    const powerup = scene.physics.add.sprite(x, y, powerupType.key);
    powerup.setData('type', powerupType.type);
    
    try {
        powerup.postFX.addGlow(0x00ffff, 2, 0, false, 0.2, 10);
    } catch(e) {
        // Glow not supported
    }
    
    // Float animation
    scene.tweens.add({
        targets: powerup,
        y: powerup.y - 10,
        duration: 500,
        yoyo: true,
        repeat: -1
    });

    scene.powerups.add(powerup);

    // Auto-destroy after timeout
    scene.time.delayedCall(GAME_CONFIG.powerupLifetime, () => {
        if (powerup && powerup.active) powerup.destroy();
    });
}

// Shoot projectile
function shootProjectile(scene, shooter, target) {
    if (!scene.projectiles) return;
    
    const projectile = scene.physics.add.sprite(shooter.x, shooter.y, 'projectile');
    projectile.setScale(1.5);
    
    try {
        projectile.postFX.addGlow(0xff0000, 2, 0, false, 0.2, 10);
    } catch(e) {
        // Glow not supported
    }
    
    scene.physics.moveToObject(projectile, target, 200);
    scene.projectiles.add(projectile);

    scene.time.delayedCall(3000, () => {
        if (projectile && projectile.active) projectile.destroy();
    });
}