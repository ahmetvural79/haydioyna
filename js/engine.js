// Oyun motoru: döngü, bölünmüş ekran, vücut hareketlerinden kontrol girişi, geri sayım, skor
import { TAU, clamp, rr, text, star, handIcon } from './draw.js';
import { sfx, say } from './audio.js';
import { BONES } from './pose.js';

export const PLAYER_COLORS = ['#06D6A0', '#8338EC'];
export const PLAYER_NAMES = ['Pamuk', 'Tarçın'];

// Bir oyuncunun ham noktalarından oyun girişleri üretir
class InputState {
  constructor() {
    this.baseY = null;
    this.airborne = false;
    this.cool = 0;
    this.prevHands = [null, null];
    this.tilt = 0;
    this.jumps = 0;
  }

  reset() { this.baseY = null; this.airborne = false; this.jumps = 0; }

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
    const hands = [hand(15, 19, 0), hand(16, 20, 1)];
    const lS = pts[11], rS = pts[12];
    const shW = Math.max(20, Math.hypot(lS.x - rS.x, lS.y - rS.y));
    const shMid = { x: (lS.x + rS.x) / 2, y: (lS.y + rS.y) / 2 };
    const hipMid = { x: (pts[23].x + pts[24].x) / 2, y: (pts[23].y + pts[24].y) / 2 };
    const head = { x: pts[0].x, y: pts[0].y, r: shW * 0.45, visible: vis(0) };

    // kolların eğimi (uçak/snowboard direksiyonu)
    let tiltRaw;
    const [a, b] = hands[0].x < hands[1].x ? hands : [hands[1], hands[0]];
    const spread = Math.abs(b.x - a.x) / shW;
    if (hands[0].visible && hands[1].visible && spread > 1.2) tiltRaw = Math.atan2(b.y - a.y, b.x - a.x);
    else {
      const [sa, sb] = lS.x < rS.x ? [lS, rS] : [rS, lS];
      tiltRaw = Math.atan2(sb.y - sa.y, sb.x - sa.x) * 2.5;
    }
    this.tilt += (clamp(tiltRaw, -1.2, 1.2) - this.tilt) * Math.min(1, dt * 12);

    const handY = (hands[0].y + hands[1].y) / 2;
    const armsUp = clamp((shMid.y - handY) / shW, -2, 2.5);

    // zıplama: omuz yüksekliği yavaş bir referansla kıyaslanır
    let jump = false;
    if (this.baseY === null) this.baseY = shMid.y;
    const rise = (this.baseY - shMid.y) / shW;
    this.cool -= dt;
    if (!this.airborne) {
      this.baseY += (shMid.y - this.baseY) * Math.min(1, dt * 1.5);
      if (rise > 0.28 && this.cool <= 0) { jump = true; this.airborne = true; this.cool = 0.45; this.jumps++; }
    } else if (rise < 0.1) this.airborne = false;

    return {
      present: true, fake: false, pts, hands, head, shW, shMid, hipMid,
      tilt: this.tilt, spread, armsUp, jump, airborne: this.airborne,
      lean: clamp((shMid.x / w) * 2 - 1, -1, 1),
      handsUp: hands[0].y < pts[0].y && hands[1].y < pts[0].y,
      w, h,
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
    if (keys.Space && !this._sp) { jump = true; this.jumps++; }
    this._sp = keys.Space;
    const shW = Math.min(w, h) * 0.18;
    return {
      present: true, fake: true, pts: null, hands: [hand, { ...hand }], head: { x, y, r: shW * 0.3, visible: false },
      shW, shMid: { x: this.leanX * w, y: h * 0.45 }, hipMid: { x: this.leanX * w, y: h * 0.7 },
      tilt: this.tilt, spread: 2, armsUp: keys.ArrowUp ? 1.5 : keys.ArrowDown ? -1 : (m.down ? 1.5 : 0.2), jump, airborne: !!keys.Space,
      lean: this.leanX * 2 - 1, handsUp: !!keys.ArrowUp || m.down, mouseDown: m.down, w, h,
    };
  }
}

