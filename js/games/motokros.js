// Köy Yolu Motokros: sağa-sola yürüyerek motoru sür, zıplayarak engellerin üstünden atla!
import { TAU, rand, pick, clamp, lerp, cloud, crescentStar, Particles, skyGradient, text, sunGlow, fogBand, vignette } from '../draw.js';
import { sfx } from '../audio.js';

function coin(g, x, y, r, t) {
  const sx = Math.abs(Math.cos(t * 4));
  g.save(); g.translate(x, y); g.scale(Math.max(0.15, sx), 1);
  g.fillStyle = '#FFC300'; g.strokeStyle = '#B7791F'; g.lineWidth = r * 0.15;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.stroke();
  crescentStar(g, -r * 0.1, 0, r * 0.45, '#FFF3B0');
  g.restore();
}

function simit(g, x, y, r) {
  g.save(); g.translate(x, y);
  g.strokeStyle = '#B5651D'; g.lineWidth = r * 0.55;
  g.beginPath(); g.arc(0, 0, r * 0.7, 0, TAU); g.stroke();
  g.strokeStyle = '#D9822B'; g.lineWidth = r * 0.25;
  g.beginPath(); g.arc(0, 0, r * 0.75, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  g.fillStyle = '#FFF1C1';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; g.fillRect(Math.cos(a) * r * 0.7 - 1, Math.sin(a) * r * 0.7 - 1, 3, 2); }
  g.restore();
}

function chicken(g, x, y, s, t) {
  g.save(); g.translate(x, y);
  const hop = Math.abs(Math.sin(t * 8)) * s * 0.1;
  g.translate(0, -hop);
  g.fillStyle = '#fff'; g.strokeStyle = '#334155'; g.lineWidth = s * 0.05;
  g.beginPath(); g.ellipse(0, -s * 0.4, s * 0.45, s * 0.38, 0, 0, TAU); g.fill(); g.stroke();
  g.beginPath(); g.arc(s * 0.25, -s * 0.85, s * 0.22, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#E63946';
  g.beginPath(); g.arc(s * 0.2, -s * 1.08, s * 0.08, 0, TAU); g.arc(s * 0.3, -s * 1.1, s * 0.08, 0, TAU); g.fill();
  g.fillStyle = '#F59E0B';
  g.beginPath(); g.moveTo(s * 0.45, -s * 0.85); g.lineTo(s * 0.62, -s * 0.8); g.lineTo(s * 0.45, -s * 0.75); g.fill();
  g.fillStyle = '#111'; g.beginPath(); g.arc(s * 0.3, -s * 0.9, s * 0.04, 0, TAU); g.fill();
  g.strokeStyle = '#F59E0B'; g.lineWidth = s * 0.06;
  g.beginPath(); g.moveTo(-s * 0.1, -s * 0.05); g.lineTo(-s * 0.1, 0); g.moveTo(s * 0.1, -s * 0.05); g.lineTo(s * 0.1, 0); g.stroke();
  g.restore();
}

function sheep(g, x, y, s) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#334155';
  g.fillRect(-s * 0.35, -s * 0.25, s * 0.1, s * 0.25); g.fillRect(s * 0.25, -s * 0.25, s * 0.1, s * 0.25);
  g.fillStyle = '#F8FAFC'; g.strokeStyle = '#CBD5E1'; g.lineWidth = s * 0.04;
  for (const [bx, by] of [[-0.3, -0.5], [0, -0.6], [0.3, -0.5], [-0.15, -0.35], [0.15, -0.35], [0, -0.75]]) { g.beginPath(); g.arc(bx * s, by * s, s * 0.25, 0, TAU); g.fill(); g.stroke(); }
  g.fillStyle = '#334155'; g.beginPath(); g.ellipse(0, -s * 0.45, s * 0.17, s * 0.22, 0, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(-s * 0.07, -s * 0.5, s * 0.04, 0, TAU); g.arc(s * 0.07, -s * 0.5, s * 0.04, 0, TAU); g.fill();
  g.restore();
}

function hay(g, x, y, s) {
  g.fillStyle = '#E9C46A'; g.strokeStyle = '#B08930'; g.lineWidth = s * 0.04;
  g.fillRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 0.55); g.strokeRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 0.55);
  g.beginPath(); for (let i = 1; i < 4; i++) { g.moveTo(x - s * 0.55, y - s * 0.55 + (i * s * 0.55) / 4); g.lineTo(x + s * 0.55, y - s * 0.55 + (i * s * 0.55) / 4); } g.stroke();
}

