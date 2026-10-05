// HaydiOyna uygulama kabuğu: ana sayfa, kamera, el imleci, hazırlık / bitiş ekranları, yan panel
import { Session, PLAYER_COLORS, PLAYER_NAMES } from './engine.js';
import { PoseTracker, BONES } from './pose.js';
import { HandCursors } from './handcursor.js';
import { sfx, say, isMuted, setMuted } from './audio.js';
import { vanCat, TAU, RAINBOW, rr, avatarURL } from './draw.js';

import kapadokya from './games/kapadokya.js';
import hezarfen from './games/hezarfen.js';
import lokanta from './games/lokanta.js';
import hasat from './games/hasat.js';
import taekwondo from './games/taekwondo.js';
import motokros from './games/motokros.js';
import kayak from './games/kayak.js';
import hiztreni from './games/hiztreni.js';
import cini from './games/cini.js';

const GAMES = [kapadokya, hezarfen, lokanta, hasat, taekwondo, motokros, kayak, hiztreni, cini];

// kart rengi, zorluk etiketi, hazırlık animasyonu, kontrol ipucu
const META = {
  kapadokya: { c: '#EF476F', cd: '#B8264B', tint: '#FFF0F3', lvl: 'Orta', demo: 'touch', controls: '✋ Balonlara dokun · 🙆 kafa da patlatır · 🐝 arı ve 🐦 kuşa dokunma!' },
  hezarfen: { c: '#2E86DE', cd: '#1B5A99', tint: '#EEF6FF', lvl: 'Aksiyon', demo: 'tilt', controls: '↔️ Kolları eğ = dön · 🙌 kollar yukarı = yüksel · 👇 aşağı = alçal' },
  lokanta: { c: '#F77F00', cd: '#B85E00', tint: '#FFF5EA', lvl: 'Kolay', demo: 'touch', controls: '✋ Sarı yanan malzemeye dokun · ❌ yanlış malzeme -1' },
  hasat: { c: '#3BAA4A', cd: '#257A31', tint: '#F0FBF1', lvl: 'Kolay', demo: 'touch', controls: '✋ Meyvelere uzan · 🧺 düşeni yakala · 🐝 arıya dokunma' },
  taekwondo: { c: '#E63946', cd: '#A61E2A', tint: '#FFF1F2', lvl: 'Orta', demo: 'pose', controls: '🥋 Hocanın pozunu yap · yeşil olunca tut' },
  motokros: { c: '#D9822B', cd: '#9A5615', tint: '#FFF6EC', lvl: 'Aksiyon', demo: 'step', controls: '↔️ Sağa-sola adım at · ⬆️ zıpla · 🐔🐑 engellere çarpma' },
  kayak: { c: '#2BB3D9', cd: '#167F9C', tint: '#ECFAFF', lvl: 'Aksiyon', demo: 'tilt', controls: '↔️ Kolları aç ve eğ = dön · ⬆️ tepede zıpla · 🌲⛄ çarpma' },
  hiztreni: { c: '#C0392B', cd: '#8C2219', tint: '#FFF2F0', lvl: 'Kolay', demo: 'touch', controls: '✋ Yıldızlara uzan · 🙌 inişte eller yukarı · 🦇 yarasaya dokunma' },
  cini: { c: '#8338EC', cd: '#5B1FB0', tint: '#F6F0FF', lvl: 'Kolay', demo: 'touch', controls: '✋ Parlayan yıldıza dokun · ☁️ kara buluttan uzak dur' },
};
GAMES.forEach((g) => { g.controls = META[g.id].controls; });
const byId = Object.fromEntries(GAMES.map((g) => [g.id, g]));
const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const state = {
  players: store.get('ho-players', 1),
  difficulty: store.get('ho-diff', 'orta'),
  tracker: null,
  cameraBusy: false,
  session: null,
  current: null, // { game, players, mouse }
  readyFlags: [false, false],
};
let hands;
const thumbs = [];

