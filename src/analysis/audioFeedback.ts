export class AudioFeedbackManager {
  private lastSpokenAt = new Map<string, number>();
  private cooldownMs: number;
  private enabled = true;
  private lastGlobalSpokenAt = 0;
  private lastMessage: string | null = null;

  constructor(cooldownMs = 2600) {
    this.cooldownMs = cooldownMs;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  speak(message: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastGlobalSpokenAt < this.cooldownMs) {
      return false;
    }

    const lastAt = this.lastSpokenAt.get(message) ?? 0;
    if (this.lastMessage === message && now - lastAt < this.cooldownMs) {
      return false;
    }

    this.lastSpokenAt.set(message, now);
    this.lastGlobalSpokenAt = now;
    this.lastMessage = message;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }

  reset() {
    this.lastSpokenAt.clear();
    this.lastGlobalSpokenAt = 0;
    this.lastMessage = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
