'use strict';
// CAT SANCTUARY — a tiny pixel-art cat-keeping game. No libraries.
const W = 320, H = 180, DAY = 180, SAVE = 'catsanct-v3', MAXCATS = 6;
const $ = (i) => document.getElementById(i);
const R = (a, b) => a + Math.random() * (b - a), P = (a) => a[Math.random() * a.length | 0];
const C = (v, a, b) => Math.max(a, Math.min(b, v));
const cv = $('game'), ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
const OUT = '#5a4663', BOWL = { x: 262, y: 152 }, CUSH = { x: 70, y: 152 }, POST = { x: 214, y: 134 };
const ITEMS = { cushion: { n: 'CUSHION', cost: 20, d: 'cats nap 50% faster' }, plant: { n: 'PLANT', cost: 15, d: 'cats earn coins faster' },
  lights: { n: 'FAIRY LIGHTS', cost: 25, d: 'pretty glow at night' }, post: { n: 'SCRATCH POST', cost: 30, d: 'cats scratch and play' } };
const ACCS = { bow: { n: 'BOW', cost: 12 }, flower: { n: 'FLOWER', cost: 12 }, crown: { n: 'CROWN', cost: 40 } };

// ---------- data ----------
const TYPES = {
  purple: { n: 'MISO', kick: 'THE SLEEPY ONE', pitch: 220, spd: .8, body: '#b9a7e8', shade: '#9f8bd6', light: '#d9ccf5', belly: '#f1eafc', line: '#6f5aa8', mk: [[9, 3, 2, 2, '#ffe58a'], [10, 4, 1, 1, '#fff6c9']], outs: [
    ['HMM.', 'you look like you need a nap.'], ['ZZZ.', 'do not disturb until 2031.'],
    ['YAWN.', 'you pressed a button. that was your workout.'], ['MRRP?', 'you woke me up for this?']] },
  white: { n: 'MOCHI', kick: 'THE MYSTERIOUS ONE', pitch: 330, spd: 1, body: '#fffaf3', shade: '#efe3dc', light: '#ffffff', belly: '#ffffff', line: '#b3a1a3', mk: [[15, 2, 3, 2, '#ffa6c1'], [16, 2, 1, 1, '#ff7fa6']], outs: [
    ['BOO!', 'you have been chosen. no refunds.'], ['I SEE.', 'mochi knows what you did last tuesday.'],
    ['...', 'the cat stares. you stare back. you lose.'], ['PSST.', 'your secret is safe. for snacks.']] },
  orange: { n: 'TOAST', kick: 'THE CHAOTIC ONE', pitch: 440, spd: 1.1, body: '#ffc27a', shade: '#f0a257', light: '#ffdcae', belly: '#fff1d9', line: '#c27a46', mk: [[8, 3, 1, 2, '#f09a4d'], [11, 3, 1, 2, '#f09a4d']], outs: [
    ['HEY.', 'you share one brain cell. be nice.'], ['ZOOM!', '3 AM energy. nobody knows why.'],
    ['OOPS.', 'toast pushed it off the table. on purpose.'], ['FOOD?', 'is it food? it is not food. but is it?']] },
  blue: { n: 'BLOOP', kick: 'THE TINY MENACE', pitch: 520, spd: 1.2, body: '#fff6ea', shade: '#f1e2d2', light: '#ffffff', belly: '#ffffff', line: '#8aa9b8', mk: [[4, 11, 12, 2, '#7ed6e0'], [12, 13, 2, 2, '#5bbfcc']], outs: [
    ['RUN.', 'this is not a drill. probably.'], ['BONK.', "bloop headbutted your ankle. you're welcome."],
    ['MWAHA.', 'the plan: sit on your keyboard.'], ['SPRINT!', 'the hallway belongs to bloop now.']] }
};
const TOTAL = 16;
const NAMES = ['Pixel', 'Noodle', 'Biscuit', 'Pickle', 'Waffle', 'Sprout', 'Mango', 'Tofu', 'Pudding', 'Nacho', 'Beans', 'Pip'];
const QUIRKS = { greedy: ['GREEDY', 'gets hungry fast'], play: ['PLAYFUL', 'loves yarn'], lazy: ['LAZY', 'naps a lot'],
  zoom: ['ZOOMIES', 'runs everywhere'], social: ['CUDDLY', 'loves pets'] };