function ramp(g, x, y, s) {
  g.fillStyle = '#A0522D';
  g.beginPath(); g.moveTo(x - s * 0.6, y); g.lineTo(x + s * 0.6, y); g.lineTo(x + s * 0.5, y - s * 0.45); g.lineTo(x - s * 0.5, y - s * 0.45); g.closePath(); g.fill();
  g.fillStyle = '#FFD23F';
  g.beginPath(); g.moveTo(x, y - s * 0.4); g.lineTo(x + s * 0.18, y - s * 0.15); g.lineTo(x - s * 0.18, y - s * 0.15); g.closePath(); g.fill();
}

function house(g, x, y, s, roof = '#C0392B') {
  g.fillStyle = '#FDF6E3'; g.fillRect(x - s * 0.5, y - s * 0.6, s, s * 0.6);
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - s * 0.6, y - s * 0.6); g.lineTo(x, y - s); g.lineTo(x + s * 0.6, y - s * 0.6); g.closePath(); g.fill();
  g.fillStyle = '#5DADE2'; g.fillRect(x - s * 0.3, y - s * 0.45, s * 0.2, s * 0.18);
  g.fillStyle = '#8B5A2B'; g.fillRect(x + s * 0.1, y - s * 0.35, s * 0.2, s * 0.35);
}

function poplar(g, x, y, s) {
  g.fillStyle = '#6B4226'; g.fillRect(x - s * 0.04, y - s * 0.3, s * 0.08, s * 0.3);
  g.fillStyle = '#2F8F46'; g.beginPath(); g.ellipse(x, y - s * 0.8, s * 0.18, s * 0.6, 0, 0, TAU); g.fill();
}

