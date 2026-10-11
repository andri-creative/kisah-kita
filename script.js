/* ═══════════════════════════════════════════════════════════
   KISAH KITA — MAIN SCRIPT
   10 Babak Interaktif Multi-Tap
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const STATE = {
  currentScene: 1,
  totalScenes: 10,
  knockCount: 0,
  sliderDone: false,
  scanDone: false,
  moodPicked: false,
  starsPopped: 0,
  starMessages: [
    "Senyummu itu obat penat paling ampuh di dunia. ✨",
    "Cara kamu cerita hal-hal kecil itu selalu bikin hangat. 💛",
    "Dunia jadi jauh lebih ramah waktu ada kamu di dalamnya. 🌍",
    "Jangan overthinking lagi ya — kamu itu jauh lebih berharga dari yang kamu pikir. 🌸",
    "Matamu kalau lagi ketawa itu... candu banget. 🫶",
    "Terima kasih sudah lahir dan hadir di dunia ini. 🤍",
    "Dan bintang ke-7 ini... adalah KAMU. 🌟"
  ],
  stars: [],
  scratchDone: [false, false, false],
  hugProgress: 0,
  hugInterval: null,
  hugDone: false,
  letterOpen: false,
  letterTyping: false,
  letterDone: false,
  polaroidCurrent: 1,
  noRunCount: 0,
  cassettePlaying: false,
  musicMuted: false
};

/* ─────────────────────────────────────────
   DOM REFS
───────────────────────────────────────── */
const $  = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelector(sel);

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildProgressDots();
  updateProgress(1);
  initAmbientCanvas();
  initScratchCards();
  initStarCanvas();
  initRunawayButton();
  initMusicPill();
  setWALink();

  // Keyboard nav for polaroid
  $('polaroid-stack').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') flipPolaroid();
  });
});

/* ─────────────────────────────────────────
   PROGRESS DOTS
───────────────────────────────────────── */
function buildProgressDots() {
  const wrap = $('step-dots');
  for (let i = 1; i <= STATE.totalScenes; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    d.id = `dot-${i}`;
    wrap.appendChild(d);
  }
}

function updateProgress(n) {
  for (let i = 1; i <= STATE.totalScenes; i++) {
    const d = $(`dot-${i}`);
    d.className = 'dot';
    if (i < n) d.classList.add('done');
    else if (i === n) d.classList.add('active');
  }
  $('step-label').textContent = `${n}/${STATE.totalScenes}`;
}

