// Pars Hoca'nın Salonu: hocanın gösterdiği taekwondo pozlarını taklit et, kuşak kazan!
import { TAU, clamp, rr, text, animalFace, Particles, flag, shuffle, vignette } from '../draw.js';
import { sfx, say } from '../audio.js';

// Açılar ekran koordinatında (derece): 0 sağ, 90 aşağı, -90 yukarı, 180 sol.
// [ekranda soldaki kol: üst, ön] [ekranda sağdaki kol: üst, ön]
const POSES = [
  { name: 'Kartal Kanatları', a: [180, 180, 0, 0] },
  { name: 'Zafer!', a: [-135, -135, -45, -45] },
  { name: 'Zeybek Kolları', a: [180, -90, 0, -90] },
  { name: 'Kılıç Yukarı', a: [-90, -90, 0, 0] },
  { name: 'Ters Kılıç', a: [180, 180, -90, -90] },
  { name: 'Roket', a: [-90, -90, 90, 90] },
  { name: 'Çatı', a: [-125, -40, -55, -140] },
  { name: 'Eller Belde', a: [125, 45, 55, 135] },
  { name: 'Kalkan', a: [180, -90, 90, 90] },
  { name: 'Ters Kalkan', a: [90, 90, 0, -90] },
  { name: 'Yıldız', a: [-160, -160, -20, -20] },
  { name: 'Aşağı Blok', a: [135, 135, 45, 45] },
];

const BELTS = [
  ['Beyaz', '#F8FAFC'], ['Sarı', '#FFD23F'], ['Yeşil', '#3BAA4A'], ['Mavi', '#2E86DE'], ['Kırmızı', '#E63946'], ['Siyah', '#111827'],
];

