// Minik Lokanta: hayvan müşteriler sipariş veriyor; malzemelere sırayla dokunarak yemeği hazırla!
import { TAU, rand, pick, shuffle, clamp, dist, rr, text, emoji, animalFace, Particles, easeOut, vignette } from '../draw.js';
import { sfx, say } from '../audio.js';

const ING = {
  hamur: ['🫓', 'Hamur'], kiyma: ['🥩', 'Kıyma'], domates: ['🍅', 'Domates'], sogan: ['🧅', 'Soğan'],
  maydanoz: ['🌿', 'Maydanoz'], limon: ['🍋', 'Limon'], yumurta: ['🥚', 'Yumurta'], biber: ['🫑', 'Biber'],
  marul: ['🥬', 'Marul'], peynir: ['🧀', 'Peynir'], sucuk: ['🌭', 'Sucuk'], salatalik: ['🥒', 'Salatalık'],
  zeytin: ['🫒', 'Zeytin'], simit: ['🥯', 'Simit'], dondurma: ['🍦', 'Dondurma'], cilek: ['🍓', 'Çilek'],
  cikolata: ['🍫', 'Çikolata'], fistik: ['🥜', 'Fıstık'], cay: ['🍵', 'Çay'],
};

const DISHES = [
  { name: 'Lahmacun', steps: ['hamur', 'kiyma', 'domates', 'maydanoz', 'limon'] },
  { name: 'Menemen', steps: ['domates', 'biber', 'yumurta'] },
  { name: 'Dürüm', steps: ['hamur', 'kiyma', 'marul', 'domates'] },
  { name: 'Sucuklu Pide', steps: ['hamur', 'peynir', 'sucuk', 'yumurta'] },
  { name: 'Çoban Salata', steps: ['domates', 'salatalik', 'biber', 'sogan', 'limon'] },
  { name: 'Kahvaltı', steps: ['simit', 'peynir', 'zeytin', 'domates', 'cay'] },
  { name: 'Maraş Dondurma', steps: ['dondurma', 'cilek', 'fistik'] },
  { name: 'Çikolatalı Dondurma', steps: ['dondurma', 'cikolata', 'fistik'] },
  { name: 'Peynirli Pide', steps: ['hamur', 'peynir', 'yumurta'] },
];

const CUSTOMERS = ['kedi', 'kangal', 'tavsan', 'ayi', 'kuzu', 'tilki', 'kaplumbaga', 'leylek'];
const NAMES = { kedi: 'Tekir', kangal: 'Karabaş', tavsan: 'Pamuk', ayi: 'Boz', kuzu: 'Kuzucuk', tilki: 'Kızıl', kaplumbaga: 'Yavaş', leylek: 'Lak Lak' };

