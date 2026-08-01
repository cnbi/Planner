let sharedAudioCtx: AudioContext | null = null;

/**
 * Pre-unlock Web Audio API Context on explicit user interaction
 * Plays a silent tone so browser policy allows subsequent alert sounds
 */
export function unlockAudioContext(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }

    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }

    // Play a silent 0.1-second buffer tone to register user gesture
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    gain.gain.setValueAtTime(0.001, sharedAudioCtx.currentTime); // silent
    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    osc.start(sharedAudioCtx.currentTime);
    osc.stop(sharedAudioCtx.currentTime + 0.1);
  } catch (err) {
    console.warn('AudioContext pre-unlock error:', err);
  }
}

/**
 * Web Audio API Chime Synthesizer
 * Plays a pleasant notification chime (double beep / major scale notes)
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = sharedAudioCtx && sharedAudioCtx.state !== 'closed' ? sharedAudioCtx : new AudioCtx();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Double beep / chime notes (520Hz and 660Hz as requested, followed by 784Hz)
    const notes = [
      { freq: 520, start: now, duration: 0.18 },
      { freq: 660, start: now + 0.12, duration: 0.28 },
      { freq: 784, start: now + 0.26, duration: 0.4 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      // Envelope: smooth attack and decay
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