/* ─────────────────────────────────────────
   SCENE NAVIGATION
───────────────────────────────────────── */
function nextScene() {
  const curr = STATE.currentScene;
  const next = curr + 1;
  if (next > STATE.totalScenes) return;

  const currEl = $(`scene-${curr}`);
  currEl.style.animation = 'sceneOut 0.4s var(--ease-out) both';
  setTimeout(() => {
    currEl.classList.remove('active');
    currEl.style.animation = '';

    STATE.currentScene = next;
    const nextEl = $(`scene-${next}`);
    nextEl.classList.add('active');
    updateProgress(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSceneEnter(next);

    // Spawn floating hearts on scene transition
    spawnFloatingHearts(3);
  }, 380);
}

function onSceneEnter(n) {
  if (n === 3) resetStarGame();
  if (n === 5) initCassetteWave();
  if (n === 7) resetHug();
  if (n === 8) resetLetter();
  if (n === 9) initRunawayInArea();
  if (n === 10) launchFinale();
}

/* ─────────────────────────────────────────
   SCENE 1: DOOR KNOCKING
───────────────────────────────────────── */
window.knockDoor = function() {
  startAudioPlayback();
  STATE.knockCount++;
  const door = $('door-frame');
  const peek = $('door-peek');
  const hint = $('knock-hint');

  // Shake animation
  door.style.animation = 'none';
  void door.offsetWidth;
  door.style.animation = 'doorShake 0.4s ease';

  // Add shake keyframes dynamically
  if (!document.querySelector('#door-shake-kf')) {
    const st = document.createElement('style');
    st.id = 'door-shake-kf';
    st.textContent = `
      @keyframes doorShake {
        0%,100%{transform:rotate(0deg);}
        20%{transform:rotate(-2deg);}
        40%{transform:rotate(2deg);}
        60%{transform:rotate(-1.5deg);}
        80%{transform:rotate(1deg);}
      }
    `;
    document.head.appendChild(st);
  }

  showToast(`Tok ${STATE.knockCount}...`);

  if (STATE.knockCount === 1) {
    door.classList.add('open-1');
    hint.textContent = 'Ketok lagi! 👆';
  } else if (STATE.knockCount === 2) {
    door.classList.remove('open-1');
    door.classList.add('open-2');
    peek.classList.add('show');
    hint.textContent = 'Satu lagi... 👀';
  } else if (STATE.knockCount >= 3) {
    door.classList.remove('open-2');
    door.classList.add('open-3');
    hint.textContent = 'Wiiih pintunya kebuka! 🎉';

    // Show slider
    $('slider-section').classList.remove('hidden');
    $('door-box').onclick = null; // disable further clicks on door

    // Spawn hearts
    spawnFloatingHearts(5);
  }
};

window.updateSlider = function(val) {
  const slider = $('kangen-slider');
  slider.style.setProperty('--prog', val + '%');

  let display = val + '%';
  if (val >= 99) {
    display = '1,000,000% 🥹💗';
    if (!STATE.sliderDone) {
      STATE.sliderDone = true;
      $('kangen-val').style.color = 'var(--rose-600)';
      showToast('Kangennya over limit! 💗');
      spawnFloatingHearts(8);
      setTimeout(() => {
        $('btn-buka-pintu').classList.remove('hidden');
      }, 600);
    }
  } else if (val > 70) {
    display = val + '% 🥺';
  }
  $('kangen-val').textContent = display;
};

/* ─────────────────────────────────────────
   SCENE 2: FINGERPRINT SCANNER
───────────────────────────────────────── */
let scanTimer = null;
let scanProgress = 0;

window.startScan = function(e) {
  if (e) e.preventDefault();
  if (STATE.scanDone) return;
  const ring = $('scan-ring');
  const result = $('scan-result');
  ring.classList.add('visible');
  result.textContent = 'Scanning... 🔄';

  scanProgress = 0;
  scanTimer = setInterval(() => {
    scanProgress += 4;
    if (scanProgress >= 100) {
      clearInterval(scanTimer);
      completeScan();
    }
  }, 80);
};

window.stopScan = function(e) {
  if (e) e.preventDefault();
  if (STATE.scanDone) return;
  clearInterval(scanTimer);
  if (scanProgress < 100) {
    $('scan-ring').classList.remove('visible');
    $('scan-result').textContent = 'Belum selesai nih... tahan lebih lama! 😅';
    scanProgress = 0;
  }
};

function completeScan() {
  STATE.scanDone = true;
  $('scan-ring').classList.remove('visible');
  $('fp-btn').style.background = 'linear-gradient(135deg,rgba(244,63,94,0.15),rgba(244,63,94,0.05))';
  $('fp-btn').style.borderColor = 'var(--rose-400)';

  $('scan-result').innerHTML = `
    <span class="highlight">✅ Identitas Terverifikasi!</span><br/>
    <span style="font-size:0.82rem;color:#7a5060;">Tingkat keimutan: <strong>∞% (Bikin Mabuk Kepayang)</strong></span>
  `;
  spawnFloatingHearts(6);
  showToast('Terverifikasi! Manusia termanis sejagat raya 💗');

  setTimeout(() => {
    $('mood-section').classList.remove('hidden');
    $('mood-section').style.animation = 'sceneIn 0.5s var(--ease-spring) both';
  }, 1200);
}

window.pickMood = function(n) {
  if (STATE.moodPicked) return;
  STATE.moodPicked = true;

  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
  $(`mood-${n}`).classList.add('selected');

  const responses = {
    1: `<strong>😴 Capek ya...</strong><br/>Kamu udah berjuang banget hari ini — itu bukan hal yang kecil. Istirahat sebentar, taro beban itu dulu. <em>Kamu layak buat rehat, beneran.</em> 🤍`,
    2: `<strong>🌧️ Sepi itu nggak enak ya...</strong><br/>Tapi sekarang kamu lagi ditemenin. Kamu nggak lagi sendiri. Selalu ada yang dengerin, walaupun dari jauh. 🫶`,
    3: `<strong>🥺 Siap! Mode manjain aktif...</strong><br/>Kamu emang layak banget buat dimanja. Sebentar lagi akan ada banyak kejutan hangat khusus untukmu! 💗`
  };

  const resp = $('mood-response');
  resp.innerHTML = responses[n];
  resp.classList.add('show');
  spawnFloatingHearts(4);

  setTimeout(() => {
    $('btn-mood-next').classList.remove('hidden');
  }, 1000);
};

/* ─────────────────────────────────────────
   SCENE 3: STAR GAME
───────────────────────────────────────── */
let starCanvas, starCtx;

function initStarCanvas() {
  starCanvas = $('star-canvas');
  starCtx = starCanvas.getContext('2d');
  starCanvas.addEventListener('click', handleStarClick);
  starCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const rect = starCanvas.getBoundingClientRect();
    const x = (t.clientX - rect.left) * (starCanvas.width / rect.width);
    const y = (t.clientY - rect.top) * (starCanvas.height / rect.height);
    checkStarHit(x, y);
  }, { passive: false });
}