// ---------- sprites: chibi cats, pixel maps baked at 2x with soft shading ----------
const SIT = ["..oo............oo..", ".obbo..........obbo.", ".obpboooooooooobpbo.", "obbbbbbbbbbbbbbbbbbo", "obbbbbbbbbbbbbbbbbbo", "obbbheebbbbbbheebbbo", "obbbeeebbbbbbeeebbbo", "obbbeeebbbbbbeeebbbo", "obpppbbbbnnbbbbpppbo", "obbbbbbbwmmwbbbbbbbo", ".obbbbbbbbbbbbbbbbo.", "...obbbbbbbbbbbbo...", "...obbbwwwwwwbbbo...", "...obbwwwwwwwwbbo...", "...obbwwwwwwwwbbo...", "...obbbwwwwwwbbbo...", "..obbbbbbbbbbbbbbo..", "....obbo....obbo....", "....oooo....oooo...."];
const LOAF = ["..oo............oo..", ".obbo..........obbo.", ".obpboooooooooobpbo.", "obbbbbbbbbbbbbbbbbbo", "obbbbbbbbbbbbbbbbbbo", "obbbeeebbbbbbeeebbbo", "obpppbbbbnnbbbbpppbo", "obbbbbbbbbbbbbbbbbbo", "obbbbbbbbbbbbbbbbbbo", ".obbbbbbbbbbbbbbbbo.", "..oooooooooooooooo.."];
const HEART = ['.x.x.', 'xxxxx', 'xxxxx', '.xxx.', '..x..'];
function bake(rows, t, blink) {
  const w = rows[0].length, c = document.createElement('canvas');
  c.width = w * 2; c.height = rows.length * 2;
  const g = c.getContext('2d'), col = { o: t.line, b: t.body, w: t.belly, e: '#4a3a4d', h: '#fff', p: '#ffb3c6', n: '#ff8fab', m: '#c98a98' };
  const put = (x, y, ww, hh, cc) => { g.fillStyle = cc; g.fillRect(x * 2, y * 2, ww * 2, hh * 2); };
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === '.') return;
    let k = ch; if (blink && (ch === 'e' || ch === 'h')) k = y === 6 ? 'e' : 'b';
    let cc = col[k];
    if (k === 'b') { if (y >= rows.length - 4 || (x >= w * .7 && y >= 3)) cc = t.shade; else if (y <= 3 && x >= 5 && x <= 9) cc = t.light; }
    put(x, y, 1, 1, cc);
  }));
  (t.mk || []).forEach((m) => put(m[0], m[1], m[2], m[3], m[4]));
  return c;
}
const S = {};
for (const k in TYPES) { const t = TYPES[k]; S[k] = { sit: bake(SIT, t), blink: bake(SIT, t, 1), loaf: bake(LOAF, t) }; }

// ---------- state & saving ----------
function mkCat(type, name, q) {
  return { id: Math.random() * 1e6 | 0, type, name: name || P(NAMES), q: q || P(Object.keys(QUIRKS)),
    x: R(40, 280), y: R(115, 165), tx: 0, ty: 0, state: 'sit', st: R(1, 3), dir: 1, hunger: 85, joy: 70, energy: 90,
    bt: 0, blink: 0, nb: R(1, 4), ct: 0, bat: 0, zt: 0, bond: 0, acc: '' };
}
let G = { coins: 10, cats: [], found: [], t: 0, bowl: 0, muted: false, saved: Date.now(), pets: 0, done: [], items: {}, accs: {} };
let away = 0;
try {
  const s = JSON.parse(localStorage.getItem(SAVE));
  if (s && Array.isArray(s.cats)) {
    G = Object.assign(G, s);
    away = Math.min((Date.now() - G.saved) / 1000, 6 * 3600);   // cozy offline progress, capped at 6h
    G.cats.forEach((c) => {
      c.hunger = Math.max(10, c.hunger - away * .04); c.joy = Math.max(15, c.joy - away * .03);
      c.energy = 100; c.state = 'sit'; c.st = 1; Object.assign(c, { bt: 0, blink: 0, nb: 2, ct: 0, bat: 0, zt: 0 });
    });
  }
} catch (e) { /* first run or private mode */ }
const save = () => { G.saved = Date.now(); try { localStorage.setItem(SAVE, JSON.stringify(G)); } catch (e) {} };
let sel = null, ball = null, mode = null, fx = [], clock = 0, hudT = 0, saveT = 0;

// ---------- sound (WebAudio chiptune) ----------
let ac;
function tone(f, s, d, type = 'square', to = null, v = .06) {
  if (G.muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + s, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) {}
}
const sfx = {
  meow: (p) => { tone(p, 0, .26, 'sawtooth', p * 1.8, .05); tone(p * 3, .28, .08); },
  purr: () => { for (let i = 0; i < 6; i++) tone(70 + (i % 2) * 12, i * .06, .05, 'sawtooth', null, .04); },
  coin: () => { tone(880, 0, .06); tone(1320, .06, .12); },
  munch: () => { tone(180, 0, .05, 'square', 90); tone(180, .1, .05, 'square', 90); },
  bat: () => tone(400, 0, .07, 'triangle', 700),
  pop: () => tone(300, 0, .1, 'square', 600),
  deny: () => tone(150, 0, .15, 'square', 100),
  fanfare: () => { tone(660, 0, .08); tone(880, .08, .08); tone(1320, .16, .18); }
};

