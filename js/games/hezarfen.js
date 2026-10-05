// Hezarfen'in Uçuşu: kollarını aç, uçak sensin! İstanbul semalarında halkalardan geç.
import { TAU, rand, clamp, lerp, cloud, star, crescentStar, Particles, skyGradient, text, sunGlow, fogBand, vignette } from '../draw.js';
import { sfx } from '../audio.js';

function skyline(g, w, y, s, color) {
  // İstanbul silueti: kubbeler, minareler ve bir kule (özgün çizim)
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, y);
  const items = [
    ['hill', 0.0, 0.12], ['dome', 0.08, 0.05], ['min', 0.14, 0.13], ['dome', 0.2, 0.09], ['min', 0.27, 0.14], ['min', 0.31, 0.14],
    ['hill', 0.38, 0.05], ['tower', 0.46, 0.16], ['hill', 0.52, 0.06], ['min', 0.6, 0.12], ['dome', 0.66, 0.08], ['dome', 0.72, 0.06],
    ['min', 0.77, 0.13], ['hill', 0.84, 0.07], ['dome', 0.92, 0.05],
  ];
  g.lineTo(0, y - s * 0.03);
  for (const [k, x, hh] of items) {
    const px = x * w;
    if (k === 'hill') { g.lineTo(px, y - s * 0.03); g.quadraticCurveTo(px + w * 0.03, y - s * hh, px + w * 0.06, y - s * 0.03); }
    if (k === 'dome') {
      g.lineTo(px, y - s * 0.03); g.lineTo(px, y - s * hh * 0.6);
      g.arc(px + s * hh * 0.7, y - s * hh * 0.6, s * hh * 0.7, Math.PI, 0);
      g.lineTo(px + s * hh * 1.4, y - s * 0.03);
    }
    if (k === 'min') {
      g.lineTo(px, y - s * 0.03); g.lineTo(px, y - s * hh * 0.9); g.lineTo(px + s * 0.006, y - s * hh);
      g.lineTo(px + s * 0.012, y - s * hh * 0.9); g.lineTo(px + s * 0.012, y - s * 0.03);
    }
    if (k === 'tower') {
      g.lineTo(px, y - s * 0.03); g.lineTo(px, y - s * hh * 0.75); g.lineTo(px + s * 0.012, y - s * hh);
      g.lineTo(px + s * 0.024, y - s * hh * 0.75); g.lineTo(px + s * 0.024, y - s * 0.03);
    }
  }
  g.lineTo(w, y - s * 0.03);
  g.lineTo(w, y);
  g.closePath();
  g.fill();
}

function glider(g, x, y, s, bank) {
  g.save();
  g.translate(x, y);
  g.rotate(bank);
  // kanatlar
  g.fillStyle = '#E30A17';
  g.strokeStyle = '#7a0a0f'; g.lineWidth = s * 0.03;
  g.beginPath();
  g.moveTo(0, -s * 0.05);
  g.quadraticCurveTo(-s * 0.6, -s * 0.2, -s * 1.1, -s * 0.05);
  g.lineTo(-s * 1.05, s * 0.08);
  g.quadraticCurveTo(-s * 0.5, s * 0.02, 0, s * 0.12);
  g.quadraticCurveTo(s * 0.5, s * 0.02, s * 1.05, s * 0.08);
  g.lineTo(s * 1.1, -s * 0.05);
  g.quadraticCurveTo(s * 0.6, -s * 0.2, 0, -s * 0.05);
  g.fill(); g.stroke();
  // kanat üstü ay-yıldız
  crescentStar(g, -s * 0.6, -s * 0.02, s * 0.07, '#fff');
  crescentStar(g, s * 0.55, -s * 0.02, s * 0.07, '#fff');
  // gövde
  g.fillStyle = '#F8FAFC';
  g.beginPath(); g.ellipse(0, s * 0.05, s * 0.14, s * 0.22, 0, 0, TAU); g.fill(); g.stroke();
  // pilot
  g.fillStyle = '#8B5A3C';
  g.beginPath(); g.arc(0, -s * 0.08, s * 0.09, 0, TAU); g.fill();
  g.fillStyle = '#38B6FF';
  g.beginPath(); g.ellipse(0, -s * 0.11, s * 0.1, s * 0.04, 0, 0, TAU); g.fill();
  // kuyruk
  g.fillStyle = '#E30A17';
  g.beginPath(); g.moveTo(0, s * 0.2); g.lineTo(-s * 0.03, s * 0.42); g.lineTo(s * 0.03, s * 0.42); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-s * 0.22, s * 0.36); g.lineTo(s * 0.22, s * 0.36); g.lineTo(s * 0.18, s * 0.42); g.lineTo(-s * 0.18, s * 0.42); g.closePath(); g.fill();
  g.restore();
}

