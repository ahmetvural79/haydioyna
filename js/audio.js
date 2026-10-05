// WebAudio ile üretilen basit efekt sesleri ve Türkçe seslendirme

let ac = null;
let muted = false;
try { muted = localStorage.getItem('ho-muted') === '1'; } catch {}

function ctx() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function tone(freq, dur = 0.12, type = 'sine', vol = 0.18, slide = 0, delay = 0) {
  if (muted) return;
  const a = ctx();
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur = 0.15, vol = 0.15, filter = 1800) {
  if (muted) return;
  const a = ctx();
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = a.createBufferSource();
  s.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = filter;
  const g = a.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination);
  s.start();
}

export const sfx = {
  unlock() { try { ctx(); } catch {} },
  pop() { noise(0.08, 0.3, 2500); tone(700, 0.08, 'triangle', 0.12, 400); },
  coin() { tone(988, 0.07, 'square', 0.08); tone(1319, 0.18, 'square', 0.08, 0, 0.07); },
  good() { tone(523, 0.1, 'triangle', 0.15); tone(659, 0.1, 'triangle', 0.15, 0, 0.08); tone(784, 0.18, 'triangle', 0.15, 0, 0.16); },
  bad() { tone(220, 0.25, 'sawtooth', 0.1, -100); },
  bump() { noise(0.2, 0.3, 300); tone(110, 0.2, 'sine', 0.2, -50); },
  whoosh() { noise(0.35, 0.18, 900); },
  jump() { tone(300, 0.2, 'square', 0.07, 500); },
  tick() { tone(880, 0.06, 'sine', 0.12); },
  go() { tone(1046, 0.35, 'triangle', 0.18); },
  magic() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, 'sine', 0.12, 0, i * 0.08)); },
  win() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.15, 0, i * 0.12)); },
  tap(i = 0) { tone(440 * Math.pow(2, (i % 8) / 8), 0.1, 'sine', 0.15); },
};

export function say(str) {
  if (muted || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(str);
    u.lang = 'tr-TR';
    u.rate = 1.05;
    u.pitch = 1.15;
    const v = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('tr'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {}
}

export function isMuted() { return muted; }
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('ho-muted', m ? '1' : '0'); } catch {}
  if (m && 'speechSynthesis' in window) speechSynthesis.cancel();
}