function resetStarGame() {
  STATE.starsPopped = 0;
  STATE.stars = [];
  if (starCtx) starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  spawnAllStars();
  $('star-count').textContent = '0 / 7 Bintang ⭐';
  $('star-msg').textContent = 'Tap bintang yang melayang... ✨';
  $('btn-star-next').classList.add('hidden');
  requestAnimationFrame(drawStars);
}

function spawnAllStars() {
  const positions = [
    {x:55,y:80},{x:170,y:50},{x:290,y:90},{x:100,y:170},
    {x:240,y:180},{x:50,y:240},{x:280,y:240}
  ];
  positions.forEach((p, i) => {
    STATE.stars.push({
      x: p.x, y: p.y, r: 22,
      vx: (Math.random()-0.5)*0.6,
      vy: (Math.random()-0.5)*0.6,
      popped: false,
      popAnim: 0,
      emoji: '⭐',
      id: i,
      color: `hsl(${10 + i*25}, 90%, 65%)`
    });
  });
}

function drawStars() {
  if (STATE.currentScene !== 3) return;
  const c = starCtx;
  const W = starCanvas.width, H = starCanvas.height;
  c.clearRect(0, 0, W, H);

  STATE.stars.forEach(s => {
    if (s.popped) {
      // Pop burst animation
      if (s.popAnim < 18) {
        s.popAnim++;
        const alpha = 1 - s.popAnim/18;
        c.save();
        c.globalAlpha = alpha;
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          const dist = s.popAnim * 4;
          c.fillStyle = s.color;
          c.beginPath();
          c.arc(s.x + Math.cos(ang)*dist, s.y + Math.sin(ang)*dist, 5, 0, Math.PI*2);
          c.fill();
        }
        c.restore();
      }
      return;
    }

    // Move
    s.x += s.vx; s.y += s.vy;
    if (s.x < s.r || s.x > W-s.r) s.vx *= -1;
    if (s.y < s.r || s.y > H-s.r) s.vy *= -1;

    // Glow
    c.save();
    c.shadowColor = s.color;
    c.shadowBlur = 14;
    c.font = `${s.r*2}px serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(s.emoji, s.x, s.y);
    c.restore();
  });

  requestAnimationFrame(drawStars);
}

function handleStarClick(e) {
  const rect = starCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (starCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (starCanvas.height / rect.height);
  checkStarHit(x, y);
}

function checkStarHit(x, y) {
  for (const s of STATE.stars) {
    if (s.popped) continue;
    const dx = x - s.x, dy = y - s.y;
    if (Math.sqrt(dx*dx+dy*dy) < s.r + 10) {
      s.popped = true;
      STATE.starsPopped++;
      $('star-count').textContent = `${STATE.starsPopped} / 7 Bintang ⭐`;
      $('star-msg').textContent = STATE.starMessages[s.id];
      spawnFloatingHearts(2);

      if (STATE.starsPopped === 7) {
        showToast('Semua bintang berhasil ditangkap! 🌟');
        setTimeout(() => $('btn-star-next').classList.remove('hidden'), 600);
      }
      break;
    }
  }
}

/* ─────────────────────────────────────────
   SCENE 4: SCRATCH CARDS
───────────────────────────────────────── */
function initScratchCards() {
  [1,2,3].forEach(i => {
    // Clone canvas to remove old event listeners on restart
    const old = $(`scratch-canvas-${i}`);
    const fresh = old.cloneNode(false);
    fresh.id = old.id;
    fresh.className = old.className;
    fresh.setAttribute('aria-label', old.getAttribute('aria-label'));
    old.parentNode.replaceChild(fresh, old);
    setupScratch(i);
  });
}

function setupScratch(idx) {
  const canvas = $(`scratch-canvas-${idx}`);
  const ctx = canvas.getContext('2d');
  const rect_w = 340, rect_h = 90;
  canvas.width = rect_w; canvas.height = rect_h;

  // Draw foil overlay
  const grad = ctx.createLinearGradient(0,0,rect_w,rect_h);
  grad.addColorStop(0, '#c0c0c0');
  grad.addColorStop(0.3, '#e8e8e8');
  grad.addColorStop(0.6, '#b0b0b0');
  grad.addColorStop(1, '#d0d0d0');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,rect_w,rect_h);

  // Instruction text
  ctx.fillStyle = 'rgba(80,40,60,0.6)';
  ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦ Gosok di Sini ✦', rect_w/2, rect_h/2);

  ctx.globalCompositeOperation = 'destination-out';

  let isDrawing = false;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = rect_w / r.width;
    const scaleY = rect_h / r.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - r.left) * scaleX,
        y: (e.touches[0].clientY - r.top) * scaleY
      };
    }
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  }

  function scratch(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 22, 0, Math.PI*2);
    ctx.fill();
    checkScratchPercent(ctx, rect_w, rect_h, idx);
  }

  canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
  canvas.addEventListener('mousemove', scratch);
  canvas.addEventListener('mouseup', () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });
  canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, {passive:false});
  canvas.addEventListener('touchmove', scratch, {passive:false});
  canvas.addEventListener('touchend', () => { isDrawing = false; });
}

function checkScratchPercent(ctx, w, h, idx) {
  if (STATE.scratchDone[idx-1]) return;
  ctx.globalCompositeOperation = 'source-over';
  const imgData = ctx.getImageData(0,0,w,h);
  let transparent = 0;
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] < 128) transparent++;
  }
  ctx.globalCompositeOperation = 'destination-out';

  const pct = transparent / (w * h);
  if (pct > 0.55 && !STATE.scratchDone[idx-1]) {
    STATE.scratchDone[idx-1] = true;
    showToast(`Kupon #${idx} terbuka! 🎉`);
    spawnFloatingHearts(4);

    const allDone = STATE.scratchDone.every(Boolean);
    if (allDone) {
      setTimeout(() => {
        $('scratch-status').textContent = '✅ Semua kupon berhasil dibuka! Simpan baik-baik ya!';
        $('btn-scratch-next').classList.remove('hidden');
      }, 500);
    } else {
      const rem = STATE.scratchDone.filter(Boolean).length;
      $('scratch-status').textContent = `${rem}/3 kartu terbuka — lanjut gosok! 🪄`;
    }
  }
}