function seagull(g, x, y, s, t) {
  g.save(); g.translate(x, y);
  const f = Math.sin(t * 10) * 0.4;
  g.strokeStyle = '#334155'; g.lineWidth = s * 0.1; g.lineCap = 'round';
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(0, 0, s * 0.3, s * 0.15, 0, 0, TAU); g.fill();
  g.beginPath();
  g.moveTo(-s, -s * f); g.quadraticCurveTo(-s * 0.5, -s * 0.5 - s * f, 0, 0);
  g.quadraticCurveTo(s * 0.5, -s * 0.5 - s * f, s, -s * f);
  g.stroke();
  g.fillStyle = '#F59E0B';
  g.beginPath(); g.moveTo(-s * 0.05, s * 0.05); g.lineTo(s * 0.05, s * 0.05); g.lineTo(0, s * 0.22); g.closePath(); g.fill();
  g.restore();
}

function stormCloud(g, x, y, s, t) {
  cloud(g, x - s * 0.5, y, s, '#475569');
  cloud(g, x - s * 0.4, y - s * 0.1, s * 0.8, '#64748B');
  if (Math.sin(t * 7 + x) > 0.6) {
    g.strokeStyle = '#FFE66D'; g.lineWidth = s * 0.06;
    g.beginPath(); g.moveTo(x, y + s * 0.3); g.lineTo(x - s * 0.1, y + s * 0.6); g.lineTo(x + s * 0.08, y + s * 0.6); g.lineTo(x - s * 0.05, y + s * 0.95); g.stroke();
  }
}

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.px = 0; this.py = 0; this.bank = 0;
    this.objs = [];
    this.fx = new Particles();
    this.spawnT = 0;
    this.pathX = 0; this.pathY = 0;
    this.t = 0;
    this.shake = 0;
    this.speed = 3.2;
    this.waves = 0;
    this.rings = 0; this.hits = 0; this.streak = 0; this.bestStreak = 0;
    this.lines = Array.from({ length: 18 }, () => ({ a: rand(0, TAU), d: rand(0.2, 1), sp: rand(0.8, 1.6) }));
  }

  get S() { return Math.min(this.v.w, this.v.h * 1.3) * 0.55; }

  proj(x, y, z) {
    const s = this.S / z;
    return { x: this.v.w / 2 + x * s, y: this.v.h * 0.5 + y * s, s };
  }

  spawn() {
    this.pathX = clamp(this.pathX + rand(-0.45, 0.45), -0.85, 0.85);
    this.pathY = clamp(this.pathY + rand(-0.25, 0.25), -0.4, 0.4);
    const r = Math.random();
    if (r < 0.7) this.objs.push({ k: 'ring', x: this.pathX, y: this.pathY, z: 12, bonus: Math.random() < 0.2 });
    if (r > 0.55) {
      const ox = clamp(this.pathX + (Math.random() < 0.5 ? -1 : 1) * rand(0.45, 0.7), -1, 1);
      this.objs.push({ k: Math.random() < 0.5 ? 'storm' : 'gull', x: ox, y: rand(-0.4, 0.3), z: 12.5 });
    }
  }

  update(dt, inp) {
    this.t += dt;
    this.speed = (3.2 + Math.min(2, this.t / 30)) * this.v.diff;
    if (inp.present) {
      this.bank = lerp(this.bank, inp.tilt, Math.min(1, dt * 8));
      this.px = clamp(this.px + this.bank * 1.7 * dt, -1, 1);
      const up = Math.abs(inp.armsUp) < 0.45 ? 0 : inp.armsUp - Math.sign(inp.armsUp) * 0.45;
      this.py = clamp(this.py - up * 0.9 * dt, -0.55, 0.5);
    }
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = 1.0 - Math.min(0.35, this.t / 120); }
    const pz = 1.2;
    for (const o of this.objs) {
      const oz = o.z;
      o.z -= this.speed * dt;
      if (oz >= pz && o.z < pz && !o.hit) {
        const dx = Math.abs(o.x - this.px), dy = Math.abs(o.y - this.py);
        const p = this.proj(this.px, this.py, pz);
        if (o.k === 'ring' && dx < 0.27 && dy < 0.27) {
          o.hit = true;
          this.streak++; this.rings++;
          this.bestStreak = Math.max(this.bestStreak, this.streak);
          const pts = (o.bonus ? 10 : 5) + (this.streak >= 3 ? 2 : 0);
          this.score += pts;
          sfx.coin();
          this.fx.burst(p.x, p.y, ['#FFD23F', '#fff'], 20, this.v.u * 50, this.v.u * 1.3, 'star');
          this.fx.text(p.x, p.y - this.v.u * 10, this.streak >= 3 ? `Süper seri! +${pts}` : '+' + pts, '#FFD23F', this.v.u * 7);
        } else if (o.k !== 'ring' && dx < 0.22 && dy < 0.22) {
          o.hit = true;
          this.score = Math.max(0, this.score - 3);
          this.shake = 0.5;
          this.hits++; this.streak = 0;
          this.v.hit?.();
          sfx.bump();
          this.fx.text(p.x, p.y - this.v.u * 10, '-3', '#EF476F', this.v.u * 7);
        }
      }
    }
    // kaçırılan halka seriyi bozar
    for (const o of this.objs) if (o.k === 'ring' && !o.hit && !o.missed && o.z < 1.0) { o.missed = true; this.streak = 0; }
    this.objs = this.objs.filter((o) => o.z > 0.3);
    for (const l of this.lines) { l.d += l.sp * dt * (this.speed / 3); if (l.d > 1.2) { l.d = 0.2; l.a = rand(0, TAU); } }
    this.shake = Math.max(0, this.shake - dt);
    this.fx.update(dt);
  }

  draw(g, inp, t) {
    const { w, h } = this.v;
    g.save();
    if (this.shake > 0) g.translate(rand(-1, 1) * this.shake * 14, rand(-1, 1) * this.shake * 14);
    // dünyayı yatış açısıyla döndür
    g.translate(w / 2, h / 2);
    g.rotate(-this.bank * 0.25);
    g.translate(-w / 2, -h / 2);
    const horizon = h * (0.62 - this.py * 0.12);
    const big = Math.max(w, h) * 1.5;
    const sg = g.createLinearGradient(0, horizon - h, 0, horizon);
    sg.addColorStop(0, '#2E86DE'); sg.addColorStop(0.7, '#9BD3FF'); sg.addColorStop(1, '#FFE0B5');
    g.fillStyle = sg; g.fillRect(-big, -big, big * 3, horizon + big);
    sunGlow(g, w * 0.2, horizon - h * 0.28, Math.min(w, h) * 0.05, t);
    for (let i = 0; i < 4; i++) cloud(g, ((i * 0.31 + t * 0.01) % 1.2) * w - w * 0.1, horizon - h * (0.35 + (i % 2) * 0.12), Math.min(w, h) * 0.09, 'rgba(255,255,255,0.85)');
    skyline(g, w, horizon, Math.min(w * 1.2, h) * 0.8, '#8A9CC0');
    fogBand(g, w * 3, horizon - h * 0.02, h * 0.05, '220,235,255', 0.6);
    skyline(g, w, horizon, Math.min(w * 1.2, h), '#3F4C6B');
    // deniz
    const seaG = g.createLinearGradient(0, horizon, 0, h);
    seaG.addColorStop(0, '#3B82C4'); seaG.addColorStop(1, '#0B4F8A');
    g.fillStyle = seaG; g.fillRect(-big, horizon, big * 3, big);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const zz = ((i / 14 - t * 0.25) % 1 + 1) % 1;
      const yy = horizon + (h - horizon) * zz * zz;
      const ww = 10 + zz * 40;
      for (let k = -3; k <= 3; k++) {
        const xx = w / 2 + k * w * 0.18 * (0.3 + zz) + ((i * 37) % 20);
        g.beginPath(); g.moveTo(xx - ww, yy); g.lineTo(xx + ww, yy); g.stroke();
      }
    }
    fogBand(g, w * 3, horizon + h * 0.01, h * 0.06, '200,225,255', 0.7);
    // nesneler (uzaktan yakına): uzaktakiler pusun içinden belirir
    const sorted = this.objs.slice().sort((a, b) => b.z - a.z);
    for (const o of sorted) {
      if (o.z < 1.0) continue;
      const p = this.proj(o.x, o.y, o.z);
      const a = clamp((12.5 - o.z) / 4, 0, 1);
      g.globalAlpha = a * a;
      if (o.k === 'ring') {
        const r = 0.27 * p.s;
        g.lineWidth = Math.max(3, r * 0.18);
        g.strokeStyle = o.hit ? '#06D6A0' : o.bonus ? '#FF5DA2' : '#FFC300';
        g.shadowColor = g.strokeStyle; g.shadowBlur = 15;
        g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.stroke();
        g.shadowBlur = 0;
        g.lineWidth = Math.max(1, r * 0.05); g.strokeStyle = '#fff';
        g.beginPath(); g.arc(p.x, p.y, r * 0.85, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
        if (o.bonus) star(g, p.x, p.y, r * 0.3, '#FFD23F', null);
      } else if (o.k === 'storm') stormCloud(g, p.x, p.y, 0.25 * p.s, t);
      else seagull(g, p.x, p.y, 0.15 * p.s, t + o.x * 3);
    }
    g.globalAlpha = 1;
    g.restore();
    // hız çizgileri
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; g.lineCap = 'round';
    for (const l of this.lines) {
      const r0 = l.d * Math.max(w, h) * 0.6, r1 = r0 + 20 + l.d * 40;
      g.globalAlpha = clamp(l.d - 0.3, 0, 0.6);
      g.beginPath(); g.moveTo(w / 2 + Math.cos(l.a) * r0, h / 2 + Math.sin(l.a) * r0); g.lineTo(w / 2 + Math.cos(l.a) * r1, h / 2 + Math.sin(l.a) * r1); g.stroke();
    }
    g.globalAlpha = 1;
    const p = this.proj(this.px, this.py, 1.2);
    // planör gölgesi denizde
    g.fillStyle = 'rgba(10,40,80,0.25)';
    g.beginPath(); g.ellipse(p.x, h * 0.93, Math.min(w, h) * 0.12 * (1 - this.py * 0.3), Math.min(w, h) * 0.02, 0, 0, TAU); g.fill();
    glider(g, p.x, p.y, Math.min(w, h) * 0.17, this.bank * 0.9);
    this.fx.draw(g);
    vignette(g, w, h, 0.25, '10,30,70');
  }

  speedKmh() { return this.speed * 28; }

  stats() {
    return [
      { icon: '⭕', label: 'Halka', value: this.rings },
      { icon: '🔥', label: 'En iyi seri', value: this.bestStreak },
      { icon: '⛈️', label: 'Çarpma', value: this.hits },
      { icon: '⚡', label: 'Seri', value: this.streak },
    ];
  }
}

