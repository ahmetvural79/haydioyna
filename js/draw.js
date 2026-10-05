// Ortak çizim ve matematik yardımcıları (HaydiOyna için özgün)

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function starPath(ctx, x, y, r, points = 5, inner = 0.45, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function star(ctx, x, y, r, fill = '#FFD23F', stroke = '#E09F00') {
  starPath(ctx, x, y, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.lineWidth = Math.max(1, r * 0.12); ctx.strokeStyle = stroke; ctx.stroke(); }
}

export function cloud(ctx, x, y, s, color = 'rgba(255,255,255,0.95)') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, TAU);
  ctx.arc(x + s * 0.45, y - s * 0.2, s * 0.55, 0, TAU);
  ctx.arc(x + s * 0.95, y, s * 0.45, 0, TAU);
  ctx.arc(x + s * 0.45, y + s * 0.15, s * 0.45, 0, TAU);
  ctx.fill();
}

export function text(ctx, str, x, y, size, color = '#fff', opts = {}) {
  const { align = 'center', base = 'middle', stroke = 'rgba(15,23,42,0.85)', weight = 700, sw } = opts;
  ctx.font = `${weight} ${size}px "Baloo 2", "Nunito", system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (stroke) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = sw ?? Math.max(2, size * 0.18);
    ctx.strokeStyle = stroke;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function emoji(ctx, ch, x, y, size) {
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, x, y);
}

export function skyGradient(ctx, w, h, top, bottom, y0 = 0, y1 = h) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Ay-yıldız (bayrak motifi)
export function crescentStar(ctx, x, y, r, color = '#fff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y, r * 0.8, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = color;
  starPath(ctx, x + r * 0.85, y, r * 0.42, 5, 0.42, Math.PI);
  ctx.fill();
  ctx.restore();
}

export function flag(ctx, x, y, w) {
  const h = w * 0.66;
  ctx.fillStyle = '#E30A17';
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  crescentStar(ctx, x + w * 0.4, y + h / 2, h * 0.27, '#fff');
  ctx.restore();
}

export function nazar(ctx, x, y, r) {
  const rings = [['#0B3C8C', 1], ['#fff', 0.72], ['#4FB3FF', 0.5], ['#111', 0.25]];
  for (const [c, k] of rings) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r * k, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.15, 0, TAU);
  ctx.fill();
}

export function tulip(ctx, x, y, s, color = '#E63946') {
  ctx.strokeStyle = '#2D8F3C';
  ctx.lineWidth = s * 0.08;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.5, x, y - s);
  ctx.stroke();
  ctx.fillStyle = '#3BAA4A';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.18, y - s * 0.35, s * 0.08, s * 0.3, -0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.25, y - s * 1.35);
  ctx.quadraticCurveTo(x - s * 0.32, y - s * 0.85, x, y - s * 0.9);
  ctx.quadraticCurveTo(x + s * 0.32, y - s * 0.85, x + s * 0.25, y - s * 1.35);
  ctx.lineTo(x + s * 0.12, y - s * 1.15);
  ctx.lineTo(x, y - s * 1.45);
  ctx.lineTo(x - s * 0.12, y - s * 1.15);
  ctx.closePath();
  ctx.fill();
}

// Van kedisi maskotu "Pamuk": beyaz, bir gözü mavi bir gözü kehribar
export function vanCat(ctx, x, y, r, mood = 'happy') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = r * 0.06;
  // kulaklar
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.85, -r * 0.3);
    ctx.lineTo(s * r * 0.7, -r * 1.15);
    ctx.lineTo(s * r * 0.2, -r * 0.8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFB4C2';
    ctx.beginPath();
    ctx.moveTo(s * r * 0.7, -r * 0.45);
    ctx.lineTo(s * r * 0.66, -r * 0.95);
    ctx.lineTo(s * r * 0.35, -r * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.88, 0, 0, TAU);
  ctx.fill(); ctx.stroke();
  // kehribar lekesi
  ctx.fillStyle = '#F4A259';
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, -r * 0.55, r * 0.3, r * 0.2, -0.4, 0, TAU);
  ctx.fill();
  // gözler
  const eyes = [[-0.38, '#3BA3FF'], [0.38, '#F2B705']];
  for (const [ex, c] of eyes) {
    if (mood === 'happy') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      ctx.arc(ex * r, -r * 0.05, r * 0.15, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(ex * r, -r * 0.12, r * 0.06, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(ex * r, -r * 0.08, r * 0.15, r * 0.19, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(ex * r, -r * 0.08, r * 0.06, r * 0.14, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex * r + r * 0.05, -r * 0.15, r * 0.04, 0, TAU);
      ctx.fill();
    }
  }
  // burun ve ağız
  ctx.fillStyle = '#FF8FA3';
  ctx.beginPath();
  ctx.moveTo(-r * 0.08, r * 0.15);
  ctx.lineTo(r * 0.08, r * 0.15);
  ctx.lineTo(0, r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(-r * 0.1, r * 0.27, r * 0.1, 0, Math.PI * 0.9);
  ctx.arc(r * 0.1, r * 0.27, r * 0.1, Math.PI * 0.1, Math.PI);
  ctx.stroke();
  // bıyıklar
  ctx.lineWidth = r * 0.03;
  for (const s of [-1, 1]) for (const k of [-1, 0, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.3, r * 0.22 + k * r * 0.06);
    ctx.lineTo(s * r * 0.95, r * 0.15 + k * r * 0.14);
    ctx.stroke();
  }
  // yanak
  ctx.fillStyle = 'rgba(255,120,150,0.35)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * r * 0.55, r * 0.25, r * 0.13, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// Basit hayvan yüzleri (müşteriler, hocalar)
export function animalFace(ctx, type, x, y, r, mood = 'neutral') {
  ctx.save();
  ctx.translate(x, y);
  const outline = '#1e293b';
  ctx.lineWidth = r * 0.06;
  ctx.strokeStyle = outline;
  const P = {
    kedi: { c: '#F6A04D', ear: 'tri', inner: '#FFD1A6' },
    kangal: { c: '#E8D3A8', ear: 'flop', inner: '#3a2e25', mask: '#3a2e25' },
    tavsan: { c: '#F3F4F6', ear: 'long', inner: '#FFB4C2' },
    ayi: { c: '#8B5A3C', ear: 'round', inner: '#C99572' },
    kuzu: { c: '#FFFFFF', ear: 'side', inner: '#F8C8D0', wool: true },
    tilki: { c: '#F97316', ear: 'tri', inner: '#fff' },
    pars: { c: '#F2C14E', ear: 'round', inner: '#fff', spots: true },
    kaplumbaga: { c: '#7BC67B', ear: 'none', inner: '#7BC67B' },
    leylek: { c: '#FFFFFF', ear: 'none', inner: '#fff', beak: true },
  }[type] || { c: '#ccc', ear: 'round', inner: '#eee' };

  // kulaklar
  ctx.fillStyle = P.c;
  if (P.ear === 'tri') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.9, -r * 0.2); ctx.lineTo(s * r * 0.75, -r * 1.15); ctx.lineTo(s * r * 0.15, -r * 0.8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  } else if (P.ear === 'round') {
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.arc(s * r * 0.7, -r * 0.72, r * 0.3, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.inner; ctx.beginPath(); ctx.arc(s * r * 0.7, -r * 0.72, r * 0.15, 0, TAU); ctx.fill(); ctx.fillStyle = P.c;
    }
  } else if (P.ear === 'long') {
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(s * r * 0.38, -r * 1.2, r * 0.2, r * 0.6, s * 0.15, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.inner; ctx.beginPath(); ctx.ellipse(s * r * 0.38, -r * 1.2, r * 0.09, r * 0.45, s * 0.15, 0, TAU); ctx.fill(); ctx.fillStyle = P.c;
    }
  } else if (P.ear === 'flop') {
    ctx.fillStyle = P.mask;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(s * r * 0.9, -r * 0.1, r * 0.25, r * 0.5, s * -0.3, 0, TAU); ctx.fill(); ctx.stroke();
    }
  } else if (P.ear === 'side') {
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(s * r * 1.0, -r * 0.15, r * 0.35, r * 0.15, s * 0.3, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
  // kafa
  ctx.fillStyle = P.c;
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.92, 0, 0, TAU); ctx.fill(); ctx.stroke();
  if (P.wool) {
    ctx.fillStyle = '#F1F5F9';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * r * 0.28, -r * 0.8, r * 0.22, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  if (P.mask) {
    ctx.fillStyle = P.mask;
    ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.45, r * 0.38, 0, 0, TAU); ctx.fill();
  }
  if (P.spots) {
    ctx.fillStyle = '#7A4E1D';
    for (const [sx, sy] of [[-0.5, -0.5], [0.45, -0.55], [-0.7, 0.1], [0.72, 0.05], [0, -0.75], [-0.25, -0.35], [0.25, -0.3]]) {
      ctx.beginPath(); ctx.arc(sx * r, sy * r, r * 0.08, 0, TAU); ctx.fill();
    }
  }
  if (type === 'tilki') {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.1); ctx.quadraticCurveTo(0, r * 1.1, r * 0.8, r * 0.1); ctx.quadraticCurveTo(0, r * 0.4, -r * 0.8, r * 0.1); ctx.fill();
  }
  if (type === 'kaplumbaga') {
    ctx.fillStyle = '#4C9A4C';
    ctx.beginPath(); ctx.arc(0, -r * 0.95, r * 0.6, Math.PI, TAU); ctx.fill(); ctx.stroke();
  }
  // gözler
  for (const s of [-1, 1]) {
    if (mood === 'happy') {
      ctx.lineWidth = r * 0.08;
      ctx.beginPath(); ctx.arc(s * r * 0.35, -r * 0.05, r * 0.13, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (mood === 'sad') {
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(s * r * 0.35, -r * 0.05, r * 0.09, 0, TAU); ctx.fill();
      ctx.lineWidth = r * 0.05;
      ctx.beginPath(); ctx.moveTo(s * r * 0.5, -r * 0.3); ctx.lineTo(s * r * 0.2, -r * 0.22); ctx.stroke();
    } else {
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(s * r * 0.35, -r * 0.05, r * 0.11, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * r * 0.35 + r * 0.04, -r * 0.1, r * 0.04, 0, TAU); ctx.fill();
    }
  }
  // burun / gaga
  if (P.beak) {
    ctx.fillStyle = '#F97316';
    ctx.beginPath(); ctx.moveTo(-r * 0.15, r * 0.15); ctx.lineTo(r * 0.15, r * 0.15); ctx.lineTo(0, r * 0.75); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillStyle = type === 'kangal' ? '#111' : '#3b2a20';
    ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 0.12, r * 0.08, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = type === 'kangal' ? '#E8D3A8' : outline;
    ctx.beginPath();
    if (mood === 'sad') ctx.arc(0, r * 0.5, r * 0.15, Math.PI * 1.15, Math.PI * 1.85);
    else ctx.arc(0, r * 0.3, r * 0.17, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,110,140,0.35)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * 0.6, r * 0.25, r * 0.12, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// Basit parçacık sistemi
export class Particles {
  constructor() { this.list = []; }
  burst(x, y, color, n = 14, speed = 260, size = 6, shape = 'circle') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = speed * (0.4 + Math.random() * 0.8);
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.2, life: 0.7 + Math.random() * 0.5, age: 0,
        color: Array.isArray(color) ? pick(color) : color, size: size * (0.6 + Math.random() * 0.8), shape, rot: Math.random() * TAU });
    }
  }
  text(x, y, str, color = '#FFD23F', size = 34) {
    this.list.push({ x, y, vx: 0, vy: -90, life: 1.0, age: 0, color, size, shape: 'text', str });
  }
  update(dt) {
    for (const p of this.list) {
      p.age += dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.shape !== 'text') { p.vy += 500 * dt; p.vx *= 0.98; p.rot += dt * 6; }
    }
    this.list = this.list.filter((p) => p.age < p.life);
  }
  draw(ctx) {
    for (const p of this.list) {
      const a = 1 - p.age / p.life;
      ctx.globalAlpha = Math.max(0, a);
      if (p.shape === 'text') text(ctx, p.str, p.x, p.y, p.size * (1 + (1 - a) * 0.3), p.color);
      else if (p.shape === 'star') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); star(ctx, 0, 0, p.size, p.color, null); ctx.restore(); }
      else if (p.shape === 'rect') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); }
      else { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
}

export const RAINBOW = ['#EF476F', '#FF8C42', '#FFD23F', '#06D6A0', '#38B6FF', '#8338EC', '#FF5DA2'];

// Basit 3B izdüşüm (sahte 3B oyunlar için)
export function project(x, y, z, w, h, horizonY, f = 1) {
  const s = (f * h) / Math.max(0.05, z);
  return { x: w / 2 + x * s, y: horizonY + y * s, s };
}

// ---------- Cila yardımcıları ----------

// Çizgi film el imleci (avuç içi). progress 0..1 bekleme halkası.
export function handIcon(ctx, x, y, s, color = '#06D6A0', progress = 0, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  // dış halka
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
  ctx.lineWidth = s * 0.14;
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.stroke();
  if (progress > 0) {
    ctx.strokeStyle = '#FFD23F';
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, s, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, progress)); ctx.stroke();
  }
  if (flip) ctx.scale(-1, 1);
  const skin = '#FFDDB8', line = '#B9784A';
  ctx.fillStyle = skin; ctx.strokeStyle = line; ctx.lineWidth = s * 0.07; ctx.lineJoin = 'round';
  // parmaklar
  const fw = s * 0.2;
  [[-0.36, -0.2, 0.42], [-0.12, -0.32, 0.5], [0.12, -0.3, 0.48], [0.34, -0.18, 0.4]].forEach(([fx, fy, fl]) => {
    ctx.beginPath();
    rr(ctx, fx * s - fw / 2, fy * s - fl * s, fw, fl * s + s * 0.3, fw / 2);
    ctx.fill(); ctx.stroke();
  });
  // başparmak
  ctx.save(); ctx.rotate(-0.7);
  rr(ctx, -s * 0.62, s * 0.05, fw, s * 0.42, fw / 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  // avuç
  rr(ctx, -s * 0.47, -s * 0.18, s * 0.94, s * 0.72, s * 0.3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,140,120,0.35)';
  ctx.beginPath(); ctx.arc(0, s * 0.2, s * 0.18, 0, TAU); ctx.fill();
  ctx.restore();
}

export function vignette(ctx, w, h, strength = 0.35, color = '0,0,0') {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.6);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// yatay sis bandı (ufuk çizgisinde atmosfer)
export function fogBand(ctx, w, y, height, rgb = '255,255,255', alpha = 0.7) {
  const g = ctx.createLinearGradient(0, y - height, 0, y + height);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(0.5, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y - height, w, height * 2);
}

// güneş parıltısı ve ışık hüzmeleri
export function sunGlow(ctx, x, y, r, t = 0, rays = true) {
  if (rays) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.05);
    ctx.fillStyle = 'rgba(255,250,220,0.12)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate(TAU / 12);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.5, -r * 6); ctx.lineTo(r * 0.5, -r * 6); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, 'rgba(255,255,240,1)');
  g.addColorStop(0.3, 'rgba(255,245,200,0.8)');
  g.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill();
}

// renk karıştırma: hex + hex -> rgb()
export function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// küçük kuş (V şeklinde kanat çırpan)
export function bird(ctx, x, y, s, t, color = '#334155') {
  const f = Math.sin(t * 12) * 0.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.35, s * 0.2, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s, -s * f); ctx.quadraticCurveTo(-s * 0.5, -s * 0.6 - s * f, 0, -s * 0.05);
  ctx.quadraticCurveTo(s * 0.5, -s * 0.6 - s * f, s, -s * f);
  ctx.stroke();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath(); ctx.moveTo(s * 0.32, -s * 0.05); ctx.lineTo(s * 0.55, s * 0.02); ctx.lineTo(s * 0.32, s * 0.1); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.05, s * 0.05, 0, TAU); ctx.fill();
  ctx.restore();
}

// eşek arısı / arı
export function bee(ctx, x, y, r, t) {
  ctx.save();
  ctx.translate(x, y);
  const f = Math.sin(t * 40) * 0.4;
  ctx.fillStyle = 'rgba(220,240,255,0.85)';
  ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.7, r * 0.45, r * 0.3 + f * r * 0.2, -0.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r * 0.3, -r * 0.7, r * 0.45, r * 0.3 - f * r * 0.2, 0.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFC300'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = r * 0.08;
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.7, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1e293b';
  for (const k of [-0.3, 0.2]) ctx.fillRect(k * r, -r * 0.65, r * 0.2, r * 1.3);
  ctx.beginPath(); ctx.moveTo(r * 0.95, 0); ctx.lineTo(r * 1.35, 0); ctx.lineTo(r * 0.95, r * 0.15); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * 0.65, -r * 0.15, r * 0.18, 0, TAU); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-r * 0.68, -r * 0.15, r * 0.09, 0, TAU); ctx.fill();
  ctx.restore();
}

// Avatarlar: 0 = Pamuk (Van kedisi), 1 = Tarçın (tekir kedi)
export const AVATARS = [
  { name: 'Pamuk', draw: (g, x, y, r) => vanCat(g, x, y, r, 'happy') },
  { name: 'Tarçın', draw: (g, x, y, r) => animalFace(g, 'kedi', x, y, r, 'happy') },
];
const _avatarCache = {};
export function avatarURL(i, size = 96) {
  const key = i + ':' + size;
  if (_avatarCache[key]) return _avatarCache[key];
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  AVATARS[i].draw(g, size / 2, size * 0.56, size * 0.36);
  return (_avatarCache[key] = c.toDataURL());
}
