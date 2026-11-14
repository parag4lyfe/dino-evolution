// Original synthesized effects; no sound files, licenses, or network needed.
export class Audio {
  constructor(enabled) { this.enabled = enabled; }
  play(kind) {
    if (!this.enabled) return;
    try {
      this.context ??= new (window.AudioContext || window.webkitAudioContext)();
      this.context.resume();
      const notes = { jump: [240, 440, 0.1], collect: [750, 1100, 0.08], hit: [120, 35, 0.25], evolve: [330, 990, 0.35], click: [500, 650, 0.06] };
      const [from, to, duration] = notes[kind] || notes.click;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      osc.type = kind === 'hit' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(to, now + duration);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain); gain.connect(this.context.destination);
      osc.start(now); osc.stop(now + duration);
    } catch { /* Audio is optional when a browser blocks it. */ }
  }
}