// ---------- soft pastel world (pre-rendered once) ----------
const hx = (h) => h[0] === '#' ? [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)) : h.match(/\d+/g).map(Number);
const mix = (a, b, t) => 'rgb(' + hx(a).map((v, i) => v + (hx(b)[i] - v) * t | 0) + ')';
const dot = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
(function () {
  const g = bg.getContext('2d');
  const blob = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const hill = (b, a, col, s) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, b - a * (.5 + .5 * Math.sin(x * .05 + s) * Math.cos(x * .021 + s * 2)) | 0);
    g.lineTo(W, H); g.fill();
  };
  hill(104, 30, '#d3f0e1', 1); hill(110, 20, '#c3e9d4', 4);
  [[34, 100], [292, 98], [262, 104]].forEach(([x, y]) => {          // round blossom trees
    g.fillStyle = '#e2c4b0'; g.fillRect(x - 2, y - 2, 4, 10);
    blob(x, y - 8, 12, '#b9e4c9'); blob(x - 8, y - 2, 8, '#a9dbbb'); blob(x + 8, y - 3, 9, '#b9e4c9');
    blob(x - 3, y - 12, 3, '#ffc4d6'); blob(x + 6, y - 9, 2.5, '#ffc4d6'); blob(x - 9, y - 4, 2, '#ffc4d6');
  });
  const gr = g.createLinearGradient(0, 108, 0, H); gr.addColorStop(0, '#c9f0d8'); gr.addColorStop(1, '#a9dfc0');
  g.fillStyle = gr; g.fillRect(0, 108, W, H);
  for (let i = 0; i < 44; i++) {
    const x = (i * 67 + 13) % 312 + 4, y = 116 + (i * 41) % 58;
    if (i % 3) { g.fillStyle = '#98d3b0'; g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y + 1, 1, 2); }
    else { blob(x, y, 2, ['#ffb3cd', '#cdb8ff', '#ffe49a', '#ffc7a8'][i % 4]); g.fillStyle = '#fff'; g.fillRect(x, y, 1, 1); }
  }
})();
const night = () => { const p = G.t % DAY / DAY; return p < .55 ? 0 : p < .7 ? (p - .55) / .15 : p < .9 ? 1 : 1 - (p - .9) / .1; };

// ---------- cat brain ----------
function go(c, x, y, s) { c.tx = x; c.ty = y; c.state = s; c.st = 15; }
function decide(c) {
  if (c.hunger < 45 && G.bowl > 0) return go(c, BOWL.x + R(-12, 8), BOWL.y + R(-3, 4), 'goeat');
  if (ball) { c.state = 'chase'; c.st = 99; return; }
  if (c.energy < 40 || (night() > .6 && Math.random() < .5)) {
    if (G.items.cushion) return go(c, CUSH.x + R(-8, 8), CUSH.y + R(-2, 2), 'gosleep');
    c.state = 'sleep'; c.st = R(10, 20); return;
  }
  if (G.items.post && Math.random() < .25) return go(c, POST.x + R(-12, 12), POST.y + R(2, 6), 'goscratch');
  if (Math.random() < .6) go(c, R(24, 296), R(114, 168), 'walk'); else { c.state = 'sit'; c.st = R(1.5, 4); }
}
function burst(x, y, kind, n = 1) { for (let i = 0; i < n; i++) fx.push({ x: x + R(-6, 6), y, vx: R(-8, 8), vy: R(-26, -14), l: 1.2, k: kind }); }
function tick(c, dt) {
  const t = TYPES[c.type], m = c.state, sleeping = m === 'sleep', n = night();
  c.bt += dt; c.nb -= dt; c.blink -= dt; c.bat -= dt;
  if (c.nb < 0) { c.blink = .15; c.nb = R(2, 5); }
  c.hunger = C(c.hunger - dt * .12 * (c.q === 'greedy' ? 1.6 : 1) * (sleeping ? .4 : 1), 0, 100);
  c.joy = C(c.joy - dt * (.07 + (c.hunger < 15 ? .1 : 0) + (c.q === 'play' ? .03 : 0)), 0, 100);
  c.energy = C(c.energy + dt * (sleeping ? 1.4 * (G.items.cushion ? 1.5 : 1) : -(.05 + n * .04) * (c.q === 'lazy' ? 1.7 : 1)), 0, 100);
  c.st -= dt;
  if (m === 'scratch') c.joy = C(c.joy + dt * 8, 0, 100);
  c.ct += dt; if (c.ct > (G.items.plant ? 23 : 30) && c.joy > 55) { c.ct = 0; G.coins++; burst(c.x, c.y - 30, 'coin'); sfx.coin(); }
  if (sleeping) {
    c.zt -= dt; if (c.zt < 0) { c.zt = 1.4; burst(c.x + 8, c.y - 12, 'z'); }
    if (c.st <= 0 || c.energy >= 98) decide(c);
  } else if (/^(walk|goeat|chase|gosleep|goscratch)$/.test(m)) {
    let tx = c.tx, ty = c.ty;
    if (m === 'chase') { if (!ball) { c.state = 'sit'; c.st = 1; return; } tx = ball.x; ty = ball.y; }
    const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy);
    const sp = 34 * t.spd * (c.q === 'zoom' ? 1.7 : 1) * (m === 'chase' ? 1.6 : 1);
    if (d < (m === 'chase' ? 12 : 3)) {
      if (m === 'goeat') { if (G.bowl > 0) { c.state = 'eat'; c.st = 2.5; } else { c.state = 'sit'; c.st = 1; } }
      else if (m === 'chase') {
        if (c.bat <= 0) {
          c.bat = .6; const a = Math.atan2(ball.y - c.y, ball.x - c.x) + R(-.8, .8);
          ball.vx = Math.cos(a) * R(70, 120); ball.vy = Math.sin(a) * R(40, 70);
          c.joy = C(c.joy + (c.q === 'play' ? 14 : 8), 0, 100); burst(c.x, c.y - 28, 'heart'); sfx.bat();
        }
      } else if (m === 'gosleep') { c.state = 'sleep'; c.st = R(10, 20); }
      else if (m === 'goscratch') { c.state = 'scratch'; c.st = 2.5; }
      else { c.state = 'sit'; c.st = R(1, 4); }
    } else { c.x += dx / d * sp * dt; c.y += dy / d * sp * dt; if (Math.abs(dx) > 1) c.dir = Math.sign(dx); }
    if (c.st <= 0 && m !== 'chase') { c.state = 'sit'; c.st = 1; }
  } else if (m === 'eat') {
    if (c.st <= 0) {
      G.bowl = Math.max(0, G.bowl - 1); c.hunger = C(c.hunger + 35, 0, 100); c.joy = C(c.joy + 4, 0, 100);
      burst(c.x, c.y - 30, 'heart'); sfx.munch(); c.state = 'sit'; c.st = 1;
    }
  } else if (c.st <= 0) decide(c);
}