// 8 kutu: sol sütun, sağ sütun, üstte iki
const SLOTS = [[0.12, 0.3], [0.1, 0.52], [0.12, 0.74], [0.88, 0.3], [0.9, 0.52], [0.88, 0.74], [0.33, 0.36], [0.67, 0.36]];

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.flying = [];
    this.served = 0;
    this.wrong = 0;
    this.lost = 0;
    this.tips = 0;
    this.newCustomer(true);
  }

  newCustomer(first = false) {
    const prevDish = this.dish;
    let dish;
    do dish = pick(DISHES); while (dish === prevDish);
    this.dish = dish;
    this.step = 0;
    this.animal = pick(CUSTOMERS);
    this.patienceMax = Math.max(14, 28 - this.served * 1.2) / this.v.diff;
    this.patience = this.patienceMax;
    this.state = 'order'; // order | happy | sad
    this.stateT = 0;
    this.enterT = 0;
    const others = shuffle(Object.keys(ING).filter((k) => !dish.steps.includes(k)));
    const keys = shuffle([...new Set(dish.steps)].concat(others).slice(0, SLOTS.length));
    this.bins = keys.map((k, i) => ({ k, x: SLOTS[i][0], y: SLOTS[i][1], dwell: 0, cool: 0, shake: 0 }));
    if (!first && this.v.players === 1) say(`${dish.name} lütfen!`);
  }

  update(dt, inp) {
    this.enterT += dt;
    this.stateT += dt;
    const { w, h, u } = this.v;
    const R = Math.min(w, h) * 0.085;
    if (this.state === 'order') {
      this.patience -= dt;
      if (this.patience <= 0) { this.state = 'sad'; this.stateT = 0; this.lost++; sfx.bad(); }
    } else if (this.stateT > 1.6) this.newCustomer();

    for (const b of this.bins) {
      b.cool -= dt; b.shake = Math.max(0, b.shake - dt);
      const bx = b.x * w, by = b.y * h;
      let over = false;
      if (inp.present && this.state === 'order') for (const hd of inp.hands) if (hd.visible && dist(hd, { x: bx, y: by }) < R * 1.1) over = true;
      if (over && b.cool <= 0) {
        b.dwell += dt;
        if (b.dwell > 0.18) {
          b.dwell = 0; b.cool = 0.8;
          if (this.dish.steps[this.step] === b.k) {
            this.step++;
            sfx.tap(this.step);
            this.flying.push({ k: b.k, x0: bx, y0: by, t: 0 });
            if (this.step >= this.dish.steps.length) {
              const bonus = Math.ceil((this.patience / this.patienceMax) * 5);
              this.tips += bonus;
              const pts = 10 + bonus;
              this.score += pts;
              this.served++;
              this.state = 'happy'; this.stateT = 0;
              sfx.good();
              this.fx.burst(w / 2, h * 0.82, ['#FFD23F', '#06D6A0', '#EF476F'], 30, u * 60, u * 1.3, 'star');
              this.fx.text(w / 2, h * 0.68, `+${pts}`, '#FFD23F', u * 9);
            }
          } else {
            b.shake = 0.4;
            this.wrong++;
            this.score = Math.max(0, this.score - 1);
            this.v.hit?.();
            this.fx.text(bx, by - R, 'Hop! -1', '#EF476F', u * 5);
            sfx.bad();
          }
        }
      } else if (!over) b.dwell = 0;
    }
    for (const f of this.flying) f.t += dt * 2.2;
    this.flying = this.flying.filter((f) => f.t < 1);
    this.fx.update(dt);
  }

  draw(g) {
    const { w, h } = this.v;
    // lokanta duvarı: çini desenli
    g.fillStyle = '#FFF4E0';
    g.fillRect(0, 0, w, h);
    const tile = Math.max(30, Math.min(w, h) * 0.09);
    for (let y = 0; y < h * 0.8; y += tile) for (let x = 0; x < w; x += tile) {
      g.fillStyle = ((x / tile + y / tile) | 0) % 2 ? '#E9F3FB' : '#FFF8EA';
      g.fillRect(x, y, tile, tile);
      g.strokeStyle = '#3A86C8'; g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x + tile / 2, y + tile * 0.15); g.quadraticCurveTo(x + tile * 0.85, y + tile / 2, x + tile / 2, y + tile * 0.85);
      g.quadraticCurveTo(x + tile * 0.15, y + tile / 2, x + tile / 2, y + tile * 0.15);
      g.stroke();
    }
    // kırmızı-beyaz tente
    const aw = h * 0.07, sw = Math.max(40, w / 10);
    for (let x = 0, i = 0; x < w; x += sw, i++) {
      g.fillStyle = i % 2 ? '#fff' : '#E63946';
      g.fillRect(x, 0, sw, aw);
      g.beginPath(); g.arc(x + sw / 2, aw, sw / 2, 0, Math.PI); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, aw + sw / 2, w, 6);
    // raf: çay demliği, simit, turşu kavanozu
    const sy = h * 0.62, sx = w * 0.04, sl = Math.min(w * 0.2, h * 0.3);
    g.fillStyle = '#8B5A2B'; g.fillRect(sx, sy, sl, h * 0.015);
    emoji(g, '🫖', sx + sl * 0.18, sy - h * 0.03, h * 0.05);
    emoji(g, '🥯', sx + sl * 0.5, sy - h * 0.025, h * 0.045);
    emoji(g, '🫙', sx + sl * 0.82, sy - h * 0.03, h * 0.05);
    // tezgâh
    g.fillStyle = '#B5651D';
    g.fillRect(0, h * 0.8, w, h * 0.2);
    g.fillStyle = '#8B4513';
    g.fillRect(0, h * 0.8, w, h * 0.025);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    for (let x = 0; x < w; x += 60) g.fillRect(x, h * 0.83, 30, h * 0.17);
  }

  stats() {
    return [
      { icon: '🍽️', label: 'Servis', value: this.served },
      { icon: '💰', label: 'Bahşiş', value: this.tips },
      { icon: '❌', label: 'Yanlış', value: this.wrong },
      { icon: '😢', label: 'Kaçan', value: this.lost },
    ];
  }

  drawOver(g) {
    const { w, h, u } = this.v;
    const m = Math.min(w, h);
    const R = m * 0.085;
    // müşteri
    const slide = easeOut(clamp(this.enterT * 2, 0, 1));
    const cx = w / 2 + (1 - slide) * w * 0.6 + (this.state !== 'order' && this.stateT > 1 ? (this.stateT - 1) * w * 1.5 : 0);
    const mood = this.state === 'happy' ? 'happy' : this.state === 'sad' || this.patience < this.patienceMax * 0.3 ? 'sad' : 'neutral';
    g.fillStyle = ['#FFC93C', '#38B6FF', '#FF8FA3', '#8BE3B9'][this.served % 4];
    rr(g, cx - m * 0.09, h * 0.87 + m * 0.04, m * 0.18, m * 0.2, m * 0.06); g.fill();
    g.fillStyle = '#E63946';
    g.beginPath(); g.moveTo(cx, h * 0.87 + m * 0.07); g.lineTo(cx - m * 0.03, h * 0.87 + m * 0.05); g.lineTo(cx - m * 0.03, h * 0.87 + m * 0.09); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx, h * 0.87 + m * 0.07); g.lineTo(cx + m * 0.03, h * 0.87 + m * 0.05); g.lineTo(cx + m * 0.03, h * 0.87 + m * 0.09); g.closePath(); g.fill();
    animalFace(g, this.animal, cx, h * 0.87, m * 0.075, mood);
    text(g, NAMES[this.animal], cx, h * 0.97, m * 0.035, '#fff');
    // tabak
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(cx + m * 0.17, h * 0.9, m * 0.08, m * 0.025, 0, 0, TAU); g.fill();
    for (let i = 0; i < this.step; i++) emoji(g, ING[this.dish.steps[i]][0], cx + m * 0.17 + (i - (this.step - 1) / 2) * m * 0.025, h * 0.88 - i * m * 0.01, m * 0.05);
    if (this.state === 'sad') text(g, 'Çok bekledim… 😢', w / 2, h * 0.7, m * 0.05, '#fff');
    if (this.state === 'happy') text(g, 'Afiyet olsun! 😋', w / 2, h * 0.7, m * 0.055, '#FFD23F');

    // sipariş balonu
    const steps = this.dish.steps;
    const iw = Math.min(m * 0.1, (w * 0.9) / (steps.length + 0.5));
    const bw = iw * steps.length + iw * 0.6, bh = iw * 1.7;
    const bx = w / 2 - bw / 2, by = h * 0.1;
    g.fillStyle = 'rgba(255,255,255,0.96)';
    rr(g, bx, by, bw, bh, iw * 0.3); g.fill();
    g.strokeStyle = '#0F172A'; g.lineWidth = 3; g.stroke();
    text(g, this.dish.name, w / 2, by + iw * 0.38, iw * 0.38, '#0F172A', { stroke: null, weight: 800 });
    steps.forEach((k, i) => {
      const x = bx + iw * 0.3 + iw * (i + 0.5), y = by + iw * 1.1;
      g.globalAlpha = i < this.step ? 0.35 : 1;
      if (i === this.step && this.state === 'order') {
        g.fillStyle = '#FFE066';
        g.beginPath(); g.arc(x, y, iw * 0.46, 0, TAU); g.fill();
      }
      emoji(g, ING[k][0], x, y, iw * 0.62);
      g.globalAlpha = 1;
      if (i < steps.length - 1) text(g, '›', x + iw * 0.5, y, iw * 0.4, '#94A3B8', { stroke: null });
      g.fillStyle = '#12213B'; g.beginPath(); g.arc(x - iw * 0.32, y - iw * 0.32, iw * 0.15, 0, TAU); g.fill();
      text(g, String(i + 1), x - iw * 0.32, y - iw * 0.31, iw * 0.2, '#fff', { stroke: null });
      if (i < this.step) text(g, '✔', x + iw * 0.25, y - iw * 0.2, iw * 0.4, '#06D6A0');
    });
    // sabır çubuğu
    const pk = clamp(this.patience / this.patienceMax, 0, 1);
    g.fillStyle = '#E2E8F0'; rr(g, bx, by + bh + 4, bw, 8, 4); g.fill();
    g.fillStyle = pk > 0.5 ? '#06D6A0' : pk > 0.25 ? '#FFC300' : '#EF476F';
    rr(g, bx, by + bh + 4, bw * pk, 8, 4); g.fill();

    // malzeme kutuları
    const next = this.dish.steps[this.step];
    for (const b of this.bins) {
      const x = b.x * w + (b.shake > 0 ? Math.sin(b.shake * 60) * 6 : 0), y = b.y * h;
      g.fillStyle = b.k === next && this.state === 'order' ? '#FFF3B0' : '#FFFFFF';
      g.strokeStyle = '#E07A2E'; g.lineWidth = 4;
      g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); g.stroke();
      if (b.dwell > 0) {
        g.strokeStyle = '#06D6A0'; g.lineWidth = 6;
        g.beginPath(); g.arc(x, y, R + 4, -Math.PI / 2, -Math.PI / 2 + (b.dwell / 0.18) * TAU); g.stroke();
      }
      emoji(g, ING[b.k][0], x, y - R * 0.08, R * 1.05);
      text(g, ING[b.k][1], x, y + R * 0.78, Math.max(11, R * 0.32), '#fff', { sw: 4 });
    }
    // uçan malzemeler
    for (const f of this.flying) {
      const t = easeOut(f.t);
      const x = f.x0 + (cx + m * 0.17 - f.x0) * t;
      const y = f.y0 + (h * 0.88 - f.y0) * t - Math.sin(t * Math.PI) * h * 0.15;
      emoji(g, ING[f.k][0], x, y, R * (1 - t * 0.5));
    }
    this.fx.draw(g);
    vignette(g, w, h, 0.15, '120,60,20');
  }
}

