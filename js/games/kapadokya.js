// Kapadokya Balonları: peribacalarının üstünde yükselen balonları ellerinle ya da kafanla patlat!
import { TAU, rand, pick, clamp, dist, cloud, star, crescentStar, Particles, RAINBOW, skyGradient, text, bird, sunGlow, fogBand, vignette } from '../draw.js';
import { sfx } from '../audio.js';

function fairyChimneys(g, w, h, seed = 1, color = '#E7A86B', shade = '#C98A4E') {
  const base = h * 0.86;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, h);
  g.lineTo(0, base);
  let x = 0, i = 0;
  while (x < w + 40) {
    const cw = (40 + ((seed * 37 + i * 53) % 50)) * (h / 600);
    const ch = (60 + ((seed * 71 + i * 29) % 110)) * (h / 600);
    g.lineTo(x + cw * 0.15, base);
    g.quadraticCurveTo(x + cw * 0.2, base - ch * 0.8, x + cw * 0.35, base - ch);
    g.lineTo(x + cw * 0.65, base - ch);
    g.quadraticCurveTo(x + cw * 0.8, base - ch * 0.8, x + cw * 0.85, base);
    x += cw; i++;
  }
  g.lineTo(w, h);
  g.closePath();
  g.fill();
  // şapkalar (peribacası başlıkları)
  x = 0; i = 0;
  g.fillStyle = shade;
  while (x < w + 40) {
    const cw = (40 + ((seed * 37 + i * 53) % 50)) * (h / 600);
    const ch = (60 + ((seed * 71 + i * 29) % 110)) * (h / 600);
    g.beginPath();
    g.ellipse(x + cw * 0.5, base - ch, cw * 0.28, cw * 0.14, 0, Math.PI, TAU);
    g.fill();
    // pencere
    g.fillStyle = 'rgba(80,40,20,0.5)';
    g.beginPath(); g.arc(x + cw * 0.5, base - ch * 0.45, cw * 0.07, 0, TAU); g.fill();
    g.fillStyle = shade;
    x += cw; i++;
  }
}

function hotAirBalloon(g, x, y, r, colors) {
  // uzakta süzülen dekoratif sıcak hava balonu
  g.save();
  g.translate(x, y);
  const n = colors.length;
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[i];
    g.beginPath();
    const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI;
    g.moveTo(0, r * 1.1);
    g.ellipse(0, 0, r, r * 1.05, 0, a0, a1);
    g.closePath();
    g.fill();
  }
  g.fillStyle = colors[0];
  g.beginPath();
  g.moveTo(-r, 0);
  g.quadraticCurveTo(-r * 0.9, r * 0.8, -r * 0.3, r * 1.15);
  g.lineTo(r * 0.3, r * 1.15);
  g.quadraticCurveTo(r * 0.9, r * 0.8, r, 0);
  g.closePath();
  g.fill();
  g.strokeStyle = '#5b3a1e'; g.lineWidth = Math.max(1, r * 0.04);
  g.beginPath(); g.moveTo(-r * 0.3, r * 1.15); g.lineTo(-r * 0.2, r * 1.45); g.moveTo(r * 0.3, r * 1.15); g.lineTo(r * 0.2, r * 1.45); g.stroke();
  g.fillStyle = '#8B5A2B';
  g.fillRect(-r * 0.22, r * 1.45, r * 0.44, r * 0.3);
  g.restore();
}

