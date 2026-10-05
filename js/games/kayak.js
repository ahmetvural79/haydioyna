// Palandöken Kayak: kollarını aç ve eğil, karlı pistte kıvrıl! Bayrak kapılarından geç, ağaçlardan kaç.
import { TAU, rand, pick, clamp, lerp, star, Particles, text, vignette } from '../draw.js';
import { sfx } from '../audio.js';

function pine(g, x, y, s) {
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.beginPath(); g.ellipse(x + s * 0.2, y + s * 0.1, s * 0.5, s * 0.18, 0, 0, TAU); g.fill();
  g.fillStyle = '#6B4226'; g.fillRect(x - s * 0.06, y - s * 0.2, s * 0.12, s * 0.25);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = i % 2 ? '#2D6A4F' : '#1B4332';
    g.beginPath(); g.moveTo(x - s * (0.5 - i * 0.1), y - s * (0.15 + i * 0.3)); g.lineTo(x, y - s * (0.75 + i * 0.3)); g.lineTo(x + s * (0.5 - i * 0.1), y - s * (0.15 + i * 0.3)); g.closePath(); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.moveTo(x - s * (0.2 - i * 0.04), y - s * (0.55 + i * 0.3)); g.lineTo(x, y - s * (0.75 + i * 0.3)); g.lineTo(x + s * (0.2 - i * 0.04), y - s * (0.55 + i * 0.3)); g.closePath(); g.fill();
  }
}

function snowman(g, x, y, s) {
  g.fillStyle = 'rgba(0,0,0,0.1)'; g.beginPath(); g.ellipse(x + s * 0.1, y + s * 0.05, s * 0.4, s * 0.12, 0, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.strokeStyle = '#CBD5E1'; g.lineWidth = s * 0.04;
  g.beginPath(); g.arc(x, y - s * 0.3, s * 0.32, 0, TAU); g.fill(); g.stroke();
  g.beginPath(); g.arc(x, y - s * 0.78, s * 0.22, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#E63946'; g.fillRect(x - s * 0.24, y - s * 0.6, s * 0.48, s * 0.08);
  g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(x, y - s * 0.78); g.lineTo(x + s * 0.25, y - s * 0.75); g.lineTo(x, y - s * 0.72); g.fill();
  g.fillStyle = '#111'; g.beginPath(); g.arc(x - s * 0.07, y - s * 0.85, s * 0.03, 0, TAU); g.arc(x + s * 0.07, y - s * 0.85, s * 0.03, 0, TAU); g.fill();
  g.fillStyle = '#1E3A8A'; g.fillRect(x - s * 0.2, y - s * 1.0, s * 0.4, s * 0.06); g.fillRect(x - s * 0.12, y - s * 1.18, s * 0.24, s * 0.2);
}

function gateFlag(g, x, y, s, color) {
  g.strokeStyle = '#334155'; g.lineWidth = s * 0.06;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - s); g.stroke();
  g.fillStyle = color;
  g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.45, y - s * 0.82); g.lineTo(x, y - s * 0.62); g.closePath(); g.fill();
}

function bump(g, x, y, s) {
  const gr = g.createRadialGradient(x - s * 0.2, y - s * 0.2, s * 0.1, x, y, s);
  gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#C7DDF0');
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, s, s * 0.45, 0, 0, TAU); g.fill();
}

function tea(g, x, y, s) {
  // ince belli çay bardağı
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y + s * 0.35, s * 0.4, s * 0.1, 0, 0, TAU); g.fill();
  g.fillStyle = '#B23A1C';
  g.beginPath(); g.moveTo(x - s * 0.22, y - s * 0.3); g.quadraticCurveTo(x - s * 0.08, y, x - s * 0.18, y + s * 0.3); g.lineTo(x + s * 0.18, y + s * 0.3);
  g.quadraticCurveTo(x + s * 0.08, y, x + s * 0.22, y - s * 0.3); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = s * 0.05; g.stroke();
}

