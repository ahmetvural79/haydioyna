// Sihirli Çini: parlayan noktalara sırayla dokun; şekil tamamlanınca büyü gerçekleşir!
import { TAU, rand, pick, clamp, dist, star, starPath, tulip, nazar, crescentStar, Particles, text, RAINBOW, shuffle, cloud, vignette } from '../draw.js';
import { sfx, say } from '../audio.js';

const circle = (n, r = 0.42) => Array.from({ length: n + 1 }, (_, i) => [0.5 + Math.cos(-Math.PI / 2 + (i / n) * TAU) * r, 0.5 + Math.sin(-Math.PI / 2 + (i / n) * TAU) * r]);
const starPts = () => Array.from({ length: 11 }, (_, i) => { const r = i % 2 ? 0.2 : 0.46; const a = -Math.PI / 2 + (i * Math.PI) / 5; return [0.5 + Math.cos(a) * r, 0.52 + Math.sin(a) * r]; });

const SHAPES = [
  { k: 'lale', name: 'Lale', pts: [[0.5, 0.95], [0.5, 0.62], [0.25, 0.58], [0.2, 0.2], [0.36, 0.36], [0.5, 0.1], [0.64, 0.36], [0.8, 0.2], [0.75, 0.58], [0.5, 0.62]] },
  { k: 'yildiz', name: 'Yıldız', pts: starPts() },
  { k: 'nazar', name: 'Nazar Boncuğu', pts: circle(8) },
  { k: 'kule', name: 'Kız Kulesi', pts: [[0.15, 0.95], [0.35, 0.95], [0.35, 0.5], [0.42, 0.4], [0.5, 0.08], [0.58, 0.4], [0.65, 0.5], [0.65, 0.95], [0.85, 0.95]] },
  { k: 'balik', name: 'Boğaz Balığı', pts: [[0.08, 0.5], [0.33, 0.28], [0.62, 0.3], [0.8, 0.5], [0.96, 0.28], [0.96, 0.72], [0.8, 0.5], [0.62, 0.7], [0.33, 0.72], [0.08, 0.5]] },
  { k: 'kelebek', name: 'Kelebek', pts: [[0.5, 0.5], [0.2, 0.12], [0.06, 0.4], [0.5, 0.5], [0.18, 0.85], [0.38, 0.92], [0.5, 0.5], [0.62, 0.92], [0.82, 0.85], [0.5, 0.5], [0.94, 0.4], [0.8, 0.12], [0.5, 0.5]] },
  { k: 'kubbe', name: 'Ay ve Kubbe', pts: [[0.08, 0.95], [0.08, 0.62], [0.22, 0.38], [0.5, 0.26], [0.78, 0.38], [0.92, 0.62], [0.92, 0.95]] },
  { k: 'gunes', name: 'Güneş', pts: circle(7, 0.36) },
  { k: 'gokkusagi', name: 'Gökkuşağı', pts: Array.from({ length: 8 }, (_, i) => [0.5 - Math.cos((i / 7) * Math.PI) * 0.45, 0.85 - Math.sin((i / 7) * Math.PI) * 0.6]) },
  { k: 'kalp', name: 'Kalp', pts: [[0.5, 0.9], [0.14, 0.52], [0.14, 0.26], [0.32, 0.14], [0.5, 0.3], [0.68, 0.14], [0.86, 0.26], [0.86, 0.52], [0.5, 0.9]] },
];

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.queue = shuffle(SHAPES);
    this.world = { tulips: [], fish: [], butterflies: [], nazar: false, kule: false, moon: false, sun: 0, rainbow: false, hearts: [] };
    this.stars = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: rand(0.5, 2), ph: rand(0, TAU) }));
    this.t = 0;
    this.shapes = 0; this.dots = 0; this.hits = 0;
    this.storm = { x: -0.2, y: 0.3, dir: 1, cool: 0 };
    this.next();
  }

  next() {
    if (!this.queue.length) this.queue = shuffle(SHAPES);
    this.shape = this.queue.pop();
    this.idx = 0;
    this.magicT = 0;
    this.enterT = 0;
  }

  box() {
    const { w, h } = this.v;
    const s = Math.min(w * 0.85, h * 0.6);
    return { x: w / 2 - s / 2, y: h * 0.47 - s / 2, s };
  }

  pt(i) {
    const b = this.box();
    const [px, py] = this.shape.pts[i];
    return { x: b.x + px * b.s, y: b.y + py * b.s };
  }

  cast() {
    const { w, h, u } = this.v;
    const W = this.world;
    const k = this.shape.k;
    sfx.magic();
    if (this.v.players === 1) say(pick(['Abrakadabra!', 'Şıbıdık!', 'Hokus pokus!', 'Sim sala bim!']));
    if (k === 'lale') for (let i = 0; i < 6; i++) W.tulips.push({ x: rand(0.03, 0.97), s: rand(0.05, 0.09), c: pick(['#E63946', '#FF5DA2', '#FFD23F', '#8338EC']), g: 0 });
    if (k === 'balik') for (let i = 0; i < 5; i++) W.fish.push({ x: rand(-0.3, 0), y: rand(0.8, 0.95), sp: rand(0.05, 0.12), c: pick(RAINBOW) });
    if (k === 'kelebek') for (let i = 0; i < 5; i++) W.butterflies.push({ x: rand(0.1, 0.9), y: rand(0.2, 0.6), ph: rand(0, TAU), c: pick(RAINBOW) });
    if (k === 'nazar') W.nazar = true;
    if (k === 'kule') W.kule = true;
    if (k === 'kubbe') W.moon = true;
    if (k === 'gunes') W.sun = 6;
    if (k === 'gokkusagi') W.rainbow = true;
    if (k === 'kalp') for (let i = 0; i < 12; i++) W.hearts.push({ x: rand(0.1, 0.9), y: 1.05, sp: rand(0.08, 0.18), c: pick(['#FF5DA2', '#EF476F', '#FFB4C2']) });
    if (k === 'yildiz') for (let i = 0; i < 6; i++) setTimeout(() => this.fx.burst(rand(0.15, 0.85) * w, rand(0.1, 0.4) * h, RAINBOW, 30, u * 50, u * 1.1, 'star'), i * 250);
    this.fx.burst(w / 2, h * 0.47, RAINBOW, 50, u * 70, u * 1.3, 'star');
    this.fx.text(w / 2, h * 0.2, `${this.shape.name}! +10`, '#FFD23F', u * 8);
  }

  update(dt, inp) {
    const { u } = this.v;
    this.t += dt;
    this.enterT += dt;
    const W = this.world;
    W.sun = Math.max(0, W.sun - dt);
    for (const f of W.fish) { f.x += f.sp * dt; if (f.x > 1.2) f.x = -0.2; }
    for (const b of W.butterflies) { b.ph += dt; b.x += Math.sin(b.ph * 0.7) * 0.04 * dt; b.y += Math.cos(b.ph * 0.9) * 0.03 * dt; }
    for (const t of W.tulips) t.g = Math.min(1, t.g + dt);
    for (const hh of W.hearts) hh.y -= hh.sp * dt;
    W.hearts = W.hearts.filter((hh) => hh.y > -0.1);

    // kara bulut ekranda süzülür: dokunursan -2 ve şimşek çakar
    const st = this.storm;
    st.cool -= dt;
    st.x += st.dir * 0.06 * this.v.diff * dt;
    st.y = 0.3 + Math.sin(this.t * 0.5) * 0.15;
    if (st.x > 1.2) st.dir = -1; else if (st.x < -0.2) st.dir = 1;
    if (this.t > 8 && st.cool <= 0 && inp.present) {
      const sp = { x: st.x * this.v.w, y: st.y * this.v.h };
      for (const hd of inp.hands) if (hd.visible && dist(hd, sp) < this.v.u * 10) {
        st.cool = 2; this.hits++;
        this.score = Math.max(0, this.score - 2);
        sfx.bump(); this.v.hit?.();
        this.fx.text(sp.x, sp.y - this.v.u * 8, 'Gürüm! -2', '#EF476F', u * 6);
        break;
      }
    }
    if (this.magicT > 0) {
      this.magicT -= dt;
      if (this.magicT <= 0) this.next();
      this.fx.update(dt);
      return;
    }
    const hands = inp.present ? inp.hands.filter((hd) => hd.visible) : [];
    const p = this.pt(this.idx);
    const r = Math.max(28, this.box().s * 0.08) / this.v.diff;
    for (const hd of hands) if (dist(hd, p) < r) {
      sfx.tap(this.idx);
      this.score += 1;
      this.dots++;
      this.fx.burst(p.x, p.y, ['#fff', '#7CF7FF', '#FFD23F'], 10, u * 25, u * 0.8, 'star');
      this.idx++;
      if (this.idx >= this.shape.pts.length) { this.score += 10; this.shapes++; this.magicT = 2.6; this.cast(); }
      break;
    }
    this.fx.update(dt);
  }

  draw(g, inp, t) {
    const { w, h } = this.v;
    const W = this.world;
    const day = clamp(W.sun > 0 ? Math.min(1, (6 - W.sun) * 2, W.sun) : 0, 0, 1);
    const sg = g.createLinearGradient(0, 0, 0, h);
    sg.addColorStop(0, day > 0 ? mix('#0B1340', '#5FB4F0', day) : '#0B1340');
    sg.addColorStop(1, day > 0 ? mix('#3B2470', '#CDEBFF', day) : '#3B2470');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.globalAlpha = 1 - day;
    for (const s of this.stars) { g.fillStyle = '#fff'; g.globalAlpha = (1 - day) * (0.5 + Math.sin(t * 2 + s.ph) * 0.4); g.beginPath(); g.arc(s.x * w, s.y * h, s.r, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    const m = Math.min(w, h);
    if (day > 0) { g.fillStyle = '#FFE066'; g.beginPath(); g.arc(w * 0.8, h * 0.15, m * 0.08 * day, 0, TAU); g.fill(); }
    if (W.moon) crescentStar(g, w * 0.18, h * 0.14, m * 0.06, '#FFF3B0');
    if (W.rainbow) RAINBOW.slice(0, 6).forEach((c, i) => { g.strokeStyle = c; g.globalAlpha = 0.55; g.lineWidth = m * 0.02; g.beginPath(); g.arc(w / 2, h * 0.85, w * 0.45 - i * m * 0.02, Math.PI, TAU); g.stroke(); g.globalAlpha = 1; });
    // tepe ve deniz
    g.fillStyle = '#1D3B6E'; g.fillRect(0, h * 0.86, w, h * 0.14);
    g.fillStyle = '#2C5A3A';
    g.beginPath(); g.moveTo(0, h * 0.88); g.quadraticCurveTo(w * 0.25, h * 0.8, w * 0.45, h * 0.88); g.lineTo(0, h); g.fill();
    if (W.kule) {
      const kx = w * 0.82, ky = h * 0.88;
      g.fillStyle = '#F1E4C8'; g.fillRect(kx - m * 0.05, ky - m * 0.06, m * 0.1, m * 0.06);
      g.fillRect(kx - m * 0.02, ky - m * 0.16, m * 0.04, m * 0.1);
      g.fillStyle = '#5B7DB1'; g.beginPath(); g.moveTo(kx - m * 0.03, ky - m * 0.16); g.lineTo(kx, ky - m * 0.22); g.lineTo(kx + m * 0.03, ky - m * 0.16); g.fill();
      g.fillStyle = `rgba(255,220,120,${0.6 + Math.sin(t * 4) * 0.3})`; g.fillRect(kx - m * 0.008, ky - m * 0.13, m * 0.016, m * 0.02);
    }
    for (const f of W.fish) {
      g.fillStyle = f.c; const fx = f.x * w, fy = f.y * h;
      g.beginPath(); g.ellipse(fx, fy, m * 0.03, m * 0.015, 0, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(fx - m * 0.025, fy); g.lineTo(fx - m * 0.05, fy - m * 0.015); g.lineTo(fx - m * 0.05, fy + m * 0.015); g.fill();
    }
    for (const tp of W.tulips) tulip(g, tp.x * w, h * 0.9, tp.s * m * tp.g * 1.6, tp.c);
    if (W.nazar) nazar(g, w * 0.08, h * 0.35 + Math.sin(t) * 6, m * 0.05);
    for (const b of W.butterflies) {
      const bx = b.x * w, by = b.y * h, f = Math.abs(Math.sin(t * 10 + b.ph));
      g.fillStyle = b.c;
      g.beginPath(); g.ellipse(bx - m * 0.015 * f, by, m * 0.018 * f + 1, m * 0.025, 0, 0, TAU); g.ellipse(bx + m * 0.015 * f, by, m * 0.018 * f + 1, m * 0.025, 0, 0, TAU); g.fill();
    }
    for (const hh of W.hearts) { g.fillStyle = hh.c; heart(g, hh.x * w, hh.y * h, m * 0.03); }
  }

  drawOver(g, inp, t) {
    const { w, h, u } = this.v;
    const pts = this.shape.pts;
    const done = this.magicT > 0;
    // çizilen çizgiler
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = done ? `hsl(${(t * 300) % 360},90%,65%)` : '#7CF7FF';
    g.shadowColor = '#7CF7FF'; g.shadowBlur = 18;
    g.lineWidth = Math.max(5, u * 1.6);
    g.beginPath();
    for (let i = 0; i < this.idx; i++) { const p = this.pt(i); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }
    g.stroke();
    g.shadowBlur = 0;
    if (done) {
      g.fillStyle = 'rgba(124,247,255,0.15)';
      g.beginPath(); pts.forEach((_, i) => { const p = this.pt(i); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.fill();
    } else {
      // noktalar
      const seen = new Set();
      for (let i = pts.length - 1; i >= this.idx; i--) {
        const p = this.pt(i);
        const key = pts[i].join(',');
        if (i !== this.idx && seen.has(key)) continue;
        seen.add(key);
        const cur = i === this.idx;
        const r = cur ? Math.max(18, u * 5) * (1 + Math.sin(t * 6) * 0.15) : Math.max(8, u * 2.2);
        if (cur) {
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.2);
          gr.addColorStop(0, 'rgba(255,240,150,0.9)'); gr.addColorStop(1, 'rgba(255,240,150,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r * 2.2, 0, TAU); g.fill();
          star(g, p.x, p.y, r, '#FFD23F', '#fff');
        } else {
          g.fillStyle = 'rgba(255,255,255,0.55)';
          g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.fill();
        }
        if (!cur && i === this.idx + 1) text(g, String(i + 1), p.x, p.y - r * 2, r * 1.6, '#fff');
      }
      // önizleme hayaleti
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 3; g.setLineDash([6, 8]);
      g.beginPath(); pts.forEach((_, i) => { const p = this.pt(i); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.stroke();
      g.setLineDash([]);
    }
    text(g, done ? '✨ ' + this.shape.name + ' ✨' : 'Sihirli şekil: ?', w / 2, h * 0.08 + u * 10, u * 5.5, done ? '#FFD23F' : '#fff');
    // kara bulut
    if (this.t > 8) {
      const st = this.storm, sx = st.x * w, sy = st.y * h, s = u * 10;
      g.globalAlpha = st.cool > 0 ? 0.5 : 0.95;
      cloud(g, sx - s * 0.5, sy, s, '#3B3355');
      cloud(g, sx - s * 0.4, sy - s * 0.1, s * 0.8, '#4B4370');
      g.fillStyle = '#fff'; g.beginPath(); g.arc(sx - s * 0.1, sy - s * 0.05, s * 0.07, 0, TAU); g.arc(sx + s * 0.15, sy - s * 0.05, s * 0.07, 0, TAU); g.fill();
      g.fillStyle = '#111'; g.beginPath(); g.arc(sx - s * 0.1, sy - s * 0.03, s * 0.035, 0, TAU); g.arc(sx + s * 0.15, sy - s * 0.03, s * 0.035, 0, TAU); g.fill();
      if (st.cool > 1.5 || Math.sin(t * 9) > 0.92) {
        g.strokeStyle = '#FFE66D'; g.lineWidth = s * 0.06;
        g.beginPath(); g.moveTo(sx, sy + s * 0.3); g.lineTo(sx - s * 0.1, sy + s * 0.6); g.lineTo(sx + s * 0.08, sy + s * 0.6); g.lineTo(sx - s * 0.05, sy + s * 0.95); g.stroke();
      }
      g.globalAlpha = 1;
    }
    this.fx.draw(g);
    vignette(g, w, h, 0.35, '10,5,40');
  }

  stats() {
    return [
      { icon: '🪄', label: 'Büyü', value: this.shapes },
      { icon: '✨', label: 'Nokta', value: this.dots },
      { icon: '⛈️', label: 'Bulut', value: this.hits },
      { icon: '🔢', label: 'Sıradaki', value: this.magicT > 0 ? '✔' : `${this.idx + 1}/${this.shape.pts.length}` },
    ];
  }
}

function heart(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y + s * 0.8);
  g.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.5, y - s * 1.1, x, y - s * 0.35);
  g.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s * 1.4, y - s * 0.2, x, y + s * 0.8);
  g.fill();
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

export default {
  id: 'cini',
  title: 'Sihirli Çini',
  tagline: 'Şıbıdık, büyü başlasın!',
  description: 'Yıldızlı bir gecede parlayan noktalara sırayla dokun. Şekil tamamlanınca büyü gerçekleşir: laleler açar, Kız Kulesi ışıl ışıl yanar, Boğaz’da balıklar yüzer, gece gündüze döner, gökkuşağı çıkar ve daha neler neler!',
  howto: ['Parlayan yıldıza dokun', 'Çizgiyi takip et', 'Kara buluta dokunma: -2', 'Büyüyü izle!'],
  color: '#5B2A86',
  emoji: '🪄',
  duration: 100,
  camAlpha: 0.22,
  stars: [40, 80, 130],
  hint: 'Parlayan yıldıza dokun!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    const sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, '#0B1340'); sg.addColorStop(1, '#3B2470');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    const pts = SHAPES[0].pts;
    const s = h * 0.8, ox = w / 2 - s / 2, oy = h * 0.1;
    const n = Math.floor((t * 3) % (pts.length + 4));
    g.strokeStyle = '#7CF7FF'; g.lineWidth = 4; g.shadowColor = '#7CF7FF'; g.shadowBlur = 12;
    g.beginPath(); pts.slice(0, Math.min(n, pts.length)).forEach(([x, y], i) => (i ? g.lineTo(ox + x * s, oy + y * s) : g.moveTo(ox + x * s, oy + y * s))); g.stroke();
    g.shadowBlur = 0;
    pts.forEach(([x, y], i) => { if (i >= n) { g.fillStyle = i === n ? '#FFD23F' : 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(ox + x * s, oy + y * s, i === n ? 7 : 4, 0, TAU); g.fill(); } });
    if (n >= pts.length) tulip(g, w * 0.15, h * 0.95, h * 0.25, '#E63946');
    crescentStar(g, w * 0.85, h * 0.18, h * 0.08, '#FFF3B0');
  },
};