// ---------- ana sayfa ----------
function buildHome() {
  const grid = $('#grid');
  GAMES.forEach((g, i) => {
    const m = META[g.id];
    const card = document.createElement('div');
    card.className = 'card';
    card.style.setProperty('--c', m.c);
    card.style.setProperty('--cd', m.cd);
    card.style.setProperty('--tint', m.tint);
    const lvlClass = m.lvl === 'Kolay' ? 'kolay' : m.lvl === 'Aksiyon' ? 'aksiyon' : '';
    card.innerHTML = `
      <div class="card-top"><span class="num">${i + 1}</span><span class="lvl ${lvlClass}">${m.lvl}</span></div>
      <canvas></canvas>
      <h3>${g.title}</h3>
      <div class="best" data-best="${g.id}"></div>
      <button class="play-btn" data-dwell>▶ OYNA</button>`;
    card.querySelector('.play-btn').addEventListener('click', () => openGame(g.id));
    card.querySelector('canvas').addEventListener('click', () => openGame(g.id));
    grid.appendChild(card);
    thumbs.push({ canvas: card.querySelector('canvas'), game: g });
  });
  const rec = document.createElement('div');
  rec.className = 'card records-card';
  rec.innerHTML = `<div class="card-top"><span class="num">🏆</span><span class="lvl">Rekorlar</span></div><h3>Rekorlarım</h3><ul class="rec-list" id="recList"></ul>`;
  grid.appendChild(rec);
  renderRecords();

  // avatarlar ve logo
  document.querySelectorAll('.pchip-av').forEach((img, i) => { img.src = avatarURL(i, 112); });
  const lc = $('#logoCat').getContext('2d');
  vanCat(lc, 60, 66, 40, 'happy');
  const ld = $('#loaderCat').getContext('2d');
  vanCat(ld, 80, 88, 54, 'happy');
}

function renderRecords() {
  const best = store.get('ho-best', {});
  const rows = Object.entries(best).sort((a, b) => b[1] - a[1]).slice(0, 4);
  $('#recList').innerHTML = rows.length
    ? rows.map(([id, s]) => `<li><span>${byId[id]?.emoji || '🎮'} ${byId[id]?.title || id}</span><b>${s}</b></li>`).join('')
    : '<li class="empty">Henüz rekor yok. Haydi bir oyun oyna! 🎈</li>';
  document.querySelectorAll('[data-best]').forEach((el) => {
    const b = best[el.dataset.best];
    el.textContent = b ? `🏆 Rekor: ${b}` : '';
  });
}

function sizeCanvas(c) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return null;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}

function syncSegs() {
  document.querySelectorAll('[data-players]').forEach((b) => b.classList.toggle('on', Number(b.dataset.players) === state.players));
  document.querySelectorAll('[data-diff]').forEach((b) => b.classList.toggle('on', b.dataset.diff === state.difficulty));
  $('#chip1').style.opacity = state.players === 2 ? 1 : 0.55;
}

