(() => {
  // js/draw.js
  var TAU = Math.PI * 2;
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var lerp = (a, b, t) => a + (b - a) * t;
  var rand = (a, b) => a + Math.random() * (b - a);
  var pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  var dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function rr(ctx2, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.arcTo(x + w, y, x + w, y + h, r);
    ctx2.arcTo(x + w, y + h, x, y + h, r);
    ctx2.arcTo(x, y + h, x, y, r);
    ctx2.arcTo(x, y, x + w, y, r);
    ctx2.closePath();
  }
  function starPath(ctx2, x, y, r, points = 5, inner = 0.45, rot = -Math.PI / 2) {
    ctx2.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rad = i % 2 === 0 ? r : r * inner;
      const a = rot + i * Math.PI / points;
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      i === 0 ? ctx2.moveTo(px, py) : ctx2.lineTo(px, py);
    }
    ctx2.closePath();
  }
  function star(ctx2, x, y, r, fill = "#FFD23F", stroke = "#E09F00") {
    starPath(ctx2, x, y, r);
    ctx2.fillStyle = fill;
    ctx2.fill();
    if (stroke) {
      ctx2.lineWidth = Math.max(1, r * 0.12);
      ctx2.strokeStyle = stroke;
      ctx2.stroke();
    }
  }
  function cloud(ctx2, x, y, s, color = "rgba(255,255,255,0.95)") {
    ctx2.fillStyle = color;
    ctx2.beginPath();
    ctx2.arc(x, y, s * 0.5, 0, TAU);
    ctx2.arc(x + s * 0.45, y - s * 0.2, s * 0.55, 0, TAU);
    ctx2.arc(x + s * 0.95, y, s * 0.45, 0, TAU);
    ctx2.arc(x + s * 0.45, y + s * 0.15, s * 0.45, 0, TAU);
    ctx2.fill();
  }
  function text(ctx2, str, x, y, size, color = "#fff", opts = {}) {
    const { align = "center", base = "middle", stroke = "rgba(15,23,42,0.85)", weight = 700, sw } = opts;
    ctx2.font = `${weight} ${size}px "Baloo 2", "Nunito", system-ui, sans-serif`;
    ctx2.textAlign = align;
    ctx2.textBaseline = base;
    if (stroke) {
      ctx2.lineJoin = "round";
      ctx2.lineWidth = sw ?? Math.max(2, size * 0.18);
      ctx2.strokeStyle = stroke;
      ctx2.strokeText(str, x, y);
    }
    ctx2.fillStyle = color;
    ctx2.fillText(str, x, y);
  }
  function emoji(ctx2, ch, x, y, size) {
    ctx2.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    ctx2.fillText(ch, x, y);
  }
  function skyGradient(ctx2, w, h, top, bottom, y0 = 0, y1 = h) {
    const g = ctx2.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx2.fillStyle = g;
    ctx2.fillRect(0, 0, w, h);
  }
  function crescentStar(ctx2, x, y, r, color = "#fff") {
    ctx2.save();
    ctx2.fillStyle = color;
    ctx2.beginPath();
    ctx2.arc(x, y, r, 0, TAU);
    ctx2.fill();
    ctx2.globalCompositeOperation = "destination-out";
    ctx2.beginPath();
    ctx2.arc(x + r * 0.25, y, r * 0.8, 0, TAU);
    ctx2.fill();
    ctx2.restore();
    ctx2.save();
    ctx2.fillStyle = color;
    starPath(ctx2, x + r * 0.85, y, r * 0.42, 5, 0.42, Math.PI);
    ctx2.fill();
    ctx2.restore();
  }
  function flag(ctx2, x, y, w) {
    const h = w * 0.66;
    ctx2.fillStyle = "#E30A17";
    ctx2.fillRect(x, y, w, h);
    ctx2.save();
    ctx2.beginPath();
    ctx2.rect(x, y, w, h);
    ctx2.clip();
    crescentStar(ctx2, x + w * 0.4, y + h / 2, h * 0.27, "#fff");
    ctx2.restore();
  }
  function nazar(ctx2, x, y, r) {
    const rings = [["#0B3C8C", 1], ["#fff", 0.72], ["#4FB3FF", 0.5], ["#111", 0.25]];
    for (const [c, k] of rings) {
      ctx2.fillStyle = c;
      ctx2.beginPath();
      ctx2.arc(x, y, r * k, 0, TAU);
      ctx2.fill();
    }
    ctx2.fillStyle = "rgba(255,255,255,0.7)";
    ctx2.beginPath();
    ctx2.arc(x - r * 0.35, y - r * 0.35, r * 0.15, 0, TAU);
    ctx2.fill();
  }
  function tulip(ctx2, x, y, s, color = "#E63946") {
    ctx2.strokeStyle = "#2D8F3C";
    ctx2.lineWidth = s * 0.08;
    ctx2.beginPath();
    ctx2.moveTo(x, y);
    ctx2.quadraticCurveTo(x + s * 0.1, y - s * 0.5, x, y - s);
    ctx2.stroke();
    ctx2.fillStyle = "#3BAA4A";
    ctx2.beginPath();
    ctx2.ellipse(x - s * 0.18, y - s * 0.35, s * 0.08, s * 0.3, -0.5, 0, TAU);
    ctx2.fill();
    ctx2.fillStyle = color;
    ctx2.beginPath();
    ctx2.moveTo(x - s * 0.25, y - s * 1.35);
    ctx2.quadraticCurveTo(x - s * 0.32, y - s * 0.85, x, y - s * 0.9);
    ctx2.quadraticCurveTo(x + s * 0.32, y - s * 0.85, x + s * 0.25, y - s * 1.35);
    ctx2.lineTo(x + s * 0.12, y - s * 1.15);
    ctx2.lineTo(x, y - s * 1.45);
    ctx2.lineTo(x - s * 0.12, y - s * 1.15);
    ctx2.closePath();
    ctx2.fill();
  }
  function vanCat(ctx2, x, y, r, mood = "happy") {
    ctx2.save();
    ctx2.translate(x, y);
    ctx2.fillStyle = "#fff";
    ctx2.strokeStyle = "#1e293b";
    ctx2.lineWidth = r * 0.06;
    for (const s of [-1, 1]) {
      ctx2.beginPath();
      ctx2.moveTo(s * r * 0.85, -r * 0.3);
      ctx2.lineTo(s * r * 0.7, -r * 1.15);
      ctx2.lineTo(s * r * 0.2, -r * 0.8);
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
      ctx2.fillStyle = "#FFB4C2";
      ctx2.beginPath();
      ctx2.moveTo(s * r * 0.7, -r * 0.45);
      ctx2.lineTo(s * r * 0.66, -r * 0.95);
      ctx2.lineTo(s * r * 0.35, -r * 0.75);
      ctx2.closePath();
      ctx2.fill();
      ctx2.fillStyle = "#fff";
    }
    ctx2.beginPath();
    ctx2.ellipse(0, 0, r, r * 0.88, 0, 0, TAU);
    ctx2.fill();
    ctx2.stroke();
    ctx2.fillStyle = "#F4A259";
    ctx2.beginPath();
    ctx2.ellipse(-r * 0.45, -r * 0.55, r * 0.3, r * 0.2, -0.4, 0, TAU);
    ctx2.fill();
    const eyes = [[-0.38, "#3BA3FF"], [0.38, "#F2B705"]];
    for (const [ex, c] of eyes) {
      if (mood === "happy") {
        ctx2.strokeStyle = "#1e293b";
        ctx2.lineWidth = r * 0.08;
        ctx2.beginPath();
        ctx2.arc(ex * r, -r * 0.05, r * 0.15, Math.PI * 1.1, Math.PI * 1.9);
        ctx2.stroke();
        ctx2.fillStyle = c;
        ctx2.beginPath();
        ctx2.arc(ex * r, -r * 0.12, r * 0.06, 0, TAU);
        ctx2.fill();
      } else {
        ctx2.fillStyle = c;
        ctx2.beginPath();
        ctx2.ellipse(ex * r, -r * 0.08, r * 0.15, r * 0.19, 0, 0, TAU);
        ctx2.fill();
        ctx2.fillStyle = "#111";
        ctx2.beginPath();
        ctx2.ellipse(ex * r, -r * 0.08, r * 0.06, r * 0.14, 0, 0, TAU);
        ctx2.fill();
        ctx2.fillStyle = "#fff";
        ctx2.beginPath();
        ctx2.arc(ex * r + r * 0.05, -r * 0.15, r * 0.04, 0, TAU);
        ctx2.fill();
      }
    }
    ctx2.fillStyle = "#FF8FA3";
    ctx2.beginPath();
    ctx2.moveTo(-r * 0.08, r * 0.15);
    ctx2.lineTo(r * 0.08, r * 0.15);
    ctx2.lineTo(0, r * 0.25);
    ctx2.closePath();
    ctx2.fill();
    ctx2.strokeStyle = "#1e293b";
    ctx2.lineWidth = r * 0.05;
    ctx2.beginPath();
    ctx2.arc(-r * 0.1, r * 0.27, r * 0.1, 0, Math.PI * 0.9);
    ctx2.arc(r * 0.1, r * 0.27, r * 0.1, Math.PI * 0.1, Math.PI);
    ctx2.stroke();
    ctx2.lineWidth = r * 0.03;
    for (const s of [-1, 1]) for (const k of [-1, 0, 1]) {
      ctx2.beginPath();
      ctx2.moveTo(s * r * 0.3, r * 0.22 + k * r * 0.06);
      ctx2.lineTo(s * r * 0.95, r * 0.15 + k * r * 0.14);
      ctx2.stroke();
    }
    ctx2.fillStyle = "rgba(255,120,150,0.35)";
    for (const s of [-1, 1]) {
      ctx2.beginPath();
      ctx2.arc(s * r * 0.55, r * 0.25, r * 0.13, 0, TAU);
      ctx2.fill();
    }
    ctx2.restore();
  }
  function animalFace(ctx2, type, x, y, r, mood = "neutral") {
    ctx2.save();
    ctx2.translate(x, y);
    const outline = "#1e293b";
    ctx2.lineWidth = r * 0.06;
    ctx2.strokeStyle = outline;
    const P = {
      kedi: { c: "#F6A04D", ear: "tri", inner: "#FFD1A6" },
      kangal: { c: "#E8D3A8", ear: "flop", inner: "#3a2e25", mask: "#3a2e25" },
      tavsan: { c: "#F3F4F6", ear: "long", inner: "#FFB4C2" },
      ayi: { c: "#8B5A3C", ear: "round", inner: "#C99572" },
      kuzu: { c: "#FFFFFF", ear: "side", inner: "#F8C8D0", wool: true },
      tilki: { c: "#F97316", ear: "tri", inner: "#fff" },
      pars: { c: "#F2C14E", ear: "round", inner: "#fff", spots: true },
      kaplumbaga: { c: "#7BC67B", ear: "none", inner: "#7BC67B" },
      leylek: { c: "#FFFFFF", ear: "none", inner: "#fff", beak: true }
    }[type] || { c: "#ccc", ear: "round", inner: "#eee" };
    ctx2.fillStyle = P.c;
    if (P.ear === "tri") {
      for (const s of [-1, 1]) {
        ctx2.beginPath();
        ctx2.moveTo(s * r * 0.9, -r * 0.2);
        ctx2.lineTo(s * r * 0.75, -r * 1.15);
        ctx2.lineTo(s * r * 0.15, -r * 0.8);
        ctx2.closePath();
        ctx2.fill();
        ctx2.stroke();
      }
    } else if (P.ear === "round") {
      for (const s of [-1, 1]) {
        ctx2.beginPath();
        ctx2.arc(s * r * 0.7, -r * 0.72, r * 0.3, 0, TAU);
        ctx2.fill();
        ctx2.stroke();
        ctx2.fillStyle = P.inner;
        ctx2.beginPath();
        ctx2.arc(s * r * 0.7, -r * 0.72, r * 0.15, 0, TAU);
        ctx2.fill();
        ctx2.fillStyle = P.c;
      }
    } else if (P.ear === "long") {
      for (const s of [-1, 1]) {
        ctx2.beginPath();
        ctx2.ellipse(s * r * 0.38, -r * 1.2, r * 0.2, r * 0.6, s * 0.15, 0, TAU);
        ctx2.fill();
        ctx2.stroke();
        ctx2.fillStyle = P.inner;
        ctx2.beginPath();
        ctx2.ellipse(s * r * 0.38, -r * 1.2, r * 0.09, r * 0.45, s * 0.15, 0, TAU);
        ctx2.fill();
        ctx2.fillStyle = P.c;
      }
    } else if (P.ear === "flop") {
      ctx2.fillStyle = P.mask;
      for (const s of [-1, 1]) {
        ctx2.beginPath();
        ctx2.ellipse(s * r * 0.9, -r * 0.1, r * 0.25, r * 0.5, s * -0.3, 0, TAU);
        ctx2.fill();
        ctx2.stroke();
      }
    } else if (P.ear === "side") {
      for (const s of [-1, 1]) {
        ctx2.beginPath();
        ctx2.ellipse(s * r * 1, -r * 0.15, r * 0.35, r * 0.15, s * 0.3, 0, TAU);
        ctx2.fill();
        ctx2.stroke();
      }
    }
    ctx2.fillStyle = P.c;
    ctx2.beginPath();
    ctx2.ellipse(0, 0, r, r * 0.92, 0, 0, TAU);
    ctx2.fill();
    ctx2.stroke();
    if (P.wool) {
      ctx2.fillStyle = "#F1F5F9";
      for (let i = -2; i <= 2; i++) {
        ctx2.beginPath();
        ctx2.arc(i * r * 0.28, -r * 0.8, r * 0.22, 0, TAU);
        ctx2.fill();
        ctx2.stroke();
      }
    }
    if (P.mask) {
      ctx2.fillStyle = P.mask;
      ctx2.beginPath();
      ctx2.ellipse(0, r * 0.35, r * 0.45, r * 0.38, 0, 0, TAU);
      ctx2.fill();
    }
    if (P.spots) {
      ctx2.fillStyle = "#7A4E1D";
      for (const [sx, sy] of [[-0.5, -0.5], [0.45, -0.55], [-0.7, 0.1], [0.72, 0.05], [0, -0.75], [-0.25, -0.35], [0.25, -0.3]]) {
        ctx2.beginPath();
        ctx2.arc(sx * r, sy * r, r * 0.08, 0, TAU);
        ctx2.fill();
      }
    }
    if (type === "tilki") {
      ctx2.fillStyle = "#fff";
      ctx2.beginPath();
      ctx2.moveTo(-r * 0.8, r * 0.1);
      ctx2.quadraticCurveTo(0, r * 1.1, r * 0.8, r * 0.1);
      ctx2.quadraticCurveTo(0, r * 0.4, -r * 0.8, r * 0.1);
      ctx2.fill();
    }
    if (type === "kaplumbaga") {
      ctx2.fillStyle = "#4C9A4C";
      ctx2.beginPath();
      ctx2.arc(0, -r * 0.95, r * 0.6, Math.PI, TAU);
      ctx2.fill();
      ctx2.stroke();
    }
    for (const s of [-1, 1]) {
      if (mood === "happy") {
        ctx2.lineWidth = r * 0.08;
        ctx2.beginPath();
        ctx2.arc(s * r * 0.35, -r * 0.05, r * 0.13, Math.PI * 1.15, Math.PI * 1.85);
        ctx2.stroke();
      } else if (mood === "sad") {
        ctx2.fillStyle = "#111";
        ctx2.beginPath();
        ctx2.arc(s * r * 0.35, -r * 0.05, r * 0.09, 0, TAU);
        ctx2.fill();
        ctx2.lineWidth = r * 0.05;
        ctx2.beginPath();
        ctx2.moveTo(s * r * 0.5, -r * 0.3);
        ctx2.lineTo(s * r * 0.2, -r * 0.22);
        ctx2.stroke();
      } else {
        ctx2.fillStyle = "#111";
        ctx2.beginPath();
        ctx2.arc(s * r * 0.35, -r * 0.05, r * 0.11, 0, TAU);
        ctx2.fill();
        ctx2.fillStyle = "#fff";
        ctx2.beginPath();
        ctx2.arc(s * r * 0.35 + r * 0.04, -r * 0.1, r * 0.04, 0, TAU);
        ctx2.fill();
      }
    }
    if (P.beak) {
      ctx2.fillStyle = "#F97316";
      ctx2.beginPath();
      ctx2.moveTo(-r * 0.15, r * 0.15);
      ctx2.lineTo(r * 0.15, r * 0.15);
      ctx2.lineTo(0, r * 0.75);
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
    } else {
      ctx2.fillStyle = type === "kangal" ? "#111" : "#3b2a20";
      ctx2.beginPath();
      ctx2.ellipse(0, r * 0.2, r * 0.12, r * 0.08, 0, 0, TAU);
      ctx2.fill();
      ctx2.lineWidth = r * 0.05;
      ctx2.strokeStyle = type === "kangal" ? "#E8D3A8" : outline;
      ctx2.beginPath();
      if (mood === "sad") ctx2.arc(0, r * 0.5, r * 0.15, Math.PI * 1.15, Math.PI * 1.85);
      else ctx2.arc(0, r * 0.3, r * 0.17, Math.PI * 0.15, Math.PI * 0.85);
      ctx2.stroke();
    }
    ctx2.fillStyle = "rgba(255,110,140,0.35)";
    for (const s of [-1, 1]) {
      ctx2.beginPath();
      ctx2.arc(s * r * 0.6, r * 0.25, r * 0.12, 0, TAU);
      ctx2.fill();
    }
    ctx2.restore();
  }
  var Particles = class {
    constructor() {
      this.list = [];
    }
    burst(x, y, color, n = 14, speed = 260, size = 6, shape = "circle") {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, s = speed * (0.4 + Math.random() * 0.8);
        this.list.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - speed * 0.2,
          life: 0.7 + Math.random() * 0.5,
          age: 0,
          color: Array.isArray(color) ? pick(color) : color,
          size: size * (0.6 + Math.random() * 0.8),
          shape,
          rot: Math.random() * TAU
        });
      }
    }
    text(x, y, str, color = "#FFD23F", size = 34) {
      this.list.push({ x, y, vx: 0, vy: -90, life: 1, age: 0, color, size, shape: "text", str });
    }
    update(dt) {
      for (const p of this.list) {
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.shape !== "text") {
          p.vy += 500 * dt;
          p.vx *= 0.98;
          p.rot += dt * 6;
        }
      }
      this.list = this.list.filter((p) => p.age < p.life);
    }
    draw(ctx2) {
      for (const p of this.list) {
        const a = 1 - p.age / p.life;
        ctx2.globalAlpha = Math.max(0, a);
        if (p.shape === "text") text(ctx2, p.str, p.x, p.y, p.size * (1 + (1 - a) * 0.3), p.color);
        else if (p.shape === "star") {
          ctx2.save();
          ctx2.translate(p.x, p.y);
          ctx2.rotate(p.rot);
          star(ctx2, 0, 0, p.size, p.color, null);
          ctx2.restore();
        } else if (p.shape === "rect") {
          ctx2.save();
          ctx2.translate(p.x, p.y);
          ctx2.rotate(p.rot);
          ctx2.fillStyle = p.color;
          ctx2.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx2.restore();
        } else {
          ctx2.fillStyle = p.color;
          ctx2.beginPath();
          ctx2.arc(p.x, p.y, p.size, 0, TAU);
          ctx2.fill();
        }
      }
      ctx2.globalAlpha = 1;
    }
  };
  var RAINBOW = ["#EF476F", "#FF8C42", "#FFD23F", "#06D6A0", "#38B6FF", "#8338EC", "#FF5DA2"];
  function handIcon(ctx2, x, y, s, color = "#06D6A0", progress = 0, flip = false) {
    ctx2.save();
    ctx2.translate(x, y);
    ctx2.fillStyle = "rgba(255,255,255,0.35)";
    ctx2.beginPath();
    ctx2.arc(0, 0, s, 0, TAU);
    ctx2.fill();
    ctx2.lineWidth = s * 0.14;
    ctx2.strokeStyle = color;
    ctx2.beginPath();
    ctx2.arc(0, 0, s, 0, TAU);
    ctx2.stroke();
    if (progress > 0) {
      ctx2.strokeStyle = "#FFD23F";
      ctx2.lineCap = "round";
      ctx2.beginPath();
      ctx2.arc(0, 0, s, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, progress));
      ctx2.stroke();
    }
    if (flip) ctx2.scale(-1, 1);
    const skin = "#FFDDB8", line = "#B9784A";
    ctx2.fillStyle = skin;
    ctx2.strokeStyle = line;
    ctx2.lineWidth = s * 0.07;
    ctx2.lineJoin = "round";
    const fw = s * 0.2;
    [[-0.36, -0.2, 0.42], [-0.12, -0.32, 0.5], [0.12, -0.3, 0.48], [0.34, -0.18, 0.4]].forEach(([fx, fy, fl]) => {
      ctx2.beginPath();
      rr(ctx2, fx * s - fw / 2, fy * s - fl * s, fw, fl * s + s * 0.3, fw / 2);
      ctx2.fill();
      ctx2.stroke();
    });
    ctx2.save();
    ctx2.rotate(-0.7);
    rr(ctx2, -s * 0.62, s * 0.05, fw, s * 0.42, fw / 2);
    ctx2.fill();
    ctx2.stroke();
    ctx2.restore();
    rr(ctx2, -s * 0.47, -s * 0.18, s * 0.94, s * 0.72, s * 0.3);
    ctx2.fill();
    ctx2.stroke();
    ctx2.fillStyle = "rgba(255,140,120,0.35)";
    ctx2.beginPath();
    ctx2.arc(0, s * 0.2, s * 0.18, 0, TAU);
    ctx2.fill();
    ctx2.restore();
  }
  function vignette(ctx2, w, h, strength = 0.35, color = "0,0,0") {
    const g = ctx2.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.6);
    g.addColorStop(0, `rgba(${color},0)`);
    g.addColorStop(1, `rgba(${color},${strength})`);
    ctx2.fillStyle = g;
    ctx2.fillRect(0, 0, w, h);
  }
  function fogBand(ctx2, w, y, height, rgb = "255,255,255", alpha = 0.7) {
    const g = ctx2.createLinearGradient(0, y - height, 0, y + height);
    g.addColorStop(0, `rgba(${rgb},0)`);
    g.addColorStop(0.5, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx2.fillStyle = g;
    ctx2.fillRect(0, y - height, w, height * 2);
  }
  function sunGlow(ctx2, x, y, r, t = 0, rays = true) {
    if (rays) {
      ctx2.save();
      ctx2.translate(x, y);
      ctx2.rotate(t * 0.05);
      ctx2.fillStyle = "rgba(255,250,220,0.12)";
      for (let i = 0; i < 12; i++) {
        ctx2.rotate(TAU / 12);
        ctx2.beginPath();
        ctx2.moveTo(0, 0);
        ctx2.lineTo(-r * 0.5, -r * 6);
        ctx2.lineTo(r * 0.5, -r * 6);
        ctx2.closePath();
        ctx2.fill();
      }
      ctx2.restore();
    }
    const g = ctx2.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, "rgba(255,255,240,1)");
    g.addColorStop(0.3, "rgba(255,245,200,0.8)");
    g.addColorStop(1, "rgba(255,240,200,0)");
    ctx2.fillStyle = g;
    ctx2.beginPath();
    ctx2.arc(x, y, r * 3, 0, TAU);
    ctx2.fill();
  }
  function bird(ctx2, x, y, s, t, color = "#334155") {
    const f = Math.sin(t * 12) * 0.5;
    ctx2.save();
    ctx2.translate(x, y);
    ctx2.fillStyle = "#fff";
    ctx2.strokeStyle = color;
    ctx2.lineWidth = s * 0.14;
    ctx2.lineCap = "round";
    ctx2.beginPath();
    ctx2.ellipse(0, 0, s * 0.35, s * 0.2, 0, 0, TAU);
    ctx2.fill();
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(-s, -s * f);
    ctx2.quadraticCurveTo(-s * 0.5, -s * 0.6 - s * f, 0, -s * 0.05);
    ctx2.quadraticCurveTo(s * 0.5, -s * 0.6 - s * f, s, -s * f);
    ctx2.stroke();
    ctx2.fillStyle = "#F59E0B";
    ctx2.beginPath();
    ctx2.moveTo(s * 0.32, -s * 0.05);
    ctx2.lineTo(s * 0.55, s * 0.02);
    ctx2.lineTo(s * 0.32, s * 0.1);
    ctx2.fill();
    ctx2.fillStyle = "#111";
    ctx2.beginPath();
    ctx2.arc(s * 0.2, -s * 0.05, s * 0.05, 0, TAU);
    ctx2.fill();
    ctx2.restore();
  }
  function bee(ctx2, x, y, r, t) {
    ctx2.save();
    ctx2.translate(x, y);
    const f = Math.sin(t * 40) * 0.4;
    ctx2.fillStyle = "rgba(220,240,255,0.85)";
    ctx2.beginPath();
    ctx2.ellipse(-r * 0.3, -r * 0.7, r * 0.45, r * 0.3 + f * r * 0.2, -0.5, 0, TAU);
    ctx2.fill();
    ctx2.beginPath();
    ctx2.ellipse(r * 0.3, -r * 0.7, r * 0.45, r * 0.3 - f * r * 0.2, 0.5, 0, TAU);
    ctx2.fill();
    ctx2.fillStyle = "#FFC300";
    ctx2.strokeStyle = "#1e293b";
    ctx2.lineWidth = r * 0.08;
    ctx2.beginPath();
    ctx2.ellipse(0, 0, r, r * 0.7, 0, 0, TAU);
    ctx2.fill();
    ctx2.stroke();
    ctx2.fillStyle = "#1e293b";
    for (const k of [-0.3, 0.2]) ctx2.fillRect(k * r, -r * 0.65, r * 0.2, r * 1.3);
    ctx2.beginPath();
    ctx2.moveTo(r * 0.95, 0);
    ctx2.lineTo(r * 1.35, 0);
    ctx2.lineTo(r * 0.95, r * 0.15);
    ctx2.fill();
    ctx2.fillStyle = "#fff";
    ctx2.beginPath();
    ctx2.arc(-r * 0.65, -r * 0.15, r * 0.18, 0, TAU);
    ctx2.fill();
    ctx2.fillStyle = "#111";
    ctx2.beginPath();
    ctx2.arc(-r * 0.68, -r * 0.15, r * 0.09, 0, TAU);
    ctx2.fill();
    ctx2.restore();
  }
  var AVATARS = [
    { name: "Pamuk", draw: (g, x, y, r) => vanCat(g, x, y, r, "happy") },
    { name: "Tar\xE7\u0131n", draw: (g, x, y, r) => animalFace(g, "kedi", x, y, r, "happy") }
  ];
  var _avatarCache = {};
  function avatarURL(i, size = 96) {
    const key = i + ":" + size;
    if (_avatarCache[key]) return _avatarCache[key];
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    AVATARS[i].draw(g, size / 2, size * 0.56, size * 0.36);
    return _avatarCache[key] = c.toDataURL();
  }

  // js/audio.js
  var ac = null;
  var muted = false;
  try {
    muted = localStorage.getItem("ho-muted") === "1";
  } catch {
  }
  function ctx() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function tone(freq, dur = 0.12, type = "sine", vol = 0.18, slide = 0, delay = 0) {
    if (muted) return;
    const a = ctx();
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function noise(dur = 0.15, vol = 0.15, filter = 1800) {
    if (muted) return;
    const a = ctx();
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource();
    s.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = filter;
    const g = a.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(a.destination);
    s.start();
  }
  var sfx = {
    unlock() {
      try {
        ctx();
      } catch {
      }
    },
    pop() {
      noise(0.08, 0.3, 2500);
      tone(700, 0.08, "triangle", 0.12, 400);
    },
    coin() {
      tone(988, 0.07, "square", 0.08);
      tone(1319, 0.18, "square", 0.08, 0, 0.07);
    },
    good() {
      tone(523, 0.1, "triangle", 0.15);
      tone(659, 0.1, "triangle", 0.15, 0, 0.08);
      tone(784, 0.18, "triangle", 0.15, 0, 0.16);
    },
    bad() {
      tone(220, 0.25, "sawtooth", 0.1, -100);
    },
    bump() {
      noise(0.2, 0.3, 300);
      tone(110, 0.2, "sine", 0.2, -50);
    },
    whoosh() {
      noise(0.35, 0.18, 900);
    },
    jump() {
      tone(300, 0.2, "square", 0.07, 500);
    },
    tick() {
      tone(880, 0.06, "sine", 0.12);
    },
    go() {
      tone(1046, 0.35, "triangle", 0.18);
    },
    magic() {
      [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, "sine", 0.12, 0, i * 0.08));
    },
    win() {
      [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.15, 0, i * 0.12));
    },
    tap(i = 0) {
      tone(440 * Math.pow(2, i % 8 / 8), 0.1, "sine", 0.15);
    }
  };
  function say(str) {
    if (muted || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(str);
      u.lang = "tr-TR";
      u.rate = 1.05;
      u.pitch = 1.15;
      const v = speechSynthesis.getVoices().find((v2) => v2.lang && v2.lang.toLowerCase().startsWith("tr"));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch {
    }
  }
  function isMuted() {
    return muted;
  }
  function setMuted(m) {
    muted = m;
    try {
      localStorage.setItem("ho-muted", m ? "1" : "0");
    } catch {
    }
    if (m && "speechSynthesis" in window) speechSynthesis.cancel();
  }

  // js/pose.js
  var VISION_VER = "0.10.14";
  var VISION_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VER}/vision_bundle.mjs`;
  var WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VER}/wasm`;
  var MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
  var PoseTracker = class {
    constructor() {
      this.video = document.createElement("video");
      this.video.playsInline = true;
      this.video.muted = true;
      this.stream = null;
      this.landmarker = null;
      this.numPoses = 2;
      this.mode = 1;
      this.lastVideoTime = -1;
      this.poses = [];
      this.slots = [null, null];
      this.lastSeen = [0, 0];
      this.fps = 0;
      this._fpsT = 0;
      this._fpsN = 0;
    }
    async startCamera() {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      await new Promise((r) => {
        if (this.video.videoWidth) return r();
        this.video.onloadedmetadata = () => r();
      });
    }
    async loadModel(onStatus = () => {
    }) {
      const numPoses = this.numPoses;
      onStatus("Hareket alg\u0131lay\u0131c\u0131 indiriliyor\u2026");
      const vision = await import(VISION_URL);
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
      const opts = (delegate) => ({
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: "VIDEO",
        numPoses,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      try {
        this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, opts("GPU"));
      } catch (e) {
        console.warn("GPU ba\u015Flat\u0131lamad\u0131, CPU deneniyor", e);
        this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, opts("CPU"));
      }
      onStatus("Haz\u0131r!");
    }
    // Her karede çağrılır; yeni kamera karesi varsa algılar
    detect(now) {
      if (!this.landmarker || this.video.readyState < 2) return;
      if (this.video.currentTime === this.lastVideoTime) return;
      this.lastVideoTime = this.video.currentTime;
      let res;
      try {
        res = this.landmarker.detectForVideo(this.video, now);
      } catch (e) {
        console.warn(e);
        return;
      }
      this.poses = (res.landmarks || []).map((lm) => lm.map((p) => ({ x: 1 - p.x, y: p.y, v: p.visibility ?? 1 })));
      this._assign(now);
      this._fpsN++;
      if (now - this._fpsT > 1e3) {
        this.fps = this._fpsN;
        this._fpsN = 0;
        this._fpsT = now;
      }
    }
    _assign(now) {
      const center = (lm) => (lm[11].x + lm[12].x) / 2;
      const width = (lm) => Math.abs(lm[11].x - lm[12].x);
      let targets = [null, null];
      if (this.mode === 1) {
        let best = null, bestScore = -1;
        for (const lm of this.poses) {
          const s = width(lm) - Math.abs(center(lm) - 0.5) * 0.2;
          if (s > bestScore) {
            bestScore = s;
            best = lm;
          }
        }
        targets[0] = best;
      } else {
        const sorted = this.poses.slice().sort((a, b) => center(a) - center(b));
        if (sorted.length >= 2) {
          targets[0] = sorted[0];
          targets[1] = sorted[sorted.length - 1];
        } else if (sorted.length === 1) targets[center(sorted[0]) < 0.5 ? 0 : 1] = sorted[0];
      }
      for (let i = 0; i < 2; i++) {
        const t = targets[i];
        if (!t) {
          if (now - this.lastSeen[i] > 400) this.slots[i] = null;
          continue;
        }
        this.lastSeen[i] = now;
        const prev = this.slots[i];
        if (!prev) {
          this.slots[i] = t.map((p) => ({ ...p }));
          continue;
        }
        const k = 0.55;
        this.slots[i] = t.map((p, j) => ({
          x: prev[j].x + (p.x - prev[j].x) * k,
          y: prev[j].y + (p.y - prev[j].y) * k,
          v: p.v
        }));
      }
    }
    setMode(m) {
      if (this.mode !== m) {
        this.mode = m;
        this.slots = [null, null];
      }
    }
    get running() {
      return !!this.stream;
    }
    stop() {
      if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      if (this.landmarker) {
        try {
          this.landmarker.close();
        } catch {
        }
      }
      this.landmarker = null;
    }
  };
  var BONES = [
    [11, 12],
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 23],
    [12, 24],
    [23, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28]
  ];

  // js/engine.js
  var PLAYER_COLORS = ["#06D6A0", "#8338EC"];
  var PLAYER_NAMES = ["Pamuk", "Tar\xE7\u0131n"];
  var InputState = class {
    constructor() {
      this.baseY = null;
      this.airborne = false;
      this.cool = 0;
      this.prevHands = [null, null];
      this.tilt = 0;
      this.jumps = 0;
    }
    reset() {
      this.baseY = null;
      this.airborne = false;
      this.jumps = 0;
    }
    fromPose(pts, dt, w, h) {
      const vis = (i) => pts[i].v > 0.35;
      const hand = (wr, idx, k) => {
        const p = pts[wr], q = pts[idx];
        const x = p.x + (q.x - p.x) * 0.7, y = p.y + (q.y - p.y) * 0.7;
        const prev = this.prevHands[k];
        const vx = prev ? (x - prev.x) / Math.max(dt, 1e-3) : 0;
        const vy = prev ? (y - prev.y) / Math.max(dt, 1e-3) : 0;
        this.prevHands[k] = { x, y };
        return { x, y, vx, vy, visible: vis(wr) || vis(idx) };
      };
      const hands2 = [hand(15, 19, 0), hand(16, 20, 1)];
      const lS = pts[11], rS = pts[12];
      const shW = Math.max(20, Math.hypot(lS.x - rS.x, lS.y - rS.y));
      const shMid = { x: (lS.x + rS.x) / 2, y: (lS.y + rS.y) / 2 };
      const hipMid = { x: (pts[23].x + pts[24].x) / 2, y: (pts[23].y + pts[24].y) / 2 };
      const head = { x: pts[0].x, y: pts[0].y, r: shW * 0.45, visible: vis(0) };
      let tiltRaw;
      const [a, b] = hands2[0].x < hands2[1].x ? hands2 : [hands2[1], hands2[0]];
      const spread = Math.abs(b.x - a.x) / shW;
      if (hands2[0].visible && hands2[1].visible && spread > 1.2) tiltRaw = Math.atan2(b.y - a.y, b.x - a.x);
      else {
        const [sa, sb] = lS.x < rS.x ? [lS, rS] : [rS, lS];
        tiltRaw = Math.atan2(sb.y - sa.y, sb.x - sa.x) * 2.5;
      }
      this.tilt += (clamp(tiltRaw, -1.2, 1.2) - this.tilt) * Math.min(1, dt * 12);
      const handY = (hands2[0].y + hands2[1].y) / 2;
      const armsUp = clamp((shMid.y - handY) / shW, -2, 2.5);
      let jump = false;
      if (this.baseY === null) this.baseY = shMid.y;
      const rise = (this.baseY - shMid.y) / shW;
      this.cool -= dt;
      if (!this.airborne) {
        this.baseY += (shMid.y - this.baseY) * Math.min(1, dt * 1.5);
        if (rise > 0.28 && this.cool <= 0) {
          jump = true;
          this.airborne = true;
          this.cool = 0.45;
          this.jumps++;
        }
      } else if (rise < 0.1) this.airborne = false;
      return {
        present: true,
        fake: false,
        pts,
        hands: hands2,
        head,
        shW,
        shMid,
        hipMid,
        tilt: this.tilt,
        spread,
        armsUp,
        jump,
        airborne: this.airborne,
        lean: clamp(shMid.x / w * 2 - 1, -1, 1),
        handsUp: hands2[0].y < pts[0].y && hands2[1].y < pts[0].y,
        w,
        h
      };
    }
    fromMouse(m, keys, dt, w, h) {
      let target = 0;
      if (keys.ArrowLeft) target -= 0.7;
      if (keys.ArrowRight) target += 0.7;
      this.tilt += (target - this.tilt) * Math.min(1, dt * 6);
      this.leanX = clamp((this.leanX ?? 0.5) + (keys.ArrowLeft ? -dt * 0.9 : 0) + (keys.ArrowRight ? dt * 0.9 : 0), 0.05, 0.95);
      if (!keys.ArrowLeft && !keys.ArrowRight && m.inside) this.leanX += (m.x / w - this.leanX) * Math.min(1, dt * 5);
      const x = m.x, y = m.y;
      const prev = this.prevHands[0];
      const vx = prev ? (x - prev.x) / Math.max(dt, 1e-3) : 0;
      const vy = prev ? (y - prev.y) / Math.max(dt, 1e-3) : 0;
      this.prevHands[0] = { x, y };
      const hand = { x, y, vx, vy, visible: m.inside };
      let jump = false;
      if (keys.Space && !this._sp) {
        jump = true;
        this.jumps++;
      }
      this._sp = keys.Space;
      const shW = Math.min(w, h) * 0.18;
      return {
        present: true,
        fake: true,
        pts: null,
        hands: [hand, { ...hand }],
        head: { x, y, r: shW * 0.3, visible: false },
        shW,
        shMid: { x: this.leanX * w, y: h * 0.45 },
        hipMid: { x: this.leanX * w, y: h * 0.7 },
        tilt: this.tilt,
        spread: 2,
        armsUp: keys.ArrowUp ? 1.5 : keys.ArrowDown ? -1 : m.down ? 1.5 : 0.2,
        jump,
        airborne: !!keys.Space,
        lean: this.leanX * 2 - 1,
        handsUp: !!keys.ArrowUp || m.down,
        mouseDown: m.down,
        w,
        h
      };
    }
  };
  var Session = class {
    constructor({ canvas, game, players, tracker, onEnd, difficulty = "orta" }) {
      this.canvas = canvas;
      this.g = canvas.getContext("2d");
      this.def = game;
      this.nPlayers = players;
      this.tracker = tracker;
      this.onEnd = onEnd;
      this.diff = difficulty === "kolay" ? 0.7 : 1;
      this.mouse = { x: 0, y: 0, inside: false, down: false };
      this.keys = {};
      this.views = [];
      this.inputs = [new InputState(), new InputState()];
      this.lastInputs = [];
      this.mirror = document.createElement("canvas");
      this.mctx = this.mirror.getContext("2d");
      this.running = false;
      this._bind();
      this.resize();
      this.reset();
    }
    _bind() {
      this._onResize = () => this.resize();
      this._onMove = (e) => {
        const r = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - r.left;
        this.mouse.y = e.clientY - r.top;
        this.mouse.inside = true;
      };
      this._onDown = (e) => {
        this._onMove(e);
        this.mouse.down = true;
      };
      this._onUp = () => {
        this.mouse.down = false;
      };
      this._onLeave = () => {
        this.mouse.inside = false;
        this.mouse.down = false;
      };
      this._onKey = (e) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code)) e.preventDefault();
        this.keys[e.code] = e.type === "keydown";
      };
      window.addEventListener("resize", this._onResize);
      this.canvas.addEventListener("pointermove", this._onMove);
      this.canvas.addEventListener("pointerdown", this._onDown);
      window.addEventListener("pointerup", this._onUp);
      this.canvas.addEventListener("pointerleave", this._onLeave);
      window.addEventListener("keydown", this._onKey);
      window.addEventListener("keyup", this._onKey);
    }
    resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = this.canvas.clientWidth || 800, H = this.canvas.clientHeight || 600;
      this.canvas.width = Math.round(W * dpr);
      this.canvas.height = Math.round(H * dpr);
      this.dpr = dpr;
      this.W = W;
      this.H = H;
      const gap = this.nPlayers === 2 ? 6 : 0;
      const vw = this.nPlayers === 2 ? (W - gap) / 2 : W;
      for (let i = 0; i < this.nPlayers; i++) {
        const v = this.views[i] || (this.views[i] = { hitT: 0 });
        Object.assign(v, {
          x: i * (vw + gap),
          y: 0,
          w: vw,
          h: H,
          player: i,
          players: this.nPlayers,
          color: PLAYER_COLORS[i],
          u: Math.min(vw, H) / 100,
          diff: this.diff,
          hit: () => {
            v.hitT = 0.5;
          }
        });
        this.insts?.[i]?.resize?.();
      }
    }
    reset() {
      this.phase = "ready";
      this.phaseT = 0;
      this.time = this.def.duration ?? 60;
      this.elapsed = 0;
      this.lastCount = 4;
      this.inputs.forEach((s) => s.reset());
      this.views.forEach((v) => {
        v.hitT = 0;
      });
      this.insts = this.views.map((v) => this.def.create(v));
    }
    // Hazır ekranından sonra çağrılır
    begin() {
      if (this.phase !== "ready") return;
      this.phase = "count";
      this.phaseT = 0;
      this.lastCount = 4;
    }
    start() {
      this.running = true;
      this.last = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        const dt = Math.min(0.05, (now - this.last) / 1e3);
        this.last = now;
        this.tick(dt, now);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
    stop() {
      this.running = false;
      cancelAnimationFrame(this.raf);
      window.removeEventListener("resize", this._onResize);
      window.removeEventListener("pointerup", this._onUp);
      window.removeEventListener("keydown", this._onKey);
      window.removeEventListener("keyup", this._onKey);
    }
    // Yan panel için anlık bilgi
    info() {
      return {
        phase: this.phase,
        time: Math.max(0, this.time),
        duration: this.def.duration ?? 60,
        players: this.insts.map((s, i) => ({
          score: Math.max(0, Math.floor(s.score)),
          present: !!this.lastInputs[i]?.present,
          stats: s.stats ? s.stats() : []
        })),
        stage: this.insts[0].stage ? this.insts[0].stage() : null
      };
    }
    // video koordinatını (aynalanmış 0..1) oyuncunun görüş alanına eşler
    _mapper(i) {
      const v = this.views[i];
      const vid = this.tracker.video;
      const sx0 = this.nPlayers === 2 ? i * 0.5 : 0;
      const sw = this.nPlayers === 2 ? 0.5 : 1;
      const vw = vid.videoWidth || 1280, vh = vid.videoHeight || 720;
      const scale = Math.max(v.w / (sw * vw), v.h / vh);
      const dw = sw * vw * scale, dh = vh * scale;
      const ox = (v.w - dw) / 2, oy = (v.h - dh) / 2;
      return { sx0, sw, vw, vh, dw, dh, ox, oy, map: (p) => ({ x: ox + (p.x - sx0) / sw * dw, y: oy + p.y * dh, v: p.v }) };
    }
    tick(dt, now) {
      const g = this.g;
      if (this.tracker) {
        this.tracker.detect(now);
        const vid = this.tracker.video;
        if (vid.videoWidth && this.mirror.width !== vid.videoWidth) {
          this.mirror.width = vid.videoWidth;
          this.mirror.height = vid.videoHeight;
        }
        if (vid.readyState >= 2 && this.mirror.width) {
          this.mctx.setTransform(-1, 0, 0, 1, this.mirror.width, 0);
          this.mctx.drawImage(vid, 0, 0);
        }
      }
      const inputs = this.views.map((v, i) => {
        if (!this.tracker) {
          if (i !== 0) return { present: false, hands: [], w: v.w, h: v.h };
          const m = { ...this.mouse, x: this.mouse.x - v.x, y: this.mouse.y - v.y };
          return this.inputs[0].fromMouse(m, this.keys, dt, v.w, v.h);
        }
        const raw = this.tracker.slots[i];
        if (!raw) return { present: false, hands: [], w: v.w, h: v.h };
        const M = this._mapper(i);
        return this.inputs[i].fromPose(raw.map(M.map), dt, v.w, v.h);
      });
      this.lastInputs = inputs;
      this.phaseT += dt;
      if (this.phase === "count") {
        const n = 3 - Math.floor(this.phaseT);
        if (n !== this.lastCount && n > 0) {
          this.lastCount = n;
          sfx.tick();
          say(String(n));
        }
        if (this.phaseT >= 3.6) {
          this.phase = "play";
          this.phaseT = 0;
        } else if (this.phaseT >= 3 && this.lastCount !== 0) {
          this.lastCount = 0;
          sfx.go();
          say("Haydi!");
        }
      } else if (this.phase === "play") {
        this.time -= dt;
        this.elapsed += dt;
        this.insts.forEach((inst, i) => {
          if (!inst.finished) inst.update(dt, inputs[i], this.elapsed);
        });
        if (this.time <= 0 || this.insts.every((s) => s.finished)) this._finish();
      }
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      g.fillStyle = "#0F172A";
      g.fillRect(0, 0, this.W, this.H);
      this.views.forEach((v, i) => {
        v.hitT = Math.max(0, v.hitT - dt);
        g.save();
        g.translate(v.x, v.y);
        g.beginPath();
        g.rect(0, 0, v.w, v.h);
        g.clip();
        const inst = this.insts[i];
        inst.draw(g, inputs[i], this.elapsed || this.phaseT);
        const camA = inst.camAlpha ?? this.def.camAlpha ?? 0;
        if (this.tracker && camA > 0) this._drawCam(g, i, camA);
        inst.drawOver?.(g, inputs[i], this.elapsed || this.phaseT);
        if (inputs[i].present && this.def.skeleton) this._drawSkeleton(g, inputs[i]);
        if (inputs[i].present && this.def.cursors !== false && (this.phase === "play" || this.phase === "count")) this._drawHands(g, inputs[i], v.color);
        if (v.hitT > 0) {
          const a = v.hitT / 0.5;
          const gr = g.createRadialGradient(v.w / 2, v.h / 2, Math.min(v.w, v.h) * 0.3, v.w / 2, v.h / 2, Math.hypot(v.w, v.h) * 0.6);
          gr.addColorStop(0, "rgba(239,71,111,0)");
          gr.addColorStop(1, `rgba(239,71,111,${0.55 * a})`);
          g.fillStyle = gr;
          g.fillRect(0, 0, v.w, v.h);
        }
        this._drawHud(g, v, inst, inputs[i]);
        g.restore();
      });
      if (this.nPlayers === 2) {
        g.fillStyle = "#FFFFFF";
        g.fillRect(this.views[1].x - 6, 0, 6, this.H);
      }
    }
    _drawCam(g, i, alpha) {
      const M = this._mapper(i);
      if (!this.mirror.width) return;
      g.save();
      g.globalAlpha = alpha;
      g.drawImage(this.mirror, M.sx0 * M.vw, 0, M.sw * M.vw, M.vh, M.ox, M.oy, M.dw, M.dh);
      g.restore();
    }
    _drawSkeleton(g, inp) {
      if (!inp.pts) return;
      g.save();
      g.lineCap = "round";
      g.strokeStyle = "rgba(255,255,255,0.75)";
      g.lineWidth = Math.max(4, inp.shW * 0.08);
      for (const [a, b] of BONES) {
        const p = inp.pts[a], q = inp.pts[b];
        if (p.v < 0.4 || q.v < 0.4) continue;
        g.beginPath();
        g.moveTo(p.x, p.y);
        g.lineTo(q.x, q.y);
        g.stroke();
      }
      g.restore();
    }
    _drawHands(g, inp, color) {
      inp.hands.forEach((hnd, k) => {
        if (!hnd.visible) return;
        const r = Math.max(18, (inp.shW || 80) * 0.24);
        handIcon(g, hnd.x, hnd.y, r, color, 0, k === 1);
      });
    }
    _drawHud(g, v, inst, inp) {
      const u = v.u;
      const pad = Math.max(10, u * 2.2);
      const fs = Math.max(22, u * 6.5);
      const score = String(Math.max(0, Math.floor(inst.score)));
      const pw = fs * (1.9 + score.length * 0.62), ph = fs * 1.55;
      g.save();
      g.shadowColor = "rgba(15,23,42,0.25)";
      g.shadowBlur = 10;
      g.shadowOffsetY = 4;
      g.fillStyle = "#fff";
      rr(g, pad, pad, pw, ph, ph / 2);
      g.fill();
      g.restore();
      g.lineWidth = 4;
      g.strokeStyle = this.nPlayers === 2 ? v.color : "#FFC300";
      rr(g, pad, pad, pw, ph, ph / 2);
      g.stroke();
      star(g, pad + ph * 0.52, pad + ph / 2, ph * 0.3);
      text(g, score, pad + ph * 0.95, pad + ph * 0.54, fs, "#7C2D12", { align: "left", stroke: null, weight: 800 });
      if (this.nPlayers === 2) {
        const nw = fs * 3.6;
        g.fillStyle = v.color;
        rr(g, v.w - pad - nw, pad, nw, ph, ph / 2);
        g.fill();
        text(g, PLAYER_NAMES[v.player], v.w - pad - nw / 2, pad + ph * 0.54, fs * 0.7, "#fff", { stroke: null });
      }
      if (inst.speedKmh && this.nPlayers === 1 && this.phase === "play") {
        const s = `${Math.round(inst.speedKmh())} km/s`;
        const sw = fs * 3.8;
        g.fillStyle = "rgba(15,23,42,0.75)";
        rr(g, v.w - pad - sw, pad, sw, ph, ph / 2);
        g.fill();
        text(g, s, v.w - pad - sw / 2, pad + ph * 0.54, fs * 0.72, "#FFD23F", { stroke: null, weight: 800 });
      }
      if (inst.hud) inst.hud(g, pad, fs);
      if (this.phase === "count") {
        const t = this.phaseT;
        g.fillStyle = "rgba(15,23,42,0.35)";
        g.fillRect(0, 0, v.w, v.h);
        const n = 3 - Math.floor(t);
        const k = t % 1;
        const m = Math.min(v.w, v.h);
        if (n > 0) {
          const s = 1 + (1 - Math.min(1, k * 4)) * 0.6;
          g.fillStyle = "rgba(255,255,255,0.95)";
          g.beginPath();
          g.arc(v.w / 2, v.h / 2, m * 0.2 * s, 0, TAU);
          g.fill();
          g.lineWidth = m * 0.02;
          g.strokeStyle = ["#EF476F", "#FFC300", "#06D6A0"][n - 1];
          g.beginPath();
          g.arc(v.w / 2, v.h / 2, m * 0.2 * s, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - k));
          g.stroke();
          text(g, String(n), v.w / 2, v.h / 2 + m * 0.01, m * 0.26 * s, ["#EF476F", "#E09F00", "#06A77D"][n - 1], { stroke: null, weight: 800 });
        } else {
          const s = 1 + Math.min(1, k * 3) * 0.2;
          text(g, "HAYD\u0130!", v.w / 2, v.h / 2, m * 0.2 * s, "#FFD23F", { sw: m * 0.03 });
        }
        if (this.def.controls) text(g, this.def.controls, v.w / 2, v.h * 0.82, Math.max(16, fs * 0.6), "#fff");
      } else if (this.phase === "play" && !inp.present && this.tracker) {
        g.fillStyle = "rgba(15,23,42,0.35)";
        g.fillRect(0, v.h * 0.42, v.w, v.h * 0.16);
        text(g, "\u{1F440} Seni g\xF6remiyorum, kameraya d\xF6n!", v.w / 2, v.h * 0.5, Math.max(18, fs * 0.75), "#FFD23F");
      }
    }
    _finish() {
      if (this.phase === "end") return;
      this.phase = "end";
      sfx.win();
      const st = this.def.stars || [10, 20, 30];
      const results = this.insts.map((s) => {
        const score = Math.max(0, Math.floor(s.score));
        return { score, stars: score >= st[2] ? 3 : score >= st[1] ? 2 : score >= st[0] ? 1 : 0, stats: s.stats ? s.stats() : [] };
      });
      say(this.nPlayers === 2 ? results[0].score === results[1].score ? "Berabere! Harikas\u0131n\u0131z!" : `${results[0].score > results[1].score ? PLAYER_NAMES[0] : PLAYER_NAMES[1]} kazand\u0131!` : "Oyun bitti! S\xFCper oynad\u0131n!");
      setTimeout(() => this.onEnd?.(results), 600);
    }
  };

  // js/handcursor.js
  var DWELL = 1.1;
  var COLORS = ["#06D6A0", "#8338EC"];
  var HAND_SVG = (color) => `
<svg viewBox="-60 -60 120 120" width="100%" height="100%" aria-hidden="true">
  <circle r="54" fill="rgba(255,255,255,0.45)" stroke="${color}" stroke-width="8"/>
  <circle class="hc-ring" r="54" fill="none" stroke="#FFD23F" stroke-width="9" stroke-linecap="round"
    stroke-dasharray="339.3" stroke-dashoffset="339.3" transform="rotate(-90)"/>
  <g fill="#FFDDB8" stroke="#B9784A" stroke-width="3.5" stroke-linejoin="round">
    <rect x="-23" y="-40" width="10" height="34" rx="5"/>
    <rect x="-11" y="-46" width="10" height="40" rx="5"/>
    <rect x="1" y="-45" width="10" height="39" rx="5"/>
    <rect x="13" y="-36" width="10" height="31" rx="5"/>
    <rect x="-34" y="-2" width="10" height="24" rx="5" transform="rotate(-38 -29 10)"/>
    <rect x="-24" y="-12" width="48" height="38" rx="15"/>
  </g>
  <circle cy="8" r="8" fill="rgba(255,140,120,0.35)"/>
</svg>`;
  var HandCursors = class {
    constructor(layer) {
      this.layer = layer;
      this.cursors = [0, 1].map((i) => {
        const el = document.createElement("div");
        el.className = "hand-cursor";
        el.innerHTML = HAND_SVG(COLORS[i]);
        el.style.display = "none";
        layer.appendChild(el);
        return { el, ring: el.querySelector(".hc-ring"), x: innerWidth / 2, y: innerHeight / 2, target: null, t: 0, cool: 0, seen: false };
      });
      this.enabled = true;
    }
    // ham noktalardan ekrandaki el konumu: kalkık olan el seçilir, ekrana yayılır
    _point(lm) {
      const cands = [[15, 19], [16, 20]].map(([w, idx]) => ({
        x: lm[w].x + (lm[idx].x - lm[w].x) * 0.7,
        y: lm[w].y + (lm[idx].y - lm[w].y) * 0.7,
        v: Math.max(lm[w].v, lm[idx].v)
      })).filter((p2) => p2.v > 0.35);
      if (!cands.length) return null;
      const p = cands.sort((a, b) => a.y - b.y)[0];
      const sx = Math.min(1, Math.max(0, (p.x - 0.5) * 1.6 + 0.5));
      const sy = Math.min(1, Math.max(0, (p.y - 0.45) * 1.7 + 0.5));
      return { x: sx * innerWidth, y: sy * innerHeight };
    }
    update(tracker, dt) {
      for (let i = 0; i < 2; i++) {
        const c = this.cursors[i];
        const lm = this.enabled && tracker && tracker.running ? tracker.slots[i] : null;
        const p = lm ? this._point(lm) : null;
        if (!p) {
          c.el.style.display = "none";
          c.seen = false;
          this._setTarget(c, null);
          continue;
        }
        if (!c.seen) {
          c.x = p.x;
          c.y = p.y;
          c.seen = true;
        }
        const k = Math.min(1, dt * 14);
        c.x += (p.x - c.x) * k;
        c.y += (p.y - c.y) * k;
        c.el.style.display = "block";
        c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
        c.cool -= dt;
        let el = document.elementFromPoint(c.x, c.y);
        el = el && el.closest("[data-dwell]");
        if (el && (el.disabled || el.closest("[hidden]") || el.dataset.dwellPlayer && el.dataset.dwellPlayer !== String(i))) el = null;
        if (el !== c.target) {
          this._setTarget(c, el);
          c.t = 0;
        }
        if (el && c.cool <= 0) {
          c.t += dt;
          if (c.t >= DWELL) {
            c.t = 0;
            c.cool = 1;
            el.classList.add("dwell-done");
            setTimeout(() => el.classList.remove("dwell-done"), 300);
            el.click();
          }
        }
        c.ring.setAttribute("stroke-dashoffset", String(339.3 * (1 - Math.min(1, c.t / DWELL))));
      }
    }
    _setTarget(c, el) {
      if (c.target) c.target.classList.remove("dwell-hover");
      c.target = el;
      if (el) el.classList.add("dwell-hover");
    }
    hide() {
      this.cursors.forEach((c) => {
        c.el.style.display = "none";
        this._setTarget(c, null);
      });
    }
  };

  // js/games/kapadokya.js
  function fairyChimneys(g, w, h, seed = 1, color = "#E7A86B", shade = "#C98A4E") {
    const base = h * 0.86;
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, base);
    let x = 0, i = 0;
    while (x < w + 40) {
      const cw = (40 + (seed * 37 + i * 53) % 50) * (h / 600);
      const ch = (60 + (seed * 71 + i * 29) % 110) * (h / 600);
      g.lineTo(x + cw * 0.15, base);
      g.quadraticCurveTo(x + cw * 0.2, base - ch * 0.8, x + cw * 0.35, base - ch);
      g.lineTo(x + cw * 0.65, base - ch);
      g.quadraticCurveTo(x + cw * 0.8, base - ch * 0.8, x + cw * 0.85, base);
      x += cw;
      i++;
    }
    g.lineTo(w, h);
    g.closePath();
    g.fill();
    x = 0;
    i = 0;
    g.fillStyle = shade;
    while (x < w + 40) {
      const cw = (40 + (seed * 37 + i * 53) % 50) * (h / 600);
      const ch = (60 + (seed * 71 + i * 29) % 110) * (h / 600);
      g.beginPath();
      g.ellipse(x + cw * 0.5, base - ch, cw * 0.28, cw * 0.14, 0, Math.PI, TAU);
      g.fill();
      g.fillStyle = "rgba(80,40,20,0.5)";
      g.beginPath();
      g.arc(x + cw * 0.5, base - ch * 0.45, cw * 0.07, 0, TAU);
      g.fill();
      g.fillStyle = shade;
      x += cw;
      i++;
    }
  }
  function hotAirBalloon(g, x, y, r, colors) {
    g.save();
    g.translate(x, y);
    const n = colors.length;
    for (let i = 0; i < n; i++) {
      g.fillStyle = colors[i];
      g.beginPath();
      const a0 = Math.PI + i / n * Math.PI, a1 = Math.PI + (i + 1) / n * Math.PI;
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
    g.strokeStyle = "#5b3a1e";
    g.lineWidth = Math.max(1, r * 0.04);
    g.beginPath();
    g.moveTo(-r * 0.3, r * 1.15);
    g.lineTo(-r * 0.2, r * 1.45);
    g.moveTo(r * 0.3, r * 1.15);
    g.lineTo(r * 0.2, r * 1.45);
    g.stroke();
    g.fillStyle = "#8B5A2B";
    g.fillRect(-r * 0.22, r * 1.45, r * 0.44, r * 0.3);
    g.restore();
  }
  function drawBee(g, b) {
    const { x, y, r } = b;
    g.save();
    g.translate(x + Math.sin(b.t * 5 + b.ph) * r * 0.6, y);
    const f = Math.sin(b.t * 40) * 0.4;
    g.fillStyle = "rgba(220,240,255,0.85)";
    g.beginPath();
    g.ellipse(-r * 0.3, -r * 0.7, r * 0.45, r * 0.3 + f * r * 0.2, -0.5, 0, TAU);
    g.fill();
    g.beginPath();
    g.ellipse(r * 0.3, -r * 0.7, r * 0.45, r * 0.3 - f * r * 0.2, 0.5, 0, TAU);
    g.fill();
    g.fillStyle = "#FFC300";
    g.strokeStyle = "#1e293b";
    g.lineWidth = r * 0.08;
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.7, 0, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = "#1e293b";
    for (const k of [-0.3, 0.2]) g.fillRect(k * r, -r * 0.65, r * 0.2, r * 1.3);
    g.beginPath();
    g.moveTo(r * 0.95, 0);
    g.lineTo(r * 1.35, 0);
    g.lineTo(r * 0.95, r * 0.15);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(-r * 0.65, -r * 0.15, r * 0.18, 0, TAU);
    g.fill();
    g.fillStyle = "#111";
    g.beginPath();
    g.arc(-r * 0.68, -r * 0.15, r * 0.09, 0, TAU);
    g.fill();
    g.restore();
  }
  function drawBalloon(g, b) {
    if (b.kind === "ari") return drawBee(g, b);
    const { x, y, r, color } = b;
    g.save();
    g.translate(x, y);
    g.rotate(Math.sin(b.t * 2 + b.ph) * 0.08);
    g.strokeStyle = "rgba(255,255,255,0.8)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, r * 1.15);
    g.bezierCurveTo(r * 0.3, r * 1.5, -r * 0.3, r * 1.8, 0, r * 2.2);
    g.stroke();
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
    gr.addColorStop(0, "#ffffffcc");
    gr.addColorStop(0.25, color);
    gr.addColorStop(1, shadeColor(color, -35));
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(0, 0, r, r * 1.15, 0, 0, TAU);
    g.fill();
    g.fillStyle = shadeColor(color, -30);
    g.beginPath();
    g.moveTo(-r * 0.15, r * 1.12);
    g.lineTo(r * 0.15, r * 1.12);
    g.lineTo(0, r * 1.28);
    g.closePath();
    g.fill();
    if (b.kind === "gold") star(g, 0, 0, r * 0.5, "#fff8d6", null);
    if (b.kind === "flag") crescentStar(g, -r * 0.1, 0, r * 0.38, "#fff");
    if (b.kind === "rainbow") {
      for (let i = 0; i < 5; i++) {
        g.strokeStyle = RAINBOW[i];
        g.lineWidth = r * 0.1;
        g.beginPath();
        g.arc(0, r * 0.4, r * (0.75 - i * 0.12), Math.PI * 1.1, Math.PI * 1.9);
        g.stroke();
      }
    }
    g.restore();
  }
  function shadeColor(hex, pct) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => clamp(Math.round(c + pct / 100 * 255), 0, 255);
    const r = f(n >> 16), gg = f(n >> 8 & 255), b = f(n & 255);
    return "#" + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }
  var Game = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.balloons = [];
      this.fx = new Particles();
      this.spawnT = 0;
      this.t = 0;
      this.combo = 0;
      this.comboT = 0;
      this.popped = 0;
      this.golds = 0;
      this.hits = 0;
      this.birds = [];
      this.birdT = rand(5, 8);
      this.deco = Array.from({ length: 4 }, (_, i) => ({ x: rand(0, 1), y: rand(0.1, 0.5), s: rand(0.03, 0.06), sp: rand(4e-3, 0.01), c: pick([["#E63946", "#FFD23F"], ["#06D6A0", "#118AB2"], ["#8338EC", "#FF5DA2"], ["#F77F00", "#FCBF49"]]) }));
      this.clouds = Array.from({ length: 5 }, () => ({ x: rand(0, 1), y: rand(0.05, 0.4), s: rand(0.06, 0.12), sp: rand(5e-3, 0.015) }));
    }
    spawn() {
      const { w, h, u } = this.v;
      const roll = Math.random();
      let kind = "normal", r = rand(6, 10) * u, speed = rand(9, 16) * u, pts = 1;
      let color = pick(RAINBOW);
      if (roll < 0.08) {
        kind = "gold";
        color = "#FFC300";
        speed *= 1.4;
        pts = 5;
        r *= 0.9;
      } else if (roll < 0.16) {
        kind = "flag";
        color = "#E30A17";
        pts = 3;
      } else if (roll < 0.2) {
        kind = "rainbow";
        color = "#FFFFFF";
        pts = 2;
      } else if (roll < 0.28 && this.t > 5) {
        kind = "ari";
        color = "#FFC300";
        r *= 0.7;
        pts = -3;
      } else if (roll < 0.4) {
        r *= 0.65;
        speed *= 1.5;
        pts = 2;
      }
      speed *= (1 + Math.min(1, this.t / 60) * 0.6) * this.v.diff;
      this.balloons.push({ x: rand(r, w - r), y: h + r * 2, r, speed, color, kind, pts, t: 0, ph: rand(0, TAU), drift: rand(-1, 1) * u * 3 });
    }
    pop(b) {
      b.dead = true;
      if (b.kind === "ari") {
        this.score = Math.max(0, this.score + b.pts);
        this.combo = 0;
        sfx.bad();
        this.fx.burst(b.x, b.y, ["#FFC300", "#1e293b"], 10, this.v.u * 30, this.v.u);
        this.fx.text(b.x, b.y - b.r, "V\u0131z! -3", "#EF476F", this.v.u * 6);
        this.hits++;
        this.v.hit?.();
        return;
      }
      this.combo = this.comboT > 0 ? this.combo + 1 : 1;
      this.comboT = 1.2;
      const bonus = this.combo >= 5 ? 2 : 1;
      this.popped++;
      if (b.kind === "gold") this.golds++;
      this.score += b.pts * bonus;
      this.fx.burst(b.x, b.y, b.kind === "rainbow" ? RAINBOW : [b.color, "#fff"], 18, this.v.u * 50, this.v.u * 1.2, b.kind === "gold" ? "star" : "rect");
      this.fx.text(b.x, b.y - b.r, "+" + b.pts * bonus, b.kind === "gold" ? "#FFD23F" : "#fff", this.v.u * 6);
      sfx.pop();
      if (b.kind === "gold") sfx.coin();
      if (b.kind === "rainbow") {
        sfx.magic();
        for (const o of this.balloons) if (!o.dead && o !== b && o.kind !== "ari") {
          o.dead = true;
          this.score += 1;
          this.fx.burst(o.x, o.y, [o.color], 10, this.v.u * 35, this.v.u);
        }
      }
    }
    update(dt, inp) {
      this.t += dt;
      this.comboT -= dt;
      const rate = 0.75 - Math.min(0.4, this.t / 120);
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawn();
        this.spawnT = rate * rand(0.6, 1.3) * (this.v.players === 2 ? 1.2 : 1);
      }
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
          bd.dead = true;
          this.hits++;
          this.score = Math.max(0, this.score - 2);
          this.combo = 0;
          sfx.bad();
          this.v.hit?.();
          this.fx.burst(p.x, p.y, ["#fff", "#CBD5E1"], 14, this.v.u * 30, this.v.u, "circle");
          this.fx.text(p.x, p.y - r, "Cik cik! -2", "#EF476F", this.v.u * 6);
        }
      }
      this.birds = this.birds.filter((bd) => !bd.dead && bd.x > -0.2 && bd.x < 1.2);
      for (const d of this.deco) {
        d.x += d.sp * dt;
        if (d.x > 1.1) d.x = -0.1;
      }
      for (const c of this.clouds) {
        c.x += c.sp * dt;
        if (c.x > 1.2) c.x = -0.2;
      }
      this.fx.update(dt);
    }
    draw(g, inp, t) {
      const { w, h } = this.v;
      skyGradient(g, w, h, "#FF9E7A", "#FFE3B3");
      const sg = g.createLinearGradient(0, 0, 0, h * 0.6);
      sg.addColorStop(0, "#5BB8F5");
      sg.addColorStop(1, "rgba(91,184,245,0)");
      g.fillStyle = sg;
      g.fillRect(0, 0, w, h * 0.6);
      sunGlow(g, w * 0.78, h * 0.6, Math.min(w, h) * 0.07, t);
      for (const c of this.clouds) cloud(g, c.x * w, c.y * h, c.s * Math.min(w, h) * 1.6, "rgba(255,255,255,0.8)");
      for (const d of this.deco) hotAirBalloon(g, d.x * w, (d.y + Math.sin(t * 0.5 + d.x * 9) * 0.02) * h, d.s * Math.min(w, h), [d.c[0], d.c[1], d.c[0], d.c[1], d.c[0]]);
      fairyChimneys(g, w, h * 0.96, 5, "#F7D0A8", "#E8B58A");
      fogBand(g, w, h * 0.84, h * 0.08, "255,236,214", 0.75);
      fairyChimneys(g, w, h * 1.02, 3, "#F0B985", "#D49763");
      fogBand(g, w, h * 0.9, h * 0.05, "255,230,200", 0.5);
      fairyChimneys(g, w, h * 1.12, 7, "#D9925A", "#B5733F");
    }
    stats() {
      return [
        { icon: "\u{1F388}", label: "Patlat\u0131lan", value: this.popped },
        { icon: "\u2B50", label: "Alt\u0131n balon", value: this.golds },
        { icon: "\u{1F4A5}", label: "Ar\u0131 / ku\u015F", value: this.hits },
        { icon: "\u{1F525}", label: "Seri", value: this.comboT > 0 ? this.combo : 0 }
      ];
    }
    drawOver(g, inp, t) {
      for (const bd of this.birds) {
        g.save();
        g.translate(bd.x * this.v.w, (bd.y + Math.sin(bd.t * 3) * 0.02) * this.v.h);
        g.scale(bd.dir, 1);
        bird(g, 0, 0, this.v.u * 5, bd.t);
        g.restore();
      }
      for (const b of this.balloons) drawBalloon(g, b);
      this.fx.draw(g);
      if (this.combo >= 5 && this.comboT > 0) text(g, `Seri x${this.combo}! \u{1F525}`, this.v.w / 2, this.v.h * 0.2, this.v.u * 7, "#FFD23F");
      vignette(g, this.v.w, this.v.h, 0.22, "120,60,20");
    }
  };
  var kapadokya_default = {
    id: "kapadokya",
    title: "Kapadokya Balonlar\u0131",
    tagline: "P\u0131t, p\u0131t, patlat!",
    description: "Peribacalar\u0131n\u0131n \xFCst\xFCnden reng\xE2renk balonlar y\xFCkseliyor. Ellerinle ya da kafanla dokunup hepsini patlat! Alt\u0131n balonlar 5 puan, g\xF6kku\u015Fa\u011F\u0131 balonu ekrandaki t\xFCm balonlar\u0131 patlat\u0131r. Ama dikkat: ar\u0131lara dokunma!",
    howto: ["Ellerini salla", "Kafanla da patlatabilirsin", "Alt\u0131n balonu ka\xE7\u0131rma!", "Ar\u0131 -3, ku\u015F -2: dokunma!"],
    color: "#FF8C42",
    emoji: "\u{1F388}",
    duration: 60,
    camAlpha: 0.32,
    stars: [20, 45, 75],
    hint: "Balonlara elinle dokun!",
    create: (v) => new Game(v),
    thumb(g, w, h, t) {
      skyGradient(g, w, h, "#5BB8F5", "#FFE3B3");
      hotAirBalloon(g, w * 0.25, h * 0.3 + Math.sin(t) * 4, h * 0.13, ["#E63946", "#FFD23F", "#E63946", "#FFD23F"]);
      fairyChimneys(g, w, h * 1.05, 3, "#F0B985", "#D49763");
      const cols = ["#EF476F", "#06D6A0", "#FFC300", "#38B6FF"];
      cols.forEach((c, i) => drawBalloon(g, { x: w * (0.5 + i * 0.13), y: h * (0.55 - (t * 0.15 + i * 0.27) % 1 * 0.45), r: h * 0.08, color: c, kind: i === 2 ? "gold" : "normal", t, ph: i }));
    }
  };

  // js/games/hezarfen.js
  function skyline(g, w, y, s, color) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, y);
    const items = [
      ["hill", 0, 0.12],
      ["dome", 0.08, 0.05],
      ["min", 0.14, 0.13],
      ["dome", 0.2, 0.09],
      ["min", 0.27, 0.14],
      ["min", 0.31, 0.14],
      ["hill", 0.38, 0.05],
      ["tower", 0.46, 0.16],
      ["hill", 0.52, 0.06],
      ["min", 0.6, 0.12],
      ["dome", 0.66, 0.08],
      ["dome", 0.72, 0.06],
      ["min", 0.77, 0.13],
      ["hill", 0.84, 0.07],
      ["dome", 0.92, 0.05]
    ];
    g.lineTo(0, y - s * 0.03);
    for (const [k, x, hh] of items) {
      const px = x * w;
      if (k === "hill") {
        g.lineTo(px, y - s * 0.03);
        g.quadraticCurveTo(px + w * 0.03, y - s * hh, px + w * 0.06, y - s * 0.03);
      }
      if (k === "dome") {
        g.lineTo(px, y - s * 0.03);
        g.lineTo(px, y - s * hh * 0.6);
        g.arc(px + s * hh * 0.7, y - s * hh * 0.6, s * hh * 0.7, Math.PI, 0);
        g.lineTo(px + s * hh * 1.4, y - s * 0.03);
      }
      if (k === "min") {
        g.lineTo(px, y - s * 0.03);
        g.lineTo(px, y - s * hh * 0.9);
        g.lineTo(px + s * 6e-3, y - s * hh);
        g.lineTo(px + s * 0.012, y - s * hh * 0.9);
        g.lineTo(px + s * 0.012, y - s * 0.03);
      }
      if (k === "tower") {
        g.lineTo(px, y - s * 0.03);
        g.lineTo(px, y - s * hh * 0.75);
        g.lineTo(px + s * 0.012, y - s * hh);
        g.lineTo(px + s * 0.024, y - s * hh * 0.75);
        g.lineTo(px + s * 0.024, y - s * 0.03);
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
    g.fillStyle = "#E30A17";
    g.strokeStyle = "#7a0a0f";
    g.lineWidth = s * 0.03;
    g.beginPath();
    g.moveTo(0, -s * 0.05);
    g.quadraticCurveTo(-s * 0.6, -s * 0.2, -s * 1.1, -s * 0.05);
    g.lineTo(-s * 1.05, s * 0.08);
    g.quadraticCurveTo(-s * 0.5, s * 0.02, 0, s * 0.12);
    g.quadraticCurveTo(s * 0.5, s * 0.02, s * 1.05, s * 0.08);
    g.lineTo(s * 1.1, -s * 0.05);
    g.quadraticCurveTo(s * 0.6, -s * 0.2, 0, -s * 0.05);
    g.fill();
    g.stroke();
    crescentStar(g, -s * 0.6, -s * 0.02, s * 0.07, "#fff");
    crescentStar(g, s * 0.55, -s * 0.02, s * 0.07, "#fff");
    g.fillStyle = "#F8FAFC";
    g.beginPath();
    g.ellipse(0, s * 0.05, s * 0.14, s * 0.22, 0, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = "#8B5A3C";
    g.beginPath();
    g.arc(0, -s * 0.08, s * 0.09, 0, TAU);
    g.fill();
    g.fillStyle = "#38B6FF";
    g.beginPath();
    g.ellipse(0, -s * 0.11, s * 0.1, s * 0.04, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#E30A17";
    g.beginPath();
    g.moveTo(0, s * 0.2);
    g.lineTo(-s * 0.03, s * 0.42);
    g.lineTo(s * 0.03, s * 0.42);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(-s * 0.22, s * 0.36);
    g.lineTo(s * 0.22, s * 0.36);
    g.lineTo(s * 0.18, s * 0.42);
    g.lineTo(-s * 0.18, s * 0.42);
    g.closePath();
    g.fill();
    g.restore();
  }
  function seagull(g, x, y, s, t) {
    g.save();
    g.translate(x, y);
    const f = Math.sin(t * 10) * 0.4;
    g.strokeStyle = "#334155";
    g.lineWidth = s * 0.1;
    g.lineCap = "round";
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(0, 0, s * 0.3, s * 0.15, 0, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(-s, -s * f);
    g.quadraticCurveTo(-s * 0.5, -s * 0.5 - s * f, 0, 0);
    g.quadraticCurveTo(s * 0.5, -s * 0.5 - s * f, s, -s * f);
    g.stroke();
    g.fillStyle = "#F59E0B";
    g.beginPath();
    g.moveTo(-s * 0.05, s * 0.05);
    g.lineTo(s * 0.05, s * 0.05);
    g.lineTo(0, s * 0.22);
    g.closePath();
    g.fill();
    g.restore();
  }
  function stormCloud(g, x, y, s, t) {
    cloud(g, x - s * 0.5, y, s, "#475569");
    cloud(g, x - s * 0.4, y - s * 0.1, s * 0.8, "#64748B");
    if (Math.sin(t * 7 + x) > 0.6) {
      g.strokeStyle = "#FFE66D";
      g.lineWidth = s * 0.06;
      g.beginPath();
      g.moveTo(x, y + s * 0.3);
      g.lineTo(x - s * 0.1, y + s * 0.6);
      g.lineTo(x + s * 0.08, y + s * 0.6);
      g.lineTo(x - s * 0.05, y + s * 0.95);
      g.stroke();
    }
  }
  var Game2 = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.px = 0;
      this.py = 0;
      this.bank = 0;
      this.objs = [];
      this.fx = new Particles();
      this.spawnT = 0;
      this.pathX = 0;
      this.pathY = 0;
      this.t = 0;
      this.shake = 0;
      this.speed = 3.2;
      this.waves = 0;
      this.rings = 0;
      this.hits = 0;
      this.streak = 0;
      this.bestStreak = 0;
      this.lines = Array.from({ length: 18 }, () => ({ a: rand(0, TAU), d: rand(0.2, 1), sp: rand(0.8, 1.6) }));
    }
    get S() {
      return Math.min(this.v.w, this.v.h * 1.3) * 0.55;
    }
    proj(x, y, z) {
      const s = this.S / z;
      return { x: this.v.w / 2 + x * s, y: this.v.h * 0.5 + y * s, s };
    }
    spawn() {
      this.pathX = clamp(this.pathX + rand(-0.45, 0.45), -0.85, 0.85);
      this.pathY = clamp(this.pathY + rand(-0.25, 0.25), -0.4, 0.4);
      const r = Math.random();
      if (r < 0.7) this.objs.push({ k: "ring", x: this.pathX, y: this.pathY, z: 12, bonus: Math.random() < 0.2 });
      if (r > 0.55) {
        const ox = clamp(this.pathX + (Math.random() < 0.5 ? -1 : 1) * rand(0.45, 0.7), -1, 1);
        this.objs.push({ k: Math.random() < 0.5 ? "storm" : "gull", x: ox, y: rand(-0.4, 0.3), z: 12.5 });
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
      if (this.spawnT <= 0) {
        this.spawn();
        this.spawnT = 1 - Math.min(0.35, this.t / 120);
      }
      const pz = 1.2;
      for (const o of this.objs) {
        const oz = o.z;
        o.z -= this.speed * dt;
        if (oz >= pz && o.z < pz && !o.hit) {
          const dx = Math.abs(o.x - this.px), dy = Math.abs(o.y - this.py);
          const p = this.proj(this.px, this.py, pz);
          if (o.k === "ring" && dx < 0.27 && dy < 0.27) {
            o.hit = true;
            this.streak++;
            this.rings++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
            const pts = (o.bonus ? 10 : 5) + (this.streak >= 3 ? 2 : 0);
            this.score += pts;
            sfx.coin();
            this.fx.burst(p.x, p.y, ["#FFD23F", "#fff"], 20, this.v.u * 50, this.v.u * 1.3, "star");
            this.fx.text(p.x, p.y - this.v.u * 10, this.streak >= 3 ? `S\xFCper seri! +${pts}` : "+" + pts, "#FFD23F", this.v.u * 7);
          } else if (o.k !== "ring" && dx < 0.22 && dy < 0.22) {
            o.hit = true;
            this.score = Math.max(0, this.score - 3);
            this.shake = 0.5;
            this.hits++;
            this.streak = 0;
            this.v.hit?.();
            sfx.bump();
            this.fx.text(p.x, p.y - this.v.u * 10, "-3", "#EF476F", this.v.u * 7);
          }
        }
      }
      for (const o of this.objs) if (o.k === "ring" && !o.hit && !o.missed && o.z < 1) {
        o.missed = true;
        this.streak = 0;
      }
      this.objs = this.objs.filter((o) => o.z > 0.3);
      for (const l of this.lines) {
        l.d += l.sp * dt * (this.speed / 3);
        if (l.d > 1.2) {
          l.d = 0.2;
          l.a = rand(0, TAU);
        }
      }
      this.shake = Math.max(0, this.shake - dt);
      this.fx.update(dt);
    }
    draw(g, inp, t) {
      const { w, h } = this.v;
      g.save();
      if (this.shake > 0) g.translate(rand(-1, 1) * this.shake * 14, rand(-1, 1) * this.shake * 14);
      g.translate(w / 2, h / 2);
      g.rotate(-this.bank * 0.25);
      g.translate(-w / 2, -h / 2);
      const horizon = h * (0.62 - this.py * 0.12);
      const big = Math.max(w, h) * 1.5;
      const sg = g.createLinearGradient(0, horizon - h, 0, horizon);
      sg.addColorStop(0, "#2E86DE");
      sg.addColorStop(0.7, "#9BD3FF");
      sg.addColorStop(1, "#FFE0B5");
      g.fillStyle = sg;
      g.fillRect(-big, -big, big * 3, horizon + big);
      sunGlow(g, w * 0.2, horizon - h * 0.28, Math.min(w, h) * 0.05, t);
      for (let i = 0; i < 4; i++) cloud(g, (i * 0.31 + t * 0.01) % 1.2 * w - w * 0.1, horizon - h * (0.35 + i % 2 * 0.12), Math.min(w, h) * 0.09, "rgba(255,255,255,0.85)");
      skyline(g, w, horizon, Math.min(w * 1.2, h) * 0.8, "#8A9CC0");
      fogBand(g, w * 3, horizon - h * 0.02, h * 0.05, "220,235,255", 0.6);
      skyline(g, w, horizon, Math.min(w * 1.2, h), "#3F4C6B");
      const seaG = g.createLinearGradient(0, horizon, 0, h);
      seaG.addColorStop(0, "#3B82C4");
      seaG.addColorStop(1, "#0B4F8A");
      g.fillStyle = seaG;
      g.fillRect(-big, horizon, big * 3, big);
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const zz = ((i / 14 - t * 0.25) % 1 + 1) % 1;
        const yy = horizon + (h - horizon) * zz * zz;
        const ww = 10 + zz * 40;
        for (let k = -3; k <= 3; k++) {
          const xx = w / 2 + k * w * 0.18 * (0.3 + zz) + i * 37 % 20;
          g.beginPath();
          g.moveTo(xx - ww, yy);
          g.lineTo(xx + ww, yy);
          g.stroke();
        }
      }
      fogBand(g, w * 3, horizon + h * 0.01, h * 0.06, "200,225,255", 0.7);
      const sorted = this.objs.slice().sort((a, b) => b.z - a.z);
      for (const o of sorted) {
        if (o.z < 1) continue;
        const p2 = this.proj(o.x, o.y, o.z);
        const a = clamp((12.5 - o.z) / 4, 0, 1);
        g.globalAlpha = a * a;
        if (o.k === "ring") {
          const r = 0.27 * p2.s;
          g.lineWidth = Math.max(3, r * 0.18);
          g.strokeStyle = o.hit ? "#06D6A0" : o.bonus ? "#FF5DA2" : "#FFC300";
          g.shadowColor = g.strokeStyle;
          g.shadowBlur = 15;
          g.beginPath();
          g.arc(p2.x, p2.y, r, 0, TAU);
          g.stroke();
          g.shadowBlur = 0;
          g.lineWidth = Math.max(1, r * 0.05);
          g.strokeStyle = "#fff";
          g.beginPath();
          g.arc(p2.x, p2.y, r * 0.85, Math.PI * 1.1, Math.PI * 1.5);
          g.stroke();
          if (o.bonus) star(g, p2.x, p2.y, r * 0.3, "#FFD23F", null);
        } else if (o.k === "storm") stormCloud(g, p2.x, p2.y, 0.25 * p2.s, t);
        else seagull(g, p2.x, p2.y, 0.15 * p2.s, t + o.x * 3);
      }
      g.globalAlpha = 1;
      g.restore();
      g.strokeStyle = "rgba(255,255,255,0.5)";
      g.lineWidth = 2;
      g.lineCap = "round";
      for (const l of this.lines) {
        const r0 = l.d * Math.max(w, h) * 0.6, r1 = r0 + 20 + l.d * 40;
        g.globalAlpha = clamp(l.d - 0.3, 0, 0.6);
        g.beginPath();
        g.moveTo(w / 2 + Math.cos(l.a) * r0, h / 2 + Math.sin(l.a) * r0);
        g.lineTo(w / 2 + Math.cos(l.a) * r1, h / 2 + Math.sin(l.a) * r1);
        g.stroke();
      }
      g.globalAlpha = 1;
      const p = this.proj(this.px, this.py, 1.2);
      g.fillStyle = "rgba(10,40,80,0.25)";
      g.beginPath();
      g.ellipse(p.x, h * 0.93, Math.min(w, h) * 0.12 * (1 - this.py * 0.3), Math.min(w, h) * 0.02, 0, 0, TAU);
      g.fill();
      glider(g, p.x, p.y, Math.min(w, h) * 0.17, this.bank * 0.9);
      this.fx.draw(g);
      vignette(g, w, h, 0.25, "10,30,70");
    }
    speedKmh() {
      return this.speed * 28;
    }
    stats() {
      return [
        { icon: "\u2B55", label: "Halka", value: this.rings },
        { icon: "\u{1F525}", label: "En iyi seri", value: this.bestStreak },
        { icon: "\u26C8\uFE0F", label: "\xC7arpma", value: this.hits },
        { icon: "\u26A1", label: "Seri", value: this.streak }
      ];
    }
  };
  var hezarfen_default = {
    id: "hezarfen",
    title: "Hezarfen'in U\xE7u\u015Fu",
    tagline: "U\xE7ak sensin!",
    description: "Kollar\u0131n\u0131 iki yana a\xE7: art\u0131k bir plan\xF6rs\xFCn! Kollar\u0131n\u0131 sa\u011Fa sola e\u011Ferek \u0130stanbul semalar\u0131ndaki alt\u0131n halkalardan ge\xE7. F\u0131rt\u0131na bulutlar\u0131ndan ve mart\u0131lardan uzak dur. Kollar\u0131 yukar\u0131 kald\u0131r\u0131nca y\xFCkselir, a\u015Fa\u011F\u0131 indirince al\xE7al\u0131rs\u0131n.",
    howto: ["Kollar\u0131n\u0131 iki yana a\xE7", "E\u011Fil: sa\u011Fa-sola d\xF6n", "Kollar yukar\u0131: y\xFCksel", "Bulut ve mart\u0131 -3"],
    color: "#2E86DE",
    emoji: "\u{1F6E9}\uFE0F",
    duration: 60,
    camAlpha: 0,
    skeleton: false,
    cursors: false,
    stars: [40, 90, 150],
    hint: "Kollar\u0131n\u0131 iki yana a\xE7!",
    create: (v) => new Game2(v),
    thumb(g, w, h, t) {
      skyGradient(g, w, h, "#2E86DE", "#FFE0B5", 0, h * 0.62);
      g.fillStyle = "#0B4F8A";
      g.fillRect(0, h * 0.62, w, h);
      skyline(g, w, h * 0.62, h, "#3F4C6B");
      g.strokeStyle = "#FFC300";
      g.lineWidth = 5;
      g.beginPath();
      g.arc(w * 0.62, h * 0.4, h * 0.16, 0, TAU);
      g.stroke();
      glider(g, w * 0.45 + Math.sin(t) * w * 0.05, h * 0.68, h * 0.28, Math.sin(t) * 0.3);
    }
  };

  // js/games/lokanta.js
  var ING = {
    hamur: ["\u{1FAD3}", "Hamur"],
    kiyma: ["\u{1F969}", "K\u0131yma"],
    domates: ["\u{1F345}", "Domates"],
    sogan: ["\u{1F9C5}", "So\u011Fan"],
    maydanoz: ["\u{1F33F}", "Maydanoz"],
    limon: ["\u{1F34B}", "Limon"],
    yumurta: ["\u{1F95A}", "Yumurta"],
    biber: ["\u{1FAD1}", "Biber"],
    marul: ["\u{1F96C}", "Marul"],
    peynir: ["\u{1F9C0}", "Peynir"],
    sucuk: ["\u{1F32D}", "Sucuk"],
    salatalik: ["\u{1F952}", "Salatal\u0131k"],
    zeytin: ["\u{1FAD2}", "Zeytin"],
    simit: ["\u{1F96F}", "Simit"],
    dondurma: ["\u{1F366}", "Dondurma"],
    cilek: ["\u{1F353}", "\xC7ilek"],
    cikolata: ["\u{1F36B}", "\xC7ikolata"],
    fistik: ["\u{1F95C}", "F\u0131st\u0131k"],
    cay: ["\u{1F375}", "\xC7ay"]
  };
  var DISHES = [
    { name: "Lahmacun", steps: ["hamur", "kiyma", "domates", "maydanoz", "limon"] },
    { name: "Menemen", steps: ["domates", "biber", "yumurta"] },
    { name: "D\xFCr\xFCm", steps: ["hamur", "kiyma", "marul", "domates"] },
    { name: "Sucuklu Pide", steps: ["hamur", "peynir", "sucuk", "yumurta"] },
    { name: "\xC7oban Salata", steps: ["domates", "salatalik", "biber", "sogan", "limon"] },
    { name: "Kahvalt\u0131", steps: ["simit", "peynir", "zeytin", "domates", "cay"] },
    { name: "Mara\u015F Dondurma", steps: ["dondurma", "cilek", "fistik"] },
    { name: "\xC7ikolatal\u0131 Dondurma", steps: ["dondurma", "cikolata", "fistik"] },
    { name: "Peynirli Pide", steps: ["hamur", "peynir", "yumurta"] }
  ];
  var CUSTOMERS = ["kedi", "kangal", "tavsan", "ayi", "kuzu", "tilki", "kaplumbaga", "leylek"];
  var NAMES = { kedi: "Tekir", kangal: "Karaba\u015F", tavsan: "Pamuk", ayi: "Boz", kuzu: "Kuzucuk", tilki: "K\u0131z\u0131l", kaplumbaga: "Yava\u015F", leylek: "Lak Lak" };
  var SLOTS = [[0.12, 0.3], [0.1, 0.52], [0.12, 0.74], [0.88, 0.3], [0.9, 0.52], [0.88, 0.74], [0.33, 0.36], [0.67, 0.36]];
  var Game3 = class {
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
      do
        dish = pick(DISHES);
      while (dish === prevDish);
      this.dish = dish;
      this.step = 0;
      this.animal = pick(CUSTOMERS);
      this.patienceMax = Math.max(14, 28 - this.served * 1.2) / this.v.diff;
      this.patience = this.patienceMax;
      this.state = "order";
      this.stateT = 0;
      this.enterT = 0;
      const others = shuffle(Object.keys(ING).filter((k) => !dish.steps.includes(k)));
      const keys = shuffle([...new Set(dish.steps)].concat(others).slice(0, SLOTS.length));
      this.bins = keys.map((k, i) => ({ k, x: SLOTS[i][0], y: SLOTS[i][1], dwell: 0, cool: 0, shake: 0 }));
      if (!first && this.v.players === 1) say(`${dish.name} l\xFCtfen!`);
    }
    update(dt, inp) {
      this.enterT += dt;
      this.stateT += dt;
      const { w, h, u } = this.v;
      const R = Math.min(w, h) * 0.085;
      if (this.state === "order") {
        this.patience -= dt;
        if (this.patience <= 0) {
          this.state = "sad";
          this.stateT = 0;
          this.lost++;
          sfx.bad();
        }
      } else if (this.stateT > 1.6) this.newCustomer();
      for (const b of this.bins) {
        b.cool -= dt;
        b.shake = Math.max(0, b.shake - dt);
        const bx = b.x * w, by = b.y * h;
        let over = false;
        if (inp.present && this.state === "order") {
          for (const hd of inp.hands) if (hd.visible && dist(hd, { x: bx, y: by }) < R * 1.1) over = true;
        }
        if (over && b.cool <= 0) {
          b.dwell += dt;
          if (b.dwell > 0.18) {
            b.dwell = 0;
            b.cool = 0.8;
            if (this.dish.steps[this.step] === b.k) {
              this.step++;
              sfx.tap(this.step);
              this.flying.push({ k: b.k, x0: bx, y0: by, t: 0 });
              if (this.step >= this.dish.steps.length) {
                const bonus = Math.ceil(this.patience / this.patienceMax * 5);
                this.tips += bonus;
                const pts = 10 + bonus;
                this.score += pts;
                this.served++;
                this.state = "happy";
                this.stateT = 0;
                sfx.good();
                this.fx.burst(w / 2, h * 0.82, ["#FFD23F", "#06D6A0", "#EF476F"], 30, u * 60, u * 1.3, "star");
                this.fx.text(w / 2, h * 0.68, `+${pts}`, "#FFD23F", u * 9);
              }
            } else {
              b.shake = 0.4;
              this.wrong++;
              this.score = Math.max(0, this.score - 1);
              this.v.hit?.();
              this.fx.text(bx, by - R, "Hop! -1", "#EF476F", u * 5);
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
      g.fillStyle = "#FFF4E0";
      g.fillRect(0, 0, w, h);
      const tile = Math.max(30, Math.min(w, h) * 0.09);
      for (let y = 0; y < h * 0.8; y += tile) for (let x = 0; x < w; x += tile) {
        g.fillStyle = (x / tile + y / tile | 0) % 2 ? "#E9F3FB" : "#FFF8EA";
        g.fillRect(x, y, tile, tile);
        g.strokeStyle = "#3A86C8";
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x + tile / 2, y + tile * 0.15);
        g.quadraticCurveTo(x + tile * 0.85, y + tile / 2, x + tile / 2, y + tile * 0.85);
        g.quadraticCurveTo(x + tile * 0.15, y + tile / 2, x + tile / 2, y + tile * 0.15);
        g.stroke();
      }
      const aw = h * 0.07, sw = Math.max(40, w / 10);
      for (let x = 0, i = 0; x < w; x += sw, i++) {
        g.fillStyle = i % 2 ? "#fff" : "#E63946";
        g.fillRect(x, 0, sw, aw);
        g.beginPath();
        g.arc(x + sw / 2, aw, sw / 2, 0, Math.PI);
        g.fill();
      }
      g.fillStyle = "rgba(0,0,0,0.08)";
      g.fillRect(0, aw + sw / 2, w, 6);
      const sy = h * 0.62, sx = w * 0.04, sl = Math.min(w * 0.2, h * 0.3);
      g.fillStyle = "#8B5A2B";
      g.fillRect(sx, sy, sl, h * 0.015);
      emoji(g, "\u{1FAD6}", sx + sl * 0.18, sy - h * 0.03, h * 0.05);
      emoji(g, "\u{1F96F}", sx + sl * 0.5, sy - h * 0.025, h * 0.045);
      emoji(g, "\u{1FAD9}", sx + sl * 0.82, sy - h * 0.03, h * 0.05);
      g.fillStyle = "#B5651D";
      g.fillRect(0, h * 0.8, w, h * 0.2);
      g.fillStyle = "#8B4513";
      g.fillRect(0, h * 0.8, w, h * 0.025);
      g.fillStyle = "rgba(255,255,255,0.08)";
      for (let x = 0; x < w; x += 60) g.fillRect(x, h * 0.83, 30, h * 0.17);
    }
    stats() {
      return [
        { icon: "\u{1F37D}\uFE0F", label: "Servis", value: this.served },
        { icon: "\u{1F4B0}", label: "Bah\u015Fi\u015F", value: this.tips },
        { icon: "\u274C", label: "Yanl\u0131\u015F", value: this.wrong },
        { icon: "\u{1F622}", label: "Ka\xE7an", value: this.lost }
      ];
    }
    drawOver(g) {
      const { w, h, u } = this.v;
      const m = Math.min(w, h);
      const R = m * 0.085;
      const slide = easeOut(clamp(this.enterT * 2, 0, 1));
      const cx = w / 2 + (1 - slide) * w * 0.6 + (this.state !== "order" && this.stateT > 1 ? (this.stateT - 1) * w * 1.5 : 0);
      const mood = this.state === "happy" ? "happy" : this.state === "sad" || this.patience < this.patienceMax * 0.3 ? "sad" : "neutral";
      g.fillStyle = ["#FFC93C", "#38B6FF", "#FF8FA3", "#8BE3B9"][this.served % 4];
      rr(g, cx - m * 0.09, h * 0.87 + m * 0.04, m * 0.18, m * 0.2, m * 0.06);
      g.fill();
      g.fillStyle = "#E63946";
      g.beginPath();
      g.moveTo(cx, h * 0.87 + m * 0.07);
      g.lineTo(cx - m * 0.03, h * 0.87 + m * 0.05);
      g.lineTo(cx - m * 0.03, h * 0.87 + m * 0.09);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(cx, h * 0.87 + m * 0.07);
      g.lineTo(cx + m * 0.03, h * 0.87 + m * 0.05);
      g.lineTo(cx + m * 0.03, h * 0.87 + m * 0.09);
      g.closePath();
      g.fill();
      animalFace(g, this.animal, cx, h * 0.87, m * 0.075, mood);
      text(g, NAMES[this.animal], cx, h * 0.97, m * 0.035, "#fff");
      g.fillStyle = "#fff";
      g.beginPath();
      g.ellipse(cx + m * 0.17, h * 0.9, m * 0.08, m * 0.025, 0, 0, TAU);
      g.fill();
      for (let i = 0; i < this.step; i++) emoji(g, ING[this.dish.steps[i]][0], cx + m * 0.17 + (i - (this.step - 1) / 2) * m * 0.025, h * 0.88 - i * m * 0.01, m * 0.05);
      if (this.state === "sad") text(g, "\xC7ok bekledim\u2026 \u{1F622}", w / 2, h * 0.7, m * 0.05, "#fff");
      if (this.state === "happy") text(g, "Afiyet olsun! \u{1F60B}", w / 2, h * 0.7, m * 0.055, "#FFD23F");
      const steps = this.dish.steps;
      const iw = Math.min(m * 0.1, w * 0.9 / (steps.length + 0.5));
      const bw = iw * steps.length + iw * 0.6, bh = iw * 1.7;
      const bx = w / 2 - bw / 2, by = h * 0.1;
      g.fillStyle = "rgba(255,255,255,0.96)";
      rr(g, bx, by, bw, bh, iw * 0.3);
      g.fill();
      g.strokeStyle = "#0F172A";
      g.lineWidth = 3;
      g.stroke();
      text(g, this.dish.name, w / 2, by + iw * 0.38, iw * 0.38, "#0F172A", { stroke: null, weight: 800 });
      steps.forEach((k, i) => {
        const x = bx + iw * 0.3 + iw * (i + 0.5), y = by + iw * 1.1;
        g.globalAlpha = i < this.step ? 0.35 : 1;
        if (i === this.step && this.state === "order") {
          g.fillStyle = "#FFE066";
          g.beginPath();
          g.arc(x, y, iw * 0.46, 0, TAU);
          g.fill();
        }
        emoji(g, ING[k][0], x, y, iw * 0.62);
        g.globalAlpha = 1;
        if (i < steps.length - 1) text(g, "\u203A", x + iw * 0.5, y, iw * 0.4, "#94A3B8", { stroke: null });
        g.fillStyle = "#12213B";
        g.beginPath();
        g.arc(x - iw * 0.32, y - iw * 0.32, iw * 0.15, 0, TAU);
        g.fill();
        text(g, String(i + 1), x - iw * 0.32, y - iw * 0.31, iw * 0.2, "#fff", { stroke: null });
        if (i < this.step) text(g, "\u2714", x + iw * 0.25, y - iw * 0.2, iw * 0.4, "#06D6A0");
      });
      const pk = clamp(this.patience / this.patienceMax, 0, 1);
      g.fillStyle = "#E2E8F0";
      rr(g, bx, by + bh + 4, bw, 8, 4);
      g.fill();
      g.fillStyle = pk > 0.5 ? "#06D6A0" : pk > 0.25 ? "#FFC300" : "#EF476F";
      rr(g, bx, by + bh + 4, bw * pk, 8, 4);
      g.fill();
      const next = this.dish.steps[this.step];
      for (const b of this.bins) {
        const x = b.x * w + (b.shake > 0 ? Math.sin(b.shake * 60) * 6 : 0), y = b.y * h;
        g.fillStyle = b.k === next && this.state === "order" ? "#FFF3B0" : "#FFFFFF";
        g.strokeStyle = "#E07A2E";
        g.lineWidth = 4;
        g.beginPath();
        g.arc(x, y, R, 0, TAU);
        g.fill();
        g.stroke();
        if (b.dwell > 0) {
          g.strokeStyle = "#06D6A0";
          g.lineWidth = 6;
          g.beginPath();
          g.arc(x, y, R + 4, -Math.PI / 2, -Math.PI / 2 + b.dwell / 0.18 * TAU);
          g.stroke();
        }
        emoji(g, ING[b.k][0], x, y - R * 0.08, R * 1.05);
        text(g, ING[b.k][1], x, y + R * 0.78, Math.max(11, R * 0.32), "#fff", { sw: 4 });
      }
      for (const f of this.flying) {
        const t = easeOut(f.t);
        const x = f.x0 + (cx + m * 0.17 - f.x0) * t;
        const y = f.y0 + (h * 0.88 - f.y0) * t - Math.sin(t * Math.PI) * h * 0.15;
        emoji(g, ING[f.k][0], x, y, R * (1 - t * 0.5));
      }
      this.fx.draw(g);
      vignette(g, w, h, 0.15, "120,60,20");
    }
  };
  var lokanta_default = {
    id: "lokanta",
    title: "Minik Lokanta",
    tagline: "Ac\u0131kt\u0131k! \xC7abuk pi\u015Fir!",
    description: "Sevimli hayvan m\xFC\u015Fteriler lokantana geliyor ve lahmacun, menemen, d\xFCr\xFCm, pide ya da Mara\u015F dondurmas\u0131 istiyor. Sipari\u015Fteki malzemelere ellerinle do\u011Fru s\u0131rayla dokun, m\xFC\u015Fteri sab\u0131rs\u0131zlanmadan servis et!",
    howto: ["Sipari\u015Fe bak", "Malzemeye elinle dokun", "S\u0131ray\u0131 kar\u0131\u015Ft\u0131rma: yanl\u0131\u015F -1", "\xC7abuk ol, bah\u015Fi\u015F kazan!"],
    color: "#E07A2E",
    emoji: "\u{1F959}",
    duration: 90,
    camAlpha: 0.28,
    stars: [40, 90, 150],
    hint: "Sar\u0131 yanan malzemeye dokun!",
    create: (v) => new Game3(v),
    thumb(g, w, h, t) {
      g.fillStyle = "#FFF4E0";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#B5651D";
      g.fillRect(0, h * 0.72, w, h * 0.28);
      animalFace(g, "kangal", w * 0.3, h * 0.6, h * 0.17, Math.sin(t * 2) > 0 ? "happy" : "neutral");
      ["\u{1FAD3}", "\u{1F345}", "\u{1F969}", "\u{1F34B}"].forEach((e, i) => {
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(w * (0.58 + i % 2 * 0.2), h * (0.25 + Math.floor(i / 2) * 0.32), h * 0.12, 0, TAU);
        g.fill();
        emoji(g, e, w * (0.58 + i % 2 * 0.2), h * (0.25 + Math.floor(i / 2) * 0.32), h * 0.15);
      });
    }
  };

  // js/games/hasat.js
  var FRUITS = [
    { k: "kayisi", name: "Malatya kay\u0131s\u0131s\u0131", leaves: "#3E8E41" },
    { k: "kiraz", name: "Kiraz", leaves: "#2F7D32" },
    { k: "incir", name: "\u0130ncir", leaves: "#4C9A2A" },
    { k: "nar", name: "Nar", leaves: "#2E7D4F" },
    { k: "portakal", name: "Portakal", leaves: "#2C7A3A" },
    { k: "elma", name: "Amasya elmas\u0131", leaves: "#3B8F3B" }
  ];
  function drawFruit(g, k, x, y, r, rot = 0) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    const shine = () => {
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.beginPath();
      g.ellipse(-r * 0.35, -r * 0.35, r * 0.2, r * 0.13, -0.6, 0, TAU);
      g.fill();
    };
    const leaf = (lx, ly, a = -0.6) => {
      g.fillStyle = "#3BAA4A";
      g.beginPath();
      g.ellipse(lx, ly, r * 0.32, r * 0.14, a, 0, TAU);
      g.fill();
    };
    g.strokeStyle = "rgba(0,0,0,0.25)";
    g.lineWidth = Math.max(1, r * 0.06);
    if (k === "kayisi") {
      g.fillStyle = "#FFA62B";
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.fill();
      g.stroke();
      g.fillStyle = "rgba(230,80,30,0.45)";
      g.beginPath();
      g.arc(r * 0.3, r * 0.2, r * 0.55, 0, TAU);
      g.fill();
      g.strokeStyle = "rgba(160,70,0,0.4)";
      g.beginPath();
      g.moveTo(0, -r);
      g.quadraticCurveTo(-r * 0.3, 0, 0, r);
      g.stroke();
      shine();
      leaf(r * 0.3, -r * 1);
    } else if (k === "kiraz") {
      g.strokeStyle = "#4C7A2A";
      g.lineWidth = r * 0.12;
      g.beginPath();
      g.moveTo(-r * 0.5, 0);
      g.quadraticCurveTo(-r * 0.2, -r * 1.2, r * 0.2, -r * 1.4);
      g.moveTo(r * 0.55, r * 0.1);
      g.quadraticCurveTo(r * 0.4, -r * 0.8, r * 0.2, -r * 1.4);
      g.stroke();
      for (const [cx, cy] of [[-r * 0.5, r * 0.1], [r * 0.55, r * 0.2]]) {
        g.fillStyle = "#C1121F";
        g.beginPath();
        g.arc(cx, cy, r * 0.6, 0, TAU);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.5)";
        g.beginPath();
        g.arc(cx - r * 0.2, cy - r * 0.2, r * 0.13, 0, TAU);
        g.fill();
      }
      leaf(r * 0.45, -r * 1.35, 0.4);
    } else if (k === "incir") {
      g.fillStyle = "#6A2C70";
      g.beginPath();
      g.moveTo(0, -r * 1.1);
      g.bezierCurveTo(r * 0.5, -r * 0.6, r * 1.05, r * 0.2, r * 0.6, r * 0.8);
      g.quadraticCurveTo(0, r * 1.15, -r * 0.6, r * 0.8);
      g.bezierCurveTo(-r * 1.05, r * 0.2, -r * 0.5, -r * 0.6, 0, -r * 1.1);
      g.fill();
      g.stroke();
      g.fillStyle = "#9B4F96";
      g.beginPath();
      g.ellipse(r * 0.2, r * 0.3, r * 0.35, r * 0.45, 0, 0, TAU);
      g.fill();
      g.fillStyle = "#4C7A2A";
      g.fillRect(-r * 0.08, -r * 1.3, r * 0.16, r * 0.3);
      shine();
    } else if (k === "nar") {
      g.fillStyle = "#B5172B";
      g.beginPath();
      g.arc(0, r * 0.05, r, 0, TAU);
      g.fill();
      g.stroke();
      g.fillStyle = "#8E0E20";
      g.beginPath();
      g.moveTo(-r * 0.3, -r * 0.85);
      g.lineTo(-r * 0.35, -r * 1.2);
      g.lineTo(-r * 0.12, -r * 1);
      g.lineTo(0, -r * 1.3);
      g.lineTo(r * 0.12, -r * 1);
      g.lineTo(r * 0.35, -r * 1.2);
      g.lineTo(r * 0.3, -r * 0.85);
      g.closePath();
      g.fill();
      g.fillStyle = "rgba(255,140,120,0.4)";
      g.beginPath();
      g.arc(r * 0.35, r * 0.3, r * 0.4, 0, TAU);
      g.fill();
      shine();
    } else if (k === "portakal") {
      g.fillStyle = "#FB8500";
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.fill();
      g.stroke();
      g.fillStyle = "rgba(255,200,80,0.6)";
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.arc(Math.cos(i) * r * 0.5, Math.sin(i * 2) * r * 0.5, r * 0.06, 0, TAU);
        g.fill();
      }
      shine();
      leaf(r * 0.25, -r * 1);
    } else {
      g.fillStyle = "#E63946";
      g.beginPath();
      g.moveTo(0, -r * 0.7);
      g.bezierCurveTo(r * 0.8, -r * 1.2, r * 1.3, r * 0.2, r * 0.5, r * 0.9);
      g.quadraticCurveTo(0, r * 1.05, -r * 0.5, r * 0.9);
      g.bezierCurveTo(-r * 1.3, r * 0.2, -r * 0.8, -r * 1.2, 0, -r * 0.7);
      g.fill();
      g.stroke();
      g.fillStyle = "#5b3a1e";
      g.fillRect(-r * 0.06, -r * 1.05, r * 0.12, r * 0.4);
      shine();
      leaf(r * 0.3, -r * 0.95);
    }
    g.restore();
  }
  function drawTree(g, x, baseY, s, leaves, shakeA) {
    g.save();
    g.translate(x, baseY);
    g.fillStyle = "#7A4B2A";
    g.beginPath();
    g.moveTo(-s * 0.08, 0);
    g.lineTo(-s * 0.05, -s * 0.55);
    g.lineTo(-s * 0.25, -s * 0.8);
    g.lineTo(-s * 0.2, -s * 0.83);
    g.lineTo(0, -s * 0.62);
    g.lineTo(s * 0.22, -s * 0.85);
    g.lineTo(s * 0.26, -s * 0.8);
    g.lineTo(s * 0.05, -s * 0.55);
    g.lineTo(s * 0.08, 0);
    g.closePath();
    g.fill();
    g.rotate(Math.sin(shakeA) * 0.03);
    const blobs = [[0, -1.15, 0.5], [-0.45, -0.95, 0.38], [0.45, -0.95, 0.38], [-0.3, -1.35, 0.35], [0.3, -1.35, 0.35], [-0.6, -0.7, 0.28], [0.6, -0.7, 0.28], [0, -0.8, 0.4]];
    for (const [bx, by, br] of blobs) {
      g.fillStyle = leaves;
      g.beginPath();
      g.arc(bx * s, by * s, br * s, 0, TAU);
      g.fill();
    }
    g.fillStyle = "rgba(255,255,255,0.08)";
    for (const [bx, by, br] of blobs) {
      g.beginPath();
      g.arc(bx * s - br * s * 0.3, by * s - br * s * 0.3, br * s * 0.5, 0, TAU);
      g.fill();
    }
    g.restore();
  }
  var Game4 = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.fx = new Particles();
      this.treeIdx = Math.floor(Math.random() * FRUITS.length);
      this.flying = [];
      this.falling = [];
      this.basket = 0;
      this.picked = 0;
      this.caught = 0;
      this.trees = 0;
      this.stung = 0;
      this.bees = [];
      this.t = 0;
      this.newTree();
    }
    get tree() {
      return FRUITS[this.treeIdx % FRUITS.length];
    }
    newTree() {
      this.treeIdx++;
      this.enterT = 0;
      this.windT = rand(5, 8);
      this.shakeA = 0;
      this.fruits = [];
      const n = 10;
      let tries = 0;
      while (this.fruits.length < n && tries++ < 400) {
        const a = rand(0, TAU), rr2 = Math.sqrt(Math.random());
        const fx = Math.cos(a) * rr2 * 0.72, fy = -1.05 + Math.sin(a) * rr2 * 0.48;
        if (this.fruits.some((f) => Math.hypot(f.fx - fx, f.fy - fy) < 0.2)) continue;
        this.fruits.push({ fx, fy, ph: rand(0, TAU) });
      }
      if (this.v.players === 1 && this.treeIdx > 1) say(this.tree.name + " a\u011Fac\u0131!");
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
      const hands2 = inp.present ? inp.hands.filter((hd) => hd.visible) : [];
      if (this.windT <= 0 && this.fruits.length) {
        this.windT = rand(6, 9);
        sfx.whoosh();
        const k = Math.min(this.fruits.length, Math.random() < 0.5 ? 2 : 3);
        const free = this.fruits.filter((f) => !f.wobble);
        for (let i = 0; i < k && free.length; i++) free.splice(Math.floor(Math.random() * free.length), 1)[0].wobble = 1.2;
      }
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
      for (const f of this.fruits) {
        const p = this.fruitPos(f);
        for (const hd of hands2) if (!f.dead && dist(p, hd) < (fr * 1.6 + 10) / this.v.diff) {
          f.dead = true;
          this.score += 1;
          this.picked++;
          sfx.pop();
          this.fx.burst(p.x, p.y, ["#FFD23F", "#fff", "#06D6A0"], 10, u * 30, u * 0.9, "star");
          this.flying.push({ x0: p.x, y0: p.y, t: 0 });
        }
      }
      this.fruits = this.fruits.filter((f) => !f.dead);
      for (const f of this.falling) {
        f.vy += h * 0.55 * dt;
        f.y += f.vy * dt;
        f.x += f.vx * dt;
        f.rot += dt * 3;
        for (const hd of hands2) if (!f.dead && dist(f, hd) < fr * 2) {
          f.dead = true;
          this.score += 2;
          this.caught++;
          sfx.coin();
          this.fx.text(f.x, f.y - fr, "+2 Yakalad\u0131n!", "#FFD23F", u * 5);
          this.flying.push({ x0: f.x, y0: f.y, t: 0 });
        }
        if (!f.dead && f.y > h * 0.92) {
          f.dead = true;
          this.fx.burst(f.x, h * 0.92, ["#A0522D", "#FFA62B"], 8, u * 20, u * 0.8);
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
        this.fx.text(w / 2, h * 0.3, "A\u011Fa\xE7 bitti! +5", "#06D6A0", u * 8);
      }
      if (this.clearT) {
        this.clearT -= dt;
        if (this.clearT <= 0) {
          this.clearT = 0;
          this.newTree();
        }
      }
      this.t += dt;
      if (this.bees.length < (this.t > 20 ? 2 : 1) && this.t > 6) this.bees.push({ a: rand(0, TAU), sp: rand(0.6, 1) * this.v.diff * (Math.random() < 0.5 ? 1 : -1), r: rand(0.3, 0.55), cool: 0 });
      const g0 = this.geom();
      for (const b of this.bees) {
        b.a += b.sp * dt;
        b.cool -= dt;
        b.x = g0.tx + Math.cos(b.a) * g0.s * b.r * 1.3;
        b.y = g0.ty - g0.s * 1 + Math.sin(b.a * 1.7) * g0.s * b.r * 0.6;
        for (const hd of hands2) if (b.cool <= 0 && dist(b, hd) < u * 6) {
          b.cool = 1.5;
          this.stung++;
          this.score = Math.max(0, this.score - 2);
          sfx.bad();
          this.v.hit?.();
          this.fx.text(b.x, b.y - u * 6, "V\u0131zzz! -2", "#EF476F", u * 5);
          b.sp *= -1;
        }
      }
      this.fx.update(dt);
    }
    stats() {
      return [
        { icon: "\u{1F351}", label: "Toplanan", value: this.picked },
        { icon: "\u{1F9FA}", label: "Yakalanan", value: this.caught },
        { icon: "\u{1F333}", label: "A\u011Fa\xE7", value: this.trees },
        { icon: "\u{1F41D}", label: "Ar\u0131", value: this.stung }
      ];
    }
    draw(g, inp, t) {
      const { w, h } = this.v;
      skyGradient(g, w, h, "#7EC8F2", "#D9F2FF");
      sunGlow(g, w * 0.85, h * 0.1, Math.min(w, h) * 0.05, t);
      for (let i = 0; i < 3; i++) cloud(g, (i * 0.4 + t * 0.01) % 1.3 * w - w * 0.1, h * (0.08 + i * 0.06), Math.min(w, h) * 0.08);
      g.fillStyle = "#9BD770";
      g.beginPath();
      g.moveTo(0, h * 0.7);
      g.quadraticCurveTo(w * 0.3, h * 0.55, w * 0.6, h * 0.7);
      g.quadraticCurveTo(w * 0.85, h * 0.6, w, h * 0.68);
      g.lineTo(w, h);
      g.lineTo(0, h);
      g.fill();
      g.fillStyle = "#B9DDA0";
      g.beginPath();
      g.moveTo(0, h * 0.66);
      g.quadraticCurveTo(w * 0.5, h * 0.5, w, h * 0.64);
      g.lineTo(w, h * 0.7);
      g.lineTo(0, h * 0.7);
      g.fill();
      fogBand(g, w, h * 0.66, h * 0.06, "235,248,255", 0.6);
      for (let i = 0; i < 6; i++) drawTree(g, w * (i / 5), h * 0.74, Math.min(w, h) * 0.12, "#6DBE45", 0);
      g.fillStyle = "#7CC24F";
      g.fillRect(0, h * 0.86, w, h * 0.14);
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
      for (const b of this.bees) if (b.x !== void 0) {
        g.globalAlpha = b.cool > 0 ? 0.5 : 1;
        g.save();
        g.translate(b.x, b.y);
        g.scale(b.sp > 0 ? -1 : 1, 1);
        bee(g, 0, 0, u * 3.5, this.t);
        g.restore();
        g.globalAlpha = 1;
      }
      const bx = w * 0.5, by = h * 0.95, bw = Math.min(w, h) * 0.22;
      for (const f of this.flying) {
        const k = easeOut(f.t);
        drawFruit(g, this.tree.k, f.x0 + (bx - f.x0) * k, f.y0 + (by - bw * 0.2 - f.y0) * k - Math.sin(k * Math.PI) * h * 0.1, fr * (1 - k * 0.3));
      }
      g.fillStyle = "#C68642";
      g.beginPath();
      g.moveTo(bx - bw / 2, by - bw * 0.25);
      g.lineTo(bx + bw / 2, by - bw * 0.25);
      g.lineTo(bx + bw * 0.4, by + bw * 0.1);
      g.lineTo(bx - bw * 0.4, by + bw * 0.1);
      g.closePath();
      g.fill();
      g.strokeStyle = "#8B5A2B";
      g.lineWidth = 3;
      for (let i = 1; i < 4; i++) {
        g.beginPath();
        g.moveTo(bx - bw / 2 + bw * i / 4, by - bw * 0.25);
        g.lineTo(bx - bw * 0.4 + bw * 0.8 * i / 4, by + bw * 0.1);
        g.stroke();
      }
      text(g, String(this.basket), bx, by - bw * 0.05, bw * 0.18, "#fff");
      text(g, this.tree.name, w / 2, h * 0.08 + u * 10, u * 5, "#fff");
      this.fx.draw(g);
      vignette(g, w, h, 0.18, "20,60,20");
    }
  };
  var hasat_default = {
    id: "hasat",
    title: "Bah\xE7e Hasad\u0131",
    tagline: "Uzan, topla!",
    description: "Bah\xE7ede Malatya kay\u0131s\u0131s\u0131, kiraz, incir, nar, portakal ve Amasya elmas\u0131 a\u011Fa\xE7lar\u0131 var. Uzan\u0131p her meyveye dokun, a\u011Fac\u0131 bo\u015Falt! R\xFCzg\xE2r esince d\xFC\u015Fen meyveleri yere de\u011Fmeden yakala.",
    howto: ["Meyveye elinle dokun", "Sallanan meyve d\xFC\u015Fmek \xFCzere!", "D\xFC\u015Feni yakala: +2", "Ar\u0131ya dokunma: -2"],
    color: "#3BAA4A",
    emoji: "\u{1F351}",
    duration: 75,
    camAlpha: 0.25,
    stars: [25, 50, 80],
    hint: "Meyvelere uzan!",
    create: (v) => new Game4(v),
    thumb(g, w, h, t) {
      skyGradient(g, w, h, "#7EC8F2", "#D9F2FF");
      g.fillStyle = "#7CC24F";
      g.fillRect(0, h * 0.82, w, h * 0.18);
      drawTree(g, w * 0.5, h * 0.85, h * 0.55, "#3E8E41", t);
      [[-0.3, -1.1], [0.2, -1.2], [0.4, -0.85], [-0.45, -0.8], [0, -0.9]].forEach(([x, y], i) => drawFruit(g, ["kayisi", "kiraz", "nar", "incir", "elma"][i], w * 0.5 + x * h * 0.55, h * 0.85 + y * h * 0.55, h * 0.06));
    }
  };

  // js/games/taekwondo.js
  var POSES = [
    { name: "Kartal Kanatlar\u0131", a: [180, 180, 0, 0] },
    { name: "Zafer!", a: [-135, -135, -45, -45] },
    { name: "Zeybek Kollar\u0131", a: [180, -90, 0, -90] },
    { name: "K\u0131l\u0131\xE7 Yukar\u0131", a: [-90, -90, 0, 0] },
    { name: "Ters K\u0131l\u0131\xE7", a: [180, 180, -90, -90] },
    { name: "Roket", a: [-90, -90, 90, 90] },
    { name: "\xC7at\u0131", a: [-125, -40, -55, -140] },
    { name: "Eller Belde", a: [125, 45, 55, 135] },
    { name: "Kalkan", a: [180, -90, 90, 90] },
    { name: "Ters Kalkan", a: [90, 90, 0, -90] },
    { name: "Y\u0131ld\u0131z", a: [-160, -160, -20, -20] },
    { name: "A\u015Fa\u011F\u0131 Blok", a: [135, 135, 45, 45] }
  ];
  var BELTS = [
    ["Beyaz", "#F8FAFC"],
    ["Sar\u0131", "#FFD23F"],
    ["Ye\u015Fil", "#3BAA4A"],
    ["Mavi", "#2E86DE"],
    ["K\u0131rm\u0131z\u0131", "#E63946"],
    ["Siyah", "#111827"]
  ];
  var angDiff = (a, b) => {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };
  var deg = (p, q) => Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
  function armChains(pts) {
    const leftFirst = pts[11].x < pts[12].x;
    const L = leftFirst ? [11, 13, 15] : [12, 14, 16];
    const R = leftFirst ? [12, 14, 16] : [11, 13, 15];
    return [L, R];
  }
  function drawCoach(g, type, x, y, r, beltColor, t, pose) {
    g.save();
    const sh = { l: { x: x - r * 0.75, y: y + r * 1.4 }, r: { x: x + r * 0.75, y: y + r * 1.4 } };
    g.fillStyle = "#FFFFFF";
    g.strokeStyle = "#1e293b";
    g.lineWidth = r * 0.08;
    rr(g, x - r * 0.85, y + r * 1.2, r * 1.7, r * 2, r * 0.3);
    g.fill();
    g.stroke();
    g.fillStyle = beltColor;
    g.fillRect(x - r * 0.85, y + r * 2.4, r * 1.7, r * 0.25);
    g.strokeRect(x - r * 0.85, y + r * 2.4, r * 1.7, r * 0.25);
    const seg = r * 1;
    g.lineCap = "round";
    [[sh.l, pose.a[0], pose.a[1]], [sh.r, pose.a[2], pose.a[3]]].forEach(([s, a1, a2]) => {
      const e = { x: s.x + Math.cos(a1 * Math.PI / 180) * seg, y: s.y + Math.sin(a1 * Math.PI / 180) * seg };
      const w = { x: e.x + Math.cos(a2 * Math.PI / 180) * seg, y: e.y + Math.sin(a2 * Math.PI / 180) * seg };
      g.strokeStyle = "#1e293b";
      g.lineWidth = r * 0.5;
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.lineTo(e.x, e.y);
      g.lineTo(w.x, w.y);
      g.stroke();
      g.strokeStyle = "#fff";
      g.lineWidth = r * 0.36;
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.lineTo(e.x, e.y);
      g.lineTo(w.x, w.y);
      g.stroke();
      g.fillStyle = type === "pars" ? "#F2C14E" : "#E8D3A8";
      g.beginPath();
      g.arc(w.x, w.y, r * 0.22, 0, TAU);
      g.fill();
      g.stroke();
    });
    animalFace(g, type, x, y + Math.sin(t * 3) * r * 0.05, r, "happy");
    g.restore();
  }
  var Game5 = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.fx = new Particles();
      this.coach = view.player === 1 ? "kangal" : "pars";
      this.coachName = view.player === 1 ? "Karaba\u015F Hoca" : "Pars Hoca";
      this.queue = shuffle(POSES);
      this.done = 0;
      this.missed = 0;
      this.fastest = 0;
      this.limbScore = [0, 0, 0, 0];
      this.next();
    }
    get belt() {
      return BELTS[Math.min(BELTS.length - 1, Math.floor(this.done / 3))];
    }
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
      } else if (inp.fake && inp.mouseDown) {
        match = 1;
        this.limbScore = [1, 1, 1, 1];
      }
      this.match = match;
      if (match > 0.72) this.hold += dt;
      else this.hold = Math.max(0, this.hold - dt * 0.6);
      if (this.hold >= 1) {
        const beltBefore = this.belt[0];
        this.done++;
        const pts = 10 + Math.max(0, Math.round(8 - this.poseT));
        if (!this.fastest || this.poseT < this.fastest) this.fastest = this.poseT;
        this.score += pts;
        sfx.good();
        this.fx.burst(w / 2, h * 0.4, ["#FFD23F", "#fff", this.belt[1]], 30, u * 60, u * 1.3, "star");
        this.fx.text(w / 2, h * 0.35, `Hai! +${pts}`, "#FFD23F", u * 9);
        if (this.belt[0] !== beltBefore) {
          this.fx.text(w / 2, h * 0.5, `${this.belt[0]} ku\u015Fak!`, this.belt[1] === "#111827" ? "#fff" : this.belt[1], u * 8);
          if (this.v.players === 1) say(`Tebrikler, ${this.belt[0]} ku\u015Fak!`);
          sfx.win();
        }
        this.passT = 1.2;
      } else if (this.poseT > 10) {
        this.fx.text(w / 2, h * 0.35, "S\u0131radaki!", "#fff", u * 6);
        this.missed++;
        this.passT = 0.6;
      }
      this.fx.update(dt);
    }
    draw(g) {
      const { w, h } = this.v;
      g.fillStyle = "#F3E3C3";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#E6CFA2";
      for (let x = 0; x < w; x += Math.max(40, w / 12)) g.fillRect(x, 0, 3, h * 0.72);
      g.fillStyle = "#2E86DE";
      g.fillRect(0, h * 0.72, w, h * 0.28);
      g.fillStyle = "#E63946";
      for (let x = 0; x < w; x += w / 4) g.fillRect(x, h * 0.72, w / 8, h * 0.28);
      flag(g, w * 0.04, h * 0.05, Math.min(w, h) * 0.13);
      const lg = g.createRadialGradient(w / 2, -h * 0.1, 0, w / 2, -h * 0.1, h * 0.9);
      lg.addColorStop(0, "rgba(255,250,230,0.55)");
      lg.addColorStop(1, "rgba(255,250,230,0)");
      g.fillStyle = lg;
      g.fillRect(0, 0, w, h);
    }
    stats() {
      return [
        { icon: "\u{1F94B}", label: "Poz", value: this.done },
        { icon: "\u{1F397}\uFE0F", label: "Ku\u015Fak", value: this.belt[0] },
        { icon: "\u26A1", label: "En h\u0131zl\u0131", value: this.fastest ? this.fastest.toFixed(1) + "s" : "-" },
        { icon: "\u23ED\uFE0F", label: "Ka\xE7an", value: this.missed }
      ];
    }
    drawOver(g, inp, t) {
      const { w, h, u } = this.v;
      const m = Math.min(w, h);
      if (inp.present && inp.pts && this.passT <= 0) {
        const P = inp.pts;
        const [L, R] = armChains(P);
        const segL = (i) => Math.hypot(P[i[0]].x - P[i[1]].x, P[i[0]].y - P[i[1]].y);
        const len = Math.max(inp.shW * 0.9, (segL(L) + segL(R)) / 2);
        g.lineCap = "round";
        [[L, 0], [R, 2]].forEach(([chain, k]) => {
          const s = P[chain[0]];
          const a1 = this.pose.a[k] * Math.PI / 180, a2 = this.pose.a[k + 1] * Math.PI / 180;
          const e = { x: s.x + Math.cos(a1) * len, y: s.y + Math.sin(a1) * len };
          const wr = { x: e.x + Math.cos(a2) * len, y: e.y + Math.sin(a2) * len };
          g.strokeStyle = "rgba(255,255,255,0.45)";
          g.lineWidth = inp.shW * 0.28;
          g.beginPath();
          g.moveTo(s.x, s.y);
          g.lineTo(e.x, e.y);
          g.lineTo(wr.x, wr.y);
          g.stroke();
          for (let j = 0; j < 2; j++) {
            const sc = this.limbScore[k + j];
            g.strokeStyle = sc > 0.7 ? "#06D6A0" : sc > 0.35 ? "#FFC300" : "#EF476F";
            g.lineWidth = inp.shW * 0.12;
            g.beginPath();
            g.moveTo(P[chain[j]].x, P[chain[j]].y);
            g.lineTo(P[chain[j + 1]].x, P[chain[j + 1]].y);
            g.stroke();
          }
        });
      }
      const cw = m * 0.42, chh = m * 0.5;
      const cx = w - cw - u * 3, cy = h * 0.2;
      g.fillStyle = "rgba(255,255,255,0.9)";
      rr(g, cx, cy, cw, chh, u * 3);
      g.fill();
      g.strokeStyle = this.belt[1] === "#F8FAFC" ? "#CBD5E1" : this.belt[1];
      g.lineWidth = 5;
      g.stroke();
      drawCoach(g, this.coach, cx + cw / 2, cy + chh * 0.22, cw * 0.14, this.belt[1], t, this.pose);
      text(g, this.coachName, cx + cw / 2, cy + chh * 0.06, cw * 0.08, "#0F172A", { stroke: null });
      text(g, this.pose.name, w / 2, h * 0.88, m * 0.07, "#fff");
      const bw = Math.min(w * 0.6, m * 0.7);
      g.fillStyle = "rgba(15,23,42,0.6)";
      rr(g, w / 2 - bw / 2, h * 0.93, bw, m * 0.035, 8);
      g.fill();
      g.fillStyle = "#06D6A0";
      rr(g, w / 2 - bw / 2, h * 0.93, bw * clamp(this.hold, 0, 1), m * 0.035, 8);
      g.fill();
      text(g, `${this.belt[0]} ku\u015Fak`, u * 4, h * 0.2 + u * 12, m * 0.045, this.belt[1] === "#111827" ? "#fff" : this.belt[1], { align: "left" });
      if (inp.fake) text(g, "Fare ile: bas\u0131l\u0131 tut = poz", w / 2, h * 0.8, m * 0.035, "#fff");
      this.fx.draw(g);
      vignette(g, w, h, 0.2, "60,30,10");
    }
  };
  var taekwondo_default = {
    id: "taekwondo",
    title: "Pars Hoca'n\u0131n Salonu",
    tagline: "Hai! Ku\u015Fak kazan!",
    description: "Anadolu pars\u0131 Pars Hoca sana taekwondo ve halk oyunu pozlar\u0131 g\xF6steriyor. Ayn\u0131s\u0131n\u0131 yap, bir saniye tut ve beyaz ku\u015Faktan siyah ku\u015Fa\u011Fa y\xFCksel! \u0130ki ki\u015Fi oynarken ikinci oyuncunun hocas\u0131 Kangal k\xF6pe\u011Fi Karaba\u015F Hoca.",
    howto: ["Hocan\u0131n pozuna bak", "Kollar\u0131n\u0131 ayn\u0131 \u015Fekilde a\xE7", "Ye\u015Fil olunca tut!"],
    color: "#E63946",
    emoji: "\u{1F94B}",
    duration: 90,
    camAlpha: 0.6,
    skeleton: true,
    cursors: false,
    stars: [40, 100, 160],
    hint: "Hocan\u0131n pozunu taklit et!",
    create: (v) => new Game5(v),
    thumb(g, w, h, t) {
      g.fillStyle = "#F3E3C3";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#2E86DE";
      g.fillRect(0, h * 0.75, w, h * 0.25);
      const p = POSES[Math.floor(t / 1.5) % POSES.length];
      drawCoach(g, "pars", w * 0.5, h * 0.2, h * 0.12, "#111827", t, p);
    }
  };

  // js/games/motokros.js
  function coin(g, x, y, r, t) {
    const sx = Math.abs(Math.cos(t * 4));
    g.save();
    g.translate(x, y);
    g.scale(Math.max(0.15, sx), 1);
    g.fillStyle = "#FFC300";
    g.strokeStyle = "#B7791F";
    g.lineWidth = r * 0.15;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.fill();
    g.stroke();
    crescentStar(g, -r * 0.1, 0, r * 0.45, "#FFF3B0");
    g.restore();
  }
  function simit(g, x, y, r) {
    g.save();
    g.translate(x, y);
    g.strokeStyle = "#B5651D";
    g.lineWidth = r * 0.55;
    g.beginPath();
    g.arc(0, 0, r * 0.7, 0, TAU);
    g.stroke();
    g.strokeStyle = "#D9822B";
    g.lineWidth = r * 0.25;
    g.beginPath();
    g.arc(0, 0, r * 0.75, Math.PI * 1.1, Math.PI * 1.6);
    g.stroke();
    g.fillStyle = "#FFF1C1";
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      g.fillRect(Math.cos(a) * r * 0.7 - 1, Math.sin(a) * r * 0.7 - 1, 3, 2);
    }
    g.restore();
  }
  function chicken(g, x, y, s, t) {
    g.save();
    g.translate(x, y);
    const hop = Math.abs(Math.sin(t * 8)) * s * 0.1;
    g.translate(0, -hop);
    g.fillStyle = "#fff";
    g.strokeStyle = "#334155";
    g.lineWidth = s * 0.05;
    g.beginPath();
    g.ellipse(0, -s * 0.4, s * 0.45, s * 0.38, 0, 0, TAU);
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(s * 0.25, -s * 0.85, s * 0.22, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = "#E63946";
    g.beginPath();
    g.arc(s * 0.2, -s * 1.08, s * 0.08, 0, TAU);
    g.arc(s * 0.3, -s * 1.1, s * 0.08, 0, TAU);
    g.fill();
    g.fillStyle = "#F59E0B";
    g.beginPath();
    g.moveTo(s * 0.45, -s * 0.85);
    g.lineTo(s * 0.62, -s * 0.8);
    g.lineTo(s * 0.45, -s * 0.75);
    g.fill();
    g.fillStyle = "#111";
    g.beginPath();
    g.arc(s * 0.3, -s * 0.9, s * 0.04, 0, TAU);
    g.fill();
    g.strokeStyle = "#F59E0B";
    g.lineWidth = s * 0.06;
    g.beginPath();
    g.moveTo(-s * 0.1, -s * 0.05);
    g.lineTo(-s * 0.1, 0);
    g.moveTo(s * 0.1, -s * 0.05);
    g.lineTo(s * 0.1, 0);
    g.stroke();
    g.restore();
  }
  function sheep(g, x, y, s) {
    g.save();
    g.translate(x, y);
    g.fillStyle = "#334155";
    g.fillRect(-s * 0.35, -s * 0.25, s * 0.1, s * 0.25);
    g.fillRect(s * 0.25, -s * 0.25, s * 0.1, s * 0.25);
    g.fillStyle = "#F8FAFC";
    g.strokeStyle = "#CBD5E1";
    g.lineWidth = s * 0.04;
    for (const [bx, by] of [[-0.3, -0.5], [0, -0.6], [0.3, -0.5], [-0.15, -0.35], [0.15, -0.35], [0, -0.75]]) {
      g.beginPath();
      g.arc(bx * s, by * s, s * 0.25, 0, TAU);
      g.fill();
      g.stroke();
    }
    g.fillStyle = "#334155";
    g.beginPath();
    g.ellipse(0, -s * 0.45, s * 0.17, s * 0.22, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(-s * 0.07, -s * 0.5, s * 0.04, 0, TAU);
    g.arc(s * 0.07, -s * 0.5, s * 0.04, 0, TAU);
    g.fill();
    g.restore();
  }
  function hay(g, x, y, s) {
    g.fillStyle = "#E9C46A";
    g.strokeStyle = "#B08930";
    g.lineWidth = s * 0.04;
    g.fillRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 0.55);
    g.strokeRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 0.55);
    g.beginPath();
    for (let i = 1; i < 4; i++) {
      g.moveTo(x - s * 0.55, y - s * 0.55 + i * s * 0.55 / 4);
      g.lineTo(x + s * 0.55, y - s * 0.55 + i * s * 0.55 / 4);
    }
    g.stroke();
  }
  function ramp(g, x, y, s) {
    g.fillStyle = "#A0522D";
    g.beginPath();
    g.moveTo(x - s * 0.6, y);
    g.lineTo(x + s * 0.6, y);
    g.lineTo(x + s * 0.5, y - s * 0.45);
    g.lineTo(x - s * 0.5, y - s * 0.45);
    g.closePath();
    g.fill();
    g.fillStyle = "#FFD23F";
    g.beginPath();
    g.moveTo(x, y - s * 0.4);
    g.lineTo(x + s * 0.18, y - s * 0.15);
    g.lineTo(x - s * 0.18, y - s * 0.15);
    g.closePath();
    g.fill();
  }
  function house(g, x, y, s, roof = "#C0392B") {
    g.fillStyle = "#FDF6E3";
    g.fillRect(x - s * 0.5, y - s * 0.6, s, s * 0.6);
    g.fillStyle = roof;
    g.beginPath();
    g.moveTo(x - s * 0.6, y - s * 0.6);
    g.lineTo(x, y - s);
    g.lineTo(x + s * 0.6, y - s * 0.6);
    g.closePath();
    g.fill();
    g.fillStyle = "#5DADE2";
    g.fillRect(x - s * 0.3, y - s * 0.45, s * 0.2, s * 0.18);
    g.fillStyle = "#8B5A2B";
    g.fillRect(x + s * 0.1, y - s * 0.35, s * 0.2, s * 0.35);
  }
  function poplar(g, x, y, s) {
    g.fillStyle = "#6B4226";
    g.fillRect(x - s * 0.04, y - s * 0.3, s * 0.08, s * 0.3);
    g.fillStyle = "#2F8F46";
    g.beginPath();
    g.ellipse(x, y - s * 0.8, s * 0.18, s * 0.6, 0, 0, TAU);
    g.fill();
  }
  function bike(g, x, y, s, lean, air) {
    g.save();
    g.translate(x, y);
    g.rotate(lean * 0.35);
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.beginPath();
    g.ellipse(0, air, s * 0.4, s * 0.08, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#1F2937";
    rr0(g, -s * 0.12, -s * 0.5, s * 0.24, s * 0.5, s * 0.1);
    g.fillStyle = "#E63946";
    rr0(g, -s * 0.25, -s * 0.75, s * 0.5, s * 0.3, s * 0.08);
    g.fillStyle = "#fff";
    g.fillRect(-s * 0.08, -s * 0.72, s * 0.16, s * 0.08);
    g.fillStyle = "#2E86DE";
    rr0(g, -s * 0.2, -s * 1.15, s * 0.4, s * 0.45, s * 0.12);
    g.strokeStyle = "#2E86DE";
    g.lineWidth = s * 0.1;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(-s * 0.18, -s * 1.05);
    g.lineTo(-s * 0.38, -s * 0.85);
    g.moveTo(s * 0.18, -s * 1.05);
    g.lineTo(s * 0.38, -s * 0.85);
    g.stroke();
    g.strokeStyle = "#111";
    g.lineWidth = s * 0.05;
    g.beginPath();
    g.moveTo(-s * 0.42, -s * 0.85);
    g.lineTo(s * 0.42, -s * 0.85);
    g.stroke();
    g.fillStyle = "#FFD23F";
    g.beginPath();
    g.arc(0, -s * 1.27, s * 0.17, 0, TAU);
    g.fill();
    g.fillStyle = "#E63946";
    g.fillRect(-s * 0.17, -s * 1.3, s * 0.34, s * 0.05);
    g.restore();
  }
  function rr0(g, x, y, w, h, r) {
    g.beginPath();
    g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h);
    g.fill();
  }
  var Game6 = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.fx = new Particles();
      this.bx = 0;
      this.vx = 0;
      this.hgt = 0;
      this.vh = 0;
      this.travel = 0;
      this.speed = 7;
      this.objs = [];
      this.side = [];
      this.spawnT = 0.5;
      this.sideT = 0;
      this.t = 0;
      this.wobble = 0;
      this.slow = 0;
      this.coins = 0;
      this.jumps = 0;
      this.bumps = 0;
      this.flights = 0;
      this.dust = [];
      for (let z = 2; z < 16; z += 1.2) this.addSide(z);
    }
    addSide(z) {
      const s = Math.random() < 0.5 ? -1 : 1;
      this.side.push({ k: Math.random() < 0.35 ? "house" : "poplar", x: s * rand(1.4, 2.4), z, roof: pick(["#C0392B", "#D35400", "#2E86DE"]) });
    }
    get horizon() {
      return this.v.h * 0.4;
    }
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
        const kind = Math.random() < 0.25 ? "simit" : "coin";
        for (let i = 0; i < 4; i++) this.objs.push({ k: kind, x: lane, z: 15 + i * 0.9, y: 0 });
      } else if (r < 0.85) {
        this.objs.push({ k: pick(["tavuk", "koyun", "saman"]), x: lane, z: 15 });
        if (Math.random() < 0.5) this.objs.push({ k: "coin", x: lane, z: 15, y: 0.6 });
      } else {
        this.objs.push({ k: "rampa", x: lane, z: 15 });
        for (let i = 1; i < 4; i++) this.objs.push({ k: "coin", x: lane, z: 15 + i * 0.8, y: 0.45 + i * 0.12 });
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
        if (inp.jump && this.hgt <= 1e-3) {
          this.vh = 2.6;
          this.jumps++;
          sfx.jump();
        }
      }
      this.vh -= 7 * dt;
      this.hgt = Math.max(0, this.hgt + this.vh * dt);
      if (this.hgt <= 0) this.vh = Math.max(0, this.vh);
      this.travel += this.speed * dt;
      this.wobble = Math.max(0, this.wobble - dt);
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawn();
        this.spawnT = rand(0.9, 1.5) * (7 / this.speed);
      }
      this.sideT -= dt;
      if (this.sideT <= 0) {
        this.addSide(16);
        this.sideT = 0.25;
      }
      const bz = 1.3;
      for (const o of this.objs) {
        const oz = o.z;
        o.z -= this.speed * dt * 0.5;
        if (oz >= bz && o.z < bz && Math.abs(o.x - this.bx) < 0.3) {
          const p = this.proj(o.x, bz);
          if (o.k === "coin" || o.k === "simit") {
            if (Math.abs((o.y || 0) - this.hgt) < 0.35) {
              o.dead = true;
              const pts = o.k === "simit" ? 3 : 1;
              this.score += pts;
              this.coins++;
              sfx.coin();
              this.fx.text(p.x, p.y - u * 15, "+" + pts, "#FFD23F", u * 6);
            }
          } else if (o.k === "rampa") {
            if (this.hgt < 0.2) {
              this.vh = 3.6;
              this.score += 3;
              this.flights++;
              sfx.jump();
              this.fx.text(p.x, p.y - u * 20, "U\xE7u\u015F! +3", "#06D6A0", u * 6);
            }
          } else if (this.hgt < 0.32) {
            this.score = Math.max(0, this.score - 2);
            this.wobble = 0.6;
            this.slow = 1;
            this.bumps++;
            this.v.hit?.();
            sfx.bump();
            this.fx.burst(p.x, p.y - u * 8, o.k === "tavuk" ? ["#fff", "#F1F5F9"] : o.k === "koyun" ? ["#fff"] : ["#E9C46A"], 14, u * 30, u);
            this.fx.text(p.x, p.y - u * 20, o.k === "tavuk" ? "G\u0131t g\u0131t! -2" : o.k === "koyun" ? "Meee! -2" : "Ayy! -2", "#EF476F", u * 5);
            o.dead = true;
          } else if (!o.jumped) {
            o.jumped = true;
            this.score += 2;
            this.fx.text(p.x, p.y - u * 20, "S\xFCper atlay\u0131\u015F! +2", "#06D6A0", u * 5);
            sfx.good();
          }
        }
      }
      for (const s of this.side) s.z -= this.speed * dt * 0.5;
      this.objs = this.objs.filter((o) => !o.dead && o.z > 0.6);
      if (this.hgt <= 0.01 && Math.random() < 0.7) this.dust.push({ x: this.bx + rand(-0.05, 0.05), z: 1.2, a: 1, s: rand(0.6, 1.2) });
      for (const d of this.dust) {
        d.z += dt * 0.6;
        d.a -= dt * 1.6;
        d.x += rand(-0.2, 0.2) * dt;
      }
      this.dust = this.dust.filter((d) => d.a > 0);
      this.side = this.side.filter((s) => s.z > 0.6);
      this.fx.update(dt);
    }
    draw(g, inp, t) {
      const { w, h } = this.v;
      const hz = this.horizon;
      skyGradient(g, w, hz, "#66B7F0", "#CFEFFF");
      sunGlow(g, w * 0.8, hz * 0.4, Math.min(w, h) * 0.045, t);
      for (let i = 0; i < 3; i++) cloud(g, (i * 0.37 + t * 8e-3) % 1.3 * w - w * 0.1, hz * (0.25 + i * 0.15), Math.min(w, h) * 0.07);
      g.fillStyle = "#8FC27A";
      g.beginPath();
      g.moveTo(0, hz);
      g.quadraticCurveTo(w * 0.2, hz - h * 0.12, w * 0.45, hz);
      g.quadraticCurveTo(w * 0.7, hz - h * 0.15, w, hz);
      g.fill();
      g.fillStyle = "#ECF0F1";
      const mx = w * 0.7;
      g.fillRect(mx, hz - h * 0.12, w * 0.012, h * 0.12);
      g.beginPath();
      g.moveTo(mx - w * 2e-3, hz - h * 0.12);
      g.lineTo(mx + w * 6e-3, hz - h * 0.16);
      g.lineTo(mx + w * 0.014, hz - h * 0.12);
      g.fill();
      g.beginPath();
      g.arc(mx + w * 0.05, hz - h * 0.02, w * 0.03, Math.PI, 0);
      g.fill();
      fogBand(g, w, hz, h * 0.05, "235,245,255", 0.85);
      g.fillStyle = "#7CC24F";
      g.fillRect(0, hz, w, h - hz);
      const step = 0.5;
      const phase = this.travel * 0.5 % (step * 2);
      for (let z = 16; z > 1; z -= step) {
        const z0 = z - phase, z1 = z0 - step;
        if (z1 < 0.9) continue;
        const a = this.proj(-1.1, z0), b = this.proj(1.1, z0), c = this.proj(1.1, z1), d = this.proj(-1.1, z1);
        const band = Math.floor((z + this.travel * 0.5) / step) % 2 === 0;
        g.fillStyle = band ? "#6DB33F" : "#7CC24F";
        g.fillRect(0, a.y, w, c.y - a.y + 1);
        g.fillStyle = band ? "#C49A6C" : "#B88A5A";
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.lineTo(c.x, c.y);
        g.lineTo(d.x, d.y);
        g.closePath();
        g.fill();
        g.fillStyle = band ? "#E63946" : "#fff";
        const ew = 0.08;
        for (const sx of [-1, 1]) {
          const p0 = this.proj(sx * 1.1, z0), p1 = this.proj(sx * (1.1 + ew), z0), p2 = this.proj(sx * (1.1 + ew), z1), p3 = this.proj(sx * 1.1, z1);
          g.beginPath();
          g.moveTo(p0.x, p0.y);
          g.lineTo(p1.x, p1.y);
          g.lineTo(p2.x, p2.y);
          g.lineTo(p3.x, p3.y);
          g.closePath();
          g.fill();
        }
      }
      const fphase = this.travel * 0.5 % 1;
      for (let z = 14; z > 1; z -= 1) {
        const zz = z - fphase;
        for (const sx of [-1.3, 1.3]) {
          const p = this.proj(sx, zz), s = Math.min(w, h * 0.9) * 0.08 * p.s;
          g.globalAlpha = clamp((15 - zz) / 5, 0, 1);
          g.fillStyle = "#C98B4E";
          g.fillRect(p.x - s * 0.08, p.y - s, s * 0.16, s);
          g.fillRect(p.x - s * 0.5, p.y - s * 0.75, s, s * 0.1);
        }
      }
      g.globalAlpha = 1;
      const fogG = g.createLinearGradient(0, hz, 0, hz + (h - hz) * 0.25);
      fogG.addColorStop(0, "rgba(225,240,255,0.75)");
      fogG.addColorStop(1, "rgba(225,240,255,0)");
      g.fillStyle = fogG;
      g.fillRect(0, hz, w, (h - hz) * 0.25);
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
        if (o.z < bz && !bikeDrawn) {
          drawBike();
          bikeDrawn = true;
        }
        const p = this.proj(o.x, o.z);
        const s = S * 0.32 * p.s;
        if (o.side) {
          o.k === "house" ? house(g, p.x, p.y, s * 1.6, o.roof) : poplar(g, p.x, p.y, s * 1.5);
          continue;
        }
        const lift = (o.y || 0) * S * 0.25 * p.s;
        if (o.k === "coin") coin(g, p.x, p.y - s * 0.4 - lift, s * 0.25, t + o.z);
        else if (o.k === "simit") simit(g, p.x, p.y - s * 0.4 - lift, s * 0.35);
        else if (o.k === "tavuk") chicken(g, p.x, p.y, s * 0.8, t + o.x);
        else if (o.k === "koyun") sheep(g, p.x, p.y, s);
        else if (o.k === "saman") hay(g, p.x, p.y, s);
        else if (o.k === "rampa") ramp(g, p.x, p.y, s * 1.2);
      }
      if (!bikeDrawn) drawBike();
      for (const d of this.dust) {
        const p = this.proj(d.x, d.z);
        g.fillStyle = `rgba(196,154,108,${d.a * 0.5})`;
        g.beginPath();
        g.arc(p.x, p.y - 4, S * 0.03 * d.s * (1.6 - d.a), 0, TAU);
        g.fill();
      }
      this.fx.draw(g);
      vignette(g, w, h, 0.2, "40,30,10");
    }
    speedKmh() {
      return this.speed * 9;
    }
    stats() {
      return [
        { icon: "\u{1FA99}", label: "Alt\u0131n", value: this.coins },
        { icon: "\u{1F680}", label: "Z\u0131plama", value: this.jumps },
        { icon: "\u{1F4A5}", label: "\xC7arpma", value: this.bumps },
        { icon: "\u{1F6EB}", label: "Rampa", value: this.flights }
      ];
    }
  };
  var motokros_default = {
    id: "motokros",
    title: "K\xF6y Yolu Motokros",
    tagline: "Y\xFCr\xFC, z\u0131pla, topla!",
    description: "Motoru b\xFCt\xFCn v\xFCcudunla s\xFCr\xFCyorsun: sa\u011Fa ya da sola y\xFCr\xFC, motor da seninle gelsin; z\u0131pla, motor da z\u0131plas\u0131n! Alt\u0131nlar\u0131 ve simitleri topla, rampalardan u\xE7; tavuklara, koyunlara ve saman balyalar\u0131na \xE7arpma.",
    howto: ["Sa\u011Fa-sola ad\u0131m at", "Engelde z\u0131pla", "Simit 3 puan!", "Tavuk, koyun, saman -2"],
    color: "#C0392B",
    emoji: "\u{1F3CD}\uFE0F",
    duration: 60,
    camAlpha: 0,
    cursors: false,
    stars: [25, 50, 80],
    hint: "Sa\u011Fa sola ad\u0131m at, z\u0131pla!",
    create: (v) => new Game6(v),
    thumb(g, w, h, t) {
      skyGradient(g, w, h, "#66B7F0", "#CFEFFF");
      g.fillStyle = "#7CC24F";
      g.fillRect(0, h * 0.45, w, h);
      g.fillStyle = "#C49A6C";
      g.beginPath();
      g.moveTo(w * 0.47, h * 0.45);
      g.lineTo(w * 0.53, h * 0.45);
      g.lineTo(w * 0.95, h);
      g.lineTo(w * 0.05, h);
      g.closePath();
      g.fill();
      chicken(g, w * 0.62, h * 0.66, h * 0.15, t);
      coin(g, w * 0.4, h * 0.58, h * 0.05, t);
      bike(g, w * 0.45, h * 0.97 - Math.abs(Math.sin(t * 2)) * h * 0.1, h * 0.38, Math.sin(t) * 0.5, 0);
    }
  };

  // js/games/kayak.js
  function pine(g, x, y, s) {
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.beginPath();
    g.ellipse(x + s * 0.2, y + s * 0.1, s * 0.5, s * 0.18, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#6B4226";
    g.fillRect(x - s * 0.06, y - s * 0.2, s * 0.12, s * 0.25);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = i % 2 ? "#2D6A4F" : "#1B4332";
      g.beginPath();
      g.moveTo(x - s * (0.5 - i * 0.1), y - s * (0.15 + i * 0.3));
      g.lineTo(x, y - s * (0.75 + i * 0.3));
      g.lineTo(x + s * (0.5 - i * 0.1), y - s * (0.15 + i * 0.3));
      g.closePath();
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(x - s * (0.2 - i * 0.04), y - s * (0.55 + i * 0.3));
      g.lineTo(x, y - s * (0.75 + i * 0.3));
      g.lineTo(x + s * (0.2 - i * 0.04), y - s * (0.55 + i * 0.3));
      g.closePath();
      g.fill();
    }
  }
  function snowman(g, x, y, s) {
    g.fillStyle = "rgba(0,0,0,0.1)";
    g.beginPath();
    g.ellipse(x + s * 0.1, y + s * 0.05, s * 0.4, s * 0.12, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#fff";
    g.strokeStyle = "#CBD5E1";
    g.lineWidth = s * 0.04;
    g.beginPath();
    g.arc(x, y - s * 0.3, s * 0.32, 0, TAU);
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(x, y - s * 0.78, s * 0.22, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = "#E63946";
    g.fillRect(x - s * 0.24, y - s * 0.6, s * 0.48, s * 0.08);
    g.fillStyle = "#F97316";
    g.beginPath();
    g.moveTo(x, y - s * 0.78);
    g.lineTo(x + s * 0.25, y - s * 0.75);
    g.lineTo(x, y - s * 0.72);
    g.fill();
    g.fillStyle = "#111";
    g.beginPath();
    g.arc(x - s * 0.07, y - s * 0.85, s * 0.03, 0, TAU);
    g.arc(x + s * 0.07, y - s * 0.85, s * 0.03, 0, TAU);
    g.fill();
    g.fillStyle = "#1E3A8A";
    g.fillRect(x - s * 0.2, y - s * 1, s * 0.4, s * 0.06);
    g.fillRect(x - s * 0.12, y - s * 1.18, s * 0.24, s * 0.2);
  }
  function gateFlag(g, x, y, s, color) {
    g.strokeStyle = "#334155";
    g.lineWidth = s * 0.06;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x, y - s);
    g.stroke();
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(x, y - s);
    g.lineTo(x + s * 0.45, y - s * 0.82);
    g.lineTo(x, y - s * 0.62);
    g.closePath();
    g.fill();
  }
  function bump(g, x, y, s) {
    const gr = g.createRadialGradient(x - s * 0.2, y - s * 0.2, s * 0.1, x, y, s);
    gr.addColorStop(0, "#FFFFFF");
    gr.addColorStop(1, "#C7DDF0");
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(x, y, s, s * 0.45, 0, 0, TAU);
    g.fill();
  }
  function tea(g, x, y, s) {
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(x, y + s * 0.35, s * 0.4, s * 0.1, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#B23A1C";
    g.beginPath();
    g.moveTo(x - s * 0.22, y - s * 0.3);
    g.quadraticCurveTo(x - s * 0.08, y, x - s * 0.18, y + s * 0.3);
    g.lineTo(x + s * 0.18, y + s * 0.3);
    g.quadraticCurveTo(x + s * 0.08, y, x + s * 0.22, y - s * 0.3);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.8)";
    g.lineWidth = s * 0.05;
    g.stroke();
  }
  function boarder(g, x, y, s, tilt, air) {
    g.save();
    g.fillStyle = "rgba(30,58,138,0.18)";
    g.beginPath();
    g.ellipse(x + air * 0.6, y + air, s * 0.7, s * 0.25, tilt * 0.6, 0, TAU);
    g.fill();
    g.translate(x, y - air * 0.3);
    g.rotate(tilt * 0.6);
    const sc = 1 + air / (s * 3);
    g.scale(sc, sc);
    g.fillStyle = "#FF5DA2";
    g.strokeStyle = "#7A1E4C";
    g.lineWidth = s * 0.04;
    g.beginPath();
    g.ellipse(0, 0, s * 0.75, s * 0.18, 0, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = "#FFD23F";
    g.fillRect(-s * 0.4, -s * 0.03, s * 0.8, s * 0.06);
    g.strokeStyle = "#2E86DE";
    g.lineWidth = s * 0.14;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(-s * 0.55, -s * 0.05);
    g.lineTo(s * 0.55, -s * 0.05);
    g.stroke();
    g.fillStyle = "#2E86DE";
    g.beginPath();
    g.ellipse(0, 0, s * 0.28, s * 0.2, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#E63946";
    g.beginPath();
    g.arc(0, -s * 0.02, s * 0.17, 0, TAU);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, -s * 0.02, s * 0.07, 0, TAU);
    g.fill();
    g.restore();
  }
  var Game7 = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.fx = new Particles();
      this.x = 0.5;
      this.tilt = 0;
      this.air = 0;
      this.vair = 0;
      this.objs = [];
      this.trail = [];
      this.t = 0;
      this.spawnY = 0;
      this.scroll = 0;
      this.hit = 0;
      this.lastX = 0.5;
      this.seed = Math.random() * 1e3;
      this.gates = 0;
      this.crashes = 0;
      this.tricks = 0;
      this.stars = 0;
      this.flakes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: rand(1, 3.5), sp: rand(0.02, 0.08) }));
    }
    get speed() {
      return this.v.h * (0.42 + Math.min(0.35, this.t / 120)) * (this.hit > 0 ? 0.5 : 1) * this.v.diff;
    }
    spawnRow() {
      const r = Math.random();
      const c = 0.5 + Math.sin(this.scroll / this.v.h * 1.3 + this.seed) * 0.25;
      if (r < 0.3) this.objs.push({ k: "gate", x: clamp(c + rand(-0.1, 0.1), 0.2, 0.8), y: 1.15, gap: 0.22, color: pick(["#E63946", "#2E86DE"]) });
      else if (r < 0.5) for (let i = 0; i < 3; i++) this.objs.push({ k: "star", x: clamp(c + (i - 1) * 0.04, 0.1, 0.9), y: 1.15 + i * 0.06 });
      else if (r < 0.58) this.objs.push({ k: "bump", x: clamp(c, 0.15, 0.85), y: 1.15 });
      else if (r < 0.62) this.objs.push({ k: "tea", x: clamp(c + rand(-0.15, 0.15), 0.1, 0.9), y: 1.15 });
      const nObs = Math.random() < 0.6 ? 1 : 2;
      for (let i = 0; i < nObs; i++) {
        let ox = rand(0.05, 0.95);
        if (Math.abs(ox - c) < 0.12) ox += ox < c ? -0.15 : 0.15;
        this.objs.push({ k: Math.random() < 0.75 ? "pine" : "snowman", x: clamp(ox, 0.03, 0.97), y: rand(1.12, 1.3) });
      }
    }
    update(dt, inp) {
      const { w, h, u } = this.v;
      this.t += dt;
      this.hit = Math.max(0, this.hit - dt);
      if (inp.present) {
        this.tilt = lerp(this.tilt, inp.tilt, Math.min(1, dt * 8));
        if (inp.jump && this.air <= 1e-3) {
          this.vair = 2.2;
          sfx.jump();
        }
      }
      this.lastX = this.x;
      this.x = clamp(this.x + this.tilt * 0.75 * dt, 0.04, 0.96);
      this.vair -= 6 * dt;
      this.air = Math.max(0, this.air + this.vair * dt);
      const dy = this.speed * dt / h;
      this.scroll += this.speed * dt;
      this.spawnY -= dy;
      if (this.spawnY <= 0) {
        this.spawnRow();
        this.spawnY = rand(0.28, 0.4);
      }
      const py = 0.3;
      for (const o of this.objs) {
        const oy = o.y;
        o.y -= dy;
        if (oy >= py && o.y < py && !o.done) {
          o.done = true;
          const sx = o.x * w, sy = py * h;
          if (o.k === "gate") {
            if (Math.abs(this.x - o.x) < o.gap / 2) {
              this.score += 3;
              this.gates++;
              sfx.good();
              this.fx.text(sx, sy + u * 8, "Kap\u0131! +3", "#06D6A0", u * 5);
              o.pass = true;
            }
          } else if (o.k === "star" && Math.abs(this.x - o.x) < 0.07) {
            o.dead = true;
            this.score += 1;
            this.stars++;
            sfx.coin();
            this.fx.burst(sx, sy, ["#FFD23F"], 8, u * 25, u * 0.8, "star");
          } else if (o.k === "tea" && Math.abs(this.x - o.x) < 0.07) {
            o.dead = true;
            this.score += 5;
            sfx.coin();
            this.fx.text(sx, sy + u * 8, "S\u0131cak \xE7ay! +5", "#FFD23F", u * 5);
          } else if (o.k === "bump" && Math.abs(this.x - o.x) < 0.12) {
            if (this.air > 0.05) {
              this.score += 4;
              this.tricks++;
              sfx.good();
              this.fx.text(sx, sy + u * 8, "Akrobasi! +4", "#FF5DA2", u * 5);
            } else {
              this.vair = 1.4;
            }
          } else if ((o.k === "pine" || o.k === "snowman") && Math.abs(this.x - o.x) < 0.055 && this.air < 0.15) {
            this.score = Math.max(0, this.score - 2);
            this.hit = 0.8;
            this.crashes++;
            this.v.hit?.();
            sfx.bump();
            this.fx.burst(sx, sy, ["#fff", "#DBEAFE"], 18, u * 35, u);
            this.fx.text(sx, sy + u * 8, "Pat! -2", "#EF476F", u * 5);
          }
        }
      }
      this.objs = this.objs.filter((o) => !o.dead && o.y > -0.15);
      this.trail.push({ x: this.x, y: py, a: this.air });
      for (const tp of this.trail) tp.y -= dy;
      this.trail = this.trail.filter((tp) => tp.y > -0.05);
      if (Math.abs(this.tilt) > 0.4 && this.air <= 0 && Math.random() < 0.5) this.fx.burst(this.x * w, py * h + u * 3, ["#fff"], 2, u * 10, u * 0.6);
      for (const f of this.flakes) {
        f.y += f.sp * dt - dy * 0.3;
        f.x += Math.sin(this.t + f.r) * 0.01 * dt;
        if (f.y < -0.02) {
          f.y = 1.02;
          f.x = Math.random();
        }
        if (f.y > 1.02) f.y = -0.02;
      }
      this.fx.update(dt);
    }
    speedKmh() {
      return this.speed / this.v.h * 70;
    }
    stats() {
      return [
        { icon: "\u{1F6A9}", label: "Kap\u0131", value: this.gates },
        { icon: "\u2B50", label: "Y\u0131ld\u0131z", value: this.stars },
        { icon: "\u{1F938}", label: "Akrobasi", value: this.tricks },
        { icon: "\u{1F4A5}", label: "\xC7arpma", value: this.crashes }
      ];
    }
    draw(g, inp, t) {
      const { w, h, u } = this.v;
      const sg = g.createLinearGradient(0, 0, w, h);
      sg.addColorStop(0, "#F8FBFF");
      sg.addColorStop(1, "#E3EEF9");
      g.fillStyle = sg;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(160,190,220,0.18)";
      const off = this.scroll % 80;
      for (let y = -off; y < h; y += 80) for (let x = (y + off) / 80 % 2 ? 0 : 40; x < w; x += 80) {
        g.beginPath();
        g.ellipse(x, y, 18, 4, 0, 0, TAU);
        g.fill();
      }
      g.strokeStyle = "rgba(148,180,210,0.6)";
      g.lineWidth = u * 1.2;
      g.lineCap = "round";
      g.beginPath();
      let pen = false;
      for (const tp of this.trail) {
        if (tp.a > 0.05) {
          pen = false;
          continue;
        }
        pen ? g.lineTo(tp.x * w, tp.y * h) : g.moveTo(tp.x * w, tp.y * h);
        pen = true;
      }
      g.stroke();
      const S = Math.min(w, h);
      const sorted = this.objs.slice().sort((a, b) => a.y - b.y);
      for (const o of sorted.filter((o2) => o2.k === "bump")) bump(g, o.x * w, o.y * h, S * 0.09);
      let drawn = false;
      for (const o of sorted) {
        if (o.k === "bump") continue;
        if (!drawn && o.y > 0.3) {
          boarder(g, this.x * w, 0.3 * h, S * 0.12, this.tilt, this.air * S * 0.1);
          drawn = true;
        }
        const x = o.x * w, y = o.y * h;
        if (o.k === "pine") pine(g, x, y, S * 0.12);
        else if (o.k === "snowman") snowman(g, x, y, S * 0.11);
        else if (o.k === "gate") {
          gateFlag(g, (o.x - o.gap / 2) * w, y, S * 0.09, o.pass ? "#06D6A0" : o.color);
          gateFlag(g, (o.x + o.gap / 2) * w, y, S * 0.09, o.pass ? "#06D6A0" : o.color);
        } else if (o.k === "star") star(g, x, y, S * 0.025);
        else if (o.k === "tea") tea(g, x, y, S * 0.05);
      }
      if (!drawn) boarder(g, this.x * w, 0.3 * h, S * 0.12, this.tilt, this.air * S * 0.1);
      this.fx.draw(g);
      const sh = g.createLinearGradient(0, 0, w, 0);
      sh.addColorStop(0, "rgba(90,130,180,0.25)");
      sh.addColorStop(0.15, "rgba(90,130,180,0)");
      sh.addColorStop(0.85, "rgba(90,130,180,0)");
      sh.addColorStop(1, "rgba(90,130,180,0.25)");
      g.fillStyle = sh;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#fff";
      for (const f of this.flakes) {
        g.globalAlpha = 0.85;
        g.beginPath();
        g.arc(f.x * w, f.y * h, f.r, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;
      text(g, "PALAND\xD6KEN", w / 2, h - u * 5, u * 4, "rgba(46,134,222,0.5)", { stroke: null });
      vignette(g, w, h, 0.18, "30,60,110");
    }
  };
  var kayak_default = {
    id: "kayak",
    title: "Paland\xF6ken Kayak",
    tagline: "E\u011Fil ve kay!",
    description: "Erzurum Paland\xF6ken\u2019in karl\u0131 pistinden snowboardla iniyorsun; pist her seferinde farkl\u0131! Kollar\u0131n\u0131 iki yana a\xE7 ve e\u011Ferek d\xF6n. Bayrak kap\u0131lar\u0131ndan ge\xE7, y\u0131ld\u0131zlar\u0131 ve s\u0131cak \xE7ay\u0131 topla, \xE7am a\u011Fa\xE7lar\u0131na ve kardan adamlara \xE7arpma. Kar tepelerinde z\u0131plarsan akrobasi puan\u0131!",
    howto: ["Kollar\u0131n\u0131 a\xE7", "Sa\u011Fa-sola e\u011F", "Tepede z\u0131pla: akrobasi!", "A\u011Fa\xE7 ve kardan adam -2"],
    color: "#5DADE2",
    emoji: "\u{1F3C2}",
    duration: 60,
    camAlpha: 0,
    cursors: false,
    stars: [30, 60, 100],
    hint: "Kollar\u0131n\u0131 a\xE7 ve e\u011F!",
    create: (v) => new Game7(v),
    thumb(g, w, h, t) {
      g.fillStyle = "#F1F7FF";
      g.fillRect(0, 0, w, h);
      pine(g, w * 0.15, h * 0.7, h * 0.3);
      pine(g, w * 0.85, h * 0.95, h * 0.3);
      pine(g, w * 0.8, h * 0.4, h * 0.22);
      gateFlag(g, w * 0.4, h * 0.85, h * 0.2, "#E63946");
      gateFlag(g, w * 0.62, h * 0.85, h * 0.2, "#E63946");
      snowman(g, w * 0.3, h * 0.35, h * 0.2);
      boarder(g, w * 0.5 + Math.sin(t) * w * 0.12, h * 0.4, h * 0.22, Math.cos(t) * 0.8, 0);
    }
  };

  // js/games/hiztreni.js
  var SCENES = [
    { name: "Pamukkale", sky: ["#4FA8E8", "#CFEAFF"], ground: "#F4F1EA", deco: "pamukkale" },
    { name: "A\u011Fr\u0131 Da\u011F\u0131", sky: ["#5B8FD9", "#E0ECFF"], ground: "#8FB36B", deco: "agri" },
    { name: "Damlata\u015F Ma\u011Faras\u0131", sky: ["#120B2E", "#2A1B4F"], ground: "#2B2140", deco: "cave" },
    { name: "Kapadokya", sky: ["#FF9E7A", "#FFE3B3"], ground: "#E2A86B", deco: "kapadokya" },
    { name: "Karadeniz Yaylas\u0131", sky: ["#7FB6D9", "#E4F2EC"], ground: "#3E9B4F", deco: "yayla" }
  ];
  var SCENE_LEN = 13;
  function bat(g, x, y, s, t) {
    const f = Math.sin(t * 14) * 0.5;
    g.save();
    g.translate(x, y);
    g.fillStyle = "#2B1E3F";
    g.strokeStyle = "#120B1F";
    g.lineWidth = s * 0.05;
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(-s * 0.6, -s * (0.6 + f), -s * 1.2, -s * 0.1 * (1 + f));
    g.quadraticCurveTo(-s * 0.8, 0, -s * 0.9, s * 0.25);
    g.quadraticCurveTo(-s * 0.4, s * 0.05, 0, s * 0.3);
    g.quadraticCurveTo(s * 0.4, s * 0.05, s * 0.9, s * 0.25);
    g.quadraticCurveTo(s * 0.8, 0, s * 1.2, -s * 0.1 * (1 + f));
    g.quadraticCurveTo(s * 0.6, -s * (0.6 + f), 0, 0);
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(0, s * 0.05, s * 0.3, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(-s * 0.22, -s * 0.15);
    g.lineTo(-s * 0.15, -s * 0.45);
    g.lineTo(-s * 0.05, -s * 0.2);
    g.moveTo(s * 0.22, -s * 0.15);
    g.lineTo(s * 0.15, -s * 0.45);
    g.lineTo(s * 0.05, -s * 0.2);
    g.fill();
    g.fillStyle = "#FF5D73";
    g.beginPath();
    g.arc(-s * 0.1, 0, s * 0.06, 0, TAU);
    g.arc(s * 0.1, 0, s * 0.06, 0, TAU);
    g.fill();
    g.restore();
  }
  var Game8 = class {
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
      this.curve = 0;
      this.hill = 0;
      this.caught = 0;
      this.giants = 0;
      this.hits = 0;
      this.drops = 0;
    }
    get scene() {
      return SCENES[this.sceneIdx % SCENES.length];
    }
    vp() {
      const { w, h } = this.v;
      return { x: w / 2 + this.curve * w * 0.25, y: h * (0.42 + this.hill * 0.15) };
    }
    proj(x, y, z) {
      const { w, h } = this.v;
      const S = Math.min(w, h * 1.2) * 0.6;
      const vp = this.vp();
      const k = 1 / z;
      const cx = lerp(vp.x, w / 2, clamp(k, 0, 1));
      const cy = lerp(vp.y, h * 0.5, clamp(k, 0, 1));
      return { x: cx + x * S * k, y: cy + y * S * k, s: S * k };
    }
    update(dt, inp) {
      const { w, h, u } = this.v;
      this.t += dt;
      const speed = this.dropT > 0 ? 2.2 : 1;
      this.travel += dt * speed;
      this.curve = Math.sin(this.travel * 0.35) * 0.9 + Math.sin(this.travel * 0.9) * 0.3;
      const sceneT = this.t % SCENE_LEN;
      const target = this.dropT > 0 ? -0.9 : Math.sin(this.travel * 0.5) * 0.4 + (sceneT > SCENE_LEN * 0.4 && sceneT < SCENE_LEN * 0.55 ? 0.8 : 0);
      this.hill = lerp(this.hill, target, Math.min(1, dt * 2));
      const si = Math.floor(this.t / SCENE_LEN);
      if (si !== this.sceneIdx) {
        this.sceneIdx = si;
        this.bannerT = 2.5;
        sfx.whoosh();
        if (this.v.players === 1) say(this.scene.name);
      }
      this.bannerT -= dt;
      if (Math.abs(sceneT - SCENE_LEN * 0.56) < dt && this.dropT <= 0) {
        this.dropT = 3;
        this.dropScored = false;
        sfx.whoosh();
      }
      if (this.dropT > 0) {
        this.dropT -= dt;
        if (inp.present && inp.handsUp && !this.dropScored) {
          this.dropScored = true;
          this.score += 5;
          this.drops++;
          sfx.good();
          this.fx.text(w / 2, h * 0.3, "V\u0131\u0131\u0131\u0131\u0131! +5", "#FFD23F", u * 9);
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
      const hands2 = inp.present ? inp.hands.filter((hd) => hd.visible) : [];
      for (const s of this.stars) {
        if (s.giant) {
          if (s.z > 1.5) s.z = Math.max(1.5, s.z - dt * 3.6 * speed);
          else if ((s.hover -= dt) <= 0) s.z -= dt * 3.6;
          s.rot += dt;
          if (s.z <= 1.5 && !s.dead) {
            const p = this.proj(s.x, s.y, s.z);
            const r = 0.3 * p.s / this.v.diff;
            const n = hands2.filter((hd) => Math.hypot(hd.x - p.x, hd.y - p.y) < r).length;
            if (n >= 2 || inp.fake && n >= 1 && inp.mouseDown) {
              s.dead = true;
              this.score += 5;
              this.giants++;
              sfx.win();
              this.fx.burst(p.x, p.y, RAINBOW, 40, u * 70, u * 1.4, "star");
              this.fx.text(p.x, p.y, "Dev y\u0131ld\u0131z! +5", "#FFD23F", u * 8);
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
            for (const hd of hands2) if (!s.dead && Math.hypot(hd.x - p.x, hd.y - p.y) < r * 0.8) {
              s.dead = true;
              this.hits++;
              this.score = Math.max(0, this.score - 2);
              sfx.bad();
              this.v.hit?.();
              this.fx.text(p.x, p.y, this.scene.deco === "cave" ? "Yarasa! -2" : "Gak gak! -2", "#EF476F", u * 6);
            }
            continue;
          }
          for (const hd of hands2) if (Math.hypot(hd.x - p.x, hd.y - p.y) < r) {
            s.dead = true;
            this.caught++;
            const pts = s.big ? 3 : 1;
            this.score += pts;
            s.big ? sfx.magic() : sfx.coin();
            this.fx.burst(p.x, p.y, s.big ? RAINBOW : ["#FFD23F", "#fff"], 14, u * 40, u, "star");
            this.fx.text(p.x, p.y, "+" + pts, "#FFD23F", u * 6);
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
      sg.addColorStop(0, sc.sky[0]);
      sg.addColorStop(1, sc.sky[1]);
      g.fillStyle = sg;
      g.fillRect(0, 0, w, vp.y + 2);
      g.fillStyle = sc.ground;
      g.fillRect(0, vp.y, w, h - vp.y);
      const px = -this.curve * w * 0.15;
      const m = Math.min(w, h);
      if (sc.deco === "pamukkale") {
        for (let i = 0; i < 3; i++) cloud(g, (i * 0.4 + t * 0.01) % 1.3 * w - w * 0.1, vp.y * (0.2 + i * 0.15), m * 0.08);
        for (let i = 0; i < 6; i++) {
          const yy = vp.y + i * m * 0.05, ww = w * (0.5 + i * 0.25);
          g.fillStyle = "#FFFFFF";
          g.beginPath();
          g.ellipse(w * 0.3 + px, yy, ww / 2, m * 0.035, 0, Math.PI, TAU);
          g.fill();
          g.fillStyle = "#6FD3E8";
          g.beginPath();
          g.ellipse(w * 0.3 + px, yy + m * 8e-3, ww * 0.42, m * 0.02, 0, 0, TAU);
          g.fill();
        }
      } else if (sc.deco === "agri") {
        g.fillStyle = "#7A6E8A";
        g.beginPath();
        g.moveTo(w * 0.1 + px, vp.y);
        g.lineTo(w * 0.5 + px, vp.y - m * 0.45);
        g.lineTo(w * 0.95 + px, vp.y);
        g.fill();
        g.fillStyle = "#fff";
        g.beginPath();
        g.moveTo(w * 0.36 + px, vp.y - m * 0.3);
        g.lineTo(w * 0.5 + px, vp.y - m * 0.45);
        g.lineTo(w * 0.66 + px, vp.y - m * 0.28);
        g.lineTo(w * 0.58 + px, vp.y - m * 0.32);
        g.lineTo(w * 0.52 + px, vp.y - m * 0.26);
        g.lineTo(w * 0.45 + px, vp.y - m * 0.32);
        g.closePath();
        g.fill();
        g.fillStyle = "#9A8FA8";
        g.beginPath();
        g.moveTo(w * 0.6 + px, vp.y);
        g.lineTo(w * 0.78 + px, vp.y - m * 0.2);
        g.lineTo(w * 1 + px, vp.y);
        g.fill();
      } else if (sc.deco === "cave") {
        for (let i = 0; i < 40; i++) {
          const x = i * 97 % 100 / 100 * w, y = i * 53 % 100 / 100 * vp.y;
          const c = ["#7CF7FF", "#C77DFF", "#FF7AD9", "#9BFF8A"][i % 4];
          g.globalAlpha = 0.5 + Math.sin(t * 3 + i) * 0.4;
          g.fillStyle = c;
          g.beginPath();
          g.moveTo(x, y - 8);
          g.lineTo(x + 5, y);
          g.lineTo(x, y + 8);
          g.lineTo(x - 5, y);
          g.closePath();
          g.fill();
        }
        g.globalAlpha = 1;
        g.fillStyle = "#3A2D55";
        for (let i = 0; i < 12; i++) {
          const x = i / 11 * w;
          g.beginPath();
          g.moveTo(x - m * 0.04, 0);
          g.lineTo(x, m * (0.1 + i % 3 * 0.06));
          g.lineTo(x + m * 0.04, 0);
          g.fill();
        }
      } else if (sc.deco === "kapadokya") {
        g.fillStyle = "#D9925A";
        for (let i = 0; i < 9; i++) {
          const x = i / 8 * w + px, hh = m * (0.12 + i % 3 * 0.06);
          g.beginPath();
          g.moveTo(x - m * 0.04, vp.y);
          g.quadraticCurveTo(x - m * 0.03, vp.y - hh, x, vp.y - hh);
          g.quadraticCurveTo(x + m * 0.03, vp.y - hh, x + m * 0.04, vp.y);
          g.fill();
          g.fillStyle = "#A9683A";
          g.beginPath();
          g.ellipse(x, vp.y - hh, m * 0.025, m * 0.012, 0, Math.PI, TAU);
          g.fill();
          g.fillStyle = "#D9925A";
        }
      } else if (sc.deco === "yayla") {
        g.fillStyle = "#2F7D3F";
        g.beginPath();
        g.moveTo(0, vp.y);
        g.quadraticCurveTo(w * 0.25 + px, vp.y - m * 0.35, w * 0.5 + px, vp.y);
        g.quadraticCurveTo(w * 0.75 + px, vp.y - m * 0.28, w, vp.y);
        g.fill();
        for (let i = 0; i < 3; i++) {
          const x = w * (0.2 + i * 0.3) + px, y = vp.y - m * 0.02;
          g.fillStyle = "#8B5A2B";
          g.fillRect(x - m * 0.03, y - m * 0.04, m * 0.06, m * 0.04);
          g.fillStyle = "#5D3A1A";
          g.beginPath();
          g.moveTo(x - m * 0.04, y - m * 0.04);
          g.lineTo(x, y - m * 0.07);
          g.lineTo(x + m * 0.04, y - m * 0.04);
          g.fill();
        }
        g.fillStyle = "rgba(255,255,255,0.35)";
        for (let i = 0; i < 3; i++) g.fillRect(0, vp.y - m * (0.05 + i * 0.07), w, m * 0.025);
      }
    }
    draw(g, inp, t) {
      const { w, h } = this.v;
      this.drawScenery(g, t);
      const cave = this.scene.deco === "cave";
      const phase = this.travel * (this.dropT > 0 ? 2.2 : 1) * 3 % 1;
      for (let i = 14; i >= 0; i--) {
        const z = 0.8 + (i + 1 - phase) * 0.6;
        const a = this.proj(-0.6, 0.55, z), b = this.proj(0.6, 0.55, z);
        g.strokeStyle = cave ? "#6B4F8A" : "#8B5A2B";
        g.lineWidth = Math.max(2, a.s * 0.05);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
      for (const sx of [-0.45, 0.45]) {
        g.strokeStyle = "#E63946";
        g.lineWidth = 6;
        g.beginPath();
        for (let z = 9; z >= 0.8; z -= 0.2) {
          const p = this.proj(sx, 0.55, z);
          z === 9 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y);
        }
        g.stroke();
      }
      const vp = this.vp();
      const fogRGB = cave ? "42,27,79" : this.scene.deco === "kapadokya" ? "255,227,190" : "230,242,255";
      fogBand(g, w, vp.y, h * 0.08, fogRGB, cave ? 0.8 : 0.75);
      for (const s of this.stars.slice().sort((a, b) => b.z - a.z)) {
        const p = this.proj(s.x, s.y, s.z);
        const r = (s.giant ? 0.3 : s.big ? 0.16 : 0.1) * p.s;
        g.globalAlpha = clamp((9 - s.z) / 3, 0, 1) ** 2;
        if (s.bad) {
          if (this.scene.deco === "cave") bat(g, p.x, p.y, r * 1.4, this.t + s.x * 5);
          else bird(g, p.x, p.y, r * 1.2, this.t + s.x * 5, "#111827");
          g.globalAlpha = 1;
          continue;
        }
        g.save();
        g.translate(p.x, p.y);
        g.rotate(s.rot);
        g.shadowColor = "#FFE66D";
        g.shadowBlur = 20;
        star(g, 0, 0, r, s.big ? `hsl(${this.t * 200 % 360},90%,60%)` : "#FFD23F", "#fff");
        g.restore();
        g.globalAlpha = 1;
        if (s.giant && s.z <= 1.5) text(g, "\u{1F64C} \u0130ki elinle tut!", p.x, p.y + r * 1.3, Math.max(16, r * 0.3), "#fff");
      }
    }
    drawOver(g, inp, t) {
      const { w, h, u } = this.v;
      const m = Math.min(w, h);
      const shakeY = Math.sin(t * 25) * (this.dropT > 0 ? 4 : 1.5);
      g.save();
      g.translate(0, shakeY);
      g.fillStyle = "#C1121F";
      g.beginPath();
      g.moveTo(w * 0.05, h);
      g.lineTo(w * 0.12, h - m * 0.16);
      g.quadraticCurveTo(w * 0.5, h - m * 0.22, w * 0.88, h - m * 0.16);
      g.lineTo(w * 0.95, h);
      g.fill();
      g.fillStyle = "#FFD23F";
      g.fillRect(w * 0.1, h - m * 0.13, w * 0.8, m * 0.025);
      g.fillStyle = "#334155";
      g.fillRect(w * 0.2, h - m * 0.2, w * 0.6, m * 0.02);
      g.restore();
      if (this.bannerT > 0) {
        const a = clamp(this.bannerT, 0, 1);
        g.globalAlpha = a;
        const bw = m * 0.7, bh = m * 0.12;
        g.fillStyle = "#fff";
        g.strokeStyle = "#C0392B";
        g.lineWidth = 5;
        g.beginPath();
        g.roundRect ? g.roundRect(w / 2 - bw / 2, h * 0.22 - bh / 2, bw, bh, bh / 2) : g.rect(w / 2 - bw / 2, h * 0.22 - bh / 2, bw, bh);
        g.fill();
        g.stroke();
        text(g, this.scene.name + "!", w / 2, h * 0.225, m * 0.06, "#C0392B", { stroke: null, weight: 800 });
        g.globalAlpha = 1;
      }
      if (this.dropT > 0) text(g, "\u{1F64C} Eller yukar\u0131!", w / 2, h * 0.35, m * 0.09 * (1 + Math.sin(t * 12) * 0.05), this.dropScored ? "#06D6A0" : "#FFD23F");
      this.fx.draw(g);
      vignette(g, w, h, this.dropT > 0 ? 0.45 : 0.25, "0,0,0");
    }
    speedKmh() {
      return (this.dropT > 0 ? 95 : 45) + Math.sin(this.travel) * 6;
    }
    stage() {
      return { list: ["\u{1F3C1} Ba\u015Flang\u0131\xE7", ...SCENES.map((s) => s.name), "\u{1F389} Biti\u015F"], idx: Math.min(SCENES.length + 1, this.sceneIdx + 1) };
    }
    stats() {
      return [
        { icon: "\u2B50", label: "Y\u0131ld\u0131z", value: this.caught },
        { icon: "\u{1F31F}", label: "Dev y\u0131ld\u0131z", value: this.giants },
        { icon: "\u{1F64C}", label: "\u0130ni\u015F", value: this.drops },
        { icon: "\u{1F987}", label: "\xC7arpma", value: this.hits }
      ];
    }
  };
  var hiztreni_default = {
    id: "hiztreni",
    title: "Anadolu H\u0131z Treni",
    tagline: "Eller yukar\u0131, y\u0131ld\u0131zlar\u0131 yakala!",
    description: "H\u0131z treninin en \xF6n\xFCnde oturuyorsun: 3, 2, 1\u2026 Pamukkale travertenleri, A\u011Fr\u0131 Da\u011F\u0131, \u0131\u015F\u0131l \u0131\u015F\u0131l kristalli Damlata\u015F Ma\u011Faras\u0131, Kapadokya ve Karadeniz yaylas\u0131! Ellerini uzat, u\xE7an y\u0131ld\u0131zlar\u0131 yakala. B\xFCy\xFCk ini\u015Flerde iki elini birden kald\u0131r!",
    howto: ["Y\u0131ld\u0131zlara uzan", "Dev y\u0131ld\u0131z\u0131 iki elinle tut: +5", "\u0130ni\u015Fte eller yukar\u0131!", "Yarasa ve kargaya dokunma: -2"],
    color: "#8338EC",
    emoji: "\u{1F3A2}",
    duration: SCENE_LEN * 5,
    camAlpha: 0.18,
    stars: [30, 60, 95],
    hint: "Ellerini uzat, y\u0131ld\u0131zlar\u0131 yakala!",
    create: (v) => new Game8(v),
    thumb(g, w, h, t) {
      const gm = new Game8({ w, h, u: Math.min(w, h) / 100, players: 1, player: 0, diff: 1 });
      gm.sceneIdx = Math.floor(t / 2) % SCENES.length;
      gm.travel = t;
      gm.curve = Math.sin(t * 0.7) * 0.8;
      gm.hill = Math.sin(t * 0.5) * 0.3;
      gm.stars = [{ x: -0.4, y: -0.6, z: 3, rot: t }, { x: 0.5, y: -0.4, z: 2, rot: -t, big: true }];
      gm.draw(g, {}, t);
    }
  };

  // js/games/cini.js
  var circle = (n, r = 0.42) => Array.from({ length: n + 1 }, (_, i) => [0.5 + Math.cos(-Math.PI / 2 + i / n * TAU) * r, 0.5 + Math.sin(-Math.PI / 2 + i / n * TAU) * r]);
  var starPts = () => Array.from({ length: 11 }, (_, i) => {
    const r = i % 2 ? 0.2 : 0.46;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    return [0.5 + Math.cos(a) * r, 0.52 + Math.sin(a) * r];
  });
  var SHAPES = [
    { k: "lale", name: "Lale", pts: [[0.5, 0.95], [0.5, 0.62], [0.25, 0.58], [0.2, 0.2], [0.36, 0.36], [0.5, 0.1], [0.64, 0.36], [0.8, 0.2], [0.75, 0.58], [0.5, 0.62]] },
    { k: "yildiz", name: "Y\u0131ld\u0131z", pts: starPts() },
    { k: "nazar", name: "Nazar Boncu\u011Fu", pts: circle(8) },
    { k: "kule", name: "K\u0131z Kulesi", pts: [[0.15, 0.95], [0.35, 0.95], [0.35, 0.5], [0.42, 0.4], [0.5, 0.08], [0.58, 0.4], [0.65, 0.5], [0.65, 0.95], [0.85, 0.95]] },
    { k: "balik", name: "Bo\u011Faz Bal\u0131\u011F\u0131", pts: [[0.08, 0.5], [0.33, 0.28], [0.62, 0.3], [0.8, 0.5], [0.96, 0.28], [0.96, 0.72], [0.8, 0.5], [0.62, 0.7], [0.33, 0.72], [0.08, 0.5]] },
    { k: "kelebek", name: "Kelebek", pts: [[0.5, 0.5], [0.2, 0.12], [0.06, 0.4], [0.5, 0.5], [0.18, 0.85], [0.38, 0.92], [0.5, 0.5], [0.62, 0.92], [0.82, 0.85], [0.5, 0.5], [0.94, 0.4], [0.8, 0.12], [0.5, 0.5]] },
    { k: "kubbe", name: "Ay ve Kubbe", pts: [[0.08, 0.95], [0.08, 0.62], [0.22, 0.38], [0.5, 0.26], [0.78, 0.38], [0.92, 0.62], [0.92, 0.95]] },
    { k: "gunes", name: "G\xFCne\u015F", pts: circle(7, 0.36) },
    { k: "gokkusagi", name: "G\xF6kku\u015Fa\u011F\u0131", pts: Array.from({ length: 8 }, (_, i) => [0.5 - Math.cos(i / 7 * Math.PI) * 0.45, 0.85 - Math.sin(i / 7 * Math.PI) * 0.6]) },
    { k: "kalp", name: "Kalp", pts: [[0.5, 0.9], [0.14, 0.52], [0.14, 0.26], [0.32, 0.14], [0.5, 0.3], [0.68, 0.14], [0.86, 0.26], [0.86, 0.52], [0.5, 0.9]] }
  ];
  var Game9 = class {
    constructor(view) {
      this.v = view;
      this.score = 0;
      this.fx = new Particles();
      this.queue = shuffle(SHAPES);
      this.world = { tulips: [], fish: [], butterflies: [], nazar: false, kule: false, moon: false, sun: 0, rainbow: false, hearts: [] };
      this.stars = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: rand(0.5, 2), ph: rand(0, TAU) }));
      this.t = 0;
      this.shapes = 0;
      this.dots = 0;
      this.hits = 0;
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
      if (this.v.players === 1) say(pick(["Abrakadabra!", "\u015E\u0131b\u0131d\u0131k!", "Hokus pokus!", "Sim sala bim!"]));
      if (k === "lale") for (let i = 0; i < 6; i++) W.tulips.push({ x: rand(0.03, 0.97), s: rand(0.05, 0.09), c: pick(["#E63946", "#FF5DA2", "#FFD23F", "#8338EC"]), g: 0 });
      if (k === "balik") for (let i = 0; i < 5; i++) W.fish.push({ x: rand(-0.3, 0), y: rand(0.8, 0.95), sp: rand(0.05, 0.12), c: pick(RAINBOW) });
      if (k === "kelebek") for (let i = 0; i < 5; i++) W.butterflies.push({ x: rand(0.1, 0.9), y: rand(0.2, 0.6), ph: rand(0, TAU), c: pick(RAINBOW) });
      if (k === "nazar") W.nazar = true;
      if (k === "kule") W.kule = true;
      if (k === "kubbe") W.moon = true;
      if (k === "gunes") W.sun = 6;
      if (k === "gokkusagi") W.rainbow = true;
      if (k === "kalp") for (let i = 0; i < 12; i++) W.hearts.push({ x: rand(0.1, 0.9), y: 1.05, sp: rand(0.08, 0.18), c: pick(["#FF5DA2", "#EF476F", "#FFB4C2"]) });
      if (k === "yildiz") for (let i = 0; i < 6; i++) setTimeout(() => this.fx.burst(rand(0.15, 0.85) * w, rand(0.1, 0.4) * h, RAINBOW, 30, u * 50, u * 1.1, "star"), i * 250);
      this.fx.burst(w / 2, h * 0.47, RAINBOW, 50, u * 70, u * 1.3, "star");
      this.fx.text(w / 2, h * 0.2, `${this.shape.name}! +10`, "#FFD23F", u * 8);
    }
    update(dt, inp) {
      const { u } = this.v;
      this.t += dt;
      this.enterT += dt;
      const W = this.world;
      W.sun = Math.max(0, W.sun - dt);
      for (const f of W.fish) {
        f.x += f.sp * dt;
        if (f.x > 1.2) f.x = -0.2;
      }
      for (const b of W.butterflies) {
        b.ph += dt;
        b.x += Math.sin(b.ph * 0.7) * 0.04 * dt;
        b.y += Math.cos(b.ph * 0.9) * 0.03 * dt;
      }
      for (const t of W.tulips) t.g = Math.min(1, t.g + dt);
      for (const hh of W.hearts) hh.y -= hh.sp * dt;
      W.hearts = W.hearts.filter((hh) => hh.y > -0.1);
      const st = this.storm;
      st.cool -= dt;
      st.x += st.dir * 0.06 * this.v.diff * dt;
      st.y = 0.3 + Math.sin(this.t * 0.5) * 0.15;
      if (st.x > 1.2) st.dir = -1;
      else if (st.x < -0.2) st.dir = 1;
      if (this.t > 8 && st.cool <= 0 && inp.present) {
        const sp = { x: st.x * this.v.w, y: st.y * this.v.h };
        for (const hd of inp.hands) if (hd.visible && dist(hd, sp) < this.v.u * 10) {
          st.cool = 2;
          this.hits++;
          this.score = Math.max(0, this.score - 2);
          sfx.bump();
          this.v.hit?.();
          this.fx.text(sp.x, sp.y - this.v.u * 8, "G\xFCr\xFCm! -2", "#EF476F", u * 6);
          break;
        }
      }
      if (this.magicT > 0) {
        this.magicT -= dt;
        if (this.magicT <= 0) this.next();
        this.fx.update(dt);
        return;
      }
      const hands2 = inp.present ? inp.hands.filter((hd) => hd.visible) : [];
      const p = this.pt(this.idx);
      const r = Math.max(28, this.box().s * 0.08) / this.v.diff;
      for (const hd of hands2) if (dist(hd, p) < r) {
        sfx.tap(this.idx);
        this.score += 1;
        this.dots++;
        this.fx.burst(p.x, p.y, ["#fff", "#7CF7FF", "#FFD23F"], 10, u * 25, u * 0.8, "star");
        this.idx++;
        if (this.idx >= this.shape.pts.length) {
          this.score += 10;
          this.shapes++;
          this.magicT = 2.6;
          this.cast();
        }
        break;
      }
      this.fx.update(dt);
    }
    draw(g, inp, t) {
      const { w, h } = this.v;
      const W = this.world;
      const day = clamp(W.sun > 0 ? Math.min(1, (6 - W.sun) * 2, W.sun) : 0, 0, 1);
      const sg = g.createLinearGradient(0, 0, 0, h);
      sg.addColorStop(0, day > 0 ? mix("#0B1340", "#5FB4F0", day) : "#0B1340");
      sg.addColorStop(1, day > 0 ? mix("#3B2470", "#CDEBFF", day) : "#3B2470");
      g.fillStyle = sg;
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 1 - day;
      for (const s of this.stars) {
        g.fillStyle = "#fff";
        g.globalAlpha = (1 - day) * (0.5 + Math.sin(t * 2 + s.ph) * 0.4);
        g.beginPath();
        g.arc(s.x * w, s.y * h, s.r, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;
      const m = Math.min(w, h);
      if (day > 0) {
        g.fillStyle = "#FFE066";
        g.beginPath();
        g.arc(w * 0.8, h * 0.15, m * 0.08 * day, 0, TAU);
        g.fill();
      }
      if (W.moon) crescentStar(g, w * 0.18, h * 0.14, m * 0.06, "#FFF3B0");
      if (W.rainbow) RAINBOW.slice(0, 6).forEach((c, i) => {
        g.strokeStyle = c;
        g.globalAlpha = 0.55;
        g.lineWidth = m * 0.02;
        g.beginPath();
        g.arc(w / 2, h * 0.85, w * 0.45 - i * m * 0.02, Math.PI, TAU);
        g.stroke();
        g.globalAlpha = 1;
      });
      g.fillStyle = "#1D3B6E";
      g.fillRect(0, h * 0.86, w, h * 0.14);
      g.fillStyle = "#2C5A3A";
      g.beginPath();
      g.moveTo(0, h * 0.88);
      g.quadraticCurveTo(w * 0.25, h * 0.8, w * 0.45, h * 0.88);
      g.lineTo(0, h);
      g.fill();
      if (W.kule) {
        const kx = w * 0.82, ky = h * 0.88;
        g.fillStyle = "#F1E4C8";
        g.fillRect(kx - m * 0.05, ky - m * 0.06, m * 0.1, m * 0.06);
        g.fillRect(kx - m * 0.02, ky - m * 0.16, m * 0.04, m * 0.1);
        g.fillStyle = "#5B7DB1";
        g.beginPath();
        g.moveTo(kx - m * 0.03, ky - m * 0.16);
        g.lineTo(kx, ky - m * 0.22);
        g.lineTo(kx + m * 0.03, ky - m * 0.16);
        g.fill();
        g.fillStyle = `rgba(255,220,120,${0.6 + Math.sin(t * 4) * 0.3})`;
        g.fillRect(kx - m * 8e-3, ky - m * 0.13, m * 0.016, m * 0.02);
      }
      for (const f of W.fish) {
        g.fillStyle = f.c;
        const fx = f.x * w, fy = f.y * h;
        g.beginPath();
        g.ellipse(fx, fy, m * 0.03, m * 0.015, 0, 0, TAU);
        g.fill();
        g.beginPath();
        g.moveTo(fx - m * 0.025, fy);
        g.lineTo(fx - m * 0.05, fy - m * 0.015);
        g.lineTo(fx - m * 0.05, fy + m * 0.015);
        g.fill();
      }
      for (const tp of W.tulips) tulip(g, tp.x * w, h * 0.9, tp.s * m * tp.g * 1.6, tp.c);
      if (W.nazar) nazar(g, w * 0.08, h * 0.35 + Math.sin(t) * 6, m * 0.05);
      for (const b of W.butterflies) {
        const bx = b.x * w, by = b.y * h, f = Math.abs(Math.sin(t * 10 + b.ph));
        g.fillStyle = b.c;
        g.beginPath();
        g.ellipse(bx - m * 0.015 * f, by, m * 0.018 * f + 1, m * 0.025, 0, 0, TAU);
        g.ellipse(bx + m * 0.015 * f, by, m * 0.018 * f + 1, m * 0.025, 0, 0, TAU);
        g.fill();
      }
      for (const hh of W.hearts) {
        g.fillStyle = hh.c;
        heart(g, hh.x * w, hh.y * h, m * 0.03);
      }
    }
    drawOver(g, inp, t) {
      const { w, h, u } = this.v;
      const pts = this.shape.pts;
      const done = this.magicT > 0;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.strokeStyle = done ? `hsl(${t * 300 % 360},90%,65%)` : "#7CF7FF";
      g.shadowColor = "#7CF7FF";
      g.shadowBlur = 18;
      g.lineWidth = Math.max(5, u * 1.6);
      g.beginPath();
      for (let i = 0; i < this.idx; i++) {
        const p = this.pt(i);
        i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y);
      }
      g.stroke();
      g.shadowBlur = 0;
      if (done) {
        g.fillStyle = "rgba(124,247,255,0.15)";
        g.beginPath();
        pts.forEach((_, i) => {
          const p = this.pt(i);
          i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y);
        });
        g.fill();
      } else {
        const seen = /* @__PURE__ */ new Set();
        for (let i = pts.length - 1; i >= this.idx; i--) {
          const p = this.pt(i);
          const key = pts[i].join(",");
          if (i !== this.idx && seen.has(key)) continue;
          seen.add(key);
          const cur = i === this.idx;
          const r = cur ? Math.max(18, u * 5) * (1 + Math.sin(t * 6) * 0.15) : Math.max(8, u * 2.2);
          if (cur) {
            const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.2);
            gr.addColorStop(0, "rgba(255,240,150,0.9)");
            gr.addColorStop(1, "rgba(255,240,150,0)");
            g.fillStyle = gr;
            g.beginPath();
            g.arc(p.x, p.y, r * 2.2, 0, TAU);
            g.fill();
            star(g, p.x, p.y, r, "#FFD23F", "#fff");
          } else {
            g.fillStyle = "rgba(255,255,255,0.55)";
            g.beginPath();
            g.arc(p.x, p.y, r, 0, TAU);
            g.fill();
          }
          if (!cur && i === this.idx + 1) text(g, String(i + 1), p.x, p.y - r * 2, r * 1.6, "#fff");
        }
        g.strokeStyle = "rgba(255,255,255,0.12)";
        g.lineWidth = 3;
        g.setLineDash([6, 8]);
        g.beginPath();
        pts.forEach((_, i) => {
          const p = this.pt(i);
          i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y);
        });
        g.stroke();
        g.setLineDash([]);
      }
      text(g, done ? "\u2728 " + this.shape.name + " \u2728" : "Sihirli \u015Fekil: ?", w / 2, h * 0.08 + u * 10, u * 5.5, done ? "#FFD23F" : "#fff");
      if (this.t > 8) {
        const st = this.storm, sx = st.x * w, sy = st.y * h, s = u * 10;
        g.globalAlpha = st.cool > 0 ? 0.5 : 0.95;
        cloud(g, sx - s * 0.5, sy, s, "#3B3355");
        cloud(g, sx - s * 0.4, sy - s * 0.1, s * 0.8, "#4B4370");
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(sx - s * 0.1, sy - s * 0.05, s * 0.07, 0, TAU);
        g.arc(sx + s * 0.15, sy - s * 0.05, s * 0.07, 0, TAU);
        g.fill();
        g.fillStyle = "#111";
        g.beginPath();
        g.arc(sx - s * 0.1, sy - s * 0.03, s * 0.035, 0, TAU);
        g.arc(sx + s * 0.15, sy - s * 0.03, s * 0.035, 0, TAU);
        g.fill();
        if (st.cool > 1.5 || Math.sin(t * 9) > 0.92) {
          g.strokeStyle = "#FFE66D";
          g.lineWidth = s * 0.06;
          g.beginPath();
          g.moveTo(sx, sy + s * 0.3);
          g.lineTo(sx - s * 0.1, sy + s * 0.6);
          g.lineTo(sx + s * 0.08, sy + s * 0.6);
          g.lineTo(sx - s * 0.05, sy + s * 0.95);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      this.fx.draw(g);
      vignette(g, w, h, 0.35, "10,5,40");
    }
    stats() {
      return [
        { icon: "\u{1FA84}", label: "B\xFCy\xFC", value: this.shapes },
        { icon: "\u2728", label: "Nokta", value: this.dots },
        { icon: "\u26C8\uFE0F", label: "Bulut", value: this.hits },
        { icon: "\u{1F522}", label: "S\u0131radaki", value: this.magicT > 0 ? "\u2714" : `${this.idx + 1}/${this.shape.pts.length}` }
      ];
    }
  };
  function heart(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * 0.8);
    g.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.5, y - s * 1.1, x, y - s * 0.35);
    g.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s * 1.4, y - s * 0.2, x, y + s * 0.8);
    g.fill();
  }
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = (sh) => Math.round((pa >> sh & 255) * (1 - t) + (pb >> sh & 255) * t);
    return `rgb(${c(16)},${c(8)},${c(0)})`;
  }
  var cini_default = {
    id: "cini",
    title: "Sihirli \xC7ini",
    tagline: "\u015E\u0131b\u0131d\u0131k, b\xFCy\xFC ba\u015Flas\u0131n!",
    description: "Y\u0131ld\u0131zl\u0131 bir gecede parlayan noktalara s\u0131rayla dokun. \u015Eekil tamamlan\u0131nca b\xFCy\xFC ger\xE7ekle\u015Fir: laleler a\xE7ar, K\u0131z Kulesi \u0131\u015F\u0131l \u0131\u015F\u0131l yanar, Bo\u011Faz\u2019da bal\u0131klar y\xFCzer, gece g\xFCnd\xFCze d\xF6ner, g\xF6kku\u015Fa\u011F\u0131 \xE7\u0131kar ve daha neler neler!",
    howto: ["Parlayan y\u0131ld\u0131za dokun", "\xC7izgiyi takip et", "Kara buluta dokunma: -2", "B\xFCy\xFCy\xFC izle!"],
    color: "#5B2A86",
    emoji: "\u{1FA84}",
    duration: 100,
    camAlpha: 0.22,
    stars: [40, 80, 130],
    hint: "Parlayan y\u0131ld\u0131za dokun!",
    create: (v) => new Game9(v),
    thumb(g, w, h, t) {
      const sg = g.createLinearGradient(0, 0, 0, h);
      sg.addColorStop(0, "#0B1340");
      sg.addColorStop(1, "#3B2470");
      g.fillStyle = sg;
      g.fillRect(0, 0, w, h);
      const pts = SHAPES[0].pts;
      const s = h * 0.8, ox = w / 2 - s / 2, oy = h * 0.1;
      const n = Math.floor(t * 3 % (pts.length + 4));
      g.strokeStyle = "#7CF7FF";
      g.lineWidth = 4;
      g.shadowColor = "#7CF7FF";
      g.shadowBlur = 12;
      g.beginPath();
      pts.slice(0, Math.min(n, pts.length)).forEach(([x, y], i) => i ? g.lineTo(ox + x * s, oy + y * s) : g.moveTo(ox + x * s, oy + y * s));
      g.stroke();
      g.shadowBlur = 0;
      pts.forEach(([x, y], i) => {
        if (i >= n) {
          g.fillStyle = i === n ? "#FFD23F" : "rgba(255,255,255,0.5)";
          g.beginPath();
          g.arc(ox + x * s, oy + y * s, i === n ? 7 : 4, 0, TAU);
          g.fill();
        }
      });
      if (n >= pts.length) tulip(g, w * 0.15, h * 0.95, h * 0.25, "#E63946");
      crescentStar(g, w * 0.85, h * 0.18, h * 0.08, "#FFF3B0");
    }
  };

  // js/app.js
  var GAMES = [kapadokya_default, hezarfen_default, lokanta_default, hasat_default, taekwondo_default, motokros_default, kayak_default, hiztreni_default, cini_default];
  var META = {
    kapadokya: { c: "#EF476F", cd: "#B8264B", tint: "#FFF0F3", lvl: "Orta", demo: "touch", controls: "\u270B Balonlara dokun \xB7 \u{1F646} kafa da patlat\u0131r \xB7 \u{1F41D} ar\u0131 ve \u{1F426} ku\u015Fa dokunma!" },
    hezarfen: { c: "#2E86DE", cd: "#1B5A99", tint: "#EEF6FF", lvl: "Aksiyon", demo: "tilt", controls: "\u2194\uFE0F Kollar\u0131 e\u011F = d\xF6n \xB7 \u{1F64C} kollar yukar\u0131 = y\xFCksel \xB7 \u{1F447} a\u015Fa\u011F\u0131 = al\xE7al" },
    lokanta: { c: "#F77F00", cd: "#B85E00", tint: "#FFF5EA", lvl: "Kolay", demo: "touch", controls: "\u270B Sar\u0131 yanan malzemeye dokun \xB7 \u274C yanl\u0131\u015F malzeme -1" },
    hasat: { c: "#3BAA4A", cd: "#257A31", tint: "#F0FBF1", lvl: "Kolay", demo: "touch", controls: "\u270B Meyvelere uzan \xB7 \u{1F9FA} d\xFC\u015Feni yakala \xB7 \u{1F41D} ar\u0131ya dokunma" },
    taekwondo: { c: "#E63946", cd: "#A61E2A", tint: "#FFF1F2", lvl: "Orta", demo: "pose", controls: "\u{1F94B} Hocan\u0131n pozunu yap \xB7 ye\u015Fil olunca tut" },
    motokros: { c: "#D9822B", cd: "#9A5615", tint: "#FFF6EC", lvl: "Aksiyon", demo: "step", controls: "\u2194\uFE0F Sa\u011Fa-sola ad\u0131m at \xB7 \u2B06\uFE0F z\u0131pla \xB7 \u{1F414}\u{1F411} engellere \xE7arpma" },
    kayak: { c: "#2BB3D9", cd: "#167F9C", tint: "#ECFAFF", lvl: "Aksiyon", demo: "tilt", controls: "\u2194\uFE0F Kollar\u0131 a\xE7 ve e\u011F = d\xF6n \xB7 \u2B06\uFE0F tepede z\u0131pla \xB7 \u{1F332}\u26C4 \xE7arpma" },
    hiztreni: { c: "#C0392B", cd: "#8C2219", tint: "#FFF2F0", lvl: "Kolay", demo: "touch", controls: "\u270B Y\u0131ld\u0131zlara uzan \xB7 \u{1F64C} ini\u015Fte eller yukar\u0131 \xB7 \u{1F987} yarasaya dokunma" },
    cini: { c: "#8338EC", cd: "#5B1FB0", tint: "#F6F0FF", lvl: "Kolay", demo: "touch", controls: "\u270B Parlayan y\u0131ld\u0131za dokun \xB7 \u2601\uFE0F kara buluttan uzak dur" }
  };
  GAMES.forEach((g) => {
    g.controls = META[g.id].controls;
  });
  var byId = Object.fromEntries(GAMES.map((g) => [g.id, g]));
  var $ = (s) => document.querySelector(s);
  var store = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v === null ? d : JSON.parse(v);
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {
      }
    }
  };
  var state = {
    players: store.get("ho-players", 1),
    difficulty: store.get("ho-diff", "orta"),
    tracker: null,
    cameraBusy: false,
    session: null,
    current: null,
    // { game, players, mouse }
    readyFlags: [false, false]
  };
  var hands;
  var thumbs = [];
  function buildHome() {
    const grid = $("#grid");
    GAMES.forEach((g, i) => {
      const m = META[g.id];
      const card = document.createElement("div");
      card.className = "card";
      card.style.setProperty("--c", m.c);
      card.style.setProperty("--cd", m.cd);
      card.style.setProperty("--tint", m.tint);
      const lvlClass = m.lvl === "Kolay" ? "kolay" : m.lvl === "Aksiyon" ? "aksiyon" : "";
      card.innerHTML = `
      <div class="card-top"><span class="num">${i + 1}</span><span class="lvl ${lvlClass}">${m.lvl}</span></div>
      <canvas></canvas>
      <h3>${g.title}</h3>
      <div class="best" data-best="${g.id}"></div>
      <button class="play-btn" data-dwell>\u25B6 OYNA</button>`;
      card.querySelector(".play-btn").addEventListener("click", () => openGame(g.id));
      card.querySelector("canvas").addEventListener("click", () => openGame(g.id));
      grid.appendChild(card);
      thumbs.push({ canvas: card.querySelector("canvas"), game: g });
    });
    const rec = document.createElement("div");
    rec.className = "card records-card";
    rec.innerHTML = `<div class="card-top"><span class="num">\u{1F3C6}</span><span class="lvl">Rekorlar</span></div><h3>Rekorlar\u0131m</h3><ul class="rec-list" id="recList"></ul>`;
    grid.appendChild(rec);
    renderRecords();
    document.querySelectorAll(".pchip-av").forEach((img, i) => {
      img.src = avatarURL(i, 112);
    });
    const lc = $("#logoCat").getContext("2d");
    vanCat(lc, 60, 66, 40, "happy");
    const ld = $("#loaderCat").getContext("2d");
    vanCat(ld, 80, 88, 54, "happy");
  }
  function renderRecords() {
    const best = store.get("ho-best", {});
    const rows = Object.entries(best).sort((a, b) => b[1] - a[1]).slice(0, 4);
    $("#recList").innerHTML = rows.length ? rows.map(([id, s]) => `<li><span>${byId[id]?.emoji || "\u{1F3AE}"} ${byId[id]?.title || id}</span><b>${s}</b></li>`).join("") : '<li class="empty">Hen\xFCz rekor yok. Haydi bir oyun oyna! \u{1F388}</li>';
    document.querySelectorAll("[data-best]").forEach((el) => {
      const b = best[el.dataset.best];
      el.textContent = b ? `\u{1F3C6} Rekor: ${b}` : "";
    });
  }
  function sizeCanvas(c) {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return null;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g, w, h };
  }
  function syncSegs() {
    document.querySelectorAll("[data-players]").forEach((b) => b.classList.toggle("on", Number(b.dataset.players) === state.players));
    document.querySelectorAll("[data-diff]").forEach((b) => b.classList.toggle("on", b.dataset.diff === state.difficulty));
    $("#chip1").style.opacity = state.players === 2 ? 1 : 0.55;
  }
  async function ensureCamera(statusEl) {
    if (state.tracker && state.tracker.running && state.tracker.landmarker) return true;
    if (state.cameraBusy) return false;
    state.cameraBusy = true;
    const setStatus = (s) => {
      if (statusEl) statusEl.textContent = s;
    };
    try {
      if (!state.tracker) state.tracker = new PoseTracker();
      setStatus("Kamera a\xE7\u0131l\u0131yor\u2026");
      if (!state.tracker.running) await state.tracker.startCamera();
      if (!state.tracker.landmarker) await state.tracker.loadModel((s) => setStatus(s));
      state.cameraBusy = false;
      updateCamButtons();
      return true;
    } catch (e) {
      console.error(e);
      state.cameraBusy = false;
      if (state.tracker) state.tracker.stop();
      state.tracker = null;
      updateCamButtons();
      throw e;
    }
  }
  function stopCamera() {
    if (state.tracker) state.tracker.stop();
    state.tracker = null;
    updateCamButtons();
  }
  function updateCamButtons() {
    const on = !!(state.tracker && state.tracker.running);
    $("#startCam").textContent = on ? "\u23F9 Kameray\u0131 kapat" : "\u{1F4F7} Kameray\u0131 a\xE7";
    $("#startCam").classList.toggle("on-cam", on);
    $("#startCam").classList.toggle("green", !on);
    $("#camBtn").classList.toggle("on", on);
    $("#marqueeText").textContent = on ? "\u270B Elini kald\u0131r, bir kart\u0131n \xFCst\xFCnde tut, daire dolunca oyun a\xE7\u0131l\u0131r! \u2B50" : "\u2728 \u{1F4F7} Kameray\u0131 a\xE7, sonra her \u015Feyi ellerinle y\xF6net! \u2B50";
  }
  function camErrorText(e) {
    if (e && e.name === "NotAllowedError") return "Kamera izni verilmedi. Adres \xE7ubu\u011Fundaki kamera simgesinden izin verip tekrar deneyebilirsin.";
    if (e && e.name === "NotFoundError") return "Bu cihazda kamera bulunamad\u0131. Fareyle oynayabilirsin!";
    if (e && e.name === "NotReadableError") return "Kamera ba\u015Fka bir uygulama taraf\u0131ndan kullan\u0131l\u0131yor olabilir. Onu kapat\u0131p tekrar dene.";
    return "Kamera ya da hareket alg\u0131lay\u0131c\u0131 ba\u015Flat\u0131lamad\u0131. \u0130nternet ba\u011Flant\u0131n\u0131 kontrol et ve tekrar dene.";
  }
  function openGame(id, mouse = false) {
    sfx.unlock();
    location.hash = `#/oyna/${id}/${mouse ? "fare" : state.players}`;
  }
  async function startPlay(id, mode) {
    const game = byId[id];
    if (!game) return location.hash = "#/";
    const players = mode === "2" ? 2 : 1;
    const mouse = mode === "fare";
    state.current = { game, players, mouse };
    document.body.classList.add("playing");
    $("#home").hidden = true;
    $("#info").hidden = true;
    $("#play").hidden = false;
    ["#endScreen", "#errorScreen", "#readyScreen"].forEach((s) => $(s).hidden = true);
    $("#hintBar").textContent = META[id].controls;
    $("#modeChip").textContent = mouse ? "\u{1F5B1}\uFE0F Fare" : players === 2 ? "\u{1F46B} 2 Ki\u015Fi" : "\u{1F9D2} 1 Ki\u015Fi";
    $("#stageList").hidden = true;
    buildScoreCards(players);
    if (!mouse) {
      $("#loader").hidden = false;
      try {
        await ensureCamera($("#loaderText"));
      } catch (e) {
        $("#loader").hidden = true;
        $("#errorText").textContent = camErrorText(e);
        $("#errorScreen").hidden = false;
        return;
      }
      $("#loader").hidden = true;
      if (!location.hash.startsWith(`#/oyna/${id}/`)) return;
      state.tracker.setMode(players);
    }
    newSession();
  }
  function newSession() {
    state.session?.stop();
    const { game, players, mouse } = state.current;
    state.session = new Session({
      canvas: $("#stage"),
      game,
      players,
      tracker: mouse ? null : state.tracker,
      difficulty: state.difficulty,
      onEnd: showResults
    });
    state.session.start();
    showReady();
  }
  function showReady() {
    const { game, players, mouse } = state.current;
    state.readyFlags = [false, false];
    $("#rcEmoji").textContent = game.emoji;
    $("#rcTitle").textContent = game.title;
    $("#rcSub").textContent = mouse ? "Fare = el \xB7 ok tu\u015Flar\u0131 = e\u011Fil \xB7 bo\u015Fluk = z\u0131pla. Haz\u0131rsan ba\u015Fla!" : players === 2 ? "\u0130kiniz de kameran\u0131n kar\u015F\u0131s\u0131na ge\xE7in: Pamuk solda, Tar\xE7\u0131n sa\u011Fda." : "Kameran\u0131n kar\u015F\u0131s\u0131na ge\xE7, seni net g\xF6relim.";
    const box = $("#rcPlayers");
    box.innerHTML = "";
    for (let i = 0; i < players; i++) {
      const d = document.createElement("div");
      d.className = "pcard";
      d.style.setProperty("--pc", PLAYER_COLORS[i]);
      d.innerHTML = `<img src="${avatarURL(i, 140)}" alt=""><b>${PLAYER_NAMES[i]}</b><span class="st">Bekleniyor\u2026</span>
      ${players === 2 ? `<button class="go" data-dwell data-dwell-player="${i}">\u270B \u25B6</button>` : ""}`;
      box.appendChild(d);
      if (players === 2) d.querySelector(".go").addEventListener("click", () => markReady(i));
    }
    if (players === 1) {
      const b = document.createElement("button");
      b.className = "btn big green rc-start";
      b.dataset.dwell = "";
      b.textContent = "\u25B6 \u015Eimdi ba\u015Fla!";
      b.addEventListener("click", () => beginGame());
      box.appendChild(b);
    }
    $("#rcTip").textContent = mouse ? "\u{1F5B1}\uFE0F Ba\u015Flamak i\xE7in d\xFC\u011Fmeye t\u0131kla" : "\u270B Elini d\xFC\u011Fmenin \xFCst\xFCnde tut, daire dolunca ba\u015Flar";
    $("#readyScreen").hidden = false;
    if (!mouse) say(players === 2 ? "Kameran\u0131n kar\u015F\u0131s\u0131na ge\xE7in!" : "Kameran\u0131n kar\u015F\u0131s\u0131na ge\xE7!");
  }
  function markReady(i) {
    state.readyFlags[i] = true;
    const card = $("#rcPlayers").children[i];
    card.classList.add("ready-done");
    card.querySelector(".go").textContent = "\u2714 Haz\u0131r!";
    card.querySelector(".go").disabled = true;
    sfx.good();
    if (state.readyFlags[0] && state.readyFlags[1]) beginGame();
  }
  function beginGame() {
    if (!state.session || state.session.phase !== "ready") return;
    $("#readyScreen").hidden = true;
    state.session.begin();
  }
  function updateReady() {
    const s = state.session;
    if (!s || $("#readyScreen").hidden) return;
    const { players, mouse } = state.current;
    [...$("#rcPlayers").querySelectorAll(".pcard")].forEach((card, i) => {
      const ok = mouse || !!s.lastInputs[i]?.present;
      card.classList.toggle("ok", ok);
      card.querySelector(".st").textContent = state.readyFlags[i] ? "Haz\u0131r! \u2714" : ok ? "Seni g\xF6r\xFCyorum! \u{1F7E2}" : "Bekleniyor\u2026 \u26AA";
      const go = card.querySelector(".go");
      if (go && !state.readyFlags[i]) go.disabled = !ok;
    });
    const start = $("#rcPlayers .rc-start");
    if (start) start.disabled = !(mouse || s.lastInputs[0]?.present);
  }
  function drawDemo(t) {
    if ($("#readyScreen").hidden) return;
    const S = sizeCanvas($("#demoCanvas"));
    if (!S) return;
    const { g, w, h } = S;
    const { game } = state.current;
    const type = META[game.id].demo;
    g.clearRect(0, 0, w, h);
    const cx = w * 0.3, base = h * 0.9, H = h * 0.75;
    let bodyX = 0, hop = 0, tilt = 0;
    let arms = [120, 100, 60, 80];
    if (type === "touch") {
      const k = (Math.sin(t * 2.4) + 1) / 2;
      const lerpA = (a, b) => a + (b - a) * k;
      arms = Math.floor(t / 2.618) % 2 ? [120, 100, lerpA(60, -70), lerpA(80, -80)] : [lerpA(120, -110), lerpA(100, -100), 60, 80];
    } else if (type === "tilt") {
      tilt = Math.sin(t * 1.6) * 0.35;
      arms = [180, 180, 0, 0];
    } else if (type === "step") {
      bodyX = Math.sin(t * 1.4) * w * 0.07;
      hop = Math.max(0, Math.sin(t * 4.2)) ** 3 * h * 0.12;
      arms = [130, 110, 50, 70];
    } else if (type === "pose") {
      const poses = [[180, 180, 0, 0], [-135, -135, -45, -45], [180, -90, 0, -90], [-90, -90, 0, 0]];
      arms = poses[Math.floor(t / 1.4) % poses.length];
    }
    g.fillStyle = "rgba(18,33,59,0.08)";
    g.beginPath();
    g.ellipse(cx + bodyX, base + 4, w * 0.08 - hop * 0.2, h * 0.03, 0, 0, TAU);
    g.fill();
    g.save();
    g.translate(cx + bodyX, base - hop);
    g.rotate(tilt);
    const col = "#5BD6A4";
    g.strokeStyle = col;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineWidth = H * 0.06;
    const hipY = -H * 0.38, shY = -H * 0.72, seg = H * 0.2;
    g.beginPath();
    g.moveTo(-H * 0.05, hipY);
    g.lineTo(-H * 0.1, 0);
    g.moveTo(H * 0.05, hipY);
    g.lineTo(H * 0.1, 0);
    g.stroke();
    g.beginPath();
    g.moveTo(0, hipY);
    g.lineTo(0, shY);
    g.stroke();
    const sh = [{ x: -H * 0.07, y: shY }, { x: H * 0.07, y: shY }];
    [[sh[0], arms[0], arms[1]], [sh[1], arms[2], arms[3]]].forEach(([s, a1, a2]) => {
      const e = { x: s.x + Math.cos(a1 * Math.PI / 180) * seg, y: s.y + Math.sin(a1 * Math.PI / 180) * seg };
      const wr = { x: e.x + Math.cos(a2 * Math.PI / 180) * seg, y: e.y + Math.sin(a2 * Math.PI / 180) * seg };
      g.strokeStyle = col;
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.lineTo(e.x, e.y);
      g.lineTo(wr.x, wr.y);
      g.stroke();
      g.fillStyle = "#FFE08A";
      g.strokeStyle = "#E3B341";
      g.lineWidth = H * 0.015;
      g.beginPath();
      g.arc(wr.x, wr.y, H * 0.045, 0, TAU);
      g.fill();
      g.stroke();
      g.lineWidth = H * 0.06;
    });
    g.fillStyle = "#E9FBF3";
    g.strokeStyle = col;
    g.lineWidth = H * 0.04;
    g.beginPath();
    g.arc(0, shY - H * 0.13, H * 0.1, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = "#12213B";
    g.beginPath();
    g.arc(-H * 0.03, shY - H * 0.14, H * 0.012, 0, TAU);
    g.arc(H * 0.03, shY - H * 0.14, H * 0.012, 0, TAU);
    g.fill();
    g.strokeStyle = "#12213B";
    g.lineWidth = H * 0.012;
    g.beginPath();
    g.arc(0, shY - H * 0.12, H * 0.035, 0.2, Math.PI - 0.2);
    g.stroke();
    g.restore();
    g.fillStyle = "#9AA9C2";
    const ax = w * 0.52, ay = h * 0.5;
    g.fillRect(ax - w * 0.04, ay - 4, w * 0.06, 8);
    g.beginPath();
    g.moveTo(ax + w * 0.03, ay - 14);
    g.lineTo(ax + w * 0.055, ay);
    g.lineTo(ax + w * 0.03, ay + 14);
    g.fill();
    const fw = Math.min(w * 0.3, h * 0.9 * 1.3), fh = h * 0.84, fx = w * 0.62, fy = h * 0.08;
    g.save();
    rr(g, fx, fy, fw, fh, 18);
    g.clip();
    g.translate(fx, fy);
    try {
      game.thumb(g, fw, fh, t);
    } catch {
    }
    g.restore();
    g.lineWidth = 5;
    g.strokeStyle = "#D5DEEA";
    rr(g, fx, fy, fw, fh, 18);
    g.stroke();
  }
  function buildScoreCards(players) {
    $("#scoreCards").innerHTML = Array.from({ length: players }, (_, i) => `
    <div class="score-card" style="--pc:${PLAYER_COLORS[i]}" data-i="${i}">
      <img src="${avatarURL(i, 104)}" alt="">
      <div><small>${PLAYER_NAMES[i]} \xB7 Puan</small><b>0</b></div>
      <span class="off" hidden>\u{1F440} g\xF6r\xFCnm\xFCyor</span>
    </div>`).join("");
    $("#statCards").innerHTML = "";
  }
  var lastPanel = 0;
  var shownScores = [0, 0];
  function updatePanel(now) {
    const s = state.session;
    if (!s || now - lastPanel < 160) return;
    lastPanel = now;
    const info = s.info();
    const t = Math.ceil(info.time);
    $("#timerText").textContent = String(t);
    $(".timer-pill").classList.toggle("low", info.phase === "play" && t <= 10);
    $("#timerBar").style.width = `${info.time / info.duration * 100}%`;
    info.players.forEach((p, i) => {
      const card = $(`.score-card[data-i="${i}"]`);
      if (!card) return;
      if (shownScores[i] !== p.score) {
        card.querySelector("b").textContent = String(p.score);
        if (p.score > shownScores[i]) {
          card.classList.remove("bump");
          void card.offsetWidth;
          card.classList.add("bump");
        }
        shownScores[i] = p.score;
      }
      card.querySelector(".off").hidden = state.current.mouse || p.present || info.phase !== "play";
    });
    const statsHtml = info.players.length === 1 ? info.players[0].stats.map((x) => `<div class="stat"><b>${x.value}</b><small>${x.icon} ${x.label}</small></div>`).join("") : (info.players[0].stats || []).map((x, k) => `<div class="stat"><b>${x.value} \xB7 ${info.players[1].stats[k]?.value ?? 0}</b><small>${x.icon} ${x.label}</small></div>`).join("");
    if ($("#statCards").innerHTML !== statsHtml) $("#statCards").innerHTML = statsHtml;
    if (info.stage) {
      const list = $("#stageList");
      list.hidden = false;
      const html = info.stage.list.map((n, k) => `<li class="${k < info.stage.idx ? "done" : k === info.stage.idx ? "now" : ""}">${n}</li>`).join("");
      if (list.innerHTML !== html) list.innerHTML = html;
    }
  }
  function drawMirror(t) {
    const mirror = $("#mirror");
    if ($("#play").hidden || mirror.classList.contains("min")) return;
    const S = sizeCanvas($("#mirrorCanvas"));
    if (!S) return;
    const { g, w, h } = S;
    g.fillStyle = "#1E3354";
    g.fillRect(0, 0, w, h);
    const tr = state.tracker;
    const mouse = state.current?.mouse;
    if (tr && tr.running && !mouse && state.session?.mirror?.width) {
      const src = state.session.mirror;
      const sc = Math.max(w / src.width, h / src.height);
      const dw = src.width * sc, dh = src.height * sc;
      g.globalAlpha = 0.85;
      g.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
      g.globalAlpha = 1;
      const map = (p) => ({ x: (w - dw) / 2 + p.x * dw, y: (h - dh) / 2 + p.y * dh });
      if (state.current?.players === 2) {
        g.strokeStyle = "rgba(255,255,255,0.6)";
        g.setLineDash([6, 6]);
        g.beginPath();
        g.moveTo(w / 2, 0);
        g.lineTo(w / 2, h);
        g.stroke();
        g.setLineDash([]);
      }
      tr.slots.forEach((lm, i) => {
        if (!lm) return;
        g.strokeStyle = PLAYER_COLORS[i];
        g.lineWidth = 3;
        g.lineCap = "round";
        for (const [a, b] of BONES) {
          if (lm[a].v < 0.4 || lm[b].v < 0.4) continue;
          const p = map(lm[a]), q = map(lm[b]);
          g.beginPath();
          g.moveTo(p.x, p.y);
          g.lineTo(q.x, q.y);
          g.stroke();
        }
        const head = map(lm[0]);
        g.fillStyle = PLAYER_COLORS[i];
        g.beginPath();
        g.arc(head.x, head.y, 9, 0, TAU);
        g.fill();
        for (const k of [15, 16]) {
          const p = map(lm[k]);
          g.fillStyle = "#FFE08A";
          g.beginPath();
          g.arc(p.x, p.y, 6, 0, TAU);
          g.fill();
        }
        g.font = "800 13px Nunito, sans-serif";
        g.textAlign = "center";
        g.fillStyle = "#fff";
        g.fillText(PLAYER_NAMES[i], head.x, head.y - 16);
      });
    } else {
      g.fillStyle = "rgba(255,255,255,0.5)";
      g.font = "800 14px Nunito, sans-serif";
      g.textAlign = "center";
      g.fillText(mouse ? "\u{1F5B1}\uFE0F Fare modu" : "Kamera kapal\u0131", w / 2, h / 2);
      if (mouse && state.session) {
        const inp = state.session.lastInputs[0];
        if (inp?.hands?.[0]?.visible) {
          const v = state.session.views[0];
          g.fillStyle = PLAYER_COLORS[0];
          g.beginPath();
          g.arc(inp.hands[0].x / v.w * w, inp.hands[0].y / v.h * h, 8, 0, TAU);
          g.fill();
        }
      }
    }
  }
  var confettiParts = [];
  function showResults(results) {
    const { game, players } = state.current;
    const best = Math.max(...results.map((r) => r.score));
    const tie = players === 2 && results[0].score === results[1].score;
    const winner = results.findIndex((r) => r.score === best);
    const top = players === 2 ? results[winner] : results[0];
    $("#endTitle").textContent = "OYUN B\u0130TT\u0130!";
    $("#endSub").textContent = players === 2 ? tie ? "Berabere! \u0130kiniz de harikas\u0131n\u0131z \u{1F91D}" : `${PLAYER_NAMES[winner]} kazand\u0131! Tebrikler \u{1F389}` : ["G\xFCzel deneme, bir daha oynayal\u0131m! \u{1F4AA}", "Aferin, \xE7ok e\u011Flenceliydi! \u{1F44F}", "Harika i\u015F \xE7\u0131kard\u0131n! \u{1F31F}", "Muhte\u015Femsin, \u015Fampiyon! \u{1F3C6}"][top.stars];
    $("#endStars").innerHTML = [0, 1, 2].map((k) => `<span class="${k < top.stars ? "" : "off"}">\u2B50</span>`).join("");
    $("#endResults").innerHTML = results.map((r, i) => `
    <div class="res" style="--pc:${PLAYER_COLORS[i]}">
      ${players === 2 && !tie && i === winner ? '<span class="crown">\u{1F451}</span>' : ""}
      <img src="${avatarURL(i, 128)}" alt="">
      <div class="who">${PLAYER_NAMES[i]}</div>
      <div class="sc">${r.score} <small>puan</small></div>
      <div class="mini">${r.stats.map((x) => `<span>${x.icon} ${x.value} ${x.label}</span>`).join("")}</div>
    </div>`).join("");
    const bests = store.get("ho-best", {});
    const prev = bests[game.id] || 0;
    const rec = $("#endRecord");
    rec.hidden = false;
    if (best > prev) {
      bests[game.id] = best;
      store.set("ho-best", bests);
      rec.className = "record";
      rec.textContent = prev ? `\u{1F3C6} Yeni rekor! (eski: ${prev})` : "\u{1F3C6} \u0130lk rekorun!";
    } else {
      rec.className = "record plain";
      rec.textContent = `\u{1F3C6} Rekor: ${prev}`;
    }
    renderRecords();
    $("#endScreen").hidden = false;
    confettiParts = Array.from({ length: top.stars >= 2 || best > prev ? 160 : 60 }, () => ({
      x: Math.random(),
      y: -Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: 0.15 + Math.random() * 0.25,
      r: Math.random() * TAU,
      vr: (Math.random() - 0.5) * 8,
      c: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
      s: 6 + Math.random() * 8
    }));
  }
  function drawConfetti(dt) {
    if ($("#endScreen").hidden || !confettiParts.length) return;
    const S = sizeCanvas($("#confetti"));
    if (!S) return;
    const { g, w, h } = S;
    g.clearRect(0, 0, w, h);
    for (const p of confettiParts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      g.save();
      g.translate(p.x * w, p.y * h);
      g.rotate(p.r);
      g.fillStyle = p.c;
      g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      g.restore();
    }
    confettiParts = confettiParts.filter((p) => p.y < 1.1);
  }
  function stopPlay() {
    state.session?.stop();
    state.session = null;
    shownScores[0] = shownScores[1] = 0;
    $("#play").hidden = true;
    $("#home").hidden = false;
    document.body.classList.remove("playing");
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (state.tracker) state.tracker.setMode(2);
  }
  var INFO = {
    gizlilik: `<h2>\u{1F512} Gizlilik</h2>
    <p>HaydiOyna'da oyunlar v\xFCcut hareketlerinle oynan\u0131r. Bunun i\xE7in taray\u0131c\u0131n kamera izni ister.</p>
    <h3>Kamera g\xF6r\xFCnt\xFCs\xFCne ne oluyor?</h3>
    <ul><li>Hareket alg\u0131lama (Google MediaPipe Pose) <b>tamamen senin cihaz\u0131nda</b>, taray\u0131c\u0131n\u0131n i\xE7inde \xE7al\u0131\u015F\u0131r.</li>
    <li>Kamera g\xF6r\xFCnt\xFCs\xFC <b>kaydedilmez, saklanmaz ve hi\xE7bir sunucuya g\xF6nderilmez</b>.</li>
    <li>Kameray\u0131 \xFCstteki \u{1F4F7} d\xFC\u011Fmesiyle istedi\u011Fin an kapatabilirsin.</li></ul>
    <h3>\u0130ndirilen dosyalar</h3>
    <p>Hareket alg\u0131lama program\u0131 ve modeli ilk a\xE7\u0131l\u0131\u015Fta jsDelivr ve Google sunucular\u0131ndan indirilir; yaz\u0131 tipleri Google Fonts'tan gelir. Bu s\u0131rada bu hizmetler IP adresini g\xF6rebilir. Kamera verisi bu hizmetlere g\xF6nderilmez.</p>
    <h3>Taray\u0131c\u0131da saklananlar</h3>
    <p>\xC7erez kullanm\u0131yoruz. Yaln\u0131zca ses tercihin, zorluk se\xE7imin ve rekorlar\u0131n taray\u0131c\u0131nda saklan\u0131r.</p>`,
    nasil: `<h2>\u{1F3AE} Nas\u0131l oynan\u0131r?</h2>
    <ul>
      <li><b>\u{1F4F7} Kameray\u0131 a\xE7</b>'a bas. Taray\u0131c\u0131 izin isterse <b>\u0130zin ver</b>.</li>
      <li>Elini kald\u0131r: ekranda bir <b>el imleci</b> belirir. Bir d\xFC\u011Fmenin \xFCst\xFCnde tut, daire dolunca t\u0131klan\u0131r. Fareyle de t\u0131klayabilirsin.</li>
      <li>Kameradan 1,5\u20132,5 metre uzakta dur. <b>Belinden yukar\u0131s\u0131</b> g\xF6r\xFCnmeli (z\u0131plamal\u0131 oyunlarda t\xFCm v\xFCcut daha iyi).</li>
      <li>\u0130ki ki\u015Filik oyunda ekran ikiye b\xF6l\xFCn\xFCr: <b>Pamuk solda</b>, <b>Tar\xE7\u0131n sa\u011Fda</b> durur.</li>
      <li>Odan\u0131n ayd\u0131nl\u0131k olmas\u0131 ve arkan\u0131zda kalabal\u0131k olmamas\u0131 alg\u0131lamay\u0131 iyile\u015Ftirir.</li>
      <li>Etraf\u0131nda \xE7arpabilece\u011Fin e\u015Fya olmas\u0131n. Dikkatli oyna!</li>
      <li>Kameran yoksa <b>Kameras\u0131z dene</b>: fare = el, ok tu\u015Flar\u0131 = e\u011Filme, bo\u015Fluk = z\u0131plama, yukar\u0131 ok = eller yukar\u0131.</li>
    </ul>`,
    hakkinda: `<h2>\u{1F44B} Hakk\u0131nda</h2>
    <p>HaydiOyna, \xE7ocuklar\u0131n ekran ba\u015F\u0131nda hareketsiz kalmak yerine z\u0131play\u0131p e\u011Filerek oynayabilece\u011Fi, \xFCcretsiz ve T\xFCrk\xE7e bir oyun sitesidir. B\xFCt\xFCn oyunlar, karakterler ve \xE7izimler bu site i\xE7in \xF6zg\xFCn olarak haz\u0131rland\u0131: Van kedisi Pamuk, tekir Tar\xE7\u0131n, Anadolu pars\u0131 Pars Hoca, Kangal Karaba\u015F Hoca ve di\u011Ferleri.</p>
    <p>Hareket alg\u0131lama: Google MediaPipe Pose Landmarker (Apache 2.0 lisans\u0131).</p>`
  };
  function showInfo(key) {
    $("#infoBody").innerHTML = INFO[key] || INFO.nasil;
    $("#info").hidden = false;
  }
  function route() {
    const [page, id, mode] = location.hash.replace(/^#\/?/, "").split("/");
    if (page === "oyna" && id) return startPlay(id, mode);
    if (!$("#play").hidden) stopPlay();
    $("#info").hidden = !INFO[page];
    if (INFO[page]) showInfo(page);
  }
  function updateMuteIcons() {
    $("#muteBtn").textContent = isMuted() ? "\u{1F507}" : "\u{1F50A}";
  }
  function updateChips() {
    const tr = state.tracker;
    [0, 1].forEach((i) => {
      const chip = $("#chip" + i);
      const on = !!(tr && tr.running && tr.slots[i]);
      chip.classList.toggle("on", on);
      chip.querySelector(".pchip-st").textContent = on ? "Haz\u0131r ve aktif" : !tr || !tr.running ? i ? "\u{1F44B} Sen de kat\u0131l!" : "\u{1F4F7} Kamera kapal\u0131" : i ? "\u{1F44B} Sen de kat\u0131l!" : "\u{1F44B} El salla!";
    });
  }
  var lastT = performance.now();
  var chipT = 0;
  function mainLoop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1e3);
    lastT = now;
    const t = now / 1e3;
    const playing = !$("#play").hidden;
    const tr = state.tracker;
    if (tr && tr.running && !state.session) tr.detect(now);
    const inGame = state.session && (state.session.phase === "count" || state.session.phase === "play");
    hands.enabled = !inGame;
    hands.update(tr, dt);
    if (!playing) {
      thumbs.forEach(({ canvas, game }) => {
        const S = sizeCanvas(canvas);
        if (!S) return;
        S.g.save();
        try {
          game.thumb(S.g, S.w, S.h, t);
        } catch (e) {
          console.warn(game.id, e);
        }
        S.g.restore();
      });
    } else {
      updateReady();
      drawDemo(t);
      updatePanel(now);
      drawMirror(t);
      drawConfetti(dt);
    }
    chipT -= dt;
    if (chipT <= 0) {
      chipT = 0.25;
      updateChips();
    }
    requestAnimationFrame(mainLoop);
  }
  function init() {
    if (location.search.includes("debug")) window.__ho = state;
    buildHome();
    syncSegs();
    updateMuteIcons();
    updateCamButtons();
    hands = new HandCursors($("#handLayer"));
    document.querySelectorAll("[data-players]").forEach((b) => b.addEventListener("click", () => {
      state.players = Number(b.dataset.players);
      store.set("ho-players", state.players);
      syncSegs();
      sfx.tap(state.players);
    }));
    document.querySelectorAll("[data-diff]").forEach((b) => b.addEventListener("click", () => {
      state.difficulty = b.dataset.diff;
      store.set("ho-diff", state.difficulty);
      syncSegs();
      sfx.tap(2);
    }));
    const camToggle = async () => {
      sfx.unlock();
      if (state.tracker && state.tracker.running) return stopCamera();
      try {
        await ensureCamera($("#marqueeText"));
        state.tracker.setMode(2);
        say("Elini kald\u0131r ve bir oyun se\xE7!");
      } catch (e) {
        $("#marqueeText").textContent = "\u{1F63F} " + camErrorText(e);
      }
    };
    $("#startCam").addEventListener("click", camToggle);
    $("#camBtn").addEventListener("click", camToggle);
    $("#mouseMode").addEventListener("click", () => {
      $("#marqueeText").textContent = "\u{1F5B1}\uFE0F Fare modu: bir oyunun \u25B6 OYNA d\xFC\u011Fmesine bas!";
      state.mouseNext = true;
      document.querySelectorAll(".play-btn").forEach((b) => b.classList.add("pulse"));
    });
    document.querySelectorAll(".play-btn").forEach((b, i) => b.addEventListener("click", (e) => {
      if (state.mouseNext) {
        e.stopImmediatePropagation();
        state.mouseNext = false;
        openGame(GAMES[i].id, true);
      }
    }, true));
    $("#privacyPill").addEventListener("click", () => {
      location.hash = "#/gizlilik";
    });
    document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => {
      location.hash = "#/";
    }));
    $("#info").addEventListener("click", (e) => {
      if (e.target.id === "info") location.hash = "#/";
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") location.hash = "#/";
    });
    $("#muteBtn").addEventListener("click", () => {
      setMuted(!isMuted());
      updateMuteIcons();
    });
    $("#backBtn").addEventListener("click", () => {
      location.hash = "#/";
    });
    $("#homeBtn").addEventListener("click", () => {
      location.hash = "#/";
    });
    $("#againBtn").addEventListener("click", () => {
      $("#endScreen").hidden = true;
      shownScores[0] = shownScores[1] = 0;
      buildScoreCards(state.current.players);
      newSession();
    });
    $("#retryBtn").addEventListener("click", () => {
      const { game, players } = state.current;
      startPlay(game.id, String(players));
    });
    $("#mouseBtn").addEventListener("click", () => {
      location.hash = `#/oyna/${state.current.game.id}/fare`;
    });
    $("#mirrorToggle").addEventListener("click", () => {
      $("#mirror").classList.toggle("min");
      $("#mirrorToggle").textContent = $("#mirror").classList.contains("min") ? "\u25B4" : "\u25BE";
    });
    window.addEventListener("hashchange", route);
    route();
    requestAnimationFrame(mainLoop);
  }
  init();
})();
