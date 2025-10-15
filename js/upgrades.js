// ============================================
// UPGRADE & PERK SYSTEM
// ============================================

function showUpgradeShop() {
    const modal = document.getElementById('upgrade-modal');
    const list = document.getElementById('upgrade-list');
    document.getElementById('upgrade-score').textContent = gameState.score;

    list.innerHTML = Object.keys(UPGRADES).map(key => {
        const upgrade = UPGRADES[key];
        const currentLevel = gameState.upgrades[key];
        const cost = upgrade.baseCost * currentLevel;
        const canAfford = gameState.score >= cost;
        const maxed = currentLevel >= upgrade.maxLevel;

        return `
            <div class="upgrade-item ${!canAfford || maxed ? 'locked' : ''}" 
                 onclick="${!maxed && canAfford ? `buyUpgrade('${key}')` : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 12px; color: #ffa500;">${upgrade.name}</div>
                        <div style="font-size: 9px; margin-top: 5px;">${upgrade.desc}</div>
                        <div style="font-size: 8px; color: #00ff00; margin-top: 5px;">
                            Level: ${currentLevel}/${upgrade.maxLevel}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        ${maxed ? 
                            '<div style="color: #00ff00;">MAX</div>' : 
                            `<div style="color: ${canAfford ? '#ffff00' : '#ff0000'};">${cost} pts</div>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');

    modal.style.display = 'block';
}

function buyUpgrade(key) {
    const upgrade = UPGRADES[key];
    const currentLevel = gameState.upgrades[key];
    const cost = upgrade.baseCost * currentLevel;

    if (gameState.score >= cost && currentLevel < upgrade.maxLevel) {
        gameState.score -= cost;
        gameState.upgrades[key]++;
        saveGame();
        applyUpgrades();
        showUpgradeShop(); // Refresh display
        updateUI();
        soundManager.powerup();
    }
}

function closeUpgradeShop() {
    document.getElementById('upgrade-modal').style.display = 'none';
}

// Perk System
function offerPerk(scene) {
    if (!scene) return;
    
    scene.perksPending = true;
    scene.physics.pause();

    const available = PERKS.filter(p => !gameState.perks.includes(p.id));
    if (available.length === 0) {
        scene.perksPending = false;
        scene.physics.resume();
        return;
    }

    // Select 3 random perks
    const choices = [];
    for (let i = 0; i < Math.min(3, available.length); i++) {
        const index = Math.floor(Math.random() * available.length);
        choices.push(available[index]);
        available.splice(index, 1);
    }

    const modal = document.getElementById('perk-modal');
    const list = document.getElementById('perk-list');
    list.innerHTML = choices.map(perk => `
        <div class="perk-item" onclick="selectPerk('${perk.id}')">
            <div style="font-size: 12px; color: #ffa500; margin-bottom: 5px;">${perk.name}</div>
            <div style="font-size: 9px;">${perk.desc}</div>
        </div>
    `).join('');
    modal.style.display = 'block';
}

function selectPerk(perkId) {
    gameState.perks.push(perkId);
    document.getElementById('perk-modal').style.display = 'none';
    
    const perk = PERKS.find(p => p.id === perkId);
    showAchievementPopup('🎁 Perk Unlocked!', perk.name);
    
    // Resume game
    if (window.currentScene) {
        window.currentScene.perksPending = false;
        window.currentScene.physics.resume();
    }
}

// Make functions globally available
window.buyUpgrade = buyUpgrade;
window.closeUpgradeShop = closeUpgradeShop;
window.selectPerk = selectPerk;