/* ─────────────────────────────────────────
   SCENE 5: CASSETTE
───────────────────────────────────────── */
function initCassetteWave() {
  // Wave bars already in HTML, animation via CSS when playing
  setWaveState(false);
}

function setWaveState(playing) {
  document.querySelectorAll('.wave-bar').forEach(b => {
    b.style.animationPlayState = playing ? 'running' : 'paused';
    b.style.height = playing ? '' : '4px';
  });
  [$('reel-left'), $('reel-right')].forEach(r => {
    if (!r) return;
    r.classList.toggle('spinning', playing);
  });
}

window.toggleCassette = function() {
  const audio = $('bg-audio');
  const btn = $('play-cassette');
  const pill = $('music-pill');

  if (STATE.cassettePlaying) {
    audio.pause();
    btn.textContent = '▶';
    pill.classList.remove('playing');
    setWaveState(false);
    STATE.cassettePlaying = false;
    STATE.musicMuted = true;
  } else {
    audio.play().then(() => {
      btn.textContent = '⏸';
      pill.classList.add('playing');
      setWaveState(true);
      STATE.cassettePlaying = true;
      STATE.musicMuted = false;
    }).catch(() => showToast('Tap tombol Play dulu ya! 🎵'));
  }
};

window.rewindCassette = function() {
  const audio = $('bg-audio');
  audio.currentTime = Math.max(0, audio.currentTime - 10);
  showToast('⏮ Rewind 10 detik');
};

window.forwardCassette = function() {
  const audio = $('bg-audio');
  audio.currentTime = Math.min(audio.duration || 999, audio.currentTime + 10);
  showToast('⏭ Maju 10 detik');
};

/* ─────────────────────────────────────────
   SCENE 6: POLAROID
───────────────────────────────────────── */
const POLAROID_MSGS = [
  "Setiap momen bersamamu terasa sangat spesial. 💗",
  "Tingkah lucumu itu selalu jadi highlight hariku. 😂🤍",
  "Waktu kamu gemes begitu, hatiku langsung meleleh. 🫠💕",
  "Perasaan saling butuh itu... indah banget ternyata. 🥹🤍"
];
const POLAROID_CAPTIONS = [
  "Momen ngobrol random sampai larut ✨",
  "Tingkah lucumu yang bikin ketawa sendiri 😂",
  "Waktu kamu gemes dan pura-pura galak 😤",
  "Waktu kita ngerasa saling butuh 🥹"
];