function bike(g, x, y, s, lean, air) {
  g.save(); g.translate(x, y); g.rotate(lean * 0.35);
  // gölge
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.beginPath(); g.ellipse(0, air, s * 0.4, s * 0.08, 0, 0, TAU); g.fill();
  // arka teker
  g.fillStyle = '#1F2937'; rr0(g, -s * 0.12, -s * 0.5, s * 0.24, s * 0.5, s * 0.1);
  // gövde
  g.fillStyle = '#E63946'; rr0(g, -s * 0.25, -s * 0.75, s * 0.5, s * 0.3, s * 0.08);
  g.fillStyle = '#fff'; g.fillRect(-s * 0.08, -s * 0.72, s * 0.16, s * 0.08);
  // sürücü
  g.fillStyle = '#2E86DE'; rr0(g, -s * 0.2, -s * 1.15, s * 0.4, s * 0.45, s * 0.12);
  g.strokeStyle = '#2E86DE'; g.lineWidth = s * 0.1; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-s * 0.18, -s * 1.05); g.lineTo(-s * 0.38, -s * 0.85); g.moveTo(s * 0.18, -s * 1.05); g.lineTo(s * 0.38, -s * 0.85); g.stroke();
  g.strokeStyle = '#111'; g.lineWidth = s * 0.05;
  g.beginPath(); g.moveTo(-s * 0.42, -s * 0.85); g.lineTo(s * 0.42, -s * 0.85); g.stroke();
  // kask
  g.fillStyle = '#FFD23F'; g.beginPath(); g.arc(0, -s * 1.27, s * 0.17, 0, TAU); g.fill();
  g.fillStyle = '#E63946'; g.fillRect(-s * 0.17, -s * 1.3, s * 0.34, s * 0.05);
  g.restore();
}
function rr0(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.fill(); }

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.bx = 0; this.vx = 0;
    this.hgt = 0; this.vh = 0;
    this.travel = 0;
    this.speed = 7;
    this.objs = [];
    this.side = [];
    this.spawnT = 0.5;
    this.sideT = 0;
    this.t = 0;
    this.wobble = 0;
    this.slow = 0;
    this.coins = 0; this.jumps = 0; this.bumps = 0; this.flights = 0;
    this.dust = [];
    for (let z = 2; z < 16; z += 1.2) this.addSide(z);
  }

  addSide(z) {
    const s = Math.random() < 0.5 ? -1 : 1;
    this.side.push({ k: Math.random() < 0.35 ? 'house' : 'poplar', x: s * rand(1.4, 2.4), z, roof: pick(['#C0392B', '#D35400', '#2E86DE']) });
  }

  get horizon() { return this.v.h * 0.4; }
  proj(x, z) {
    const { w, h } = this.v;
    const k = 1 / z;
    const hw = Math.min(w * 0.5, h * 0.9) * 0.95;
    return { x: w / 2 + x * hw * k, y: this.horizon + (h * 0.98 - this.horizon) * k, s: k };
  }

  spawn() {
    const lane = pick([-0.66, 0, 0.66]);
    const r = Math.random();
    if (r < 0.45) {
      const kind = Math.random() < 0.25 ? 'simit' : 'coin';
      for (let i = 0; i < 4; i++) this.objs.push({ k: kind, x: lane, z: 15 + i * 0.9, y: 0 });
    } else if (r < 0.85) {
      this.objs.push({ k: pick(['tavuk', 'koyun', 'saman']), x: lane, z: 15 });
      if (Math.random() < 0.5) this.objs.push({ k: 'coin', x: lane, z: 15, y: 0.6 });
    } else {
      this.objs.push({ k: 'rampa', x: lane, z: 15 });
      for (let i = 1; i < 4; i++) this.objs.push({ k: 'coin', x: lane, z: 15 + i * 0.8, y: 0.45 + i * 0.12 });
    }
  }

  update(dt, inp) {
    const { u } = this.v;
    this.t += dt;
    this.slow = Math.max(0, this.slow - dt);
    this.speed = (7 + Math.min(4, this.t / 15)) * (this.slow > 0 ? 0.55 : 1) * this.v.diff;
    if (inp.present) {
      const target = clamp(inp.lean * 1.25, -0.95, 0.95);
      const nb = lerp(this.bx, target, Math.min(1, dt * 7));
      this.vx = (nb - this.bx) / Math.max(dt, 1e-3);
      this.bx = nb;
      if (inp.jump && this.hgt <= 0.001) { this.vh = 2.6; this.jumps++; sfx.jump(); }
    }
    this.vh -= 7 * dt;
    this.hgt = Math.max(0, this.hgt + this.vh * dt);
    if (this.hgt <= 0) this.vh = Math.max(0, this.vh);
    this.travel += this.speed * dt;
    this.wobble = Math.max(0, this.wobble - dt);

    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = rand(0.9, 1.5) * (7 / this.speed); }
    this.sideT -= dt;
    if (this.sideT <= 0) { this.addSide(16); this.sideT = 0.25; }

    const bz = 1.3;
    for (const o of this.objs) {
      const oz = o.z;
      o.z -= this.speed * dt * 0.5;
      if (oz >= bz && o.z < bz && Math.abs(o.x - this.bx) < 0.3) {
        const p = this.proj(o.x, bz);
        if (o.k === 'coin' || o.k === 'simit') {
          if (Math.abs((o.y || 0) - this.hgt) < 0.35) {
            o.dead = true;
            const pts = o.k === 'simit' ? 3 : 1;
            this.score += pts;
            this.coins++;
            sfx.coin();
            this.fx.text(p.x, p.y - u * 15, '+' + pts, '#FFD23F', u * 6);
          }
        } else if (o.k === 'rampa') {
          if (this.hgt < 0.2) { this.vh = 3.6; this.score += 3; this.flights++; sfx.jump(); this.fx.text(p.x, p.y - u * 20, 'Uçuş! +3', '#06D6A0', u * 6); }
        } else if (this.hgt < 0.32) {
          this.score = Math.max(0, this.score - 2);
          this.wobble = 0.6; this.slow = 1.0;
          this.bumps++;
          this.v.hit?.();
          sfx.bump();
          this.fx.burst(p.x, p.y - u * 8, o.k === 'tavuk' ? ['#fff', '#F1F5F9'] : o.k === 'koyun' ? ['#fff'] : ['#E9C46A'], 14, u * 30, u);
          this.fx.text(p.x, p.y - u * 20, o.k === 'tavuk' ? 'Gıt gıt! -2' : o.k === 'koyun' ? 'Meee! -2' : 'Ayy! -2', '#EF476F', u * 5);
          o.dead = true;
        } else if (!o.jumped) { o.jumped = true; this.score += 2; this.fx.text(p.x, p.y - u * 20, 'Süper atlayış! +2', '#06D6A0', u * 5); sfx.good(); }
      }
    }
    for (const s of this.side) s.z -= this.speed * dt * 0.5;
    this.objs = this.objs.filter((o) => !o.dead && o.z > 0.6);
    // teker tozu
    if (this.hgt <= 0.01 && Math.random() < 0.7) this.dust.push({ x: this.bx + rand(-0.05, 0.05), z: 1.2, a: 1, s: rand(0.6, 1.2) });
    for (const d of this.dust) { d.z += dt * 0.6; d.a -= dt * 1.6; d.x += rand(-0.2, 0.2) * dt; }
    this.dust = this.dust.filter((d) => d.a > 0);
    this.side = this.side.filter((s) => s.z > 0.6);
    this.fx.update(dt);
  }

  draw(g, inp, t) {
    const { w, h } = this.v;
    const hz = this.horizon;
    skyGradient(g, w, hz, '#66B7F0', '#CFEFFF');
    sunGlow(g, w * 0.8, hz * 0.4, Math.min(w, h) * 0.045, t);
    for (let i = 0; i < 3; i++) cloud(g, ((i * 0.37 + t * 0.008) % 1.3) * w - w * 0.1, hz * (0.25 + i * 0.15), Math.min(w, h) * 0.07);
    // uzak dağlar ve köy camisi
    g.fillStyle = '#8FC27A';
    g.beginPath(); g.moveTo(0, hz); g.quadraticCurveTo(w * 0.2, hz - h * 0.12, w * 0.45, hz); g.quadraticCurveTo(w * 0.7, hz - h * 0.15, w, hz); g.fill();
    g.fillStyle = '#ECF0F1';
    const mx = w * 0.7;
    g.fillRect(mx, hz - h * 0.12, w * 0.012, h * 0.12);
    g.beginPath(); g.moveTo(mx - w * 0.002, hz - h * 0.12); g.lineTo(mx + w * 0.006, hz - h * 0.16); g.lineTo(mx + w * 0.014, hz - h * 0.12); g.fill();
    g.beginPath(); g.arc(mx + w * 0.05, hz - h * 0.02, w * 0.03, Math.PI, 0); g.fill();
    fogBand(g, w, hz, h * 0.05, '235,245,255', 0.85);
    // çimen
    g.fillStyle = '#7CC24F'; g.fillRect(0, hz, w, h - hz);
    // yol şeritleri (uzaktan yakına)
    const step = 0.5;
    const phase = (this.travel * 0.5) % (step * 2);
    for (let z = 16; z > 1.0; z -= step) {
      const z0 = z - phase, z1 = z0 - step;
      if (z1 < 0.9) continue;
      const a = this.proj(-1.1, z0), b = this.proj(1.1, z0), c = this.proj(1.1, z1), d = this.proj(-1.1, z1);
      const band = Math.floor((z + this.travel * 0.5) / step) % 2 === 0;
      g.fillStyle = band ? '#6DB33F' : '#7CC24F';
      g.fillRect(0, a.y, w, c.y - a.y + 1);
      g.fillStyle = band ? '#C49A6C' : '#B88A5A';
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill();
      g.fillStyle = band ? '#E63946' : '#fff';
      const ew = 0.08;
      for (const sx of [-1, 1]) {
        const p0 = this.proj(sx * 1.1, z0), p1 = this.proj(sx * (1.1 + ew), z0), p2 = this.proj(sx * (1.1 + ew), z1), p3 = this.proj(sx * 1.1, z1);
        g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath(); g.fill();
      }
    }
    // çit direkleri
    const fphase = (this.travel * 0.5) % 1;
    for (let z = 14; z > 1.0; z -= 1) {
      const zz = z - fphase;
      for (const sx of [-1.3, 1.3]) {
        const p = this.proj(sx, zz), s = Math.min(w, h * 0.9) * 0.08 * p.s;
        g.globalAlpha = clamp((15 - zz) / 5, 0, 1);
        g.fillStyle = '#C98B4E'; g.fillRect(p.x - s * 0.08, p.y - s, s * 0.16, s);
        g.fillRect(p.x - s * 0.5, p.y - s * 0.75, s, s * 0.1);
      }
    }
    g.globalAlpha = 1;
    // uzaktaki her şey sise karışır
    const fogG = g.createLinearGradient(0, hz, 0, hz + (h - hz) * 0.25);
    fogG.addColorStop(0, 'rgba(225,240,255,0.75)'); fogG.addColorStop(1, 'rgba(225,240,255,0)');
    g.fillStyle = fogG; g.fillRect(0, hz, w, (h - hz) * 0.25);
    // kenar süsleri + nesneler, uzaktan yakına
    const S = Math.min(w, h * 0.9);
    const all = [...this.side.map((s) => ({ ...s, side: true })), ...this.objs].sort((a, b) => b.z - a.z);
    const bz = 1.3;
    let bikeDrawn = false;
    const drawBike = () => {
      const p = this.proj(this.bx, bz);
      const air = this.hgt * S * 0.25;
      bike(g, p.x + (this.wobble > 0 ? Math.sin(this.wobble * 40) * 8 : 0), p.y - air, S * 0.22, clamp(this.vx * 0.3, -1, 1), air);
    };
    for (const o of all) {
      if (o.z < bz && !bikeDrawn) { drawBike(); bikeDrawn = true; }
      const p = this.proj(o.x, o.z);
      const s = S * 0.32 * p.s;
      if (o.side) { o.k === 'house' ? house(g, p.x, p.y, s * 1.6, o.roof) : poplar(g, p.x, p.y, s * 1.5); continue; }
      const lift = (o.y || 0) * S * 0.25 * p.s;
      if (o.k === 'coin') coin(g, p.x, p.y - s * 0.4 - lift, s * 0.25, t + o.z);
      else if (o.k === 'simit') simit(g, p.x, p.y - s * 0.4 - lift, s * 0.35);
      else if (o.k === 'tavuk') chicken(g, p.x, p.y, s * 0.8, t + o.x);
      else if (o.k === 'koyun') sheep(g, p.x, p.y, s);
      else if (o.k === 'saman') hay(g, p.x, p.y, s);
      else if (o.k === 'rampa') ramp(g, p.x, p.y, s * 1.2);
    }
    if (!bikeDrawn) drawBike();
    for (const d of this.dust) {
      const p = this.proj(d.x, d.z);
      g.fillStyle = `rgba(196,154,108,${d.a * 0.5})`;
      g.beginPath(); g.arc(p.x, p.y - 4, S * 0.03 * d.s * (1.6 - d.a), 0, TAU); g.fill();
    }
    this.fx.draw(g);
    vignette(g, w, h, 0.2, '40,30,10');
  }

  speedKmh() { return this.speed * 9; }

  stats() {
    return [
      { icon: '🪙', label: 'Altın', value: this.coins },
      { icon: '🚀', label: 'Zıplama', value: this.jumps },
      { icon: '💥', label: 'Çarpma', value: this.bumps },
      { icon: '🛫', label: 'Rampa', value: this.flights },
    ];
  }
}