// ---------- kamera ----------
async function ensureCamera(statusEl) {
  if (state.tracker && state.tracker.running && state.tracker.landmarker) return true;
  if (state.cameraBusy) return false;
  state.cameraBusy = true;
  const setStatus = (s) => { if (statusEl) statusEl.textContent = s; };
  try {
    if (!state.tracker) state.tracker = new PoseTracker();
    setStatus('Kamera açılıyor…');
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
  $('#startCam').textContent = on ? '⏹ Kamerayı kapat' : '📷 Kamerayı aç';
  $('#startCam').classList.toggle('on-cam', on);
  $('#startCam').classList.toggle('green', !on);
  $('#camBtn').classList.toggle('on', on);
  $('#marqueeText').textContent = on
    ? '✋ Elini kaldır, bir kartın üstünde tut, daire dolunca oyun açılır! ⭐'
    : '✨ 📷 Kamerayı aç, sonra her şeyi ellerinle yönet! ⭐';
}

function camErrorText(e) {
  if (e && e.name === 'NotAllowedError') return 'Kamera izni verilmedi. Adres çubuğundaki kamera simgesinden izin verip tekrar deneyebilirsin.';
  if (e && e.name === 'NotFoundError') return 'Bu cihazda kamera bulunamadı. Fareyle oynayabilirsin!';
  if (e && e.name === 'NotReadableError') return 'Kamera başka bir uygulama tarafından kullanılıyor olabilir. Onu kapatıp tekrar dene.';
  return 'Kamera ya da hareket algılayıcı başlatılamadı. İnternet bağlantını kontrol et ve tekrar dene.';
}

// ---------- oyun akışı ----------
function openGame(id, mouse = false) {
  sfx.unlock();
  location.hash = `#/oyna/${id}/${mouse ? 'fare' : state.players}`;
}

async function startPlay(id, mode) {
  const game = byId[id];
  if (!game) return (location.hash = '#/');
  const players = mode === '2' ? 2 : 1;
  const mouse = mode === 'fare';
  state.current = { game, players, mouse };
  document.body.classList.add('playing');
  $('#home').hidden = true;
  $('#info').hidden = true;
  $('#play').hidden = false;
  ['#endScreen', '#errorScreen', '#readyScreen'].forEach((s) => ($(s).hidden = true));
  $('#hintBar').textContent = META[id].controls;
  $('#modeChip').textContent = mouse ? '🖱️ Fare' : players === 2 ? '👫 2 Kişi' : '🧒 1 Kişi';
  $('#stageList').hidden = true;
  buildScoreCards(players);

  if (!mouse) {
    $('#loader').hidden = false;
    try {
      await ensureCamera($('#loaderText'));
    } catch (e) {
      $('#loader').hidden = true;
      $('#errorText').textContent = camErrorText(e);
      $('#errorScreen').hidden = false;
      return;
    }
    $('#loader').hidden = true;
    if (!location.hash.startsWith(`#/oyna/${id}/`)) return;
    state.tracker.setMode(players);
  }
  newSession();
}

function newSession() {
  state.session?.stop();
  const { game, players, mouse } = state.current;
  state.session = new Session({
    canvas: $('#stage'),
    game,
    players,
    tracker: mouse ? null : state.tracker,
    difficulty: state.difficulty,
    onEnd: showResults,
  });
  state.session.start();
  showReady();
}

function showReady() {
  const { game, players, mouse } = state.current;
  state.readyFlags = [false, false];
  $('#rcEmoji').textContent = game.emoji;
  $('#rcTitle').textContent = game.title;
  $('#rcSub').textContent = mouse
    ? 'Fare = el · ok tuşları = eğil · boşluk = zıpla. Hazırsan başla!'
    : players === 2 ? 'İkiniz de kameranın karşısına geçin: Pamuk solda, Tarçın sağda.' : 'Kameranın karşısına geç, seni net görelim.';
  const box = $('#rcPlayers');
  box.innerHTML = '';
  for (let i = 0; i < players; i++) {
    const d = document.createElement('div');
    d.className = 'pcard';
    d.style.setProperty('--pc', PLAYER_COLORS[i]);
    d.innerHTML = `<img src="${avatarURL(i, 140)}" alt=""><b>${PLAYER_NAMES[i]}</b><span class="st">Bekleniyor…</span>
      ${players === 2 ? `<button class="go" data-dwell data-dwell-player="${i}">✋ ▶</button>` : ''}`;
    box.appendChild(d);
    if (players === 2) d.querySelector('.go').addEventListener('click', () => markReady(i));
  }
  if (players === 1) {
    const b = document.createElement('button');
    b.className = 'btn big green rc-start';
    b.dataset.dwell = '';
    b.textContent = '▶ Şimdi başla!';
    b.addEventListener('click', () => beginGame());
    box.appendChild(b);
  }
  $('#rcTip').textContent = mouse ? '🖱️ Başlamak için düğmeye tıkla' : '✋ Elini düğmenin üstünde tut, daire dolunca başlar';
  $('#readyScreen').hidden = false;
  if (!mouse) say(players === 2 ? 'Kameranın karşısına geçin!' : 'Kameranın karşısına geç!');
}

function markReady(i) {
  state.readyFlags[i] = true;
  const card = $('#rcPlayers').children[i];
  card.classList.add('ready-done');
  card.querySelector('.go').textContent = '✔ Hazır!';
  card.querySelector('.go').disabled = true;
  sfx.good();
  if (state.readyFlags[0] && state.readyFlags[1]) beginGame();
}

function beginGame() {
  if (!state.session || state.session.phase !== 'ready') return;
  $('#readyScreen').hidden = true;
  state.session.begin();
}

function updateReady() {
  const s = state.session;
  if (!s || $('#readyScreen').hidden) return;
  const { players, mouse } = state.current;
  [...$('#rcPlayers').querySelectorAll('.pcard')].forEach((card, i) => {
    const ok = mouse || !!s.lastInputs[i]?.present;
    card.classList.toggle('ok', ok);
    card.querySelector('.st').textContent = state.readyFlags[i] ? 'Hazır! ✔' : ok ? 'Seni görüyorum! 🟢' : 'Bekleniyor… ⚪';
    const go = card.querySelector('.go');
    if (go && !state.readyFlags[i]) go.disabled = !ok;
  });
  const start = $('#rcPlayers .rc-start');
  if (start) start.disabled = !(mouse || s.lastInputs[0]?.present);
}

// hazırlık ekranındaki hareket gösterimi (çöp adam → oyun önizlemesi)
function drawDemo(t) {
  if ($('#readyScreen').hidden) return;
  const S = sizeCanvas($('#demoCanvas'));
  if (!S) return;
  const { g, w, h } = S;
  const { game } = state.current;
  const type = META[game.id].demo;
  g.clearRect(0, 0, w, h);
  const cx = w * 0.3, base = h * 0.9, H = h * 0.75;
  let bodyX = 0, hop = 0, tilt = 0;
  // kol açıları (derece): [sol üst, sol alt, sağ üst, sağ alt]
  let arms = [120, 100, 60, 80];
  if (type === 'touch') {
    // kollar sırayla yukarı uzanır
    const k = (Math.sin(t * 2.4) + 1) / 2;
    const lerpA = (a, b) => a + (b - a) * k;
    arms = Math.floor(t / 2.618) % 2
      ? [120, 100, lerpA(60, -70), lerpA(80, -80)]
      : [lerpA(120, -110), lerpA(100, -100), 60, 80];
  } else if (type === 'tilt') {
    tilt = Math.sin(t * 1.6) * 0.35;
    arms = [180, 180, 0, 0];
  } else if (type === 'step') {
    bodyX = Math.sin(t * 1.4) * w * 0.07;
    hop = Math.max(0, Math.sin(t * 4.2)) ** 3 * h * 0.12;
    arms = [130, 110, 50, 70];
  } else if (type === 'pose') {
    const poses = [[180, 180, 0, 0], [-135, -135, -45, -45], [180, -90, 0, -90], [-90, -90, 0, 0]];
    arms = poses[Math.floor(t / 1.4) % poses.length];
  }
  // gölge
  g.fillStyle = 'rgba(18,33,59,0.08)';
  g.beginPath(); g.ellipse(cx + bodyX, base + 4, w * 0.08 - hop * 0.2, h * 0.03, 0, 0, TAU); g.fill();
  g.save();
  g.translate(cx + bodyX, base - hop);
  g.rotate(tilt);
  const col = '#5BD6A4';
  g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = H * 0.06;
  const hipY = -H * 0.38, shY = -H * 0.72, seg = H * 0.2;
  // bacaklar
  g.beginPath(); g.moveTo(-H * 0.05, hipY); g.lineTo(-H * 0.1, 0); g.moveTo(H * 0.05, hipY); g.lineTo(H * 0.1, 0); g.stroke();
  // gövde
  g.beginPath(); g.moveTo(0, hipY); g.lineTo(0, shY); g.stroke();
  // kollar (ekranda sol / sağ)
  const sh = [{ x: -H * 0.07, y: shY }, { x: H * 0.07, y: shY }];
  [[sh[0], arms[0], arms[1]], [sh[1], arms[2], arms[3]]].forEach(([s, a1, a2]) => {
    const e = { x: s.x + Math.cos((a1 * Math.PI) / 180) * seg, y: s.y + Math.sin((a1 * Math.PI) / 180) * seg };
    const wr = { x: e.x + Math.cos((a2 * Math.PI) / 180) * seg, y: e.y + Math.sin((a2 * Math.PI) / 180) * seg };
    g.strokeStyle = col;
    g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(e.x, e.y); g.lineTo(wr.x, wr.y); g.stroke();
    g.fillStyle = '#FFE08A'; g.strokeStyle = '#E3B341'; g.lineWidth = H * 0.015;
    g.beginPath(); g.arc(wr.x, wr.y, H * 0.045, 0, TAU); g.fill(); g.stroke();
    g.lineWidth = H * 0.06;
  });
  // kafa
  g.fillStyle = '#E9FBF3'; g.strokeStyle = col; g.lineWidth = H * 0.04;
  g.beginPath(); g.arc(0, shY - H * 0.13, H * 0.1, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#12213B';
  g.beginPath(); g.arc(-H * 0.03, shY - H * 0.14, H * 0.012, 0, TAU); g.arc(H * 0.03, shY - H * 0.14, H * 0.012, 0, TAU); g.fill();
  g.strokeStyle = '#12213B'; g.lineWidth = H * 0.012;
  g.beginPath(); g.arc(0, shY - H * 0.12, H * 0.035, 0.2, Math.PI - 0.2); g.stroke();
  g.restore();
  // ok
  g.fillStyle = '#9AA9C2';
  const ax = w * 0.52, ay = h * 0.5;
  g.fillRect(ax - w * 0.04, ay - 4, w * 0.06, 8);
  g.beginPath(); g.moveTo(ax + w * 0.03, ay - 14); g.lineTo(ax + w * 0.055, ay); g.lineTo(ax + w * 0.03, ay + 14); g.fill();
  // oyun önizlemesi
  const fw = Math.min(w * 0.3, h * 0.9 * 1.3), fh = h * 0.84, fx = w * 0.62, fy = h * 0.08;
  g.save();
  rr(g, fx, fy, fw, fh, 18); g.clip();
  g.translate(fx, fy);
  try { game.thumb(g, fw, fh, t); } catch {}
  g.restore();
  g.lineWidth = 5; g.strokeStyle = '#D5DEEA';
  rr(g, fx, fy, fw, fh, 18); g.stroke();
}

// ---------- yan panel ----------
function buildScoreCards(players) {
  $('#scoreCards').innerHTML = Array.from({ length: players }, (_, i) => `
    <div class="score-card" style="--pc:${PLAYER_COLORS[i]}" data-i="${i}">
      <img src="${avatarURL(i, 104)}" alt="">
      <div><small>${PLAYER_NAMES[i]} · Puan</small><b>0</b></div>
      <span class="off" hidden>👀 görünmüyor</span>
    </div>`).join('');
  $('#statCards').innerHTML = '';
}

let lastPanel = 0;
const shownScores = [0, 0];
function updatePanel(now) {
  const s = state.session;
  if (!s || now - lastPanel < 160) return;
  lastPanel = now;
  const info = s.info();
  const t = Math.ceil(info.time);
  $('#timerText').textContent = String(t);
  $('.timer-pill').classList.toggle('low', info.phase === 'play' && t <= 10);
  $('#timerBar').style.width = `${(info.time / info.duration) * 100}%`;
  info.players.forEach((p, i) => {
    const card = $(`.score-card[data-i="${i}"]`);
    if (!card) return;
    if (shownScores[i] !== p.score) {
      card.querySelector('b').textContent = String(p.score);
      if (p.score > shownScores[i]) { card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump'); }
      shownScores[i] = p.score;
    }
    card.querySelector('.off').hidden = state.current.mouse || p.present || info.phase !== 'play';
  });
  // istatistikler: tek kişide ayrıntılı, iki kişide yan yana
  const statsHtml = info.players.length === 1
    ? info.players[0].stats.map((x) => `<div class="stat"><b>${x.value}</b><small>${x.icon} ${x.label}</small></div>`).join('')
    : (info.players[0].stats || []).map((x, k) => `<div class="stat"><b>${x.value} · ${info.players[1].stats[k]?.value ?? 0}</b><small>${x.icon} ${x.label}</small></div>`).join('');
  if ($('#statCards').innerHTML !== statsHtml) $('#statCards').innerHTML = statsHtml;
  if (info.stage) {
    const list = $('#stageList');
    list.hidden = false;
    const html = info.stage.list.map((n, k) => `<li class="${k < info.stage.idx ? 'done' : k === info.stage.idx ? 'now' : ''}">${n}</li>`).join('');
    if (list.innerHTML !== html) list.innerHTML = html;
  }
}

// ---------- kamera aynası ----------
function drawMirror(t) {
  const mirror = $('#mirror');
  if ($('#play').hidden || mirror.classList.contains('min')) return;
  const S = sizeCanvas($('#mirrorCanvas'));
  if (!S) return;
  const { g, w, h } = S;
  g.fillStyle = '#1E3354'; g.fillRect(0, 0, w, h);
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
    if (state.current?.players === 2) { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); g.setLineDash([]); }
    tr.slots.forEach((lm, i) => {
      if (!lm) return;
      g.strokeStyle = PLAYER_COLORS[i]; g.lineWidth = 3; g.lineCap = 'round';
      for (const [a, b] of BONES) {
        if (lm[a].v < 0.4 || lm[b].v < 0.4) continue;
        const p = map(lm[a]), q = map(lm[b]);
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      }
      const head = map(lm[0]);
      g.fillStyle = PLAYER_COLORS[i]; g.beginPath(); g.arc(head.x, head.y, 9, 0, TAU); g.fill();
      for (const k of [15, 16]) { const p = map(lm[k]); g.fillStyle = '#FFE08A'; g.beginPath(); g.arc(p.x, p.y, 6, 0, TAU); g.fill(); }
      g.font = '800 13px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff';
      g.fillText(PLAYER_NAMES[i], head.x, head.y - 16);
    });
  } else {
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '800 14px Nunito, sans-serif'; g.textAlign = 'center';
    g.fillText(mouse ? '🖱️ Fare modu' : 'Kamera kapalı', w / 2, h / 2);
    if (mouse && state.session) {
      const inp = state.session.lastInputs[0];
      if (inp?.hands?.[0]?.visible) {
        const v = state.session.views[0];
        g.fillStyle = PLAYER_COLORS[0];
        g.beginPath(); g.arc((inp.hands[0].x / v.w) * w, (inp.hands[0].y / v.h) * h, 8, 0, TAU); g.fill();
      }
    }
  }
}

// ---------- bitiş ----------
let confettiParts = [];
function showResults(results) {
  const { game, players } = state.current;
  const best = Math.max(...results.map((r) => r.score));
  const tie = players === 2 && results[0].score === results[1].score;
  const winner = results.findIndex((r) => r.score === best);
  const top = players === 2 ? results[winner] : results[0];
  $('#endTitle').textContent = 'OYUN BİTTİ!';
  $('#endSub').textContent = players === 2
    ? (tie ? 'Berabere! İkiniz de harikasınız 🤝' : `${PLAYER_NAMES[winner]} kazandı! Tebrikler 🎉`)
    : ['Güzel deneme, bir daha oynayalım! 💪', 'Aferin, çok eğlenceliydi! 👏', 'Harika iş çıkardın! 🌟', 'Muhteşemsin, şampiyon! 🏆'][top.stars];
  $('#endStars').innerHTML = [0, 1, 2].map((k) => `<span class="${k < top.stars ? '' : 'off'}">⭐</span>`).join('');
  $('#endResults').innerHTML = results.map((r, i) => `
    <div class="res" style="--pc:${PLAYER_COLORS[i]}">
      ${players === 2 && !tie && i === winner ? '<span class="crown">👑</span>' : ''}
      <img src="${avatarURL(i, 128)}" alt="">
      <div class="who">${PLAYER_NAMES[i]}</div>
      <div class="sc">${r.score} <small>puan</small></div>
      <div class="mini">${r.stats.map((x) => `<span>${x.icon} ${x.value} ${x.label}</span>`).join('')}</div>
    </div>`).join('');
  // rekor
  const bests = store.get('ho-best', {});
  const prev = bests[game.id] || 0;
  const rec = $('#endRecord');
  rec.hidden = false;
  if (best > prev) {
    bests[game.id] = best;
    store.set('ho-best', bests);
    rec.className = 'record';
    rec.textContent = prev ? `🏆 Yeni rekor! (eski: ${prev})` : '🏆 İlk rekorun!';
  } else {
    rec.className = 'record plain';
    rec.textContent = `🏆 Rekor: ${prev}`;
  }
  renderRecords();
  $('#endScreen').hidden = false;
  confettiParts = Array.from({ length: top.stars >= 2 || best > prev ? 160 : 60 }, () => ({
    x: Math.random(), y: -Math.random() * 0.6, vx: (Math.random() - 0.5) * 0.15, vy: 0.15 + Math.random() * 0.25,
    r: Math.random() * TAU, vr: (Math.random() - 0.5) * 8, c: RAINBOW[Math.floor(Math.random() * RAINBOW.length)], s: 6 + Math.random() * 8,
  }));
}

function drawConfetti(dt) {
  if ($('#endScreen').hidden || !confettiParts.length) return;
  const S = sizeCanvas($('#confetti'));
  if (!S) return;
  const { g, w, h } = S;
  g.clearRect(0, 0, w, h);
  for (const p of confettiParts) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    g.save(); g.translate(p.x * w, p.y * h); g.rotate(p.r);
    g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    g.restore();
  }
  confettiParts = confettiParts.filter((p) => p.y < 1.1);
}

