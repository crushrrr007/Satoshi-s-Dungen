// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

function checkAchievements() {
    const unlocked = [];

    // Kill achievements
    if (!gameState.achievements.firstKill && gameState.kills >= 1) {
        gameState.achievements.firstKill = true;
        unlocked.push('firstKill');
    }
    if (!gameState.achievements.tenKills && gameState.kills >= 10) {
        gameState.achievements.tenKills = true;
        unlocked.push('tenKills');
    }
    if (!gameState.achievements.fiftyKills && gameState.kills >= 50) {
        gameState.achievements.fiftyKills = true;
        unlocked.push('fiftyKills');
    }
    if (!gameState.achievements.hundredKills && gameState.kills >= 100) {
        gameState.achievements.hundredKills = true;
        unlocked.push('hundredKills');
    }
    
    // Boss achievements
    if (!gameState.achievements.firstBoss && gameState.bossesKilled >= 1) {
        gameState.achievements.firstBoss = true;
        unlocked.push('firstBoss');
    }
    
    // Level achievements
    if (!gameState.achievements.level10 && gameState.level >= 10) {
        gameState.achievements.level10 = true;
        unlocked.push('level10');
    }
    if (!gameState.achievements.level25 && gameState.level >= 25) {
        gameState.achievements.level25 = true;
        unlocked.push('level25');
    }
    
    // Mining achievement
    if (!gameState.achievements.miner100 && gameState.totalMines >= 100) {
        gameState.achievements.miner100 = true;
        unlocked.push('miner100');
    }

    // Show popups for newly unlocked achievements
    unlocked.forEach(id => {
        showAchievementPopup('🏆 Achievement Unlocked!', ACHIEVEMENTS_DEF[id].name);
    });

    // Save if any achievements were unlocked
    if (unlocked.length > 0) {
        saveGame();
    }
}

function showAchievementPopup(title, text) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `<div style="font-weight: bold;">${title}</div><div>${text}</div>`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 3000);
}

function showAchievements() {
    const modal = document.getElementById('achievement-modal');
    const list = document.getElementById('achievement-list');
    
    list.innerHTML = Object.keys(ACHIEVEMENTS_DEF).map(id => {
        const ach = ACHIEVEMENTS_DEF[id];
        const unlocked = gameState.achievements[id];
        return `
            <div style="background: ${unlocked ? 'rgba(0,255,0,0.1)' : 'rgba(128,128,128,0.1)'}; 
                        border: 2px solid ${unlocked ? '#00ff00' : '#666'}; 
                        padding: 15px; margin: 10px 0; border-radius: 5px;">
                <div style="font-size: 12px; color: ${unlocked ? '#00ff00' : '#666'};">${ach.name}</div>
                <div style="font-size: 9px; color: ${unlocked ? '#fff' : '#888'}; margin-top: 5px;">${ach.desc}</div>
                ${unlocked ? 
                    '<div style="font-size: 8px; color: #00ff00; margin-top: 5px;">✓ UNLOCKED</div>' : 
                    '<div style="font-size: 8px; color: #666; margin-top: 5px;">🔒 LOCKED</div>'
                }
            </div>
        `;
    }).join('');
    
    modal.style.display = 'block';
}