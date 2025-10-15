// ============================================
// PARTICLE EFFECTS
// ============================================

function createParticleSystems(scene) {
    const particles = {};
    
    const particleConfigs = [
        { key: 'mining', tint: 0xffff00, quantity: 5, gravityY: -50 },
        { key: 'attack', tint: 0xffff00, quantity: 3, gravityY: 0 },
        { key: 'hit', tint: 0xff0000, quantity: 5, gravityY: 0 },
        { key: 'kill', tint: 0x00ff00, quantity: 10, gravityY: 0 },
        { key: 'bossHit', tint: 0xff00ff, quantity: 8, gravityY: 0 },
        { key: 'bossKill', tint: 0xffd700, quantity: 30, gravityY: 100 },
        { key: 'powerup', tint: 0x00ffff, quantity: 8, gravityY: 0 }
    ];

    particleConfigs.forEach(cfg => {
        particles[cfg.key] = scene.add.particles(0, 0, 'player', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.3, end: 0 },
            rotate: { start: 0, end: 360 },
            lifespan: 600,
            tint: cfg.tint,
            quantity: cfg.quantity,
            gravityY: cfg.gravityY
        });
        particles[cfg.key].stop();
    });

    return particles;
}

function drawHealthBar(graphics, entity) {
    const health = entity.getData('health');
    const maxHealth = entity.getData('maxHealth');
    
    if (!health || !maxHealth) return;
    
    const percentage = health / maxHealth;
    const barWidth = entity.width * 1.2;
    const barHeight = 4;
    const x = entity.x - barWidth / 2;
    const y = entity.y - entity.height / 2 - 10;

    // Background
    graphics.fillStyle(0x000000, 0.8);
    graphics.fillRect(x, y, barWidth, barHeight);

    // Health
    const color = percentage > 0.5 ? 0x00ff00 : percentage > 0.25 ? 0xffff00 : 0xff0000;
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, barWidth * percentage, barHeight);

    // Border
    graphics.lineStyle(1, 0xffffff, 0.5);
    graphics.strokeRect(x, y, barWidth, barHeight);
}

function showFloatingText(scene, x, y, text, color) {
    const floatText = scene.add.text(x, y, text, {
        fontSize: '12px',
        fill: color,
        fontFamily: 'Press Start 2P',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: floatText,
        y: floatText.y - 50,
        alpha: 0,
        duration: 1500,
        onComplete: () => floatText.destroy()
    });
}