function stopPlay() {
  state.session?.stop();
  state.session = null;
  shownScores[0] = shownScores[1] = 0;
  $('#play').hidden = true;
  $('#home').hidden = false;
  document.body.classList.remove('playing');
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (state.tracker) state.tracker.setMode(2);
}

// ---------- bilgi sayfaları ----------
const INFO = {
  gizlilik: `<h2>🔒 Gizlilik</h2>
    <p>HaydiOyna'da oyunlar vücut hareketlerinle oynanır. Bunun için tarayıcın kamera izni ister.</p>
    <h3>Kamera görüntüsüne ne oluyor?</h3>
    <ul><li>Hareket algılama (Google MediaPipe Pose) <b>tamamen senin cihazında</b>, tarayıcının içinde çalışır.</li>
    <li>Kamera görüntüsü <b>kaydedilmez, saklanmaz ve hiçbir sunucuya gönderilmez</b>.</li>
    <li>Kamerayı üstteki 📷 düğmesiyle istediğin an kapatabilirsin.</li></ul>
    <h3>İndirilen dosyalar</h3>
    <p>Hareket algılama programı ve modeli ilk açılışta jsDelivr ve Google sunucularından indirilir; yazı tipleri Google Fonts'tan gelir. Bu sırada bu hizmetler IP adresini görebilir. Kamera verisi bu hizmetlere gönderilmez.</p>
    <h3>Tarayıcıda saklananlar</h3>
    <p>Çerez kullanmıyoruz. Yalnızca ses tercihin, zorluk seçimin ve rekorların tarayıcında saklanır.</p>`,
  nasil: `<h2>🎮 Nasıl oynanır?</h2>
    <ul>
      <li><b>📷 Kamerayı aç</b>'a bas. Tarayıcı izin isterse <b>İzin ver</b>.</li>
      <li>Elini kaldır: ekranda bir <b>el imleci</b> belirir. Bir düğmenin üstünde tut, daire dolunca tıklanır. Fareyle de tıklayabilirsin.</li>
      <li>Kameradan 1,5–2,5 metre uzakta dur. <b>Belinden yukarısı</b> görünmeli (zıplamalı oyunlarda tüm vücut daha iyi).</li>
      <li>İki kişilik oyunda ekran ikiye bölünür: <b>Pamuk solda</b>, <b>Tarçın sağda</b> durur.</li>
      <li>Odanın aydınlık olması ve arkanızda kalabalık olmaması algılamayı iyileştirir.</li>
      <li>Etrafında çarpabileceğin eşya olmasın. Dikkatli oyna!</li>
      <li>Kameran yoksa <b>Kamerasız dene</b>: fare = el, ok tuşları = eğilme, boşluk = zıplama, yukarı ok = eller yukarı.</li>
    </ul>`,
  hakkinda: `<h2>👋 Hakkında</h2>
    <p>HaydiOyna, çocukların ekran başında hareketsiz kalmak yerine zıplayıp eğilerek oynayabileceği, ücretsiz ve Türkçe bir oyun sitesidir. Bütün oyunlar, karakterler ve çizimler bu site için özgün olarak hazırlandı: Van kedisi Pamuk, tekir Tarçın, Anadolu parsı Pars Hoca, Kangal Karabaş Hoca ve diğerleri.</p>
    <p>Hareket algılama: Google MediaPipe Pose Landmarker (Apache 2.0 lisansı).</p>`,
};
function showInfo(key) {
  $('#infoBody').innerHTML = INFO[key] || INFO.nasil;
  $('#info').hidden = false;
}

