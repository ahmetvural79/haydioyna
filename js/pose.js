// Kamera + MediaPipe Pose Landmarker sarmalayıcısı
// Tüm görüntü işleme tarayıcıda yapılır; kamera görüntüsü hiçbir yere gönderilmez.

const VISION_VER = '0.10.14';
const VISION_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VER}/vision_bundle.mjs`;
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VER}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export class PoseTracker {
  constructor() {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.stream = null;
    this.landmarker = null;
    this.numPoses = 2;
    this.mode = 1; // oyuncu sayısı: atama buna göre yapılır
    this.lastVideoTime = -1;
    this.poses = []; // her biri 33 nokta: {x,y,v} aynalanmış (0..1)
    this.slots = [null, null]; // oyuncu sıralarına atanmış ve yumuşatılmış pozlar
    this.lastSeen = [0, 0];
    this.fps = 0;
    this._fpsT = 0; this._fpsN = 0;
  }

  async startCamera() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    this.video.srcObject = this.stream;
    await this.video.play();
    await new Promise((r) => {
      if (this.video.videoWidth) return r();
      this.video.onloadedmetadata = () => r();
    });
  }

  async loadModel(onStatus = () => {}) {
    const numPoses = this.numPoses;
    onStatus('Hareket algılayıcı indiriliyor…');
    const vision = await import(VISION_URL);
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
    const opts = (delegate) => ({
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numPoses,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    try {
      this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, opts('GPU'));
    } catch (e) {
      console.warn('GPU başlatılamadı, CPU deneniyor', e);
      this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, opts('CPU'));
    }
    onStatus('Hazır!');
  }

  // Her karede çağrılır; yeni kamera karesi varsa algılar
  detect(now) {
    if (!this.landmarker || this.video.readyState < 2) return;
    if (this.video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = this.video.currentTime;
    let res;
    try { res = this.landmarker.detectForVideo(this.video, now); } catch (e) { console.warn(e); return; }
    this.poses = (res.landmarks || []).map((lm) => lm.map((p) => ({ x: 1 - p.x, y: p.y, v: p.visibility ?? 1 })));
    this._assign(now);
    this._fpsN++;
    if (now - this._fpsT > 1000) { this.fps = this._fpsN; this._fpsN = 0; this._fpsT = now; }
  }

  _assign(now) {
    const center = (lm) => (lm[11].x + lm[12].x) / 2;
    const width = (lm) => Math.abs(lm[11].x - lm[12].x);
    let targets = [null, null];
    if (this.mode === 1) {
      // en yakın (en geniş omuzlu) ve ortaya yakın kişi
      let best = null, bestScore = -1;
      for (const lm of this.poses) {
        const s = width(lm) - Math.abs(center(lm) - 0.5) * 0.2;
        if (s > bestScore) { bestScore = s; best = lm; }
      }
      targets[0] = best;
    } else {
      const sorted = this.poses.slice().sort((a, b) => center(a) - center(b));
      if (sorted.length >= 2) { targets[0] = sorted[0]; targets[1] = sorted[sorted.length - 1]; }
      else if (sorted.length === 1) targets[center(sorted[0]) < 0.5 ? 0 : 1] = sorted[0];
    }
    for (let i = 0; i < 2; i++) {
      const t = targets[i];
      if (!t) {
        if (now - this.lastSeen[i] > 400) this.slots[i] = null;
        continue;
      }
      this.lastSeen[i] = now;
      const prev = this.slots[i];
      if (!prev) { this.slots[i] = t.map((p) => ({ ...p })); continue; }
      const k = 0.55; // yumuşatma
      this.slots[i] = t.map((p, j) => ({
        x: prev[j].x + (p.x - prev[j].x) * k,
        y: prev[j].y + (p.y - prev[j].y) * k,
        v: p.v,
      }));
    }
  }

  setMode(m) {
    if (this.mode !== m) { this.mode = m; this.slots = [null, null]; }
  }

  get running() { return !!this.stream; }

  stop() {
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.landmarker) { try { this.landmarker.close(); } catch {} }
    this.landmarker = null;
  }
}

// Noktaların indeksleri (MediaPipe Pose)
export const LM = {
  nose: 0, lEye: 2, rEye: 5, lSh: 11, rSh: 12, lEl: 13, rEl: 14, lWr: 15, rWr: 16,
  lIdx: 19, rIdx: 20, lHip: 23, rHip: 24, lKnee: 25, rKnee: 26, lAnk: 27, rAnk: 28,
};

export const BONES = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];