window.flipPolaroid = function() {
  const curr = STATE.polaroidCurrent;
  if (curr >= 4) {
    // All done
    $('polar-counter').textContent = 'Semua foto sudah dilihat! 🥹';
    $('btn-polar-next').classList.remove('hidden');
    spawnFloatingHearts(6);
    return;
  }

  // Fly away current top card
  const topCard = $(`polar-${curr}`);
  topCard.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  topCard.style.transform = `rotate(${curr%2===0?'-':''}25deg) translateY(-180px) scale(0.7)`;
  topCard.style.opacity = '0';
  topCard.style.pointerEvents = 'none';

  STATE.polaroidCurrent++;
  const next = STATE.polaroidCurrent;

  // Make next card "current"
  setTimeout(() => {
    $(`polar-${next}`).classList.add('current');
    $(`polar-${next}`).style.transform = '';
    $('polar-counter').textContent = `Foto ${next} dari 4 — Tap buat lanjut`;
    $('polaroid-msg').textContent = POLAROID_MSGS[next-1];
    spawnFloatingHearts(2);
  }, 200);
};

/* ─────────────────────────────────────────
   SCENE 7: HUG METER
───────────────────────────────────────── */
function resetHug() {
  STATE.hugProgress = 0;
  STATE.hugDone = false;
  clearInterval(STATE.hugInterval);
  updateHugRing(0);
  $('hug-emoji').textContent = '🫂';
  $('hug-result').classList.remove('show');
  $('hug-ring').style.display = '';
}

window.startHug = function(e) {
  if (e) e.preventDefault();
  if (STATE.hugDone) return;
  clearInterval(STATE.hugInterval);
  STATE.hugInterval = setInterval(() => {
    STATE.hugProgress += 2;
    updateHugRing(STATE.hugProgress);
    if (STATE.hugProgress >= 100) {
      clearInterval(STATE.hugInterval);
      completeHug();
    }
  }, 60);
};

window.stopHug = function(e) {
  if (e) e.preventDefault();
  if (STATE.hugDone) return;
  clearInterval(STATE.hugInterval);
  // Slowly decrease
  STATE.hugInterval = setInterval(() => {
    STATE.hugProgress = Math.max(0, STATE.hugProgress - 3);
    updateHugRing(STATE.hugProgress);
    if (STATE.hugProgress <= 0) clearInterval(STATE.hugInterval);
  }, 30);
};

function updateHugRing(pct) {
  const circumference = 2 * Math.PI * 70; // r=70
  const offset = circumference * (1 - pct/100);
  $('ring-fill').style.strokeDashoffset = offset;
  $('hug-pct').textContent = Math.round(pct) + '%';

  if (pct > 60) $('hug-emoji').textContent = '💗';
  else if (pct > 30) $('hug-emoji').textContent = '🤗';
  else $('hug-emoji').textContent = '🫂';
}

function completeHug() {
  STATE.hugDone = true;
  $('hug-ring').style.display = 'none';
  const result = $('hug-result');
  result.classList.add('show');
  spawnFloatingHearts(10);
  showToast('Pelukan terkirim! 💗');
  // Vibrate if supported
  if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 120]);
}

/* ─────────────────────────────────────────
   SCENE 8: TYPEWRITER LETTER
───────────────────────────────────────── */
const LETTER_TEXT = [
  "Mungkin ada banyak hal di luar sana yang bikin kamu ragu sama diri kamu sendiri...",
  "\n\nAda hari-hari yang berat, yang bikin kamu ngerasa sendirian menghadapi semuanya.",
  "\n\nTapi aku mau kamu tahu satu hal:",
  "\n\nKehadiranmu di dunia ini adalah salah satu anugerah paling indah.",
  "\n\nKamu nggak perlu jadi sempurna untuk dicintai.",
  "\n\nKamu cukup jadi dirimu sendiri — dan itu udah lebih dari cukup.",
  "\n\nSelalu ada seseorang di sini yang sangat bersyukur bisa kenal kamu. 🤍"
];

let letterTimers = [];
function addLetterTimer(fn, delay) {
  const t = setTimeout(fn, delay);
  letterTimers.push(t);
  return t;
}
function clearLetterTimers() {
  letterTimers.forEach(t => clearTimeout(t));
  letterTimers = [];
}

