// ============================================
// MAIN ENTRY POINT
// ============================================

let game;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wallet connection
    initWallet();
    
    // Start game button
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Show achievements button
    document.getElementById('show-achievements').addEventListener('click', showAchievements);
    
    console.log('🎮 Satoshi\'s Dungeon loaded!');
});

function startGame() {
    // Initialize sound
    soundManager.init();
    
    // Hide title screen
    document.getElementById('title-screen').style.display = 'none';
    
    // Apply upgrades to game state
    applyUpgrades();
    
    // Create Phaser game
    const config = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        backgroundColor: '#0a0a15'
    };

    game = new Phaser.Game(config);
}

// Global utility functions
window.startGame = startGame;

console.log(`
⛏️ ======================================== ⛏️
   SATOSHI'S DUNGEON - ULTIMATE EDITION
⛏️ ======================================== ⛏️
   
   🎮 Controls:
   - Arrow Keys: Move
   - SPACE: Mine
   - Click: Attack
   - ESC: Pause
   
   🔗 Built for Stacks Vibe Coding Hackathon
   🏆 Features: Upgrades, Perks, Achievements
   📚 Educational Bitcoin Content
   
⛏️ ======================================== ⛏️
`);