export default {
  id: 'hezarfen',
  title: "Hezarfen'in Uçuşu",
  tagline: 'Uçak sensin!',
  description: 'Kollarını iki yana aç: artık bir planörsün! Kollarını sağa sola eğerek İstanbul semalarındaki altın halkalardan geç. Fırtına bulutlarından ve martılardan uzak dur. Kolları yukarı kaldırınca yükselir, aşağı indirince alçalırsın.',
  howto: ['Kollarını iki yana aç', 'Eğil: sağa-sola dön', 'Kollar yukarı: yüksel', 'Bulut ve martı -3'],
  color: '#2E86DE',
  emoji: '🛩️',
  duration: 60,
  camAlpha: 0,
  skeleton: false,
  cursors: false,
  stars: [40, 90, 150],
  hint: 'Kollarını iki yana aç!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    skyGradient(g, w, h, '#2E86DE', '#FFE0B5', 0, h * 0.62);
    g.fillStyle = '#0B4F8A'; g.fillRect(0, h * 0.62, w, h);
    skyline(g, w, h * 0.62, h, '#3F4C6B');
    g.strokeStyle = '#FFC300'; g.lineWidth = 5;
    g.beginPath(); g.arc(w * 0.62, h * 0.4, h * 0.16, 0, TAU); g.stroke();
    glider(g, w * 0.45 + Math.sin(t) * w * 0.05, h * 0.68, h * 0.28, Math.sin(t) * 0.3);
  },
};
