import { setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";

export class AudioManager {
  private static instance: AudioManager;
  private isBackgroundMusicPlaying = false;
  private volume = 1;

  private constructor() {
    this.initializeAudio();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeAudio() {
    try {
      // Enable playback in silent mode on iOS
      if (Platform.OS === "ios") {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
      }
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  async playDiceRoll() {
    try {
      // Create a simple dice roll sound using Web Audio API
      if (Platform.OS === "web") {
        this.playWebAudio("dice");
      } else {
        // For native, we'll use haptic feedback as primary feedback
        console.log("Playing dice roll sound");
      }
    } catch (error) {
      console.error("Failed to play dice roll sound:", error);
    }
  }

  async playScoreConfirmation() {
    try {
      if (Platform.OS === "web") {
        this.playWebAudio("score");
      } else {
        console.log("Playing score confirmation sound");
      }
    } catch (error) {
      console.error("Failed to play score sound:", error);
    }
  }

  async playBackgroundMusic() {
    try {
      if (this.isBackgroundMusicPlaying) {
        return;
      }

      if (Platform.OS === "web") {
        this.playWebAudio("background");
      } else {
        console.log("Playing background music");
      }

      this.isBackgroundMusicPlaying = true;
    } catch (error) {
      console.error("Failed to play background music:", error);
    }
  }

  async stopBackgroundMusic() {
    try {
      this.isBackgroundMusicPlaying = false;
    } catch (error) {
      console.error("Failed to stop background music:", error);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  private playWebAudio(type: "dice" | "score" | "background") {
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContext) {
        console.log("Web Audio API not available");
        return;
      }

      const audioContext = new AudioContext();
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "dice") {
        // Dice roll: descending tones with quick decay
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gainNode.gain.setValueAtTime(0.1 * this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else if (type === "score") {
        // Score: ascending chime with bright tone
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.15 * this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
      } else if (type === "background") {
        // Background: soft ambient tone (looping)
        oscillator.frequency.setValueAtTime(220, now);
        gainNode.gain.setValueAtTime(0.03 * this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2);
        oscillator.start(now);
        oscillator.stop(now + 2);
      }
    } catch (error) {
      console.error("Web Audio playback error:", error);
    }
  }

  async cleanup() {
    try {
      this.isBackgroundMusicPlaying = false;
    } catch (error) {
      console.error("Failed to cleanup audio:", error);
    }
  }
}

export const audioManager = AudioManager.getInstance();