// ---------- yönlendirme ----------
function route() {
  const [page, id, mode] = location.hash.replace(/^#\/?/, '').split('/');
  if (page === 'oyna' && id) return startPlay(id, mode);
  if (!$('#play').hidden) stopPlay();
  $('#info').hidden = !INFO[page];
  if (INFO[page]) showInfo(page);
}

function updateMuteIcons() { $('#muteBtn').textContent = isMuted() ? '🔇' : '🔊'; }

function updateChips() {
  const tr = state.tracker;
  [0, 1].forEach((i) => {
    const chip = $('#chip' + i);
    const on = !!(tr && tr.running && tr.slots[i]);
    chip.classList.toggle('on', on);
    chip.querySelector('.pchip-st').textContent = on ? 'Hazır ve aktif' : !tr || !tr.running ? (i ? '👋 Sen de katıl!' : '📷 Kamera kapalı') : (i ? '👋 Sen de katıl!' : '👋 El salla!');
  });
}

// ---------- ana döngü ----------
let lastT = performance.now();
let chipT = 0;
function mainLoop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  const t = now / 1000;
  const playing = !$('#play').hidden;
  const tr = state.tracker;
  if (tr && tr.running && !state.session) tr.detect(now);
  const inGame = state.session && (state.session.phase === 'count' || state.session.phase === 'play');
  hands.enabled = !inGame;
  hands.update(tr, dt);
  if (!playing) {
    thumbs.forEach(({ canvas, game }) => {
      const S = sizeCanvas(canvas);
      if (!S) return;
      S.g.save();
      try { game.thumb(S.g, S.w, S.h, t); } catch (e) { console.warn(game.id, e); }
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
  if (chipT <= 0) { chipT = 0.25; updateChips(); }
  requestAnimationFrame(mainLoop);
}

function init() {
  if (location.search.includes('debug')) window.__ho = state; // yalnızca test için
  buildHome();
  syncSegs();
  updateMuteIcons();
  updateCamButtons();
  hands = new HandCursors($('#handLayer'));

  document.querySelectorAll('[data-players]').forEach((b) => b.addEventListener('click', () => {
    state.players = Number(b.dataset.players); store.set('ho-players', state.players); syncSegs(); sfx.tap(state.players);
  }));
  document.querySelectorAll('[data-diff]').forEach((b) => b.addEventListener('click', () => {
    state.difficulty = b.dataset.diff; store.set('ho-diff', state.difficulty); syncSegs(); sfx.tap(2);
  }));
  const camToggle = async () => {
    sfx.unlock();
    if (state.tracker && state.tracker.running) return stopCamera();
    try { await ensureCamera($('#marqueeText')); state.tracker.setMode(2); say('Elini kaldır ve bir oyun seç!'); }
    catch (e) { $('#marqueeText').textContent = '😿 ' + camErrorText(e); }
  };
  $('#startCam').addEventListener('click', camToggle);
  $('#camBtn').addEventListener('click', camToggle);
  $('#mouseMode').addEventListener('click', () => {
    $('#marqueeText').textContent = '🖱️ Fare modu: bir oyunun ▶ OYNA düğmesine bas!';
    state.mouseNext = true;
    document.querySelectorAll('.play-btn').forEach((b) => b.classList.add('pulse'));
  });
  // "Kamerasız dene" seçildiyse sonraki oyun fare modunda açılır
  document.querySelectorAll('.play-btn').forEach((b, i) => b.addEventListener('click', (e) => {
    if (state.mouseNext) { e.stopImmediatePropagation(); state.mouseNext = false; openGame(GAMES[i].id, true); }
  }, true));
  $('#privacyPill').addEventListener('click', () => { location.hash = '#/gizlilik'; });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { location.hash = '#/'; }));
  $('#info').addEventListener('click', (e) => { if (e.target.id === 'info') location.hash = '#/'; });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') location.hash = '#/'; });
  $('#muteBtn').addEventListener('click', () => { setMuted(!isMuted()); updateMuteIcons(); });
  $('#backBtn').addEventListener('click', () => { location.hash = '#/'; });
  $('#homeBtn').addEventListener('click', () => { location.hash = '#/'; });
  $('#againBtn').addEventListener('click', () => { $('#endScreen').hidden = true; shownScores[0] = shownScores[1] = 0; buildScoreCards(state.current.players); newSession(); });
  $('#retryBtn').addEventListener('click', () => { const { game, players } = state.current; startPlay(game.id, String(players)); });
  $('#mouseBtn').addEventListener('click', () => { location.hash = `#/oyna/${state.current.game.id}/fare`; });
  $('#mirrorToggle').addEventListener('click', () => {
    $('#mirror').classList.toggle('min');
    $('#mirrorToggle').textContent = $('#mirror').classList.contains('min') ? '▴' : '▾';
  });
  window.addEventListener('hashchange', route);
  route();
  requestAnimationFrame(mainLoop);
}

init();