export default {
  id: 'lokanta',
  title: 'Minik Lokanta',
  tagline: 'Acıktık! Çabuk pişir!',
  description: 'Sevimli hayvan müşteriler lokantana geliyor ve lahmacun, menemen, dürüm, pide ya da Maraş dondurması istiyor. Siparişteki malzemelere ellerinle doğru sırayla dokun, müşteri sabırsızlanmadan servis et!',
  howto: ['Siparişe bak', 'Malzemeye elinle dokun', 'Sırayı karıştırma: yanlış -1', 'Çabuk ol, bahşiş kazan!'],
  color: '#E07A2E',
  emoji: '🥙',
  duration: 90,
  camAlpha: 0.28,
  stars: [40, 90, 150],
  hint: 'Sarı yanan malzemeye dokun!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    g.fillStyle = '#FFF4E0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#B5651D'; g.fillRect(0, h * 0.72, w, h * 0.28);
    animalFace(g, 'kangal', w * 0.3, h * 0.6, h * 0.17, Math.sin(t * 2) > 0 ? 'happy' : 'neutral');
    ['🫓', '🍅', '🥩', '🍋'].forEach((e, i) => {
      g.fillStyle = '#fff'; g.beginPath(); g.arc(w * (0.58 + (i % 2) * 0.2), h * (0.25 + Math.floor(i / 2) * 0.32), h * 0.12, 0, TAU); g.fill();
      emoji(g, e, w * (0.58 + (i % 2) * 0.2), h * (0.25 + Math.floor(i / 2) * 0.32), h * 0.15);
    });
  },
};