// ---------- actions ----------
let toastT;
function toast(msg) { const e = $('toast'); e.textContent = msg; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 2400); }
function feed() {
  if (G.coins < 3) { sfx.deny(); return toast('not enough coins (pet your cats to earn some)'); }
  if (G.bowl >= 6) return toast('the bowl is already full');
  G.coins -= 3; G.bowl = Math.min(6, G.bowl + 3); sfx.pop(); toast('fresh food in the bowl');
}
function setMode(m) { mode = mode === m ? null : m; $('yarn').classList.toggle('on', mode === 'yarn'); document.querySelector('.stage').classList.toggle('yarn', mode === 'yarn'); if (mode === 'yarn') toast('click the grass to throw the yarn'); }
const adoptCost = () => 15 * G.cats.length;
function pet(c) {
  sel = c; G.pets++; c.bond = C((c.bond || 0) + 4, 0, 100); c.state = 'pet'; c.st = 1.3; c.bt = 0; c.dir = c.dir || 1;
  const gain = c.q === 'social' ? 20 : 12;
  if (c.joy < 95) { G.coins++; sfx.coin(); }
  c.joy = C(c.joy + gain, 0, 100); burst(c.x, c.y - 30, 'heart', 3); sfx.purr();
}
cv.addEventListener('pointerdown', (e) => {
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  if (mode === 'yarn' && y > 108) { ball = { x, y, vx: 0, vy: 0, life: 14 }; setMode('yarn'); sfx.pop(); return; }
  const hit = G.cats.filter((c) => Math.abs(x - c.x) < 20 && y > c.y - 40 && y < c.y + 4).sort((a, b) => b.y - a.y)[0];
  if (hit) { if (hit.state === 'sleep') { hit.state = 'sit'; hit.st = 1; } pet(hit); } else sel = null;
});

// ---------- adoption: the original "pick a cat, get a surprise" ----------
let firstRun = false, adopting = false;
function openPicker(first) {
  firstRun = first; $('modal').hidden = false; $('pickView').hidden = false; $('revealView').hidden = true;
  $('closeModal').hidden = first;
  $('pickSub').textContent = first ? "Choose wisely. Or don't. They're cats." : `A new friend costs ${adoptCost()}¢. Pick a box.`;
  const box = $('picks'); box.innerHTML = '';
  Object.keys(TYPES).forEach((k, i) => {
    const b = document.createElement('button'), c = document.createElement('canvas');
    c.width = 28; c.height = 28; c.getContext('2d').drawImage(S[k].sit, 0, 0);
    b.type = 'button'; b.append(c, `${i + 1} ${TYPES[k].n}`); b.onclick = () => adopt(k); box.append(b);
  });
  box.firstChild.focus();
}
function adopt(type) {
  if (!firstRun) { if (G.coins < adoptCost()) { sfx.deny(); return toast('not enough coins'); } G.coins -= adoptCost(); }
  const t = TYPES[type], i = Math.random() * 4 | 0, key = type + ':' + i, isNew = !G.found.includes(key);
  if (isNew) G.found.push(key);
  const cat = mkCat(type); G.cats.push(cat); sel = cat; cat.y = 140; cat.x = R(120, 200);
  const rc = $('rCat').getContext('2d'); rc.clearRect(0, 0, 28, 28); rc.drawImage(S[type].sit, 0, 0);
  $('rKick').textContent = t.kick + (isNew ? ' · NEW!' : '');
  $('rWord').textContent = t.outs[i][0]; $('rCap').textContent = t.outs[i][1];
  $('rTrait').textContent = `${cat.name.toUpperCase()} IS ${QUIRKS[cat.q][0]}: ${QUIRKS[cat.q][1]}`;
  $('pickView').hidden = true; $('revealView').hidden = false;
  const r = $('rCat'); r.style.animation = 'none'; void r.offsetWidth; r.style.animation = '';
  sfx.meow(t.pitch); if (isNew) sfx.fanfare(); save(); $('rOk').focus();
}
const closeModal = () => { $('modal').hidden = true; save(); };