function drawBee(g, b) {
  const { x, y, r } = b;
  g.save();
  g.translate(x + Math.sin(b.t * 5 + b.ph) * r * 0.6, y);
  const f = Math.sin(b.t * 40) * 0.4;
  g.fillStyle = 'rgba(220,240,255,0.85)';
  g.beginPath(); g.ellipse(-r * 0.3, -r * 0.7, r * 0.45, r * 0.3 + f * r * 0.2, -0.5, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(r * 0.3, -r * 0.7, r * 0.45, r * 0.3 - f * r * 0.2, 0.5, 0, TAU); g.fill();
  g.fillStyle = '#FFC300'; g.strokeStyle = '#1e293b'; g.lineWidth = r * 0.08;
  g.beginPath(); g.ellipse(0, 0, r, r * 0.7, 0, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#1e293b';
  for (const k of [-0.3, 0.2]) g.fillRect(k * r, -r * 0.65, r * 0.2, r * 1.3);
  g.beginPath(); g.moveTo(r * 0.95, 0); g.lineTo(r * 1.35, 0); g.lineTo(r * 0.95, r * 0.15); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(-r * 0.65, -r * 0.15, r * 0.18, 0, TAU); g.fill();
  g.fillStyle = '#111'; g.beginPath(); g.arc(-r * 0.68, -r * 0.15, r * 0.09, 0, TAU); g.fill();
  g.restore();
}

function drawBalloon(g, b) {
  if (b.kind === 'ari') return drawBee(g, b);
  const { x, y, r, color } = b;
  g.save();
  g.translate(x, y);
  g.rotate(Math.sin(b.t * 2 + b.ph) * 0.08);
  // ip
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, r * 1.15);
  g.bezierCurveTo(r * 0.3, r * 1.5, -r * 0.3, r * 1.8, 0, r * 2.2); g.stroke();
  // gövde
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
  gr.addColorStop(0, '#ffffffcc');
  gr.addColorStop(0.25, color);
  gr.addColorStop(1, shadeColor(color, -35));
  g.fillStyle = gr;
  g.beginPath(); g.ellipse(0, 0, r, r * 1.15, 0, 0, TAU); g.fill();
  g.fillStyle = shadeColor(color, -30);
  g.beginPath(); g.moveTo(-r * 0.15, r * 1.12); g.lineTo(r * 0.15, r * 1.12); g.lineTo(0, r * 1.28); g.closePath(); g.fill();
  if (b.kind === 'gold') star(g, 0, 0, r * 0.5, '#fff8d6', null);
  if (b.kind === 'flag') crescentStar(g, -r * 0.1, 0, r * 0.38, '#fff');
  if (b.kind === 'rainbow') {
    for (let i = 0; i < 5; i++) {
      g.strokeStyle = RAINBOW[i]; g.lineWidth = r * 0.1;
      g.beginPath(); g.arc(0, r * 0.4, r * (0.75 - i * 0.12), Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    }
  }
  g.restore();
}

function shadeColor(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => clamp(Math.round(c + (pct / 100) * 255), 0, 255);
  const r = f(n >> 16), gg = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
}

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.balloons = [];
    this.fx = new Particles();
    this.spawnT = 0;
    this.t = 0;
    this.combo = 0;
    this.comboT = 0;
    this.popped = 0; this.golds = 0; this.hits = 0;
    this.birds = []; this.birdT = rand(5, 8);
    this.deco = Array.from({ length: 4 }, (_, i) => ({ x: rand(0, 1), y: rand(0.1, 0.5), s: rand(0.03, 0.06), sp: rand(0.004, 0.01), c: pick([['#E63946', '#FFD23F'], ['#06D6A0', '#118AB2'], ['#8338EC', '#FF5DA2'], ['#F77F00', '#FCBF49']]) }));
    this.clouds = Array.from({ length: 5 }, () => ({ x: rand(0, 1), y: rand(0.05, 0.4), s: rand(0.06, 0.12), sp: rand(0.005, 0.015) }));
  }

  spawn() {
    const { w, h, u } = this.v;
    const roll = Math.random();
    let kind = 'normal', r = rand(6, 10) * u, speed = rand(9, 16) * u, pts = 1;
    let color = pick(RAINBOW);
    if (roll < 0.08) { kind = 'gold'; color = '#FFC300'; speed *= 1.4; pts = 5; r *= 0.9; }
    else if (roll < 0.16) { kind = 'flag'; color = '#E30A17'; pts = 3; }
    else if (roll < 0.2) { kind = 'rainbow'; color = '#FFFFFF'; pts = 2; }
    else if (roll < 0.28 && this.t > 5) { kind = 'ari'; color = '#FFC300'; r *= 0.7; pts = -3; }
    else if (roll < 0.4) { r *= 0.65; speed *= 1.5; pts = 2; }
    // zaman ilerledikçe hızlan
    speed *= (1 + Math.min(1, this.t / 60) * 0.6) * this.v.diff;
    this.balloons.push({ x: rand(r, w - r), y: h + r * 2, r, speed, color, kind, pts, t: 0, ph: rand(0, TAU), drift: rand(-1, 1) * u * 3 });
  }

  pop(b) {
    b.dead = true;
    if (b.kind === 'ari') {
      this.score = Math.max(0, this.score + b.pts);
      this.combo = 0;
      sfx.bad();
      this.fx.burst(b.x, b.y, ['#FFC300', '#1e293b'], 10, this.v.u * 30, this.v.u);
      this.fx.text(b.x, b.y - b.r, 'Vız! -3', '#EF476F', this.v.u * 6);
      this.hits++;
      this.v.hit?.();
      return;
    }
    this.combo = this.comboT > 0 ? this.combo + 1 : 1;
    this.comboT = 1.2;
    const bonus = this.combo >= 5 ? 2 : 1;
    this.popped++;
    if (b.kind === 'gold') this.golds++;
    this.score += b.pts * bonus;
    this.fx.burst(b.x, b.y, b.kind === 'rainbow' ? RAINBOW : [b.color, '#fff'], 18, this.v.u * 50, this.v.u * 1.2, b.kind === 'gold' ? 'star' : 'rect');
    this.fx.text(b.x, b.y - b.r, '+' + b.pts * bonus, b.kind === 'gold' ? '#FFD23F' : '#fff', this.v.u * 6);
    sfx.pop();
    if (b.kind === 'gold') sfx.coin();
    if (b.kind === 'rainbow') {
      sfx.magic();
      for (const o of this.balloons) if (!o.dead && o !== b && o.kind !== 'ari') { o.dead = true; this.score += 1; this.fx.burst(o.x, o.y, [o.color], 10, this.v.u * 35, this.v.u); }
    }
  }

  update(dt, inp) {
    this.t += dt;
    this.comboT -= dt;
    const rate = 0.75 - Math.min(0.4, this.t / 120);
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = rate * rand(0.6, 1.3) * (this.v.players === 2 ? 1.2 : 1); }
    const touchers = [];
    if (inp.present) {
      for (const h of inp.hands) if (h.visible) touchers.push({ x: h.x, y: h.y, r: Math.max(16, inp.shW * 0.25) });
      if (inp.head.visible) touchers.push({ x: inp.head.x, y: inp.head.y, r: inp.head.r });
    }
    for (const b of this.balloons) {
      b.t += dt;
      b.y -= b.speed * dt;
      b.x += Math.sin(b.t * 1.3 + b.ph) * b.drift * dt;
      for (const c of touchers) if (!b.dead && dist(b, c) < b.r + c.r) this.pop(b);
    }
    this.balloons = this.balloons.filter((b) => !b.dead && b.y > -b.r * 3);
    // kuşlar yatay geçer: dokunursan -2
    this.birdT -= dt;
    if (this.birdT <= 0 && this.t > 4) {
      this.birdT = rand(5, 9) / this.v.diff;
      const dir = Math.random() < 0.5 ? 1 : -1;
      this.birds.push({ x: dir > 0 ? -0.1 : 1.1, y: rand(0.2, 0.6), dir, sp: rand(0.12, 0.2) * this.v.diff, t: 0 });
    }
    for (const bd of this.birds) {
      bd.t += dt;
      bd.x += bd.dir * bd.sp * dt;
      const p = { x: bd.x * this.v.w, y: (bd.y + Math.sin(bd.t * 3) * 0.02) * this.v.h };
      const r = this.v.u * 5;
      for (const c of touchers) if (!bd.dead && dist(p, c) < r + c.r) {
        bd.dead = true; this.hits++;
        this.score = Math.max(0, this.score - 2);
        this.combo = 0;
        sfx.bad(); this.v.hit?.();
        this.fx.burst(p.x, p.y, ['#fff', '#CBD5E1'], 14, this.v.u * 30, this.v.u, 'circle');
        this.fx.text(p.x, p.y - r, 'Cik cik! -2', '#EF476F', this.v.u * 6);
      }
    }
    this.birds = this.birds.filter((bd) => !bd.dead && bd.x > -0.2 && bd.x < 1.2);
    for (const d of this.deco) { d.x += d.sp * dt; if (d.x > 1.1) d.x = -0.1; }
    for (const c of this.clouds) { c.x += c.sp * dt; if (c.x > 1.2) c.x = -0.2; }
    this.fx.update(dt);
  }

  draw(g, inp, t) {
    const { w, h } = this.v;
    skyGradient(g, w, h, '#FF9E7A', '#FFE3B3');
    const sg = g.createLinearGradient(0, 0, 0, h * 0.6);
    sg.addColorStop(0, '#5BB8F5'); sg.addColorStop(1, 'rgba(91,184,245,0)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h * 0.6);
    // güneş
    sunGlow(g, w * 0.78, h * 0.6, Math.min(w, h) * 0.07, t);
    for (const c of this.clouds) cloud(g, c.x * w, c.y * h, c.s * Math.min(w, h) * 1.6, 'rgba(255,255,255,0.8)');
    for (const d of this.deco) hotAirBalloon(g, d.x * w, (d.y + Math.sin(t * 0.5 + d.x * 9) * 0.02) * h, d.s * Math.min(w, h), [d.c[0], d.c[1], d.c[0], d.c[1], d.c[0]]);
    fairyChimneys(g, w, h * 0.96, 5, '#F7D0A8', '#E8B58A');
    fogBand(g, w, h * 0.84, h * 0.08, '255,236,214', 0.75);
    fairyChimneys(g, w, h * 1.02, 3, '#F0B985', '#D49763');
    fogBand(g, w, h * 0.9, h * 0.05, '255,230,200', 0.5);
    fairyChimneys(g, w, h * 1.12, 7, '#D9925A', '#B5733F');
  }

  stats() {
    return [
      { icon: '🎈', label: 'Patlatılan', value: this.popped },
      { icon: '⭐', label: 'Altın balon', value: this.golds },
      { icon: '💥', label: 'Arı / kuş', value: this.hits },
      { icon: '🔥', label: 'Seri', value: this.comboT > 0 ? this.combo : 0 },
    ];
  }

  drawOver(g, inp, t) {
    for (const bd of this.birds) {
      g.save(); g.translate(bd.x * this.v.w, (bd.y + Math.sin(bd.t * 3) * 0.02) * this.v.h); g.scale(bd.dir, 1);
      bird(g, 0, 0, this.v.u * 5, bd.t);
      g.restore();
    }
    for (const b of this.balloons) drawBalloon(g, b);
    this.fx.draw(g);
    if (this.combo >= 5 && this.comboT > 0) text(g, `Seri x${this.combo}! 🔥`, this.v.w / 2, this.v.h * 0.2, this.v.u * 7, '#FFD23F');
    vignette(g, this.v.w, this.v.h, 0.22, '120,60,20');
  }
}

