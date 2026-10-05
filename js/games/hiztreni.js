// Anadolu Hız Treni: en önde oturuyorsun! Pamukkale'den Ağrı Dağı'na, mağaradan yaylaya… Ellerini kaldır, yıldızları yakala!
import { TAU, rand, clamp, lerp, cloud, star, Particles, text, RAINBOW, fogBand, vignette, bird } from '../draw.js';
import { sfx, say } from '../audio.js';

const SCENES = [
  { name: 'Pamukkale', sky: ['#4FA8E8', '#CFEAFF'], ground: '#F4F1EA', deco: 'pamukkale' },
  { name: 'Ağrı Dağı', sky: ['#5B8FD9', '#E0ECFF'], ground: '#8FB36B', deco: 'agri' },
  { name: 'Damlataş Mağarası', sky: ['#120B2E', '#2A1B4F'], ground: '#2B2140', deco: 'cave' },
  { name: 'Kapadokya', sky: ['#FF9E7A', '#FFE3B3'], ground: '#E2A86B', deco: 'kapadokya' },
  { name: 'Karadeniz Yaylası', sky: ['#7FB6D9', '#E4F2EC'], ground: '#3E9B4F', deco: 'yayla' },
];
const SCENE_LEN = 13;

function bat(g, x, y, s, t) {
  const f = Math.sin(t * 14) * 0.5;
  g.save(); g.translate(x, y);
  g.fillStyle = '#2B1E3F'; g.strokeStyle = '#120B1F'; g.lineWidth = s * 0.05;
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(-s * 0.6, -s * (0.6 + f), -s * 1.2, -s * 0.1 * (1 + f));
  g.quadraticCurveTo(-s * 0.8, 0, -s * 0.9, s * 0.25);
  g.quadraticCurveTo(-s * 0.4, s * 0.05, 0, s * 0.3);
  g.quadraticCurveTo(s * 0.4, s * 0.05, s * 0.9, s * 0.25);
  g.quadraticCurveTo(s * 0.8, 0, s * 1.2, -s * 0.1 * (1 + f));
  g.quadraticCurveTo(s * 0.6, -s * (0.6 + f), 0, 0);
  g.fill(); g.stroke();
  g.beginPath(); g.arc(0, s * 0.05, s * 0.3, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-s * 0.22, -s * 0.15); g.lineTo(-s * 0.15, -s * 0.45); g.lineTo(-s * 0.05, -s * 0.2); g.moveTo(s * 0.22, -s * 0.15); g.lineTo(s * 0.15, -s * 0.45); g.lineTo(s * 0.05, -s * 0.2); g.fill();
  g.fillStyle = '#FF5D73'; g.beginPath(); g.arc(-s * 0.1, 0, s * 0.06, 0, TAU); g.arc(s * 0.1, 0, s * 0.06, 0, TAU); g.fill();
  g.restore();
}

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.t = 0;
    this.travel = 0;
    this.stars = [];
    this.spawnT = 1;
    this.sceneIdx = 0;
    this.bannerT = 2.5;
    this.dropT = 0;
    this.dropScored = false;
    this.curve = 0; this.hill = 0;
    this.caught = 0; this.giants = 0; this.hits = 0; this.drops = 0;
  }

  get scene() { return SCENES[this.sceneIdx % SCENES.length]; }

  vp() {
    const { w, h } = this.v;
    return { x: w / 2 + this.curve * w * 0.25, y: h * (0.42 + this.hill * 0.15) };
  }

  proj(x, y, z) {
    const { w, h } = this.v;
    const S = Math.min(w, h * 1.2) * 0.6;
    const vp = this.vp();
    const k = 1 / z;
    // yakın noktalar merkeze, uzaklar kaybolma noktasına
    const cx = lerp(vp.x, w / 2, clamp(k, 0, 1));
    const cy = lerp(vp.y, h * 0.5, clamp(k, 0, 1));
    return { x: cx + x * S * k, y: cy + y * S * k, s: S * k };
  }

  update(dt, inp) {
    const { w, h, u } = this.v;
    this.t += dt;
    const speed = this.dropT > 0 ? 2.2 : 1;
    this.travel += dt * speed;
    // eğimli ve kıvrımlı ray
    this.curve = Math.sin(this.travel * 0.35) * 0.9 + Math.sin(this.travel * 0.9) * 0.3;
    const sceneT = this.t % SCENE_LEN;
    const target = this.dropT > 0 ? -0.9 : Math.sin(this.travel * 0.5) * 0.4 + (sceneT > SCENE_LEN * 0.4 && sceneT < SCENE_LEN * 0.55 ? 0.8 : 0);
    this.hill = lerp(this.hill, target, Math.min(1, dt * 2));

    const si = Math.floor(this.t / SCENE_LEN);
    if (si !== this.sceneIdx) { this.sceneIdx = si; this.bannerT = 2.5; sfx.whoosh(); if (this.v.players === 1) say(this.scene.name); }
    this.bannerT -= dt;
    // her sahnenin ortasında büyük iniş
    if (Math.abs(sceneT - SCENE_LEN * 0.56) < dt && this.dropT <= 0) { this.dropT = 3; this.dropScored = false; sfx.whoosh(); }
    if (this.dropT > 0) {
      this.dropT -= dt;
      if (inp.present && inp.handsUp && !this.dropScored) {
        this.dropScored = true; this.score += 5; this.drops++; sfx.good();
        this.fx.text(w / 2, h * 0.3, 'Vııııı! +5', '#FFD23F', u * 9);
      }
    }

    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = rand(0.45, 0.8);
      const roll = Math.random();
      if (roll < 0.07 && !this.stars.some((s) => s.giant)) this.stars.push({ x: rand(-0.3, 0.3), y: -0.5, z: 9, giant: true, hover: 2.8, rot: 0 });
      else if (roll > 0.82 && this.t > 4) this.stars.push({ x: rand(-0.7, 0.7), y: rand(-0.8, -0.2), z: 9, bad: true, rot: 0 });
      else this.stars.push({ x: rand(-0.9, 0.9), y: rand(-0.95, -0.15), z: 9, big: roll < 0.18, rot: rand(0, TAU) });
    }
    const hands = inp.present ? inp.hands.filter((hd) => hd.visible) : [];
    for (const s of this.stars) {
      if (s.giant) {
        // dev yıldız önünde durur; iki el birden dokunmalı
        if (s.z > 1.5) s.z = Math.max(1.5, s.z - dt * 3.6 * speed);
        else if ((s.hover -= dt) <= 0) s.z -= dt * 3.6;
        s.rot += dt;
        if (s.z <= 1.5 && !s.dead) {
          const p = this.proj(s.x, s.y, s.z);
          const r = (0.3 * p.s) / this.v.diff;
          const n = hands.filter((hd) => Math.hypot(hd.x - p.x, hd.y - p.y) < r).length;
          if (n >= 2 || (inp.fake && n >= 1 && inp.mouseDown)) {
            s.dead = true; this.score += 5; this.giants++; sfx.win();
            this.fx.burst(p.x, p.y, RAINBOW, 40, u * 70, u * 1.4, 'star');
            this.fx.text(p.x, p.y, 'Dev yıldız! +5', '#FFD23F', u * 8);
          }
        }
        continue;
      }
      s.z -= dt * 3.6 * speed;
      s.rot += dt * 2;
      if (s.z < 1.6 && s.z > 0.75 && !s.dead) {
        const p = this.proj(s.x, s.y, s.z);
        const r = ((s.big ? 0.16 : 0.11) * p.s + 18) / this.v.diff;
        if (s.bad) {
          for (const hd of hands) if (!s.dead && Math.hypot(hd.x - p.x, hd.y - p.y) < r * 0.8) {
            s.dead = true; this.hits++;
            this.score = Math.max(0, this.score - 2);
            sfx.bad(); this.v.hit?.();
            this.fx.text(p.x, p.y, this.scene.deco === 'cave' ? 'Yarasa! -2' : 'Gak gak! -2', '#EF476F', u * 6);
          }
          continue;
        }
        for (const hd of hands) if (Math.hypot(hd.x - p.x, hd.y - p.y) < r) {
          s.dead = true;
          this.caught++;
          const pts = s.big ? 3 : 1;
          this.score += pts;
          s.big ? sfx.magic() : sfx.coin();
          this.fx.burst(p.x, p.y, s.big ? RAINBOW : ['#FFD23F', '#fff'], 14, u * 40, u, 'star');
          this.fx.text(p.x, p.y, '+' + pts, '#FFD23F', u * 6);
          break;
        }
      }
    }
    this.stars = this.stars.filter((s) => !s.dead && s.z > 0.7);
    this.fx.update(dt);
  }

  drawScenery(g, t) {
    const { w, h } = this.v;
    const sc = this.scene;
    const vp = this.vp();
    const sg = g.createLinearGradient(0, 0, 0, vp.y);
    sg.addColorStop(0, sc.sky[0]); sg.addColorStop(1, sc.sky[1]);
    g.fillStyle = sg; g.fillRect(0, 0, w, vp.y + 2);
    g.fillStyle = sc.ground; g.fillRect(0, vp.y, w, h - vp.y);
    const px = -this.curve * w * 0.15; // paralaks
    const m = Math.min(w, h);
    if (sc.deco === 'pamukkale') {
      for (let i = 0; i < 3; i++) cloud(g, ((i * 0.4 + t * 0.01) % 1.3) * w - w * 0.1, vp.y * (0.2 + i * 0.15), m * 0.08);
      for (let i = 0; i < 6; i++) {
        const yy = vp.y + i * m * 0.05, ww = w * (0.5 + i * 0.25);
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(w * 0.3 + px, yy, ww / 2, m * 0.035, 0, Math.PI, TAU); g.fill();
        g.fillStyle = '#6FD3E8'; g.beginPath(); g.ellipse(w * 0.3 + px, yy + m * 0.008, ww * 0.42, m * 0.02, 0, 0, TAU); g.fill();
      }
    } else if (sc.deco === 'agri') {
      g.fillStyle = '#7A6E8A';
      g.beginPath(); g.moveTo(w * 0.1 + px, vp.y); g.lineTo(w * 0.5 + px, vp.y - m * 0.45); g.lineTo(w * 0.95 + px, vp.y); g.fill();
      g.fillStyle = '#fff';
      g.beginPath(); g.moveTo(w * 0.36 + px, vp.y - m * 0.3); g.lineTo(w * 0.5 + px, vp.y - m * 0.45); g.lineTo(w * 0.66 + px, vp.y - m * 0.28);
      g.lineTo(w * 0.58 + px, vp.y - m * 0.32); g.lineTo(w * 0.52 + px, vp.y - m * 0.26); g.lineTo(w * 0.45 + px, vp.y - m * 0.32); g.closePath(); g.fill();
      g.fillStyle = '#9A8FA8';
      g.beginPath(); g.moveTo(w * 0.6 + px, vp.y); g.lineTo(w * 0.78 + px, vp.y - m * 0.2); g.lineTo(w * 1.0 + px, vp.y); g.fill();
    } else if (sc.deco === 'cave') {
      for (let i = 0; i < 40; i++) {
        const x = ((i * 97) % 100) / 100 * w, y = ((i * 53) % 100) / 100 * vp.y;
        const c = ['#7CF7FF', '#C77DFF', '#FF7AD9', '#9BFF8A'][i % 4];
        g.globalAlpha = 0.5 + Math.sin(t * 3 + i) * 0.4;
        g.fillStyle = c;
        g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x + 5, y); g.lineTo(x, y + 8); g.lineTo(x - 5, y); g.closePath(); g.fill();
      }
      g.globalAlpha = 1;
      g.fillStyle = '#3A2D55';
      for (let i = 0; i < 12; i++) { const x = (i / 11) * w; g.beginPath(); g.moveTo(x - m * 0.04, 0); g.lineTo(x, m * (0.1 + (i % 3) * 0.06)); g.lineTo(x + m * 0.04, 0); g.fill(); }
    } else if (sc.deco === 'kapadokya') {
      g.fillStyle = '#D9925A';
      for (let i = 0; i < 9; i++) {
        const x = (i / 8) * w + px, hh = m * (0.12 + (i % 3) * 0.06);
        g.beginPath(); g.moveTo(x - m * 0.04, vp.y); g.quadraticCurveTo(x - m * 0.03, vp.y - hh, x, vp.y - hh); g.quadraticCurveTo(x + m * 0.03, vp.y - hh, x + m * 0.04, vp.y); g.fill();
        g.fillStyle = '#A9683A'; g.beginPath(); g.ellipse(x, vp.y - hh, m * 0.025, m * 0.012, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#D9925A';
      }
    } else if (sc.deco === 'yayla') {
      g.fillStyle = '#2F7D3F';
      g.beginPath(); g.moveTo(0, vp.y); g.quadraticCurveTo(w * 0.25 + px, vp.y - m * 0.35, w * 0.5 + px, vp.y); g.quadraticCurveTo(w * 0.75 + px, vp.y - m * 0.28, w, vp.y); g.fill();
      for (let i = 0; i < 3; i++) {
        const x = w * (0.2 + i * 0.3) + px, y = vp.y - m * 0.02;
        g.fillStyle = '#8B5A2B'; g.fillRect(x - m * 0.03, y - m * 0.04, m * 0.06, m * 0.04);
        g.fillStyle = '#5D3A1A'; g.beginPath(); g.moveTo(x - m * 0.04, y - m * 0.04); g.lineTo(x, y - m * 0.07); g.lineTo(x + m * 0.04, y - m * 0.04); g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 3; i++) g.fillRect(0, vp.y - m * (0.05 + i * 0.07), w, m * 0.025);
    }
  }

  draw(g, inp, t) {
    const { w, h } = this.v;
    this.drawScenery(g, t);
    // ray: traversler ve iki ray
    const cave = this.scene.deco === 'cave';
    const phase = (this.travel * (this.dropT > 0 ? 2.2 : 1) * 3) % 1;
    for (let i = 14; i >= 0; i--) {
      const z = 0.8 + (i + 1 - phase) * 0.6;
      const a = this.proj(-0.6, 0.55, z), b = this.proj(0.6, 0.55, z);
      g.strokeStyle = cave ? '#6B4F8A' : '#8B5A2B'; g.lineWidth = Math.max(2, a.s * 0.05);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    for (const sx of [-0.45, 0.45]) {
      g.strokeStyle = '#E63946'; g.lineWidth = 6;
      g.beginPath();
      for (let z = 9; z >= 0.8; z -= 0.2) { const p = this.proj(sx, 0.55, z); z === 9 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y); }
      g.stroke();
    }
    // uzaklık sisi: ray ve sahne ufukta pusa karışır
    const vp = this.vp();
    const fogRGB = cave ? '42,27,79' : this.scene.deco === 'kapadokya' ? '255,227,190' : '230,242,255';
    fogBand(g, w, vp.y, h * 0.08, fogRGB, cave ? 0.8 : 0.75);
    // yıldızlar (uzaktan yakına)
    for (const s of this.stars.slice().sort((a, b) => b.z - a.z)) {
      const p = this.proj(s.x, s.y, s.z);
      const r = (s.giant ? 0.3 : s.big ? 0.16 : 0.1) * p.s;
      g.globalAlpha = clamp((9 - s.z) / 3, 0, 1) ** 2;
      if (s.bad) {
        if (this.scene.deco === 'cave') bat(g, p.x, p.y, r * 1.4, this.t + s.x * 5);
        else bird(g, p.x, p.y, r * 1.2, this.t + s.x * 5, '#111827');
        g.globalAlpha = 1;
        continue;
      }
      g.save(); g.translate(p.x, p.y); g.rotate(s.rot);
      g.shadowColor = '#FFE66D'; g.shadowBlur = 20;
      star(g, 0, 0, r, s.big ? `hsl(${(this.t * 200) % 360},90%,60%)` : '#FFD23F', '#fff');
      g.restore();
      g.globalAlpha = 1;
      if (s.giant && s.z <= 1.5) text(g, '🙌 İki elinle tut!', p.x, p.y + r * 1.3, Math.max(16, r * 0.3), '#fff');
    }
  }

  drawOver(g, inp, t) {
    const { w, h, u } = this.v;
    // vagon önü
    const m = Math.min(w, h);
    const shakeY = Math.sin(t * 25) * (this.dropT > 0 ? 4 : 1.5);
    g.save(); g.translate(0, shakeY);
    g.fillStyle = '#C1121F';
    g.beginPath(); g.moveTo(w * 0.05, h); g.lineTo(w * 0.12, h - m * 0.16); g.quadraticCurveTo(w * 0.5, h - m * 0.22, w * 0.88, h - m * 0.16); g.lineTo(w * 0.95, h); g.fill();
    g.fillStyle = '#FFD23F'; g.fillRect(w * 0.1, h - m * 0.13, w * 0.8, m * 0.025);
    g.fillStyle = '#334155';
    g.fillRect(w * 0.2, h - m * 0.2, w * 0.6, m * 0.02);
    g.restore();
    if (this.bannerT > 0) {
      const a = clamp(this.bannerT, 0, 1);
      g.globalAlpha = a;
      const bw = m * 0.7, bh = m * 0.12;
      g.fillStyle = '#fff'; g.strokeStyle = '#C0392B'; g.lineWidth = 5;
      g.beginPath(); g.roundRect ? g.roundRect(w / 2 - bw / 2, h * 0.22 - bh / 2, bw, bh, bh / 2) : g.rect(w / 2 - bw / 2, h * 0.22 - bh / 2, bw, bh); g.fill(); g.stroke();
      text(g, this.scene.name + '!', w / 2, h * 0.225, m * 0.06, '#C0392B', { stroke: null, weight: 800 });
      g.globalAlpha = 1;
    }
    if (this.dropT > 0) text(g, '🙌 Eller yukarı!', w / 2, h * 0.35, m * 0.09 * (1 + Math.sin(t * 12) * 0.05), this.dropScored ? '#06D6A0' : '#FFD23F');
    this.fx.draw(g);
    vignette(g, w, h, this.dropT > 0 ? 0.45 : 0.25, '0,0,0');
  }

  speedKmh() { return (this.dropT > 0 ? 95 : 45) + Math.sin(this.travel) * 6; }

  stage() { return { list: ['🏁 Başlangıç', ...SCENES.map((s) => s.name), '🎉 Bitiş'], idx: Math.min(SCENES.length + 1, this.sceneIdx + 1) }; }

  stats() {
    return [
      { icon: '⭐', label: 'Yıldız', value: this.caught },
      { icon: '🌟', label: 'Dev yıldız', value: this.giants },
      { icon: '🙌', label: 'İniş', value: this.drops },
      { icon: '🦇', label: 'Çarpma', value: this.hits },
    ];
  }
}

