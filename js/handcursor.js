// Menülerde el imleci: kameradaki elin ekranda bir el simgesi olur.
// [data-dwell] öğelerinin üstünde el tutulunca halka dolar ve öğe tıklanır.
// [data-dwell-player="0|1"] öğeleri yalnızca o oyuncunun eline tepki verir.

const DWELL = 1.1; // saniye
const COLORS = ['#06D6A0', '#8338EC'];

const HAND_SVG = (color) => `
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

export class HandCursors {
  constructor(layer) {
    this.layer = layer;
    this.cursors = [0, 1].map((i) => {
      const el = document.createElement('div');
      el.className = 'hand-cursor';
      el.innerHTML = HAND_SVG(COLORS[i]);
      el.style.display = 'none';
      layer.appendChild(el);
      return { el, ring: el.querySelector('.hc-ring'), x: innerWidth / 2, y: innerHeight / 2, target: null, t: 0, cool: 0, seen: false };
    });
    this.enabled = true;
  }

  // ham noktalardan ekrandaki el konumu: kalkık olan el seçilir, ekrana yayılır
  _point(lm) {
    const cands = [[15, 19], [16, 20]].map(([w, idx]) => ({
      x: lm[w].x + (lm[idx].x - lm[w].x) * 0.7,
      y: lm[w].y + (lm[idx].y - lm[w].y) * 0.7,
      v: Math.max(lm[w].v, lm[idx].v),
    })).filter((p) => p.v > 0.35);
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
        c.el.style.display = 'none';
        c.seen = false;
        this._setTarget(c, null);
        continue;
      }
      if (!c.seen) { c.x = p.x; c.y = p.y; c.seen = true; }
      const k = Math.min(1, dt * 14);
      c.x += (p.x - c.x) * k;
      c.y += (p.y - c.y) * k;
      c.el.style.display = 'block';
      c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
      c.cool -= dt;
      // altındaki tıklanabilir öğe
      let el = document.elementFromPoint(c.x, c.y);
      el = el && el.closest('[data-dwell]');
      if (el && (el.disabled || el.closest('[hidden]') || (el.dataset.dwellPlayer && el.dataset.dwellPlayer !== String(i)))) el = null;
      if (el !== c.target) { this._setTarget(c, el); c.t = 0; }
      if (el && c.cool <= 0) {
        c.t += dt;
        if (c.t >= DWELL) {
          c.t = 0; c.cool = 1.0;
          el.classList.add('dwell-done');
          setTimeout(() => el.classList.remove('dwell-done'), 300);
          el.click();
        }
      }
      c.ring.setAttribute('stroke-dashoffset', String(339.3 * (1 - Math.min(1, c.t / DWELL))));
    }
  }

  _setTarget(c, el) {
    if (c.target) c.target.classList.remove('dwell-hover');
    c.target = el;
    if (el) el.classList.add('dwell-hover');
  }

  hide() { this.cursors.forEach((c) => { c.el.style.display = 'none'; this._setTarget(c, null); }); }
}
