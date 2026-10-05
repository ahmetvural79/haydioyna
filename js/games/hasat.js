// Bahçe Hasadı: Anadolu meyvelerini dallardan topla, rüzgârda düşenleri yakala!
import { TAU, rand, pick, clamp, dist, cloud, text, Particles, skyGradient, easeOut, bee, sunGlow, fogBand, vignette } from '../draw.js';
import { sfx, say } from '../audio.js';

const FRUITS = [
  { k: 'kayisi', name: 'Malatya kayısısı', leaves: '#3E8E41' },
  { k: 'kiraz', name: 'Kiraz', leaves: '#2F7D32' },
  { k: 'incir', name: 'İncir', leaves: '#4C9A2A' },
  { k: 'nar', name: 'Nar', leaves: '#2E7D4F' },
  { k: 'portakal', name: 'Portakal', leaves: '#2C7A3A' },
  { k: 'elma', name: 'Amasya elması', leaves: '#3B8F3B' },
];

export function drawFruit(g, k, x, y, r, rot = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  const shine = () => { g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.35, r * 0.2, r * 0.13, -0.6, 0, TAU); g.fill(); };
  const leaf = (lx, ly, a = -0.6) => { g.fillStyle = '#3BAA4A'; g.beginPath(); g.ellipse(lx, ly, r * 0.32, r * 0.14, a, 0, TAU); g.fill(); };
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = Math.max(1, r * 0.06);
  if (k === 'kayisi') {
    g.fillStyle = '#FFA62B'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = 'rgba(230,80,30,0.45)'; g.beginPath(); g.arc(r * 0.3, r * 0.2, r * 0.55, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(160,70,0,0.4)'; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(-r * 0.3, 0, 0, r); g.stroke();
    shine(); leaf(r * 0.3, -r * 1.0);
  } else if (k === 'kiraz') {
    g.strokeStyle = '#4C7A2A'; g.lineWidth = r * 0.12;
    g.beginPath(); g.moveTo(-r * 0.5, 0); g.quadraticCurveTo(-r * 0.2, -r * 1.2, r * 0.2, -r * 1.4); g.moveTo(r * 0.55, r * 0.1); g.quadraticCurveTo(r * 0.4, -r * 0.8, r * 0.2, -r * 1.4); g.stroke();
    for (const [cx, cy] of [[-r * 0.5, r * 0.1], [r * 0.55, r * 0.2]]) {
      g.fillStyle = '#C1121F'; g.beginPath(); g.arc(cx, cy, r * 0.6, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(cx - r * 0.2, cy - r * 0.2, r * 0.13, 0, TAU); g.fill();
    }
    leaf(r * 0.45, -r * 1.35, 0.4);
  } else if (k === 'incir') {
    g.fillStyle = '#6A2C70';
    g.beginPath(); g.moveTo(0, -r * 1.1); g.bezierCurveTo(r * 0.5, -r * 0.6, r * 1.05, r * 0.2, r * 0.6, r * 0.8);
    g.quadraticCurveTo(0, r * 1.15, -r * 0.6, r * 0.8); g.bezierCurveTo(-r * 1.05, r * 0.2, -r * 0.5, -r * 0.6, 0, -r * 1.1); g.fill(); g.stroke();
    g.fillStyle = '#9B4F96'; g.beginPath(); g.ellipse(r * 0.2, r * 0.3, r * 0.35, r * 0.45, 0, 0, TAU); g.fill();
    g.fillStyle = '#4C7A2A'; g.fillRect(-r * 0.08, -r * 1.3, r * 0.16, r * 0.3);
    shine();
  } else if (k === 'nar') {
    g.fillStyle = '#B5172B'; g.beginPath(); g.arc(0, r * 0.05, r, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = '#8E0E20';
    g.beginPath(); g.moveTo(-r * 0.3, -r * 0.85); g.lineTo(-r * 0.35, -r * 1.2); g.lineTo(-r * 0.12, -r * 1.0); g.lineTo(0, -r * 1.3);
    g.lineTo(r * 0.12, -r * 1.0); g.lineTo(r * 0.35, -r * 1.2); g.lineTo(r * 0.3, -r * 0.85); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,140,120,0.4)'; g.beginPath(); g.arc(r * 0.35, r * 0.3, r * 0.4, 0, TAU); g.fill();
    shine();
  } else if (k === 'portakal') {
    g.fillStyle = '#FB8500'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,200,80,0.6)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(Math.cos(i) * r * 0.5, Math.sin(i * 2) * r * 0.5, r * 0.06, 0, TAU); g.fill(); }
    shine(); leaf(r * 0.25, -r * 1.0);
  } else {
    g.fillStyle = '#E63946';
    g.beginPath(); g.moveTo(0, -r * 0.7);
    g.bezierCurveTo(r * 0.8, -r * 1.2, r * 1.3, r * 0.2, r * 0.5, r * 0.9); g.quadraticCurveTo(0, r * 1.05, -r * 0.5, r * 0.9);
    g.bezierCurveTo(-r * 1.3, r * 0.2, -r * 0.8, -r * 1.2, 0, -r * 0.7); g.fill(); g.stroke();
    g.fillStyle = '#5b3a1e'; g.fillRect(-r * 0.06, -r * 1.05, r * 0.12, r * 0.4);
    shine(); leaf(r * 0.3, -r * 0.95);
  }
  g.restore();
}