export default {
  id: 'hiztreni',
  title: 'Anadolu Hız Treni',
  tagline: 'Eller yukarı, yıldızları yakala!',
  description: 'Hız treninin en önünde oturuyorsun: 3, 2, 1… Pamukkale travertenleri, Ağrı Dağı, ışıl ışıl kristalli Damlataş Mağarası, Kapadokya ve Karadeniz yaylası! Ellerini uzat, uçan yıldızları yakala. Büyük inişlerde iki elini birden kaldır!',
  howto: ['Yıldızlara uzan', 'Dev yıldızı iki elinle tut: +5', 'İnişte eller yukarı!', 'Yarasa ve kargaya dokunma: -2'],
  color: '#8338EC',
  emoji: '🎢',
  duration: SCENE_LEN * 5,
  camAlpha: 0.18,
  stars: [30, 60, 95],
  hint: 'Ellerini uzat, yıldızları yakala!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    const gm = new Game({ w, h, u: Math.min(w, h) / 100, players: 1, player: 0, diff: 1 });
    gm.sceneIdx = Math.floor(t / 2) % SCENES.length;
    gm.travel = t; gm.curve = Math.sin(t * 0.7) * 0.8; gm.hill = Math.sin(t * 0.5) * 0.3;
    gm.stars = [{ x: -0.4, y: -0.6, z: 3, rot: t }, { x: 0.5, y: -0.4, z: 2, rot: -t, big: true }];
    gm.draw(g, {}, t);
  },
};