const angDiff = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const deg = (p, q) => (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;

function armChains(pts) {
  const leftFirst = pts[11].x < pts[12].x;
  const L = leftFirst ? [11, 13, 15] : [12, 14, 16];
  const R = leftFirst ? [12, 14, 16] : [11, 13, 15];
  return [L, R];
}

function drawCoach(g, type, x, y, r, beltColor, t, pose) {
  // gövde (dobok) + kollar hedef pozda
  g.save();
  const sh = { l: { x: x - r * 0.75, y: y + r * 1.4 }, r: { x: x + r * 0.75, y: y + r * 1.4 } };
  g.fillStyle = '#FFFFFF';
  g.strokeStyle = '#1e293b'; g.lineWidth = r * 0.08;
  rr(g, x - r * 0.85, y + r * 1.2, r * 1.7, r * 2.0, r * 0.3); g.fill(); g.stroke();
  g.fillStyle = beltColor;
  g.fillRect(x - r * 0.85, y + r * 2.4, r * 1.7, r * 0.25);
  g.strokeRect(x - r * 0.85, y + r * 2.4, r * 1.7, r * 0.25);
  const seg = r * 1.0;
  g.lineCap = 'round';
  [[sh.l, pose.a[0], pose.a[1]], [sh.r, pose.a[2], pose.a[3]]].forEach(([s, a1, a2]) => {
    const e = { x: s.x + Math.cos((a1 * Math.PI) / 180) * seg, y: s.y + Math.sin((a1 * Math.PI) / 180) * seg };
    const w = { x: e.x + Math.cos((a2 * Math.PI) / 180) * seg, y: e.y + Math.sin((a2 * Math.PI) / 180) * seg };
    g.strokeStyle = '#1e293b'; g.lineWidth = r * 0.5;
    g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(e.x, e.y); g.lineTo(w.x, w.y); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = r * 0.36;
    g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(e.x, e.y); g.lineTo(w.x, w.y); g.stroke();
    g.fillStyle = type === 'pars' ? '#F2C14E' : '#E8D3A8';
    g.beginPath(); g.arc(w.x, w.y, r * 0.22, 0, TAU); g.fill(); g.stroke();
  });
  animalFace(g, type, x, y + Math.sin(t * 3) * r * 0.05, r, 'happy');
  g.restore();
}

class Game {
  constructor(view) {
    this.v = view;
    this.score = 0;
    this.fx = new Particles();
    this.coach = view.player === 1 ? 'kangal' : 'pars';
    this.coachName = view.player === 1 ? 'Karabaş Hoca' : 'Pars Hoca';
    this.queue = shuffle(POSES);
    this.done = 0;
    this.missed = 0;
    this.fastest = 0;
    this.limbScore = [0, 0, 0, 0];
    this.next();
  }

  get belt() { return BELTS[Math.min(BELTS.length - 1, Math.floor(this.done / 3))]; }

  next() {
    if (!this.queue.length) this.queue = shuffle(POSES);
    this.pose = this.queue.pop();
    this.poseT = 0;
    this.hold = 0;
    this.passT = 0;
    if (this.v.players === 1) say(this.pose.name);
  }

  update(dt, inp) {
    const { w, h, u } = this.v;
    this.poseT += dt;
    if (this.passT > 0) {
      this.passT -= dt;
      if (this.passT <= 0) this.next();
      this.fx.update(dt);
      return;
    }
    let match = 0;
    if (inp.present && inp.pts) {
      const P = inp.pts;
      const [L, R] = armChains(P);
      const ok = [...L, ...R].every((i) => P[i].v > 0.3);
      if (ok) {
        const got = [deg(P[L[0]], P[L[1]]), deg(P[L[1]], P[L[2]]), deg(P[R[0]], P[R[1]]), deg(P[R[1]], P[R[2]])];
        this.limbScore = got.map((a, i) => clamp(1 - (angDiff(a, this.pose.a[i]) - 22 / this.v.diff) / 38, 0, 1));
        match = this.limbScore.reduce((s, x) => s + x, 0) / 4;
      } else this.limbScore = [0, 0, 0, 0];
    } else if (inp.fake && inp.mouseDown) { match = 1; this.limbScore = [1, 1, 1, 1]; }
    this.match = match;
    if (match > 0.72) this.hold += dt; else this.hold = Math.max(0, this.hold - dt * 0.6);
    if (this.hold >= 1.0) {
      const beltBefore = this.belt[0];
      this.done++;
      const pts = 10 + Math.max(0, Math.round(8 - this.poseT));
      if (!this.fastest || this.poseT < this.fastest) this.fastest = this.poseT;
      this.score += pts;
      sfx.good();
      this.fx.burst(w / 2, h * 0.4, ['#FFD23F', '#fff', this.belt[1]], 30, u * 60, u * 1.3, 'star');
      this.fx.text(w / 2, h * 0.35, `Hai! +${pts}`, '#FFD23F', u * 9);
      if (this.belt[0] !== beltBefore) {
        this.fx.text(w / 2, h * 0.5, `${this.belt[0]} kuşak!`, this.belt[1] === '#111827' ? '#fff' : this.belt[1], u * 8);
        if (this.v.players === 1) say(`Tebrikler, ${this.belt[0]} kuşak!`);
        sfx.win();
      }
      this.passT = 1.2;
    } else if (this.poseT > 10) {
      this.fx.text(w / 2, h * 0.35, 'Sıradaki!', '#fff', u * 6);
      this.missed++;
      this.passT = 0.6;
    }
    this.fx.update(dt);
  }

  draw(g) {
    const { w, h } = this.v;
    // salon: ahşap duvar + minder
    g.fillStyle = '#F3E3C3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#E6CFA2';
    for (let x = 0; x < w; x += Math.max(40, w / 12)) g.fillRect(x, 0, 3, h * 0.72);
    g.fillStyle = '#2E86DE'; g.fillRect(0, h * 0.72, w, h * 0.28);
    g.fillStyle = '#E63946';
    for (let x = 0; x < w; x += w / 4) g.fillRect(x, h * 0.72, w / 8, h * 0.28);
    flag(g, w * 0.04, h * 0.05, Math.min(w, h) * 0.13);
    // tavandan yumuşak ışık
    const lg = g.createRadialGradient(w / 2, -h * 0.1, 0, w / 2, -h * 0.1, h * 0.9);
    lg.addColorStop(0, 'rgba(255,250,230,0.55)'); lg.addColorStop(1, 'rgba(255,250,230,0)');
    g.fillStyle = lg; g.fillRect(0, 0, w, h);
  }

  stats() {
    return [
      { icon: '🥋', label: 'Poz', value: this.done },
      { icon: '🎗️', label: 'Kuşak', value: this.belt[0] },
      { icon: '⚡', label: 'En hızlı', value: this.fastest ? this.fastest.toFixed(1) + 's' : '-' },
      { icon: '⏭️', label: 'Kaçan', value: this.missed },
    ];
  }

  drawOver(g, inp, t) {
    const { w, h, u } = this.v;
    const m = Math.min(w, h);
    // oyuncunun omuzlarına hedef pozun hayaleti
    if (inp.present && inp.pts && this.passT <= 0) {
      const P = inp.pts;
      const [L, R] = armChains(P);
      const segL = (i) => Math.hypot(P[i[0]].x - P[i[1]].x, P[i[0]].y - P[i[1]].y);
      const len = Math.max(inp.shW * 0.9, (segL(L) + segL(R)) / 2);
      g.lineCap = 'round';
      [[L, 0], [R, 2]].forEach(([chain, k]) => {
        const s = P[chain[0]];
        const a1 = (this.pose.a[k] * Math.PI) / 180, a2 = (this.pose.a[k + 1] * Math.PI) / 180;
        const e = { x: s.x + Math.cos(a1) * len, y: s.y + Math.sin(a1) * len };
        const wr = { x: e.x + Math.cos(a2) * len, y: e.y + Math.sin(a2) * len };
        g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = inp.shW * 0.28;
        g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(e.x, e.y); g.lineTo(wr.x, wr.y); g.stroke();
        // oyuncunun kendi kolları (yeşil = doğru)
        for (let j = 0; j < 2; j++) {
          const sc = this.limbScore[k + j];
          g.strokeStyle = sc > 0.7 ? '#06D6A0' : sc > 0.35 ? '#FFC300' : '#EF476F';
          g.lineWidth = inp.shW * 0.12;
          g.beginPath(); g.moveTo(P[chain[j]].x, P[chain[j]].y); g.lineTo(P[chain[j + 1]].x, P[chain[j + 1]].y); g.stroke();
        }
      });
    }
    // hoca kartı
    const cw = m * 0.42, chh = m * 0.5;
    const cx = w - cw - u * 3, cy = h * 0.2;
    g.fillStyle = 'rgba(255,255,255,0.9)';
    rr(g, cx, cy, cw, chh, u * 3); g.fill();
    g.strokeStyle = this.belt[1] === '#F8FAFC' ? '#CBD5E1' : this.belt[1]; g.lineWidth = 5; g.stroke();
    drawCoach(g, this.coach, cx + cw / 2, cy + chh * 0.22, cw * 0.14, this.belt[1], t, this.pose);
    text(g, this.coachName, cx + cw / 2, cy + chh * 0.06, cw * 0.08, '#0F172A', { stroke: null });
    // poz adı
    text(g, this.pose.name, w / 2, h * 0.88, m * 0.07, '#fff');
    // tutma çubuğu
    const bw = Math.min(w * 0.6, m * 0.7);
    g.fillStyle = 'rgba(15,23,42,0.6)'; rr(g, w / 2 - bw / 2, h * 0.93, bw, m * 0.035, 8); g.fill();
    g.fillStyle = '#06D6A0'; rr(g, w / 2 - bw / 2, h * 0.93, bw * clamp(this.hold, 0, 1), m * 0.035, 8); g.fill();
    // kuşak
    text(g, `${this.belt[0]} kuşak`, u * 4, h * 0.2 + u * 12, m * 0.045, this.belt[1] === '#111827' ? '#fff' : this.belt[1], { align: 'left' });
    if (inp.fake) text(g, 'Fare ile: basılı tut = poz', w / 2, h * 0.8, m * 0.035, '#fff');
    this.fx.draw(g);
    vignette(g, w, h, 0.2, '60,30,10');
  }
}

export default {
  id: 'taekwondo',
  title: "Pars Hoca'nın Salonu",
  tagline: 'Hai! Kuşak kazan!',
  description: 'Anadolu parsı Pars Hoca sana taekwondo ve halk oyunu pozları gösteriyor. Aynısını yap, bir saniye tut ve beyaz kuşaktan siyah kuşağa yüksel! İki kişi oynarken ikinci oyuncunun hocası Kangal köpeği Karabaş Hoca.',
  howto: ['Hocanın pozuna bak', 'Kollarını aynı şekilde aç', 'Yeşil olunca tut!'],
  color: '#E63946',
  emoji: '🥋',
  duration: 90,
  camAlpha: 0.6,
  skeleton: true,
  cursors: false,
  stars: [40, 100, 160],
  hint: 'Hocanın pozunu taklit et!',
  create: (v) => new Game(v),
  thumb(g, w, h, t) {
    g.fillStyle = '#F3E3C3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2E86DE'; g.fillRect(0, h * 0.75, w, h * 0.25);
    const p = POSES[Math.floor(t / 1.5) % POSES.length];
    drawCoach(g, 'pars', w * 0.5, h * 0.2, h * 0.12, '#111827', t, p);
  },
};
