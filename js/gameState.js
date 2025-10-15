// ============================================
// GAME STATE MANAGEMENT
// ============================================

const gameState = {
    // Current run stats
    hashPower: 0,
    score: 0,
    health: 100,
    maxHealth: 100,
    level: 1,
    kills: 0,
    miningPower: 10,
    attackDamage: 30,
    attackCost: 20,
    moveSpeed: 250,
    
    // Wallet
    walletConnected: false,
    userAddress: null,
    
    // Persistent upgrades (saved)
    upgrades: {
        miningPower: 1,
        maxHealth: 1,
        attackDamage: 1,
        moveSpeed: 1,
        efficiency: 1
    },
    
    // Per-run perks
    perks: [],
    
    // Achievements (saved)
    achievements: {
        firstKill: false,
        tenKills: false,
        fiftyKills: false,
        hundredKills: false,
        firstBoss: false,
        level10: false,
        level25: false,
        miner100: false,
        survivor: false,
        perfectDodge: false
    },
    
    // Run statistics
    totalMines: 0,
    damageTaken: 0,
    powerupsCollected: 0,
    bossesKilled: 0
};

// Save/Load Functions
function saveGame() {
    const saveData = {
        upgrades: gameState.upgrades,
        achievements: gameState.achievements
    };
    localStorage.setItem('satoshiDungeonSave', JSON.stringify(saveData));
}

function loadGame() {
    const saved = localStorage.getItem('satoshiDungeonSave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState.upgrades = data.upgrades || gameState.upgrades;
            gameState.achievements = data.achievements || gameState.achievements;
        } catch (e) {
            console.error('Error loading save:', e);
        }
    }
}

// Apply upgrades to game state
function applyUpgrades() {
    gameState.miningPower = UPGRADES.miningPower.effect(gameState.upgrades.miningPower);
    gameState.maxHealth = UPGRADES.maxHealth.effect(gameState.upgrades.maxHealth);
    gameState.health = gameState.maxHealth;
    gameState.attackDamage = UPGRADES.attackDamage.effect(gameState.upgrades.attackDamage);
    gameState.moveSpeed = UPGRADES.moveSpeed.effect(gameState.upgrades.moveSpeed);
    gameState.attackCost = UPGRADES.efficiency.effect(gameState.upgrades.efficiency);
}

// Reset per-run stats
function resetRunStats() {
    gameState.score = 0;
    gameState.health = gameState.maxHealth;
    gameState.hashPower = 0;
    gameState.level = 1;
    gameState.kills = 0;
    gameState.perks = [];
    gameState.totalMines = 0;
    gameState.damageTaken = 0;
    gameState.powerupsCollected = 0;
    gameState.bossesKilled = 0;
}

// Check if player has a specific perk
function hasPerk(perkId) {
    return gameState.perks.includes(perkId);
}

// Update UI elements
function updateUI() {
    document.getElementById('hashpower').textContent = Math.floor(gameState.hashPower);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('health').textContent = Math.floor(gameState.health);
    document.getElementById('maxhealth').textContent = gameState.maxHealth;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('kills').textContent = gameState.kills;
}

// Load saved data on startup
loadGame();