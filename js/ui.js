// ============================================
// UI MANAGEMENT
// ============================================

// Wallet Integration
function initWallet() {
    document.getElementById('connect-wallet').addEventListener('click', async () => {
        try {
            await connectStacksWallet(); // Use new blockchain.js function
        } catch (error) {
            console.error('Wallet connection error:', error);
            alert('Failed to connect wallet. Please make sure you have a Stacks wallet installed.');
        }
    });
}

// Pause Menu
function showPauseMenu() {
    const menu = document.createElement('div');
    menu.id = 'pause-menu';
    menu.className = 'modal';
    menu.style.display = 'block';
    menu.innerHTML = `
        <h2>⏸️ PAUSED ⏸️</h2>
        <div style="text-align: center; margin: 30px 0;">
            <button onclick="resumeGame()" style="width: 200px; margin: 10px;">Resume</button>
            <button onclick="openUpgradeShop()" style="width: 200px; margin: 10px; background: linear-gradient(180deg, #00ff00, #00cc00);">
                Upgrade Shop
            </button>
            <button onclick="showEducation()" style="width: 200px; margin: 10px; background: linear-gradient(180deg, #00ffff, #00aaaa);">
                Learn Bitcoin
            </button>
            <button onclick="location.reload()" style="width: 200px; margin: 10px; background: linear-gradient(180deg, #ff0000, #cc0000);">
                Quit to Menu
            </button>
        </div>
    `;
    document.body.appendChild(menu);
}

function resumeGame() {
    if (window.currentScene) {
        window.currentScene.isPaused = false;
        window.currentScene.physics.resume();
    }
    document.getElementById('pause-menu')?.remove();
}

function openUpgradeShop() {
    document.getElementById('pause-menu')?.remove();
    showUpgradeShop();
}

function showEducation() {
    document.getElementById('pause-menu')?.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <h2>📚 LEARN BITCOIN 📚</h2>
        <div style="font-size: 9px; line-height: 1.8;">
            ${Object.values(BITCOIN_EDUCATION).map(text => 
                `<p style="margin: 15px 0;">${text}</p>`
            ).join('')}
        </div>
        <button onclick="closeEducation()" class="btn-full">Close</button>
    `;
    document.body.appendChild(modal);
}

function closeEducation() {
    document.querySelectorAll('.modal').forEach(m => {
        if (m.querySelector('h2')?.textContent.includes('BITCOIN')) {
            m.remove();
        }
    });
    if (window.currentScene && window.currentScene.isPaused) {
        showPauseMenu();
    }
}

// Blockchain Score Submission
async function submitScore(score) {
    if (!gameState.walletConnected) {
        alert('🔗 Please connect your Stacks wallet first to submit your score to the blockchain!');
        return;
    }

    try {
        soundManager.levelup();
        alert(`🎉 Score ${score} submitted to blockchain!\n\n(In production, this calls the Clarity smart contract)`);
        // TODO: Implement actual Clarity contract call
        // await callContractFunction('submit-score', [uintCV(score)])
    } catch (error) {
        console.error('Error submitting score:', error);
        alert('❌ Error submitting score. Please try again.');
    }
}

// Make functions globally available
window.resumeGame = resumeGame;
window.openUpgradeShop = openUpgradeShop;
window.showEducation = showEducation;
window.closeEducation = closeEducation;
window.submitScore = submitScore;