function resetLetter() {
  clearLetterTimers();
  STATE.letterOpen = false;
  STATE.letterTyping = false;
  STATE.letterDone = false;

  // Reset flap
  const flap = $('env-flap');
  if (flap) flap.classList.remove('open');

  // Reset letter paper
  const paper = $('letter-paper');
  if (paper) {
    paper.style.transition = 'none';
    paper.classList.remove('open');
    requestAnimationFrame(() => { paper.style.transition = ''; });
  }

  // Reset seal
  const seal = $('env-seal');
  if (seal) seal.classList.remove('hidden-seal');

  // Reset text
  if ($('letter-text')) $('letter-text').textContent = '';
  const sign = $('letter-sign');
  if (sign) {
    sign.textContent = '';
    sign.classList.remove('show');
  }
  if ($('letter-stickers')) $('letter-stickers').classList.add('hidden');
  if ($('btn-letter-next')) $('btn-letter-next').classList.add('hidden');
  if ($('letter-hint')) $('letter-hint').textContent = 'Amplop sedang dibuka untukmu... 🥺';

  // Auto-play opening sequence
  addLetterTimer(() => autoOpenLetter(), 650);
}

function autoOpenLetter() {
  if (STATE.letterOpen) return;
  STATE.letterOpen = true;

  // Step 1: Seal fades
  const seal = $('env-seal');
  if (seal) seal.classList.add('hidden-seal');

  // Step 2: Flap flips open backward
  addLetterTimer(() => {
    const flap = $('env-flap');
    if (flap) flap.classList.add('open');
    if ($('letter-hint')) $('letter-hint').textContent = 'Membuka surat untukmu... 💌';
  }, 380);

  // Step 3: Letter sheet smoothly emerges & expands
  addLetterTimer(() => {
    const paper = $('letter-paper');
    if (paper) paper.classList.add('open');
  }, 900);

  // Step 4: Start typewriter
  addLetterTimer(() => {
    if ($('letter-hint')) $('letter-hint').textContent = 'Membacakan surat untukmu... 🖊️';
    startTypewriterLetter();
  }, 1850);
}

// Backward compatibility alias
window.openLetter = function() { /* auto-play via resetLetter */ };

function startTypewriterLetter() {
  const el = $('letter-text');
  if (!el) return;
  el.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'letter-cursor';
  el.appendChild(cursor);

  let lineIdx = 0;
  let charIdx = 0;
  let fullText = '';

  function typeNext() {
    if (lineIdx >= LETTER_TEXT.length) {
      // Finished typing
      cursor.remove();
      const sign = $('letter-sign');
      if (sign) {
        sign.textContent = '— Dari seseorang yang selalu ada. 🌸';
        sign.classList.add('show');
      }

      addLetterTimer(() => {
        if ($('letter-stickers')) $('letter-stickers').classList.remove('hidden');
        if ($('btn-letter-next')) $('btn-letter-next').classList.remove('hidden');
        if ($('letter-hint')) $('letter-hint').textContent = 'Surat selesai dibacakan 💖';
        spawnFloatingHearts(8);
      }, 700);
      return;
    }

    const line = LETTER_TEXT[lineIdx];
    if (charIdx < line.length) {
      fullText += line[charIdx];
      el.textContent = fullText;
      el.appendChild(cursor);
      charIdx++;
      const delay = line[charIdx-1] === '\n' ? 500 : (35 + Math.random() * 25);
      addLetterTimer(typeNext, delay);
    } else {
      lineIdx++;
      charIdx = 0;
      addLetterTimer(typeNext, 350);
    }
  }

  typeNext();
}

/* ─────────────────────────────────────────
   SCENE 9: RUNAWAY BUTTON
───────────────────────────────────────── */
const TAUNTS = [
  "Eits ga kena! 😜",
  "Dibilang jangan pencet ini kok! 😝",
  "Tombol ini rusak khusus buat kamu 🤪",
  "Pilih yang pink kiri aja plisss 🥺",
  "Yakin nih mau pencet? Hmm... 🤔",
  "Woy kiri! Yang kiri! 👈",
  "Tombol ini immune to touch 🛡️😂",
  "Hehe ketangkep deh niatnya 🙈"
];

function initRunawayButton() {
  const btn = $('btn-no');
  if (!btn) return;
  btn.addEventListener('mousemove', runAway);
  btn.addEventListener('touchstart', runAway, {passive:false});
}

function initRunawayInArea() {
  // reset position
  const wrap = $('btn-no-wrap');
  const area = $('runaway-area');
  if (!wrap || !area) return;
  wrap.style.left = '80px';
  wrap.style.top = '10px';
  STATE.noRunCount = 0;
  $('btn-no-taunt').textContent = '';
}