function boarder(g, x, y, s, tilt, air) {
  g.save();
  g.fillStyle = 'rgba(30,58,138,0.18)';
  g.beginPath(); g.ellipse(x + air * 0.6, y + air, s * 0.7, s * 0.25, tilt * 0.6, 0, TAU); g.fill();
  g.translate(x, y - air * 0.3);
  g.rotate(tilt * 0.6);
  const sc = 1 + air / (s * 3);
  g.scale(sc, sc);
  g.fillStyle = '#FF5DA2'; g.strokeStyle = '#7A1E4C'; g.lineWidth = s * 0.04;
  g.beginPath(); g.ellipse(0, 0, s * 0.75, s * 0.18, 0, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#FFD23F'; g.fillRect(-s * 0.4, -s * 0.03, s * 0.8, s * 0.06);
  // kollar
  g.strokeStyle = '#2E86DE'; g.lineWidth = s * 0.14; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-s * 0.55, -s * 0.05); g.lineTo(s * 0.55, -s * 0.05); g.stroke();
  // gövde
  g.fillStyle = '#2E86DE'; g.beginPath(); g.ellipse(0, 0, s * 0.28, s * 0.2, 0, 0, TAU); g.fill();
  // bere
  g.fillStyle = '#E63946'; g.beginPath(); g.arc(0, -s * 0.02, s * 0.17, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -s * 0.02, s * 0.07, 0, TAU); g.fill();
  g.restore();
}

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.x = 0.5;
    this.tilt = 0;
    this.air = 0; this.vair = 0;
    this.objs = [];
    this.trail = [];
    this.t = 0;
    this.spawnY = 0;
    this.scroll = 0;
    this.hit = 0;
    this.lastX = 0.5;
    this.seed = Math.random() * 1000;
    this.gates = 0; this.crashes = 0; this.tricks = 0; this.stars = 0;
    this.flakes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: rand(1, 3.5), sp: rand(0.02, 0.08) }));
  }

  get speed() { return this.v.h * (0.42 + Math.min(0.35, this.t / 120)) * (this.hit > 0 ? 0.5 : 1) * this.v.diff; }

  spawnRow() {
    const r = Math.random();
    // pist ortası sinüsle kıvrılır: her oyun farklı bir pist
    const c = 0.5 + Math.sin(this.scroll / this.v.h * 1.3 + this.seed) * 0.25;
    if (r < 0.3) this.objs.push({ k: 'gate', x: clamp(c + rand(-0.1, 0.1), 0.2, 0.8), y: 1.15, gap: 0.22, color: pick(['#E63946', '#2E86DE']) });
    else if (r < 0.5) for (let i = 0; i < 3; i++) this.objs.push({ k: 'star', x: clamp(c + (i - 1) * 0.04, 0.1, 0.9), y: 1.15 + i * 0.06 });
    else if (r < 0.58) this.objs.push({ k: 'bump', x: clamp(c, 0.15, 0.85), y: 1.15 });
    else if (r < 0.62) this.objs.push({ k: 'tea', x: clamp(c + rand(-0.15, 0.15), 0.1, 0.9), y: 1.15 });
    // kenarda ve bazen pistte ağaç/kardan adam
    const nObs = Math.random() < 0.6 ? 1 : 2;
    for (let i = 0; i < nObs; i++) {
      let ox = rand(0.05, 0.95);
      if (Math.abs(ox - c) < 0.12) ox += ox < c ? -0.15 : 0.15;
      this.objs.push({ k: Math.random() < 0.75 ? 'pine' : 'snowman', x: clamp(ox, 0.03, 0.97), y: rand(1.12, 1.3) });
    }
  }

  update(dt, inp) {
    const { w, h, u } = this.v;
    this.t += dt;
    this.hit = Math.max(0, this.hit - dt);
    if (inp.present) {
      this.tilt = lerp(this.tilt, inp.tilt, Math.min(1, dt * 8));
      if (inp.jump && this.air <= 0.001) { this.vair = 2.2; sfx.jump(); }
    }
    this.lastX = this.x;
    this.x = clamp(this.x + this.tilt * 0.75 * dt, 0.04, 0.96);
    this.vair -= 6 * dt;
    this.air = Math.max(0, this.air + this.vair * dt);
    const dy = (this.speed * dt) / h;
    this.scroll += this.speed * dt;
    this.spawnY -= dy;
    if (this.spawnY <= 0) { this.spawnRow(); this.spawnY = rand(0.28, 0.4); }
    const py = 0.3;
    for (const o of this.objs) {
      const oy = o.y;
      o.y -= dy;
      if (oy >= py && o.y < py && !o.done) {
        o.done = true;
        const sx = o.x * w, sy = py * h;
        if (o.k === 'gate') {
          if (Math.abs(this.x - o.x) < o.gap / 2) { this.score += 3; this.gates++; sfx.good(); this.fx.text(sx, sy + u * 8, 'Kapı! +3', '#06D6A0', u * 5); o.pass = true; }
        } else if (o.k === 'star' && Math.abs(this.x - o.x) < 0.07) { o.dead = true; this.score += 1; this.stars++; sfx.coin(); this.fx.burst(sx, sy, ['#FFD23F'], 8, u * 25, u * 0.8, 'star'); }
        else if (o.k === 'tea' && Math.abs(this.x - o.x) < 0.07) { o.dead = true; this.score += 5; sfx.coin(); this.fx.text(sx, sy + u * 8, 'Sıcak çay! +5', '#FFD23F', u * 5); }
        else if (o.k === 'bump' && Math.abs(this.x - o.x) < 0.12) {
          if (this.air > 0.05) { this.score += 4; this.tricks++; sfx.good(); this.fx.text(sx, sy + u * 8, 'Akrobasi! +4', '#FF5DA2', u * 5); }
          else { this.vair = 1.4; }
        } else if ((o.k === 'pine' || o.k === 'snowman') && Math.abs(this.x - o.x) < 0.055 && this.air < 0.15) {
          this.score = Math.max(0, this.score - 2); this.hit = 0.8; this.crashes++; this.v.hit?.(); sfx.bump();
          this.fx.burst(sx, sy, ['#fff', '#DBEAFE'], 18, u * 35, u);
          this.fx.text(sx, sy + u * 8, 'Pat! -2', '#EF476F', u * 5);
        }
      }
    }
    this.objs = this.objs.filter((o) => !o.dead && o.y > -0.15);
    // iz
    this.trail.push({ x: this.x, y: py, a: this.air });
    for (const tp of this.trail) tp.y -= dy;
    this.trail = this.trail.filter((tp) => tp.y > -0.05);
    if (Math.abs(this.tilt) > 0.4 && this.air <= 0 && Math.random() < 0.5) this.fx.burst(this.x * w, py * h + u * 3, ['#fff'], 2, u * 10, u * 0.6);
    for (const f of this.flakes) { f.y += f.sp * dt - dy * 0.3; f.x += Math.sin(this.t + f.r) * 0.01 * dt; if (f.y < -0.02) { f.y = 1.02; f.x = Math.random(); } if (f.y > 1.02) f.y = -0.02; }
    this.fx.update(dt);
  }

  speedKmh() { return (this.speed / this.v.h) * 70; }

  stats() {
    return [
      { icon: '🚩', label: 'Kapı', value: this.gates },
      { icon: '⭐', label: 'Yıldız', value: this.stars },
      { icon: '🤸', label: 'Akrobasi', value: this.tricks },
      { icon: '💥', label: 'Çarpma', value: this.crashes },
    ];
  }

  draw(g, inp, t) {
    const { w, h, u } = this.v;
    const sg = g.createLinearGradient(0, 0, w, h);
    sg.addColorStop(0, '#F8FBFF'); sg.addColorStop(1, '#E3EEF9');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    // kar dokusu
    g.fillStyle = 'rgba(160,190,220,0.18)';
    const off = this.scroll % 80;
    for (let y = -off; y < h; y += 80) for (let x = ((y + off) / 80) % 2 ? 0 : 40; x < w; x += 80) { g.beginPath(); g.ellipse(x, y, 18, 4, 0, 0, TAU); g.fill(); }
    // iz
    g.strokeStyle = 'rgba(148,180,210,0.6)'; g.lineWidth = u * 1.2; g.lineCap = 'round';
    g.beginPath();
    let pen = false;
    for (const tp of this.trail) { if (tp.a > 0.05) { pen = false; continue; } pen ? g.lineTo(tp.x * w, tp.y * h) : g.moveTo(tp.x * w, tp.y * h); pen = true; }
    g.stroke();
    const S = Math.min(w, h);
    const sorted = this.objs.slice().sort((a, b) => a.y - b.y);
    for (const o of sorted.filter((o) => o.k === 'bump')) bump(g, o.x * w, o.y * h, S * 0.09);
    // oyuncuyu doğru sıraya koy (yukarıdakiler önce)
    let drawn = false;
    for (const o of sorted) {
      if (o.k === 'bump') continue;
      if (!drawn && o.y > 0.3) { boarder(g, this.x * w, 0.3 * h, S * 0.12, this.tilt, this.air * S * 0.1); drawn = true; }
      const x = o.x * w, y = o.y * h;
      if (o.k === 'pine') pine(g, x, y, S * 0.12);
      else if (o.k === 'snowman') snowman(g, x, y, S * 0.11);
      else if (o.k === 'gate') {
        gateFlag(g, (o.x - o.gap / 2) * w, y, S * 0.09, o.pass ? '#06D6A0' : o.color);
        gateFlag(g, (o.x + o.gap / 2) * w, y, S * 0.09, o.pass ? '#06D6A0' : o.color);
      } else if (o.k === 'star') star(g, x, y, S * 0.025);
      else if (o.k === 'tea') tea(g, x, y, S * 0.05);
    }
    if (!drawn) boarder(g, this.x * w, 0.3 * h, S * 0.12, this.tilt, this.air * S * 0.1);
    this.fx.draw(g);
    // dağ gölgesi kenarlarda + yağan kar
    const sh = g.createLinearGradient(0, 0, w, 0);
    sh.addColorStop(0, 'rgba(90,130,180,0.25)'); sh.addColorStop(0.15, 'rgba(90,130,180,0)'); sh.addColorStop(0.85, 'rgba(90,130,180,0)'); sh.addColorStop(1, 'rgba(90,130,180,0.25)');
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff';
    for (const f of this.flakes) { g.globalAlpha = 0.85; g.beginPath(); g.arc(f.x * w, f.y * h, f.r, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    text(g, 'PALANDÖKEN', w / 2, h - u * 5, u * 4, 'rgba(46,134,222,0.5)', { stroke: null });
    vignette(g, w, h, 0.18, '30,60,110');
  }
}

export default {
  id: 'kayak',
  title: 'Palandöken Kayak',
  tagline: 'Eğil ve kay!',
  description: 'Erzurum Palandöken’in karlı pistinden snowboardla iniyorsun; pist her seferinde farklı! Kollarını iki yana aç ve eğerek dön. Bayrak kapılarından geç, yıldızları ve sıcak çayı topla, çam ağaçlarına ve kardan adamlara çarpma. Kar tepelerinde zıplarsan akrobasi puanı!',
  howto: ['Kollarını aç', 'Sağa-sola eğ', 'Tepede zıpla: akrobasi!', 'Ağaç ve kardan adam -2'],
  color: '#5DADE2',
  emoji: '🏂',
  duration: 60,
  camAlpha: 0,
  cursors: false,
  stars: [30, 60, 100],
  hint: 'Kollarını aç ve eğ!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    g.fillStyle = '#F1F7FF'; g.fillRect(0, 0, w, h);
    pine(g, w * 0.15, h * 0.7, h * 0.3); pine(g, w * 0.85, h * 0.95, h * 0.3); pine(g, w * 0.8, h * 0.4, h * 0.22);
    gateFlag(g, w * 0.4, h * 0.85, h * 0.2, '#E63946'); gateFlag(g, w * 0.62, h * 0.85, h * 0.2, '#E63946');
    snowman(g, w * 0.3, h * 0.35, h * 0.2);
    boarder(g, w * 0.5 + Math.sin(t) * w * 0.12, h * 0.4, h * 0.22, Math.cos(t) * 0.8, 0);
  },
};