// ---------- UI wiring ----------
$('feed').onclick = feed; $('yarn').onclick = () => setMode('yarn');
$('adopt').onclick = () => { if (G.cats.length >= MAXCATS) return toast('the sanctuary is full (6 cats max)'); openPicker(false); };
$('closeModal').onclick = closeModal; $('rOk').onclick = closeModal;
$('mute').onclick = () => { G.muted = !G.muted; $('mute').textContent = G.muted ? '♪ OFF' : '♪ ON'; if (!G.muted) sfx.pop(); };
$('pname').onclick = () => {
  if (!sel) return; const n = prompt('Rename your cat:', sel.name);
  if (n && n.trim()) sel.name = n.trim().slice(0, 10);
};
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (!$('sheet').hidden) { if (k === 'escape') $('sheet').hidden = true; return; }
  if (!$('modal').hidden) {
    if (/^[1-4]$/.test(k) && !$('pickView').hidden) adopt(Object.keys(TYPES)[k - 1]);
    else if (k === 'escape' && !firstRun) closeModal();
    return;
  }
  if (k === 'f') feed(); else if (k === 'y') setMode('yarn'); else if (k === 'a') $('adopt').click();
  else if (k === 'm') $('mute').click(); else if (k === 's') openShop(); else if (k === 'g') openGoals(); else if (k === 'escape') { sel = null; if (mode) setMode(mode); }
});
// ---------- goals, shop, dress-up ----------
const GOALS = [
  { id: 'pet10', t: 'Pet cats 10 times', n: 10, v: () => G.pets, r: 10 },
  { id: 'cats3', t: 'Have 3 cats', n: 3, v: () => G.cats.length, r: 15 },
  { id: 'kinds', t: 'Own all 4 kinds of cat', n: 4, v: () => new Set(G.cats.map((c) => c.type)).size, r: 25 },
  { id: 'found8', t: 'Find 8 surprises', n: 8, v: () => G.found.length, r: 25 },
  { id: 'decor', t: 'Buy 3 decorations', n: 3, v: () => Object.keys(G.items).length, r: 20 },
  { id: 'day5', t: 'Live to day 5', n: 5, v: () => Math.floor(G.t / DAY) + 1, r: 30 },
  { id: 'bond', t: 'Max out a cat\'s bond', n: 1, v: () => G.cats.some((c) => (c.bond || 0) >= 100) ? 1 : 0, r: 40 }
];
function goals() {
  GOALS.forEach((g) => { if (!G.done.includes(g.id) && g.v() >= g.n) { G.done.push(g.id); G.coins += g.r; toast(`goal done: ${g.t}  +${g.r}¢`); sfx.fanfare(); } });
}
const sheet = (title, html) => { $('sheetTitle').textContent = title; $('sheetBody').innerHTML = html; $('sheet').hidden = false; };
function openShop() {
  const row = (kind, k, o) => { const own = !!G[kind][k];
    return `<div class="row"><b>${o.n}</b><span>${o.d || 'dress-up for one cat'}</span><button data-b="${kind}:${k}" ${own || G.coins < o.cost ? 'disabled' : ''}>${own ? 'OWNED' : o.cost + '¢'}</button></div>`; };
  sheet(`SHOP · ${G.coins}¢`, Object.entries(ITEMS).map(([k, o]) => row('items', k, o)).join('') + Object.entries(ACCS).map(([k, o]) => row('accs', k, o)).join(''));
}
function openGoals() {
  sheet('GOALS', GOALS.map((g) => { const v = Math.min(g.v(), g.n), d = G.done.includes(g.id);
    return `<div class="row goal ${d ? 'done' : ''}"><b>${d ? '✓ ' : ''}${g.t}</b><span>${v}/${g.n} · +${g.r}¢</span><i style="--w:${v / g.n * 100}%"></i></div>`; }).join(''));
}
$('sheetBody').onclick = (e) => {
  const b = e.target.closest('button[data-b]'); if (!b || b.disabled) return;
  const [kind, k] = b.dataset.b.split(':'), o = (kind === 'items' ? ITEMS : ACCS)[k];
  if (G.coins < o.cost) return sfx.deny();
  G.coins -= o.cost; G[kind][k] = 1; sfx.fanfare(); toast(o.n + ' bought!'); save(); openShop();
};
$('sheetClose').onclick = () => { $('sheet').hidden = true; };
$('shop').onclick = openShop; $('goals').onclick = openGoals;
$('pdress').onclick = () => {
  if (!sel) return; const own = [''].concat(Object.keys(ACCS).filter((k) => G.accs[k]));
  if (own.length === 1) return toast('buy accessories in the shop (S)');
  sel.acc = own[(own.indexOf(sel.acc || '') + 1) % own.length]; sfx.pop(); burst(sel.x, sel.y - 36, 'heart', 2);
};
const bar = (id, v, col) => { const e = $(id); e.style.width = v + '%'; e.style.background = v < 30 ? '#ff9aae' : col; };
function hud() {
  const p = G.t % DAY / DAY, n = night();
  $('coins').textContent = '¢ ' + G.coins;
  $('clock').textContent = `DAY ${Math.floor(G.t / DAY) + 1} · ${n > .6 ? 'NIGHT' : p < .15 ? 'MORNING' : p < .55 ? 'DAY' : 'EVENING'}`;
  $('found').textContent = `✦ ${G.found.length}/${TOTAL}`;
  $('adopt').disabled = G.cats.length >= MAXCATS; $('adoptCost').textContent = `-${adoptCost()}¢ · A`;
  goals(); $('panel').hidden = !sel;
  if (sel) {
    const b = (sel.bond || 0) / 20 | 0;
    $('pname').textContent = sel.name.toUpperCase();
    $('pinfo').textContent = `${TYPES[sel.type].n} · ${QUIRKS[sel.q][0]} · ${'♥'.repeat(b) + '♡'.repeat(5 - b)}`;
    bar('mH', sel.hunger | 0, '#ffc27a'); bar('mJ', sel.joy | 0, '#ff9fc0'); bar('mE', sel.energy | 0, '#8fdcc0');
    $('pdress').textContent = '✿ ' + (sel.acc ? ACCS[sel.acc].n : 'STYLE');
  }
}