function runAway(e) {
  e.preventDefault();
  const area = $('runaway-area');
  const wrap = $('btn-no-wrap');
  if (!area || !wrap) return;

  const aW = area.offsetWidth;
  const aH = area.offsetHeight;
  const btnW = wrap.offsetWidth;
  const btnH = wrap.offsetHeight;

  const maxX = aW - btnW - 8;
  const maxY = aH - btnH - 8;

  const newX = Math.random() * maxX;
  const newY = Math.random() * maxY;

  wrap.style.transition = 'left 0.25s var(--ease-spring), top 0.25s var(--ease-spring)';
  wrap.style.left = newX + 'px';
  wrap.style.top = newY + 'px';

  STATE.noRunCount++;
  const taunt = TAUNTS[Math.min(STATE.noRunCount - 1, TAUNTS.length - 1)];
  $('btn-no-taunt').textContent = taunt;
  $('btn-no-taunt').style.opacity = '1';
  if (navigator.vibrate) navigator.vibrate(30);
}

window.answerYes = function() {
  spawnFloatingHearts(15);
  showToast('YAAAY! Aku seneng banget! 🥳💗');
  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  setTimeout(() => nextScene(), 1200);
};

/* ─────────────────────────────────────────
   SCENE 10: FINALE
───────────────────────────────────────── */
let confettiParticles = [];
let confettiRunning = false;

function launchFinale() {
  const canvas = $('finale-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  // Create confetti
  const colors = ['#f43f5e','#fb7185','#fda4af','#fcd34d','#a78bfa','#34d399','#60a5fa','#f9a8d4'];
  confettiParticles = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: 5 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 6,
    shape: Math.random() > 0.4 ? 'rect' : 'circle',
    w: 8 + Math.random()*8, h: 5 + Math.random()*5
  }));

  confettiRunning = true;

  function animConf() {
    if (!confettiRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      p.vy += 0.08; // gravity

      if (p.y > canvas.height + 20) {
        confettiParticles[i] = {
          x: Math.random() * canvas.width,
          y: -20, r: p.r, color: p.color,
          vx: (Math.random()-0.5)*4, vy: 2+Math.random()*4,
          rot: 0, rotV: (Math.random()-0.5)*6,
          shape: p.shape, w: p.w, h: p.h
        };
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      }
      ctx.restore();
    });
    requestAnimationFrame(animConf);
  }
  animConf();

  spawnFloatingHearts(12);
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);

  // Stop confetti after 8 seconds
  setTimeout(() => { confettiRunning = false; ctx.clearRect(0,0,canvas.width,canvas.height); }, 8000);
}

window.restartJourney = function() {
  confettiRunning = false;
  STATE.currentScene = 1;
  STATE.knockCount = 0;
  STATE.sliderDone = false;
  STATE.scanDone = false;
  STATE.moodPicked = false;
  STATE.starsPopped = 0;
  STATE.stars = [];
  STATE.scratchDone = [false,false,false];
  STATE.hugProgress = 0;
  STATE.hugDone = false;
  STATE.letterOpen = false;
  STATE.letterDone = false;
  STATE.polaroidCurrent = 1;
  STATE.noRunCount = 0;
  STATE.cassettePlaying = false;
  scanProgress = 0;

  // Reset scene displays
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
  $('scene-1').classList.add('active');
  updateProgress(1);

  // Reset Scene 1 (Pintu)
  $('door-frame').className = 'door-frame';
  $('door-peek').classList.remove('show');
  $('knock-hint').textContent = 'Klik pintu buat ngetok 👆';
  $('slider-section').classList.add('hidden');
  $('btn-buka-pintu').classList.add('hidden');
  $('kangen-val').textContent = '0%';
  $('kangen-slider').value = 0;
  $('door-box').onclick = () => knockDoor();

  // Reset Scene 2 (Mood Scan)
  $('scan-result').textContent = 'Tahan tombol di atas selama 2 detik...';
  $('mood-section').classList.add('hidden');
  $('mood-response').classList.remove('show');
  $('btn-mood-next').classList.add('hidden');
  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));

  // Reset Scene 3 (Tangkap Bintang)
  resetStarGame();

  // Reinit Scene 4 (Scratch Cards)
  initScratchCards();
  $('scratch-status').textContent = 'Gosok semua kartu dulu yaa... 🪄';
  $('btn-scratch-next').classList.add('hidden');

  // Reset Scene 5 (Kaset Analog)
  setWaveState(false);
  const playBtn = $('btn-play-cassette');
  if (playBtn) playBtn.textContent = '▶ Putar';

  // Reset Scene 6 (Polaroids)
  STATE.polaroidCurrent = 1;
  [1,2,3,4].forEach(i => {
    const el = $(`polar-${i}`);
    if (el) {
      el.style = '';
      el.classList.remove('current');
    }
  });
  if ($('polar-1')) $('polar-1').classList.add('current');
  if ($('polar-counter')) $('polar-counter').textContent = 'Foto 1 dari 4 — Tap buat lanjut';
  if ($('polaroid-msg')) $('polaroid-msg').textContent = 'Setiap momen bersamamu terasa sangat spesial. 💗';
  if ($('btn-polar-next')) $('btn-polar-next').classList.add('hidden');

  // Reset Scene 7 (Pelukan)
  resetHug();

  // Reset Scene 8 (Surat)
  clearLetterTimers();
  const flap = $('env-flap');
  if (flap) flap.classList.remove('open');
  const paper = $('letter-paper');
  if (paper) {
    paper.style.transition = 'none';
    paper.classList.remove('open');
    requestAnimationFrame(() => { paper.style.transition = ''; });
  }
  const seal = $('env-seal');
  if (seal) seal.classList.remove('hidden-seal');
  if ($('letter-text')) $('letter-text').textContent = '';
  const sign = $('letter-sign');
  if (sign) {
    sign.textContent = '';
    sign.classList.remove('show');
  }
  if ($('letter-stickers')) $('letter-stickers').classList.add('hidden');
  if ($('btn-letter-next')) $('btn-letter-next').classList.add('hidden');
  if ($('letter-hint')) $('letter-hint').textContent = 'Amplop sedang dibuka untukmu... 🥺';

  // Reset Scene 9 (Tombol Kabur)
  initRunawayInArea();

  window.scrollTo({top:0, behavior:'smooth'});
};

