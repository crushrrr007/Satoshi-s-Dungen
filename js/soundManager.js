// ============================================
// SOUND MANAGER
// ============================================

class SoundManager {
    constructor() {
        this.context = null;
        this.muted = false;
        this.initialized = false;
    }
    
    init() {
        if (!this.initialized) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.initialized = true;
            } catch (e) {
                console.warn('Audio context not available:', e);
            }
        }
    }
    
    beep(freq, duration, volume = 0.1) {
        if (this.muted || !this.initialized || !this.context) return;
        
        try {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.frequency.value = freq;
            osc.type = 'square';
            
            gain.gain.value = volume;
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
            
            osc.start(this.context.currentTime);
            osc.stop(this.context.currentTime + duration);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }
    
    mine() { 
        this.beep(800, 0.1, 0.15); 
    }
    
    attack() { 
        this.beep(400, 0.15, 0.12); 
    }
    
    hit() { 
        this.beep(200, 0.2, 0.2); 
    }
    
    kill() { 
        this.beep(600, 0.1, 0.15);
        setTimeout(() => this.beep(800, 0.1, 0.15), 50);
    }
    
    powerup() {
        this.beep(523, 0.1, 0.15);
        setTimeout(() => this.beep(659, 0.1, 0.15), 100);
        setTimeout(() => this.beep(784, 0.15, 0.15), 200);
    }
    
    levelup() {
        this.beep(523, 0.1, 0.2);
        setTimeout(() => this.beep(659, 0.1, 0.2), 100);
        setTimeout(() => this.beep(784, 0.1, 0.2), 200);
        setTimeout(() => this.beep(1047, 0.2, 0.2), 300);
    }
    
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

// Global sound manager instance
const soundManager = new SoundManager();