export default {
  id: 'motokros',
  title: 'Köy Yolu Motokros',
  tagline: 'Yürü, zıpla, topla!',
  description: 'Motoru bütün vücudunla sürüyorsun: sağa ya da sola yürü, motor da seninle gelsin; zıpla, motor da zıplasın! Altınları ve simitleri topla, rampalardan uç; tavuklara, koyunlara ve saman balyalarına çarpma.',
  howto: ['Sağa-sola adım at', 'Engelde zıpla', 'Simit 3 puan!', 'Tavuk, koyun, saman -2'],
  color: '#C0392B',
  emoji: '🏍️',
  duration: 60,
  camAlpha: 0,
  cursors: false,
  stars: [25, 50, 80],
  hint: 'Sağa sola adım at, zıpla!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    skyGradient(g, w, h, '#66B7F0', '#CFEFFF');
    g.fillStyle = '#7CC24F'; g.fillRect(0, h * 0.45, w, h);
    g.fillStyle = '#C49A6C';
    g.beginPath(); g.moveTo(w * 0.47, h * 0.45); g.lineTo(w * 0.53, h * 0.45); g.lineTo(w * 0.95, h); g.lineTo(w * 0.05, h); g.closePath(); g.fill();
    chicken(g, w * 0.62, h * 0.66, h * 0.15, t);
    coin(g, w * 0.4, h * 0.58, h * 0.05, t);
    bike(g, w * 0.45, h * 0.97 - Math.abs(Math.sin(t * 2)) * h * 0.1, h * 0.38, Math.sin(t) * 0.5, 0);
  },
};