function drawTree(g, x, baseY, s, leaves, shakeA) {
  g.save();
  g.translate(x, baseY);
  g.fillStyle = '#7A4B2A';
  g.beginPath();
  g.moveTo(-s * 0.08, 0); g.lineTo(-s * 0.05, -s * 0.55); g.lineTo(-s * 0.25, -s * 0.8); g.lineTo(-s * 0.2, -s * 0.83);
  g.lineTo(0, -s * 0.62); g.lineTo(s * 0.22, -s * 0.85); g.lineTo(s * 0.26, -s * 0.8); g.lineTo(s * 0.05, -s * 0.55); g.lineTo(s * 0.08, 0);
  g.closePath(); g.fill();
  g.rotate(Math.sin(shakeA) * 0.03);
  const blobs = [[0, -1.15, 0.5], [-0.45, -0.95, 0.38], [0.45, -0.95, 0.38], [-0.3, -1.35, 0.35], [0.3, -1.35, 0.35], [-0.6, -0.7, 0.28], [0.6, -0.7, 0.28], [0, -0.8, 0.4]];
  for (const [bx, by, br] of blobs) {
    g.fillStyle = leaves;
    g.beginPath(); g.arc(bx * s, by * s, br * s, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,0.08)';
  for (const [bx, by, br] of blobs) { g.beginPath(); g.arc(bx * s - br * s * 0.3, by * s - br * s * 0.3, br * s * 0.5, 0, TAU); g.fill(); }
  g.restore();
}

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.treeIdx = Math.floor(Math.random() * FRUITS.length);
    this.flying = [];
    this.falling = [];
    this.basket = 0;
    this.picked = 0; this.caught = 0; this.trees = 0; this.stung = 0;
    this.bees = [];
    this.t = 0;
    this.newTree();
  }

  get tree() { return FRUITS[this.treeIdx % FRUITS.length]; }

  newTree() {
    this.treeIdx++;
    this.enterT = 0;
    this.windT = rand(5, 8);
    this.shakeA = 0;
    this.fruits = [];
    const n = 10;
    let tries = 0;
    while (this.fruits.length < n && tries++ < 400) {
      // ağaç tacı içinde (normalize, ağaç tabanına göre)
      const a = rand(0, TAU), rr = Math.sqrt(Math.random());
      const fx = Math.cos(a) * rr * 0.72, fy = -1.05 + Math.sin(a) * rr * 0.48;
      if (this.fruits.some((f) => Math.hypot(f.fx - fx, f.fy - fy) < 0.2)) continue;
      this.fruits.push({ fx, fy, ph: rand(0, TAU) });
    }
    if (this.v.players === 1 && this.treeIdx > 1) say(this.tree.name + ' ağacı!');
  }

  geom() {
    const { w, h } = this.v;
    const s = Math.min(w * 0.75, h * 0.62);
    return { tx: w / 2, ty: h * 0.86, s };
  }

  fruitPos(f) {
    const { tx, ty, s } = this.geom();
    const wob = f.wobble ? Math.sin(this.shakeA * 25) * s * 0.012 : 0;
    return { x: tx + f.fx * s + wob, y: ty + f.fy * s };
  }

  update(dt, inp) {
    const { w, h, u } = this.v;
    const { s } = this.geom();
    const fr = s * 0.06;
    this.enterT += dt;
    this.shakeA += dt * (this.windT < 1 ? 20 : 2);
    this.windT -= dt;
    const hands = inp.present ? inp.hands.filter((hd) => hd.visible) : [];
    // rüzgâr: birkaç meyve düşer
    if (this.windT <= 0 && this.fruits.length) {
      this.windT = rand(6, 9);
      sfx.whoosh();
      const k = Math.min(this.fruits.length, Math.random() < 0.5 ? 2 : 3);
      const free = this.fruits.filter((f) => !f.wobble);
      for (let i = 0; i < k && free.length; i++) free.splice(Math.floor(Math.random() * free.length), 1)[0].wobble = 1.2;
    }
    // sallanan meyve bir süre sonra düşer
    for (const f of this.fruits) {
      if (!f.wobble) continue;
      f.wobble -= dt;
      if (f.wobble <= 0) {
        f.dead = true;
        const p = this.fruitPos(f);
        this.falling.push({ x: p.x, y: p.y, vy: 0, vx: rand(-1, 1) * u * 6, rot: 0 });
      }
    }
    this.fruits = this.fruits.filter((f) => !f.dead);
    // toplama
    for (const f of this.fruits) {
      const p = this.fruitPos(f);
      for (const hd of hands) if (!f.dead && dist(p, hd) < (fr * 1.6 + 10) / this.v.diff) {
        f.dead = true;
        this.score += 1;
        this.picked++;
        sfx.pop();
        this.fx.burst(p.x, p.y, ['#FFD23F', '#fff', '#06D6A0'], 10, u * 30, u * 0.9, 'star');
        this.flying.push({ x0: p.x, y0: p.y, t: 0 });
      }
    }
    this.fruits = this.fruits.filter((f) => !f.dead);
    // düşenleri yakala
    for (const f of this.falling) {
      f.vy += h * 0.55 * dt;
      f.y += f.vy * dt; f.x += f.vx * dt; f.rot += dt * 3;
      for (const hd of hands) if (!f.dead && dist(f, hd) < fr * 2) {
        f.dead = true;
        this.score += 2;
        this.caught++;
        sfx.coin();
        this.fx.text(f.x, f.y - fr, '+2 Yakaladın!', '#FFD23F', u * 5);
        this.flying.push({ x0: f.x, y0: f.y, t: 0 });
      }
      if (!f.dead && f.y > h * 0.92) {
        f.dead = true;
        this.fx.burst(f.x, h * 0.92, ['#A0522D', '#FFA62B'], 8, u * 20, u * 0.8);
      }
    }
    this.falling = this.falling.filter((f) => !f.dead);
    for (const f of this.flying) f.t += dt * 2;
    const landed = this.flying.filter((f) => f.t >= 1).length;
    this.basket += landed;
    this.flying = this.flying.filter((f) => f.t < 1);
    if (!this.fruits.length && !this.falling.length && !this.flying.length && !this.clearT) {
      this.clearT = 1.4;
      this.score += 5;
      this.trees++;
      sfx.good();
      this.fx.text(w / 2, h * 0.3, 'Ağaç bitti! +5', '#06D6A0', u * 8);
    }
    if (this.clearT) { this.clearT -= dt; if (this.clearT <= 0) { this.clearT = 0; this.newTree(); } }
    // arılar ağacın etrafında döner: dokunursan -2
    this.t += dt;
    if (this.bees.length < (this.t > 20 ? 2 : 1) && this.t > 6) this.bees.push({ a: rand(0, TAU), sp: rand(0.6, 1.0) * this.v.diff * (Math.random() < 0.5 ? 1 : -1), r: rand(0.3, 0.55), cool: 0 });
    const g0 = this.geom();
    for (const b of this.bees) {
      b.a += b.sp * dt;
      b.cool -= dt;
      b.x = g0.tx + Math.cos(b.a) * g0.s * b.r * 1.3;
      b.y = g0.ty - g0.s * 1.0 + Math.sin(b.a * 1.7) * g0.s * b.r * 0.6;
      for (const hd of hands) if (b.cool <= 0 && dist(b, hd) < u * 6) {
        b.cool = 1.5;
        this.stung++;
        this.score = Math.max(0, this.score - 2);
        sfx.bad(); this.v.hit?.();
        this.fx.text(b.x, b.y - u * 6, 'Vızzz! -2', '#EF476F', u * 5);
        b.sp *= -1;
      }
    }
    this.fx.update(dt);
  }

  stats() {
    return [
      { icon: '🍑', label: 'Toplanan', value: this.picked },
      { icon: '🧺', label: 'Yakalanan', value: this.caught },
      { icon: '🌳', label: 'Ağaç', value: this.trees },
      { icon: '🐝', label: 'Arı', value: this.stung },
    ];
  }

  draw(g, inp, t) {
    const { w, h } = this.v;
    skyGradient(g, w, h, '#7EC8F2', '#D9F2FF');
    sunGlow(g, w * 0.85, h * 0.1, Math.min(w, h) * 0.05, t);
    for (let i = 0; i < 3; i++) cloud(g, ((i * 0.4 + t * 0.01) % 1.3) * w - w * 0.1, h * (0.08 + i * 0.06), Math.min(w, h) * 0.08);
    // tepeler
    g.fillStyle = '#9BD770';
    g.beginPath(); g.moveTo(0, h * 0.7); g.quadraticCurveTo(w * 0.3, h * 0.55, w * 0.6, h * 0.7); g.quadraticCurveTo(w * 0.85, h * 0.6, w, h * 0.68); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#B9DDA0';
    g.beginPath(); g.moveTo(0, h * 0.66); g.quadraticCurveTo(w * 0.5, h * 0.5, w, h * 0.64); g.lineTo(w, h * 0.7); g.lineTo(0, h * 0.7); g.fill();
    fogBand(g, w, h * 0.66, h * 0.06, '235,248,255', 0.6);
    // uzak ağaç sırası
    for (let i = 0; i < 6; i++) drawTree(g, w * (i / 5), h * 0.74, Math.min(w, h) * 0.12, '#6DBE45', 0);
    g.fillStyle = '#7CC24F'; g.fillRect(0, h * 0.86, w, h * 0.14);
    const { tx, ty, s } = this.geom();
    const slide = this.clearT ? (1.4 - this.clearT) / 1.4 : 0;
    const enter = easeOut(clamp(this.enterT * 1.5, 0, 1));
    g.save();
    g.translate(-slide * w + (1 - enter) * w, 0);
    drawTree(g, tx, ty, s, this.tree.leaves, this.shakeA);
    const fr = s * 0.06;
    for (const f of this.fruits) {
      const p = this.fruitPos(f);
      drawFruit(g, this.tree.k, p.x, p.y, fr);
    }
    g.restore();
  }

  drawOver(g) {
    const { w, h, u } = this.v;
    const { s } = this.geom();
    const fr = s * 0.06;
    for (const f of this.falling) drawFruit(g, this.tree.k, f.x, f.y, fr, f.rot);
    for (const b of this.bees) if (b.x !== undefined) {
      g.globalAlpha = b.cool > 0 ? 0.5 : 1;
      g.save(); g.translate(b.x, b.y); g.scale(b.sp > 0 ? -1 : 1, 1); bee(g, 0, 0, u * 3.5, this.t); g.restore();
      g.globalAlpha = 1;
    }
    // sepet
    const bx = w * 0.5, by = h * 0.95, bw = Math.min(w, h) * 0.22;
    for (const f of this.flying) {
      const k = easeOut(f.t);
      drawFruit(g, this.tree.k, f.x0 + (bx - f.x0) * k, f.y0 + (by - bw * 0.2 - f.y0) * k - Math.sin(k * Math.PI) * h * 0.1, fr * (1 - k * 0.3));
    }
    g.fillStyle = '#C68642';
    g.beginPath(); g.moveTo(bx - bw / 2, by - bw * 0.25); g.lineTo(bx + bw / 2, by - bw * 0.25); g.lineTo(bx + bw * 0.4, by + bw * 0.1); g.lineTo(bx - bw * 0.4, by + bw * 0.1); g.closePath(); g.fill();
    g.strokeStyle = '#8B5A2B'; g.lineWidth = 3;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(bx - bw / 2 + (bw * i) / 4, by - bw * 0.25); g.lineTo(bx - bw * 0.4 + (bw * 0.8 * i) / 4, by + bw * 0.1); g.stroke(); }
    text(g, String(this.basket), bx, by - bw * 0.05, bw * 0.18, '#fff');
    text(g, this.tree.name, w / 2, h * 0.08 + u * 10, u * 5, '#fff');
    this.fx.draw(g);
    vignette(g, w, h, 0.18, '20,60,20');
  }
}