export default {
  id: 'kapadokya',
  title: 'Kapadokya Balonları',
  tagline: 'Pıt, pıt, patlat!',
  description: 'Peribacalarının üstünden rengârenk balonlar yükseliyor. Ellerinle ya da kafanla dokunup hepsini patlat! Altın balonlar 5 puan, gökkuşağı balonu ekrandaki tüm balonları patlatır. Ama dikkat: arılara dokunma!',
  howto: ['Ellerini salla', 'Kafanla da patlatabilirsin', 'Altın balonu kaçırma!', 'Arı -3, kuş -2: dokunma!'],
  color: '#FF8C42',
  emoji: '🎈',
  duration: 60,
  camAlpha: 0.32,
  stars: [20, 45, 75],
  hint: 'Balonlara elinle dokun!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    skyGradient(g, w, h, '#5BB8F5', '#FFE3B3');
    hotAirBalloon(g, w * 0.25, h * 0.3 + Math.sin(t) * 4, h * 0.13, ['#E63946', '#FFD23F', '#E63946', '#FFD23F']);
    fairyChimneys(g, w, h * 1.05, 3, '#F0B985', '#D49763');
    const cols = ['#EF476F', '#06D6A0', '#FFC300', '#38B6FF'];
    cols.forEach((c, i) => drawBalloon(g, { x: w * (0.5 + i * 0.13), y: h * (0.55 - ((t * 0.15 + i * 0.27) % 1) * 0.45), r: h * 0.08, color: c, kind: i === 2 ? 'gold' : 'normal', t, ph: i }));
  },
};
