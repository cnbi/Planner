/**
 * Web Audio API Chime Synthesizer
 * Plays a pleasant 3-tone notification chime without requiring external audio files.
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    
    // Resume context if suspended by browser policy
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Frequencies for a soft major chime: C5, E5, G5
    const notes = [
      { freq: 523.25, start: now, duration: 0.25 },
      { freq: 659.25, start: now + 0.12, duration: 0.35 },
      { freq: 783.99, start: now + 0.25, duration: 0.6 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      // Envelope: smooth attack and decay
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });

    // Close audio context after completion
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    }, 1200);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}