export default {
  id: 'hasat',
  title: 'Bahçe Hasadı',
  tagline: 'Uzan, topla!',
  description: 'Bahçede Malatya kayısısı, kiraz, incir, nar, portakal ve Amasya elması ağaçları var. Uzanıp her meyveye dokun, ağacı boşalt! Rüzgâr esince düşen meyveleri yere değmeden yakala.',
  howto: ['Meyveye elinle dokun', 'Sallanan meyve düşmek üzere!', 'Düşeni yakala: +2', 'Arıya dokunma: -2'],
  color: '#3BAA4A',
  emoji: '🍑',
  duration: 75,
  camAlpha: 0.25,
  stars: [25, 50, 80],
  hint: 'Meyvelere uzan!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    skyGradient(g, w, h, '#7EC8F2', '#D9F2FF');
    g.fillStyle = '#7CC24F'; g.fillRect(0, h * 0.82, w, h * 0.18);
    drawTree(g, w * 0.5, h * 0.85, h * 0.55, '#3E8E41', t);
    [[-0.3, -1.1], [0.2, -1.2], [0.4, -0.85], [-0.45, -0.8], [0, -0.9]].forEach(([x, y], i) => drawFruit(g, ['kayisi', 'kiraz', 'nar', 'incir', 'elma'][i], w * 0.5 + x * h * 0.55, h * 0.85 + y * h * 0.55, h * 0.06));
  },
};
