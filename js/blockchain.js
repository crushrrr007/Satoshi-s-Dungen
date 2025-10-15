// ============================================
// STACKS BLOCKCHAIN INTEGRATION
// Uses @stacks/connect and @stacks/transactions from CDN
// ============================================

// Configuration
const BLOCKCHAIN_CONFIG = {
    network: 'testnet', // or 'mainnet'
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // REPLACE WITH YOUR DEPLOYED CONTRACT
    contractName: 'satoshis-dungeon-leaderboard',
    apiBase: 'https://api.testnet.hiro.so', // or 'https://api.hiro.so' for mainnet
    explorerBase: 'https://explorer.hiro.so/?chain=testnet'
};

// ============================================
// WALLET CONNECTION
// ============================================

/**
 * Connect user's Stacks wallet using @stacks/connect
 */
async function connectStacksWallet() {
    try {
        // Import from global @stacks/connect
        const { connect } = window.StacksConnect;
        
        const response = await connect({
            appDetails: {
                name: "Satoshi's Dungeon",
                icon: window.location.origin + "/favicon.ico"
            },
            onFinish: (data) => {
                console.log('Wallet connected successfully:', data);
                
                // Get address from response
                const stxAddress = data.userSession.loadUserData().profile.stxAddress[BLOCKCHAIN_CONFIG.network];
                
                if (stxAddress) {
                    gameState.walletConnected = true;
                    gameState.userAddress = stxAddress;
                    
                    // Update UI
                    updateWalletUI(stxAddress);
                    
                    // Load player stats from blockchain
                    loadPlayerStatsFromChain(stxAddress);
                    
                    // Show success message
                    showNotification('Wallet connected successfully!', 'success');
                }
            },
            onCancel: () => {
                console.log('User cancelled wallet connection');
                showNotification('Wallet connection cancelled', 'info');
            }
        });
        
        return response;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Disconnect wallet
 */
function disconnectStacksWallet() {
    const { disconnect } = window.StacksConnect;
    disconnect();
    
    gameState.walletConnected = false;
    gameState.userAddress = null;
    
    // Update UI
    document.getElementById('wallet-info').style.display = 'none';
    document.getElementById('connect-wallet').textContent = 'Connect Wallet';
    document.getElementById('connect-wallet').disabled = false;
    
    showNotification('Wallet disconnected', 'info');
}

/**
 * Check if wallet is currently connected
 */
function isWalletConnected() {
    const { isConnected } = window.StacksConnect;
    return isConnected();
}

/**
 * Update wallet UI after connection
 */
function updateWalletUI(address) {
    const walletInfo = document.getElementById('wallet-info');
    walletInfo.style.display = 'block';
    walletInfo.innerHTML = `
        <div style="font-size: 8px;">
            <div>✓ ${shortenAddress(address)}</div>
            <div style="margin-top: 5px;">
                <a href="${BLOCKCHAIN_CONFIG.explorerBase}/address/${address}" 
                   target="_blank" 
                   style="color: #ffa500; text-decoration: none;">
                    View on Explorer
                </a>
            </div>
        </div>
    `;
    
    document.getElementById('connect-wallet').textContent = 'Connected ✓';
    document.getElementById('connect-wallet').disabled = true;
}

// ============================================
// SMART CONTRACT WRITE FUNCTIONS
// ============================================

/**
 * Submit score to blockchain leaderboard
 */
async function submitScoreToBlockchain(score, level, kills) {
    if (!gameState.walletConnected) {
        showNotification('Please connect your wallet first!', 'error');
        return null;
    }

    try {
        const { openContractCall } = window.StacksConnect;
        const { uintCV, FungibleConditionCode } = window.StacksTransactions;
        
        showNotification('Submitting score to blockchain...', 'info');

        const options = {
            network: BLOCKCHAIN_CONFIG.network,
            contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
            contractName: BLOCKCHAIN_CONFIG.contractName,
            functionName: 'submit-score',
            functionArgs: [
                uintCV(score),
                uintCV(level),
                uintCV(kills)
            ],
            onFinish: (data) => {
                console.log('Transaction submitted:', data);
                const txId = data.txId;
                
                showNotification(
                    `Score submitted! <a href="${getExplorerTxUrl(txId)}" target="_blank" style="color: #00ff00;">View Transaction</a>`,
                    'success',
                    10000
                );
                
                // Monitor transaction status
                monitorTransaction(txId);
                
                return txId;
            },
            onCancel: () => {
                showNotification('Transaction cancelled', 'info');
            }
        };

        await openContractCall(options);
    } catch (error) {
        console.error('Error submitting score:', error);
        showNotification('Failed to submit score: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Unlock achievement on blockchain
 */
async function unlockAchievementOnChain(achievementType) {
    if (!gameState.walletConnected) {
        return;
    }

    try {
        const { openContractCall } = window.StacksConnect;
        const { stringAsciiCV } = window.StacksTransactions;

        await openContractCall({
            network: BLOCKCHAIN_CONFIG.network,
            contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
            contractName: BLOCKCHAIN_CONFIG.contractName,
            functionName: 'unlock-achievement',
            functionArgs: [stringAsciiCV(achievementType)],
            onFinish: (data) => {
                console.log('Achievement unlocked on-chain:', achievementType);
                showNotification('Achievement unlocked on blockchain! 🏆', 'success');
            }
        });
    } catch (error) {
        console.error('Error unlocking achievement:', error);
    }
}

// ============================================
// SMART CONTRACT READ FUNCTIONS
// ============================================

/**
 * Get player statistics from blockchain
 */
async function loadPlayerStatsFromChain(address) {
    try {
        const { callReadOnlyFunction, standardPrincipalCV, cvToJSON } = window.StacksTransactions;
        const { StacksTestnet, StacksMainnet } = window.StacksNetwork;
        
        const network = BLOCKCHAIN_CONFIG.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

        const result = await callReadOnlyFunction({
            contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
            contractName: BLOCKCHAIN_CONFIG.contractName,
            functionName: 'get-player-stats',
            functionArgs: [standardPrincipalCV(address)],
            network: network,
            senderAddress: address
        });

        const statsData = cvToJSON(result);
        console.log('Player stats from blockchain:', statsData);
        
        const stats = {
            highScore: parseInt(statsData.value['high-score'].value),
            totalGames: parseInt(statsData.value['total-games'].value),
            totalKills: parseInt(statsData.value['total-kills'].value),
            highestLevel: parseInt(statsData.value['highest-level'].value)
        };
        
        // Display stats in UI
        displayBlockchainStats(stats);
        
        return stats;
    } catch (error) {
        console.error('Error loading player stats:', error);
        return null;
    }
}

/**
 * Get total players from blockchain
 */
async function getTotalPlayers() {
    try {
        const { callReadOnlyFunction, cvToJSON } = window.StacksTransactions;
        const { StacksTestnet, StacksMainnet } = window.StacksNetwork;
        
        const network = BLOCKCHAIN_CONFIG.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

        const result = await callReadOnlyFunction({
            contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
            contractName: BLOCKCHAIN_CONFIG.contractName,
            functionName: 'get-total-players',
            functionArgs: [],
            network: network,
            senderAddress: BLOCKCHAIN_CONFIG.contractAddress
        });

        return parseInt(cvToJSON(result).value);
    } catch (error) {
        console.error('Error getting total players:', error);
        return 0;
    }
}

// ============================================
// STACKS API CALLS
// ============================================

/**
 * Monitor transaction status
 */
async function monitorTransaction(txId) {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes
    
    const checkStatus = async () => {
        try {
            const response = await fetch(`${BLOCKCHAIN_CONFIG.apiBase}/extended/v1/tx/${txId}`);
            const data = await response.json();
            
            if (data.tx_status === 'success') {
                showNotification('Transaction confirmed! ✓', 'success');
                return true;
            } else if (data.tx_status === 'failed') {
                showNotification('Transaction failed ✗', 'error');
                return true;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkStatus, 10000); // Check every 10 seconds
            } else {
                showNotification('Transaction is taking longer than expected...', 'info');
            }
        } catch (error) {
            console.error('Error checking transaction:', error);
        }
    };
    
    setTimeout(checkStatus, 10000); // Start checking after 10 seconds
}

/**
 * Get account balance
 */
async function getAccountBalance(address) {
    try {
        const response = await fetch(`${BLOCKCHAIN_CONFIG.apiBase}/extended/v1/address/${address}/balances`);
        const data = await response.json();
        
        return {
            stx: parseInt(data.stx.balance) / 1000000, // Convert from micro-STX
            locked: parseInt(data.stx.locked) / 1000000
        };
    } catch (error) {
        console.error('Error getting balance:', error);
        return null;
    }
}

/**
 * Display blockchain stats in UI
 */
function displayBlockchainStats(stats) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'blockchain-stats-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <h2>📊 YOUR BLOCKCHAIN STATS 📊</h2>
        <div style="font-size: 11px; line-height: 2;">
            <p><strong>🏆 All-Time High Score:</strong> ${stats.highScore}</p>
            <p><strong>🎮 Total Games Played:</strong> ${stats.totalGames}</p>
            <p><strong>⚔️ Total Enemies Defeated:</strong> ${stats.totalKills}</p>
            <p><strong>📊 Highest Level Reached:</strong> ${stats.highestLevel}</p>
            <p style="margin-top: 20px; color: #ffa500; font-size: 9px;">
                * Stats are stored permanently on the Stacks blockchain
            </p>
        </div>
        <button onclick="this.parentElement.remove()" style="margin-top: 20px; width: 100%;">Close</button>
    `;
    document.body.appendChild(modal);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show notification to user
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'achievement-popup';
    
    const bgColors = {
        success: 'rgba(0,255,0,0.9)',
        error: 'rgba(255,0,0,0.9)',
        info: 'rgba(0,191,255,0.9)'
    };
    
    const borderColors = {
        success: '#00ff00',
        error: '#ff0000',
        info: '#00bfff'
    };
    
    notification.style.background = `linear-gradient(135deg, ${bgColors[type]}, ${bgColors[type]})`;
    notification.style.borderColor = borderColors[type];
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

/**
 * Format STX amount for display
 */
function formatSTX(microSTX) {
    return (parseInt(microSTX) / 1000000).toFixed(6);
}

/**
 * Shorten address for display
 */
function shortenAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get explorer URL for transaction
 */
function getExplorerTxUrl(txId) {
    return `${BLOCKCHAIN_CONFIG.explorerBase}/txid/${txId}?chain=${BLOCKCHAIN_CONFIG.network}`;
}

/**
 * Get explorer URL for address
 */
function getExplorerAddressUrl(address) {
    return `${BLOCKCHAIN_CONFIG.explorerBase}/address/${address}?chain=${BLOCKCHAIN_CONFIG.network}`;
}

// ============================================
// INITIALIZATION
// ============================================

// Check if already connected on page load
window.addEventListener('load', () => {
    if (isWalletConnected()) {
        const { getLocalStorage } = window.StacksConnect;
        const data = getLocalStorage();
        if (data && data.addresses && data.addresses.stx && data.addresses.stx[0]) {
            const address = data.addresses.stx[0].address;
            gameState.walletConnected = true;
            gameState.userAddress = address;
            updateWalletUI(address);
            loadPlayerStatsFromChain(address);
        }
    }
});

console.log('🔗 Stacks blockchain integration loaded!');