// Sound Effects Utility
// Uses Web Audio API to generate sound effects programmatically
// This ensures no external files are needed

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.settings = {
      enabled: true,
      volume: 100
    };
    this.init();
  }

  init() {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.loadSettings();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.settings.enabled = settings.soundEnabled !== false;
        this.settings.volume = settings.soundVolume || 100;
      }
    } catch (error) {
      console.warn('Error loading sound settings:', error);
    }
  }

  updateSettings() {
    this.loadSettings();
  }

  playSound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext || !this.settings.enabled || this.settings.volume === 0) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const actualVolume = (volume * this.settings.volume) / 100;
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(actualVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // Specific sound effects
  playSuccess() {
    // Ascending chime
    this.playSound(523.25, 0.1, 'sine', 0.2); // C5
    setTimeout(() => this.playSound(659.25, 0.1, 'sine', 0.2), 100); // E5
    setTimeout(() => this.playSound(783.99, 0.2, 'sine', 0.25), 200); // G5
  }

  playError() {
    // Descending buzz
    this.playSound(200, 0.3, 'sawtooth', 0.15);
    setTimeout(() => this.playSound(150, 0.2, 'sawtooth', 0.15), 200);
  }

  playClick() {
    this.playSound(800, 0.05, 'square', 0.1);
  }

  playHover() {
    this.playSound(600, 0.03, 'sine', 0.08);
  }

  playLevelUp() {
    // Victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.2, 'sine', 0.2);
      }, i * 150);
    });
  }

  playCoin() {
    // Coin collection sound
    this.playSound(988, 0.1, 'sine', 0.15);
    setTimeout(() => this.playSound(1318.51, 0.15, 'sine', 0.15), 100);
  }

  playPopup() {
    // Quick pop sound
    this.playSound(400, 0.08, 'sine', 0.2);
    setTimeout(() => this.playSound(600, 0.05, 'sine', 0.15), 50);
  }

  playTick() {
    this.playSound(1000, 0.02, 'sine', 0.05);
  }

  playSpin() {
    // Spinning wheel sound
    const frequencies = [200, 250, 300, 350, 400, 350, 300, 250];
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.1, 'square', 0.1);
      }, i * 100);
    });
  }

  playSubmit() {
    // Submission sound
    this.playSound(440, 0.15, 'sine', 0.2);
    setTimeout(() => this.playSound(554.37, 0.1, 'sine', 0.15), 100);
  }

  playTimeWarning() {
    // Warning beep
    this.playSound(880, 0.1, 'sine', 0.3);
  }

  playBadge() {
    // Badge earned sound
    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.25, 'sine', 0.2);
      }, i * 100);
    });
  }

  // Stop all sounds (if needed)
  stopAll() {
    if (this.audioContext) {
      try {
        this.audioContext.close();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Error stopping sounds:', error);
      }
    }
  }
}

// Create singleton instance
const soundEffects = new SoundEffects();

export default soundEffects;

