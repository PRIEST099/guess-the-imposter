/**
 * Sound manager using Web Audio API with programmatically generated sounds.
 * No external audio files needed — all sounds are synthesized.
 */

let audioContext: AudioContext | null = null;
let initialized = false;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Resume audio context on user interaction (browser autoplay policy)
export function initAudio() {
  if (initialized) return;
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  initialized = true;
}

function getVolume(): number {
  // Import dynamically to avoid SSR issues
  try {
    const store = require('@/stores/settings-store').useSettingsStore;
    const state = store.getState();
    return state.soundEnabled ? state.soundVolume : 0;
  } catch {
    return 0.5;
  }
}

// === Core synthesis helpers ===

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volumeMultiplier = 1,
  fadeOut = true
) {
  const ctx = getContext();
  if (!ctx) return;
  const vol = getVolume() * volumeMultiplier;
  if (vol <= 0) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volumeMultiplier = 0.5) {
  frequencies.forEach(f => playTone(f, duration, type, volumeMultiplier / frequencies.length));
}

function playNoise(duration: number, volumeMultiplier = 0.1) {
  const ctx = getContext();
  if (!ctx) return;
  const vol = getVolume() * volumeMultiplier;
  if (vol <= 0) return;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Bandpass filter for softer noise
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

// === Game sound effects ===

/** Soft whoosh for phase transitions */
export function playPhaseTransition() {
  const ctx = getContext();
  if (!ctx) return;
  const vol = getVolume();
  if (vol <= 0) return;

  // Rising sweep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);

  // Soft noise whoosh
  playNoise(0.3, 0.15);
}

/** Soft tick for timer (≤10s remaining) */
export function playTimerTick() {
  playTone(880, 0.08, 'sine', 0.3);
}

/** Urgent double-tick for timer (≤5s remaining) */
export function playTimerUrgent() {
  playTone(1100, 0.06, 'square', 0.25);
  setTimeout(() => playTone(1100, 0.06, 'square', 0.25), 80);
}

/** Click sound when casting a vote */
export function playVoteCast() {
  playTone(600, 0.1, 'triangle', 0.4);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.3), 50);
}

/** Role reveal — dramatic for imposter, gentle for player */
export function playRoleReveal(isImposter: boolean) {
  if (isImposter) {
    // Ominous low chord
    playChord([130, 155, 196], 1.5, 'sawtooth', 0.4);
    setTimeout(() => playTone(98, 1.0, 'sine', 0.5), 200);
  } else {
    // Pleasant ascending chime
    playTone(523, 0.3, 'sine', 0.4);
    setTimeout(() => playTone(659, 0.3, 'sine', 0.35), 150);
    setTimeout(() => playTone(784, 0.4, 'sine', 0.3), 300);
  }
}

/** Victory fanfare (imposter found) */
export function playVictoryFanfare() {
  playTone(523, 0.2, 'triangle', 0.4);
  setTimeout(() => playTone(659, 0.2, 'triangle', 0.35), 150);
  setTimeout(() => playTone(784, 0.2, 'triangle', 0.35), 300);
  setTimeout(() => playChord([784, 988, 1175], 0.6, 'sine', 0.5), 450);
}

/** Suspense sting (imposter escaped) */
export function playSuspenseSting() {
  playChord([233, 277, 330], 0.8, 'sawtooth', 0.3);
  setTimeout(() => playTone(220, 1.0, 'sine', 0.4), 400);
}

/** Confetti pop */
export function playConfetti() {
  playNoise(0.15, 0.3);
  playTone(1200, 0.1, 'sine', 0.3);
  setTimeout(() => {
    playNoise(0.1, 0.2);
    playTone(1500, 0.1, 'sine', 0.2);
  }, 100);
}

/** Chat message notification blip */
export function playChatBlip() {
  playTone(1047, 0.06, 'sine', 0.15);
}

/** Submit action confirmation */
export function playSubmit() {
  playTone(440, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(660, 0.15, 'sine', 0.25), 80);
}

/** Player joined lobby */
export function playPlayerJoin() {
  playTone(440, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(554, 0.2, 'sine', 0.2), 120);
}

/** Generic UI click */
export function playClick() {
  playTone(800, 0.04, 'triangle', 0.2);
}

/** Countdown beep (3-2-1) */
export function playCountdownBeep(final = false) {
  if (final) {
    playTone(880, 0.3, 'sine', 0.4);
  } else {
    playTone(660, 0.15, 'sine', 0.3);
  }
}