export class Session {
  constructor({ canvas, game, players, tracker, onEnd, difficulty = 'orta' }) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.def = game;
    this.nPlayers = players;
    this.tracker = tracker; // null => fare/klavye modu
    this.onEnd = onEnd;
    this.diff = difficulty === 'kolay' ? 0.7 : 1;
    this.mouse = { x: 0, y: 0, inside: false, down: false };
    this.keys = {};
    this.views = [];
    this.inputs = [new InputState(), new InputState()];
    this.lastInputs = [];
    this.mirror = document.createElement('canvas');
    this.mctx = this.mirror.getContext('2d');
    this.running = false;
    this._bind();
    this.resize();
    this.reset();
  }

  _bind() {
    this._onResize = () => this.resize();
    this._onMove = (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; this.mouse.inside = true;
    };
    this._onDown = (e) => { this._onMove(e); this.mouse.down = true; };
    this._onUp = () => { this.mouse.down = false; };
    this._onLeave = () => { this.mouse.inside = false; this.mouse.down = false; };
    this._onKey = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
      this.keys[e.code] = e.type === 'keydown';
    };
    window.addEventListener('resize', this._onResize);
    this.canvas.addEventListener('pointermove', this._onMove);
    this.canvas.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointerup', this._onUp);
    this.canvas.addEventListener('pointerleave', this._onLeave);
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('keyup', this._onKey);
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = this.canvas.clientWidth || 800, H = this.canvas.clientHeight || 600;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.dpr = dpr; this.W = W; this.H = H;
    const gap = this.nPlayers === 2 ? 6 : 0;
    const vw = this.nPlayers === 2 ? (W - gap) / 2 : W;
    for (let i = 0; i < this.nPlayers; i++) {
      const v = this.views[i] || (this.views[i] = { hitT: 0 });
      Object.assign(v, {
        x: i * (vw + gap), y: 0, w: vw, h: H, player: i, players: this.nPlayers, color: PLAYER_COLORS[i],
        u: Math.min(vw, H) / 100, diff: this.diff,
        hit: () => { v.hitT = 0.5; },
      });
      this.insts?.[i]?.resize?.();
    }
  }

  reset() {
    this.phase = 'ready';
    this.phaseT = 0;
    this.time = this.def.duration ?? 60;
    this.elapsed = 0;
    this.lastCount = 4;
    this.inputs.forEach((s) => s.reset());
    this.views.forEach((v) => { v.hitT = 0; });
    this.insts = this.views.map((v) => this.def.create(v));
  }

  // Hazır ekranından sonra çağrılır
  begin() {
    if (this.phase !== 'ready') return;
    this.phase = 'count';
    this.phaseT = 0;
    this.lastCount = 4;
  }

  start() {
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.tick(dt, now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('keyup', this._onKey);
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
        stats: s.stats ? s.stats() : [],
      })),
      stage: this.insts[0].stage ? this.insts[0].stage() : null,
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
    return { sx0, sw, vw, vh, dw, dh, ox, oy, map: (p) => ({ x: ox + ((p.x - sx0) / sw) * dw, y: oy + p.y * dh, v: p.v }) };
  }

  tick(dt, now) {
    const g = this.g;
    if (this.tracker) {
      this.tracker.detect(now);
      const vid = this.tracker.video;
      if (vid.videoWidth && this.mirror.width !== vid.videoWidth) { this.mirror.width = vid.videoWidth; this.mirror.height = vid.videoHeight; }
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
    if (this.phase === 'count') {
      const n = 3 - Math.floor(this.phaseT);
      if (n !== this.lastCount && n > 0) { this.lastCount = n; sfx.tick(); say(String(n)); }
      if (this.phaseT >= 3.6) { this.phase = 'play'; this.phaseT = 0; }
      else if (this.phaseT >= 3 && this.lastCount !== 0) { this.lastCount = 0; sfx.go(); say('Haydi!'); }
    } else if (this.phase === 'play') {
      this.time -= dt;
      this.elapsed += dt;
      this.insts.forEach((inst, i) => {
        if (!inst.finished) inst.update(dt, inputs[i], this.elapsed);
      });
      if (this.time <= 0 || this.insts.every((s) => s.finished)) this._finish();
    }

    // çizim
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.fillStyle = '#0F172A';
    g.fillRect(0, 0, this.W, this.H);
    this.views.forEach((v, i) => {
      v.hitT = Math.max(0, v.hitT - dt);
      g.save();
      g.translate(v.x, v.y);
      g.beginPath(); g.rect(0, 0, v.w, v.h); g.clip();
      const inst = this.insts[i];
      inst.draw(g, inputs[i], this.elapsed || this.phaseT);
      const camA = inst.camAlpha ?? this.def.camAlpha ?? 0;
      if (this.tracker && camA > 0) this._drawCam(g, i, camA);
      inst.drawOver?.(g, inputs[i], this.elapsed || this.phaseT);
      if (inputs[i].present && this.def.skeleton) this._drawSkeleton(g, inputs[i]);
      if (inputs[i].present && this.def.cursors !== false && (this.phase === 'play' || this.phase === 'count')) this._drawHands(g, inputs[i], v.color);
      if (v.hitT > 0) {
        const a = v.hitT / 0.5;
        const gr = g.createRadialGradient(v.w / 2, v.h / 2, Math.min(v.w, v.h) * 0.3, v.w / 2, v.h / 2, Math.hypot(v.w, v.h) * 0.6);
        gr.addColorStop(0, 'rgba(239,71,111,0)'); gr.addColorStop(1, `rgba(239,71,111,${0.55 * a})`);
        g.fillStyle = gr; g.fillRect(0, 0, v.w, v.h);
      }
      this._drawHud(g, v, inst, inputs[i]);
      g.restore();
    });
    if (this.nPlayers === 2) {
      g.fillStyle = '#FFFFFF';
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
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = Math.max(4, inp.shW * 0.08);
    for (const [a, b] of BONES) {
      const p = inp.pts[a], q = inp.pts[b];
      if (p.v < 0.4 || q.v < 0.4) continue;
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
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
    // skor hapı
    const score = String(Math.max(0, Math.floor(inst.score)));
    const pw = fs * (1.9 + score.length * 0.62), ph = fs * 1.55;
    g.save();
    g.shadowColor = 'rgba(15,23,42,0.25)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
    g.fillStyle = '#fff';
    rr(g, pad, pad, pw, ph, ph / 2); g.fill();
    g.restore();
    g.lineWidth = 4; g.strokeStyle = this.nPlayers === 2 ? v.color : '#FFC300';
    rr(g, pad, pad, pw, ph, ph / 2); g.stroke();
    star(g, pad + ph * 0.52, pad + ph / 2, ph * 0.3);
    text(g, score, pad + ph * 0.95, pad + ph * 0.54, fs, '#7C2D12', { align: 'left', stroke: null, weight: 800 });
    // 2 kişilikte isim
    if (this.nPlayers === 2) {
      const nw = fs * 3.6;
      g.fillStyle = v.color;
      rr(g, v.w - pad - nw, pad, nw, ph, ph / 2); g.fill();
      text(g, PLAYER_NAMES[v.player], v.w - pad - nw / 2, pad + ph * 0.54, fs * 0.7, '#fff', { stroke: null });
    }
    // hız göstergesi
    if (inst.speedKmh && this.nPlayers === 1 && this.phase === 'play') {
      const s = `${Math.round(inst.speedKmh())} km/s`;
      const sw = fs * 3.8;
      g.fillStyle = 'rgba(15,23,42,0.75)';
      rr(g, v.w - pad - sw, pad, sw, ph, ph / 2); g.fill();
      text(g, s, v.w - pad - sw / 2, pad + ph * 0.54, fs * 0.72, '#FFD23F', { stroke: null, weight: 800 });
    }
    if (inst.hud) inst.hud(g, pad, fs);

    if (this.phase === 'count') {
      const t = this.phaseT;
      g.fillStyle = 'rgba(15,23,42,0.35)';
      g.fillRect(0, 0, v.w, v.h);
      const n = 3 - Math.floor(t);
      const k = t % 1;
      const m = Math.min(v.w, v.h);
      if (n > 0) {
        const s = 1 + (1 - Math.min(1, k * 4)) * 0.6;
        g.fillStyle = 'rgba(255,255,255,0.95)';
        g.beginPath(); g.arc(v.w / 2, v.h / 2, m * 0.2 * s, 0, TAU); g.fill();
        g.lineWidth = m * 0.02; g.strokeStyle = ['#EF476F', '#FFC300', '#06D6A0'][n - 1];
        g.beginPath(); g.arc(v.w / 2, v.h / 2, m * 0.2 * s, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - k)); g.stroke();
        text(g, String(n), v.w / 2, v.h / 2 + m * 0.01, m * 0.26 * s, ['#EF476F', '#E09F00', '#06A77D'][n - 1], { stroke: null, weight: 800 });
      } else {
        const s = 1 + Math.min(1, k * 3) * 0.2;
        text(g, 'HAYDİ!', v.w / 2, v.h / 2, m * 0.2 * s, '#FFD23F', { sw: m * 0.03 });
      }
      if (this.def.controls) text(g, this.def.controls, v.w / 2, v.h * 0.82, Math.max(16, fs * 0.6), '#fff');
    } else if (this.phase === 'play' && !inp.present && this.tracker) {
      g.fillStyle = 'rgba(15,23,42,0.35)';
      g.fillRect(0, v.h * 0.42, v.w, v.h * 0.16);
      text(g, '👀 Seni göremiyorum, kameraya dön!', v.w / 2, v.h * 0.5, Math.max(18, fs * 0.75), '#FFD23F');
    }
  }

  _finish() {
    if (this.phase === 'end') return;
    this.phase = 'end';
    sfx.win();
    const st = this.def.stars || [10, 20, 30];
    const results = this.insts.map((s) => {
      const score = Math.max(0, Math.floor(s.score));
      return { score, stars: score >= st[2] ? 3 : score >= st[1] ? 2 : score >= st[0] ? 1 : 0, stats: s.stats ? s.stats() : [] };
    });
    say(this.nPlayers === 2
      ? (results[0].score === results[1].score ? 'Berabere! Harikasınız!' : `${results[0].score > results[1].score ? PLAYER_NAMES[0] : PLAYER_NAMES[1]} kazandı!`)
      : 'Oyun bitti! Süper oynadın!');
    setTimeout(() => this.onEnd?.(results), 600);
  }
}