/* ─────────────────────────────────────────
   MUSIC PLAYER & AUTOPLAY
───────────────────────────────────────── */
function startAudioPlayback() {
  const audio = $('bg-audio');
  const pill = $('music-pill');
  if (!audio) return;
  audio.play().then(() => {
    if (pill) pill.classList.add('playing');
    const label = $('music-label');
    if (label) label.textContent = 'Jeda 🎵';
    STATE.musicMuted = false;
    if (STATE.currentScene === 5) setWaveState(true);
  }).catch(() => {
    // Autoplay policy: will trigger on first user click/touch
  });
}

function initMusicPill() {
  const pill = $('music-pill');
  if (pill) {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const audio = $('bg-audio');
      if (!audio) return;
      if (audio.paused) {
        startAudioPlayback();
      } else {
        audio.pause();
        pill.classList.remove('playing');
        const label = $('music-label');
        if (label) label.textContent = 'Musik 🎵';
        STATE.musicMuted = true;
        if (STATE.currentScene === 5) setWaveState(false);
      }
    });
  }

  // 1. Try playing immediately on load
  startAudioPlayback();

  // 2. Play on first interaction anywhere if blocked initially
  const unlockAudio = () => {
    const audio = $('bg-audio');
    if (audio && audio.paused && !STATE.musicMuted) {
      startAudioPlayback();
    }
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

/* ─────────────────────────────────────────
   WHATSAPP LINK
───────────────────────────────────────── */
function setWALink() {
  const phone = "6281249192305";
  const msg = encodeURIComponent("Hai! Aku udah buka web Kisah Kita sampai babak terakhir... ini lucu banget dan bikin baper haha 🥺🤍 Makasih yaa~");
  const btn = $('btn-wa');
  if (btn) btn.href = `https://wa.me/${phone}?text=${msg}`;
}

/* ─────────────────────────────────────────
   FLOATING HEARTS
───────────────────────────────────────── */
function spawnFloatingHearts(n) {
  const hearts = ['🤍','💗','💕','🩷','💓','🌸','✨','💫'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'float-heart';
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = (10 + Math.random() * 80) + 'vw';
      el.style.top = (20 + Math.random() * 60) + 'vh';
      el.style.fontSize = (1.1 + Math.random() * 1.3) + 'rem';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 80);
  }
}

/* ─────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ─────────────────────────────────────────
   AMBIENT BACKGROUND CANVAS
───────────────────────────────────────── */
function initAmbientCanvas() {
  const canvas = $('ambient-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const particles = Array.from({length: 55}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1.5 + Math.random() * 3,
    vx: (Math.random()-0.5)*0.3,
    vy: -0.2 - Math.random()*0.5,
    alpha: 0.2 + Math.random()*0.4,
    color: `hsl(${340 + Math.random()*40}, 80%, 75%)`
  }));

  function drawAmbient() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random()*canvas.width; }
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    requestAnimationFrame(drawAmbient);
  }
  drawAmbient();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