// ---------- rendering ----------
function px(rows, x, y, col, s = 2) { ctx.fillStyle = col; rows.forEach((r, j) => [...r].forEach((ch, i) => ch === 'x' && ctx.fillRect(x + i * s, y + j * s, s, s))); }
function accessory(a, cx, y) {
  if (a === 'bow') { ctx.fillStyle = '#ff8fab'; ctx.fillRect(cx + 7, y + 2, 4, 5); ctx.fillRect(cx + 13, y + 2, 4, 5); ctx.fillStyle = '#ff5f8f'; ctx.fillRect(cx + 11, y + 3, 2, 3); }
  if (a === 'crown') { ctx.fillStyle = '#ffd96b'; ctx.fillRect(cx - 7, y - 1, 14, 4); ctx.fillRect(cx - 7, y - 5, 3, 4); ctx.fillRect(cx - 1, y - 7, 3, 6); ctx.fillRect(cx + 4, y - 5, 3, 4); ctx.fillStyle = '#ff8fab'; ctx.fillRect(cx - 1, y, 3, 2); }
  if (a === 'flower') { ctx.fillStyle = '#ffb3cd'; [[-14, 1], [-10, 1], [-12, -1], [-12, 3]].forEach(([dx, dy]) => ctx.fillRect(cx + dx, y + 2 + dy, 3, 3)); ctx.fillStyle = '#ffe49a'; ctx.fillRect(cx - 12, y + 3, 3, 3); }
}
function drawCat(c) {
  const t = TYPES[c.type], s = S[c.type], sl = c.state === 'sleep', f = sl ? s.loaf : c.blink > 0 ? s.blink : s.sit, w = f.width, h = f.height;
  const mv = /^(walk|goeat|chase|gosleep|goscratch)$/.test(c.state);
  const by = mv ? -Math.abs(Math.sin(c.bt * 9)) * 3 : c.state === 'pet' ? -Math.abs(Math.sin(c.bt * 14)) * 3 : c.state === 'eat' ? Math.sin(c.bt * 12) * 1.2
    : c.state === 'scratch' ? Math.sin(c.bt * 16) * 1.5 : sl ? Math.sin(c.bt * 2) * .8 : Math.sin(c.bt * 2 + c.id) * .6;
  const x = c.x - w / 2 | 0, y = c.y - h + by | 0;
  ctx.fillStyle = 'rgba(120,90,140,.17)'; ctx.fillRect(x + 6, c.y - 3, w - 12, 3); ctx.fillRect(x + 9, c.y - 4, w - 18, 1);
  if (!sl) {                                                  // wagging tail
    const d = c.dir, tx = d > 0 ? x + w - 6 : x + 4, wag = Math.sin(G.t * 5 + c.id) * 3 | 0;
    const seg = (i) => [tx + d * i * 2, y + h - 9 - i * 2 + (i > 2 ? wag : 0)];
    ctx.fillStyle = t.line; for (let i = 0; i < 5; i++) { const [a, b] = seg(i); ctx.fillRect(a - 1, b - 1, 4, 4); }
    ctx.fillStyle = t.body; for (let i = 0; i < 5; i++) { const [a, b] = seg(i); ctx.fillRect(a, b, 2, 2); ctx.fillRect(a + (d > 0 ? 1 : -1), b, 2, 2); }
  }
  ctx.drawImage(f, x, y);
  if (c.acc) accessory(c.acc, c.x, y);
  const bob = G.t * 6 % 2 | 0;
  if (c === sel) { ctx.fillStyle = '#ff8fab'; ctx.fillRect(c.x - 3, y - 11 - bob, 6, 2); ctx.fillRect(c.x - 2, y - 9 - bob, 4, 2); ctx.fillRect(c.x - 1, y - 7 - bob, 2, 2); }
  if (!sl && c.joy > 88) px(HEART, c.x + 12, y - 4 - bob, '#ff8fab', 1);
  const need = c.hunger < 30 ? '!' : c.joy < 25 ? '…' : '';
  if (need && !sl) { ctx.fillStyle = '#fff'; ctx.fillRect(c.x + 12, y - 8, 12, 12); ctx.fillStyle = '#ffb3c6'; ctx.fillRect(c.x + 12, y + 4, 12, 1); ctx.fillStyle = OUT; ctx.font = 'bold 9px monospace'; ctx.fillText(need, c.x + 16, y + 2); }
}
function drawItem(k) {
  if (k === 'cushion') { ctx.fillStyle = 'rgba(120,90,140,.16)'; ctx.fillRect(CUSH.x - 20, CUSH.y, 40, 4); ctx.fillStyle = '#d9ccf5'; ctx.fillRect(CUSH.x - 20, CUSH.y - 8, 40, 9); ctx.fillRect(CUSH.x - 17, CUSH.y - 10, 34, 2); ctx.fillStyle = '#ece4fb'; ctx.fillRect(CUSH.x - 16, CUSH.y - 9, 30, 2); ctx.fillStyle = '#ffb3c6'; ctx.fillRect(CUSH.x - 1, CUSH.y - 11, 3, 3); }
  if (k === 'post') { ctx.fillStyle = '#d9ccf5'; ctx.fillRect(POST.x - 9, POST.y - 3, 18, 4); ctx.fillStyle = '#f0d6b8'; ctx.fillRect(POST.x - 3, POST.y - 26, 6, 24); ctx.fillStyle = '#d9b894'; for (let j = 0; j < 6; j++) ctx.fillRect(POST.x - 3, POST.y - 24 + j * 4, 6, 1); ctx.fillStyle = '#ffb3c6'; ctx.fillRect(POST.x - 6, POST.y - 29, 12, 4); }
  if (k === 'plant') { ctx.fillStyle = '#8fd6a8'; dot(20, 112, 6); dot(28, 110, 7); dot(24, 104, 6); ctx.fillStyle = '#ffb597'; ctx.fillRect(14, 118, 20, 3); ctx.fillStyle = '#ffcbb0'; ctx.fillRect(16, 121, 16, 9); ctx.fillStyle = '#ffb3cd'; dot(24, 100, 2); }
}
function lights(glow, n) {
  for (let i = 0; i < 21; i++) {
    const x = i * 16, y = 94 + Math.sin(i * .9) * 3 | 0, a = .7 + .3 * Math.sin(G.t * 2 + i);
    if (glow) { ctx.fillStyle = `rgba(255,236,170,${n * .35 * a})`; dot(x, y + 2, 6); }
    else { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x, y - 2, 16, 1); ctx.fillStyle = ['#ffb3cd', '#ffe49a', '#b9e4c9', '#cdb8ff'][i % 4]; ctx.fillRect(x - 1, y, 3, 4); }
  }
}
function render() {
  const n = night(), p = G.t % DAY / DAY, warm = Math.max(0, 1 - Math.abs(p - .02) / .1, 1 - Math.abs(p - .6) / .1);
  const sk = ctx.createLinearGradient(0, 0, 0, 110);
  sk.addColorStop(0, mix(mix('#bfe0ff', '#3b3566', n), '#ffc9d9', warm * .5)); sk.addColorStop(1, mix(mix('#fff1f5', '#8c7cc0', n), '#ffd9b8', warm * .6));
  ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
  if (n > .2) for (let i = 0; i < 24; i++) { ctx.fillStyle = `rgba(255,253,246,${n * (.4 + .6 * Math.sin(G.t * 2 + i))})`; ctx.fillRect((i * 53 + 7) % W, (i * 29) % 80, 2, 2); }
  const sx = 24 + p * 272, sy = 64 - Math.sin(p * Math.PI) * 46, moon = n > .5;
  ctx.fillStyle = moon ? 'rgba(255,255,255,.22)' : 'rgba(255,236,170,.4)'; dot(sx, sy, 15);
  ctx.fillStyle = moon ? '#f4f0ff' : '#ffeaa7'; dot(sx, sy, 9);
  if (moon) { ctx.fillStyle = '#5b5090'; dot(sx + 4, sy - 2, 7); }
  [[0, 24, 7], [110, 14, 11], [190, 38, 5]].forEach(([b, y, v]) => {
    const cx = ((b + G.t * v / 4) % (W + 80)) - 40; ctx.fillStyle = `rgba(255,255,255,${.9 - n * .55})`;
    dot(cx, y + 6, 7); dot(cx + 10, y + 2, 9); dot(cx + 22, y + 5, 8); dot(cx + 31, y + 8, 5); ctx.fillRect(cx, y + 8, 31, 6);
  });
  ctx.drawImage(bg, 0, 0);
  if (G.items.lights) lights(false, n);
  ['plant', 'cushion', 'post'].forEach((k) => G.items[k] && drawItem(k));
  ctx.fillStyle = 'rgba(120,90,140,.16)'; ctx.fillRect(BOWL.x - 12, BOWL.y + 2, 24, 3);
  ctx.fillStyle = '#ffb3c6'; dot(BOWL.x, BOWL.y - 2, 11); ctx.fillStyle = '#ffd6e2'; ctx.fillRect(BOWL.x - 11, BOWL.y - 6, 22, 3);
  ctx.fillStyle = '#ffe9f0'; ctx.fillRect(BOWL.x - 9, BOWL.y - 5, 18, 2);
  ctx.fillStyle = '#c98a6b'; for (let i = 0; i < G.bowl; i++) ctx.fillRect(BOWL.x - 8 + i * 3, BOWL.y - 8 - (i % 2), 2, 3);
  G.cats.slice().sort((a, b) => a.y - b.y).forEach(drawCat);
  if (ball) { ctx.fillStyle = 'rgba(120,90,140,.18)'; ctx.fillRect(ball.x - 4, ball.y, 8, 2); ctx.fillStyle = '#ff9fc0'; dot(ball.x, ball.y - 5, 5); ctx.fillStyle = '#ffc9dc'; ctx.fillRect(ball.x - 3, ball.y - 8, 3, 2); ctx.fillStyle = '#fff'; ctx.fillRect(ball.x - 3, ball.y - 6, 1, 4); }
  fx.forEach((f) => {
    ctx.globalAlpha = C(f.l, 0, 1);
    if (f.k === 'heart') px(HEART, f.x | 0, f.y | 0, '#ff7fa6');
    else { ctx.fillStyle = f.k === 'coin' ? '#d9a21b' : '#9f8bd6'; ctx.font = 'bold 9px monospace'; ctx.fillText(f.k === 'coin' ? '+1¢' : 'z', f.x | 0, f.y | 0); }
    ctx.globalAlpha = 1;
  });
  if (n > 0) { ctx.fillStyle = `rgba(80,64,150,${n * .26})`; ctx.fillRect(0, 0, W, H); }
  if (G.items.lights && n > .1) lights(true, n);
  for (let i = 0; i < 14; i++) {                                          // petals by day, fireflies by night
    if (n < .5) { ctx.fillStyle = `rgba(255,179,205,${.85 - n})`; ctx.fillRect(((i * 57 + G.t * 9) % (W + 10) - 5) | 0, ((i * 23 + G.t * (7 + i % 4)) % H) | 0, 2, 2); }
    else {
      const x = (i * 61) % W + Math.sin(G.t * .7 + i) * 14, y = 100 + (i * 13) % 70 + Math.cos(G.t * .9 + i) * 8, a = n * (.5 + .5 * Math.sin(G.t * 3 + i));
      ctx.fillStyle = `rgba(255,243,168,${a * .3})`; ctx.fillRect(x - 2 | 0, y - 2 | 0, 5, 5); ctx.fillStyle = `rgba(255,250,200,${a})`; ctx.fillRect(x | 0, y | 0, 2, 2);
    }
  }
}

// ---------- main loop ----------
function update(dt) {
  G.t += dt; G.cats.forEach((c) => tick(c, dt));
  if (ball) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt; const f = Math.pow(.04, dt); ball.vx *= f; ball.vy *= f;
    if (ball.x < 8 || ball.x > W - 8) ball.vx *= -1; if (ball.y < 112 || ball.y > 172) ball.vy *= -1;
    ball.x = C(ball.x, 8, W - 8); ball.y = C(ball.y, 112, 172); ball.life -= dt; if (ball.life <= 0) ball = null;
  }
  fx.forEach((f) => { f.x += f.vx * dt; f.y += f.vy * dt; f.l -= dt; }); fx = fx.filter((f) => f.l > 0);
  hudT -= dt; if (hudT < 0) { hudT = .2; hud(); }
  saveT += dt; if (saveT > 5) { saveT = 0; save(); }
}
let last = performance.now();
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); render(); requestAnimationFrame(frame); }
addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => document.hidden && save());
$('mute').textContent = G.muted ? '♪ OFF' : '♪ ON';
hud();
if (G.cats.length === 0) openPicker(true);
else { $('modal').hidden = true; if (away > 60) toast('welcome back! your cats missed you'); }
requestAnimationFrame(frame);