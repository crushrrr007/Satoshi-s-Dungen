// ============================================
// GAME CONFIGURATION
// ============================================

const GAME_CONFIG = {
    width: 800,
    height: 600,
    enemySpawnInterval: 2000,
    levelDuration: 15000,
    bossInterval: 5, // Boss every 5 levels
    perkInterval: 3, // Perk every 3 levels
    powerupDropChance: 0.15,
    powerupLifetime: 10000
};

// Upgrade definitions
const UPGRADES = {
    miningPower: {
        name: "⛏️ Mining Power",
        desc: "Mine more HashPower per click",
        baseCost: 500,
        maxLevel: 5,
        effect: (level) => 10 + (level * 5)
    },
    maxHealth: {
        name: "❤️ Max Health",
        desc: "Increase maximum health",
        baseCost: 750,
        maxLevel: 5,
        effect: (level) => 100 + (level * 25)
    },
    attackDamage: {
        name: "⚔️ Attack Damage",
        desc: "Deal more damage to enemies",
        baseCost: 600,
        maxLevel: 5,
        effect: (level) => 30 + (level * 15)
    },
    moveSpeed: {
        name: "🏃 Movement Speed",
        desc: "Move faster to dodge enemies",
        baseCost: 400,
        maxLevel: 5,
        effect: (level) => 250 + (level * 25)
    },
    efficiency: {
        name: "⚡ Efficiency",
        desc: "Reduce attack HashPower cost",
        baseCost: 800,
        maxLevel: 5,
        effect: (level) => Math.max(5, 20 - (level * 3))
    }
};

// Perk definitions
const PERKS = [
    { id: 'crit', name: '💥 Critical Strike', desc: '25% chance for 2x damage' },
    { id: 'lifesteal', name: '💚 Life Steal', desc: 'Heal 5 HP per enemy kill' },
    { id: 'chain', name: '⚡ Chain Lightning', desc: 'Attacks hit nearby enemies' },
    { id: 'shield', name: '🛡️ Regeneration', desc: 'Heal 1 HP every 2 seconds' },
    { id: 'haste', name: '💨 Haste', desc: '+50% attack speed' },
    { id: 'fortune', name: '💰 Fortune', desc: '2x score from all sources' },
    { id: 'vampire', name: '🧛 Vampiric', desc: 'Life steal on mining too' },
    { id: 'dodge', name: '👻 Phase Shift', desc: '15% chance to dodge attacks' }
];

// Achievement definitions
const ACHIEVEMENTS_DEF = {
    firstKill: { name: '🎯 First Blood', desc: 'Defeat your first enemy' },
    tenKills: { name: '⚔️ Warrior', desc: 'Defeat 10 enemies in one run' },
    fiftyKills: { name: '🗡️ Slayer', desc: 'Defeat 50 enemies in one run' },
    hundredKills: { name: '👑 Legend', desc: 'Defeat 100 enemies in one run' },
    firstBoss: { name: '🏆 Boss Hunter', desc: 'Defeat your first boss' },
    level10: { name: '📊 Survivor', desc: 'Reach level 10' },
    level25: { name: '💎 Elite', desc: 'Reach level 25' },
    miner100: { name: '⛏️ Master Miner', desc: 'Mine 100 times in one run' },
    survivor: { name: '❤️ Undying', desc: 'Reach level 15 without upgrades' },
    perfectDodge: { name: '👻 Untouchable', desc: 'Complete 5 levels without taking damage' }
};

// Educational tooltips about Bitcoin
const BITCOIN_EDUCATION = {
    mining: "⛏️ MINING: In Bitcoin, mining is the process of validating transactions and adding them to the blockchain. Miners use computational power (hashpower) to solve complex puzzles.",
    hashpower: "💪 HASHPOWER: The computational power used in Bitcoin mining. More hashpower = higher chance of mining a block and earning rewards.",
    block: "📦 BLOCK: A collection of Bitcoin transactions. Blocks are added to the blockchain approximately every 10 minutes.",
    security: "🛡️ SECURITY: Bitcoin's security comes from its decentralized network of miners. Attacking the network would require 51% of total hashpower.",
    difficulty: "📈 DIFFICULTY: Bitcoin automatically adjusts mining difficulty every 2016 blocks to maintain ~10 minute block times."
};

// Enemy type configurations
const ENEMY_TYPES = [
    { key: 'enemy1', type: 'chaser', speedMult: 1.0, hpMult: 1.0, color: 0xff0000 },
    { key: 'enemy2', type: 'ghost', speedMult: 1.4, hpMult: 0.75, color: 0x8b00ff },
    { key: 'enemy3', type: 'slime', speedMult: 0.6, hpMult: 1.5, color: 0x00ff00 },
    { key: 'enemy4', type: 'fast', speedMult: 2.0, hpMult: 0.5, color: 0xff6600 },
    { key: 'enemy5', type: 'tank', speedMult: 0.5, hpMult: 2.5, color: 0x0088ff },
    { key: 'enemy6', type: 'shooter', speedMult: 0.8, hpMult: 0.9, color: 0xff1493 }
];

// Powerup configurations
const POWERUP_TYPES = [
    { key: 'powerup_health', type: 'health', color: 0xff0000 },
    { key: 'powerup_shield', type: 'shield', color: 0x00ffff },
    { key: 'powerup_double', type: 'double', color: 0xffff00 },
    { key: 'powerup_score', type: 'score', color: 0x00ff00 },
    { key: 'powerup_laser', type: 'laser', color: 0xff00ff }
];