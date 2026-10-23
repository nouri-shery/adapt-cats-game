'use strict';

// Cat Sanctuary is drawn on a small canvas so the pixel art stays crisp.
// The game runs in plain JavaScript; it doesn't need any extra libraries.

const W = 320;
const H = 180;
const DAY = 180;
const SAVE = 'catsanct-v3';
const MAXCATS = 6;

const $ = (id) => document.getElementById(id);

const randomBetween = (min, max) => min + Math.random() * (max - min);
const pickRandom = (items) => items[Math.random() * items.length | 0];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const cv = $('game');
const ctx = cv.getContext('2d');

cv.width = W;
cv.height = H;

const OUT = '#5a4663';
const BOWL = { x: 262, y: 152 };
const CUSH = { x: 70, y: 152 };
const POST = { x: 214, y: 134 };

// Short aliases keep the movement and drawing code easy to scan.
const R = randomBetween;
const P = pickRandom;
const C = clamp;

const ITEMS = {
  cushion: { n: 'CUSHION', cost: 20, d: 'cats nap 50% faster' },
  plant: { n: 'PLANT', cost: 15, d: 'cats earn coins faster' },
  lights: { n: 'FAIRY LIGHTS', cost: 25, d: 'pretty glow at night' },
  post: { n: 'SCRATCH POST', cost: 30, d: 'cats scratch and play' }
};

const ACCS = {
  bow: { n: 'BOW', cost: 12 },
  flower: { n: 'FLOWER', cost: 12 },
  crown: { n: 'CROWN', cost: 40 }
};

// ---------- cat types and game data ----------

const TYPES = {
  purple: {
    n: 'MISO',
    kick: 'THE SLEEPY ONE',
    pitch: 220,
    spd: 0.8,
    body: '#b9a7e8',
    shade: '#9f8bd6',
    light: '#d9ccf5',
    belly: '#f1eafc',
    line: '#6f5aa8',
    mk: [
      [9, 3, 2, 2, '#ffe58a'],
      [10, 4, 1, 1, '#fff6c9']
    ],
    outs: [
      ['HMM.', 'you look like you need a nap.'],
      ['ZZZ.', 'do not disturb until 2031.'],
      ['YAWN.', 'you pressed a button. that was your workout.'],
      ['MRRP?', 'you woke me up for this?']
    ]
  },

  white: {
    n: 'MOCHI',
    kick: 'THE MYSTERIOUS ONE',
    pitch: 330,
    spd: 1,
    body: '#fffaf3',
    shade: '#efe3dc',
    light: '#ffffff',
    belly: '#ffffff',
    line: '#b3a1a3',
    mk: [
      [15, 2, 3, 2, '#ffa6c1'],
      [16, 2, 1, 1, '#ff7fa6']
    ],
    outs: [
      ['BOO!', 'you have been chosen. no refunds.'],
      ['I SEE.', 'mochi knows what you did last tuesday.'],
      ['...', 'the cat stares. you stare back. you lose.'],
      ['PSST.', 'your secret is safe. for snacks.']
    ]
  },

  orange: {
    n: 'TOAST',
    kick: 'THE CHAOTIC ONE',
    pitch: 440,
    spd: 1.1,
    body: '#ffc27a',
    shade: '#f0a257',
    light: '#ffdcae',
    belly: '#fff1d9',
    line: '#c27a46',
    mk: [
      [8, 3, 1, 2, '#f09a4d'],
      [11, 3, 1, 2, '#f09a4d']
    ],
    outs: [
      ['HEY.', 'you share one brain cell. be nice.'],
      ['ZOOM!', '3 AM energy. nobody knows why.'],
      ['OOPS.', 'toast pushed it off the table. on purpose.'],
      ['FOOD?', 'is it food? it is not food. but is it?']
    ]
  },

  blue: {
    n: 'BLOOP',
    kick: 'THE TINY MENACE',
    pitch: 520,
    spd: 1.2,
    body: '#fff6ea',
    shade: '#f1e2d2',
    light: '#ffffff',
    belly: '#ffffff',
    line: '#8aa9b8',
    mk: [
      [4, 11, 12, 2, '#7ed6e0'],
      [12, 13, 2, 2, '#5bbfcc']
    ],
    outs: [
      ['RUN.', 'this is not a drill. probably.'],
      ['BONK.', "bloop headbutted your ankle. you're welcome."],
      ['MWAHA.', 'the plan: sit on your keyboard.'],
      ['SPRINT!', 'the hallway belongs to bloop now.']
    ]
  }
};

const TOTAL = 16;

const NAMES = [
  'Pixel', 'Noodle', 'Biscuit', 'Pickle',
  'Waffle', 'Sprout', 'Mango', 'Tofu',
  'Pudding', 'Nacho', 'Beans', 'Pip'
];

const QUIRKS = {
  greedy: ['GREEDY', 'gets hungry fast'],
  play: ['PLAYFUL', 'loves yarn'],
  lazy: ['LAZY', 'naps a lot'],
  zoom: ['ZOOMIES', 'runs everywhere'],
  social: ['CUDDLY', 'loves pets']
};

// ---------- cat sprites ----------

// Each character is a tiny text map. bake() turns the map into a canvas once,
// so the game loop can draw the finished sprite instead of rebuilding it every frame.

const SIT = [
  '..oo............oo..',
  '.obbo..........obbo.',
  '.obpboooooooooobpbo.',
  'obbbbbbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbbbbbo',
  'obbbheebbbbbbheebbbo',
  'obbbeeebbbbbbeeebbbo',
  'obbbeeebbbbbbeeebbbo',
  'obpppbbbbnnbbbbpppbo',
  'obbbbbbbwmmwbbbbbbbo',
  '.obbbbbbbbbbbbbbbbo.',
  '...obbbbbbbbbbbbo...',
  '...obbbwwwwwwbbbo...',
  '...obbwwwwwwwwbbo...',
  '...obbwwwwwwwwbbo...',
  '...obbbwwwwwwbbbo...',
  '..obbbbbbbbbbbbbbo..',
  '....obbo....obbo....',
  '....oooo....oooo....'
];

const LOAF = [
  '..oo............oo..',
  '.obbo..........obbo.',
  '.obpboooooooooobpbo.',
  'obbbbbbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbbbbbo',
  'obbbeeebbbbbbeeebbbo',
  'obpppbbbbnnbbbbpppbo',
  'obbbbbbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbbbbbo',
  '.obbbbbbbbbbbbbbbbo.',
  '..oooooooooooooooo..'
];

const HEART = [
  '.x.x.',
  'xxxxx',
  'xxxxx',
  '.xxx.',
  '..x..'
];

function bake(rows, type, blink) {
  const width = rows[0].length;
  const canvas = document.createElement('canvas');

  canvas.width = width * 2;
  canvas.height = rows.length * 2;

  const g = canvas.getContext('2d');

  const colors = {
    o: type.line,
    b: type.body,
    w: type.belly,
    e: '#4a3a4d',
    h: '#fff',
    p: '#ffb3c6',
    n: '#ff8fab',
    m: '#c98a98'
  };

  function put(x, y, width, height, color) {
    g.fillStyle = color;
    g.fillRect(x * 2, y * 2, width * 2, height * 2);
  }

  rows.forEach((row, y) => {
    [...row].forEach((character, x) => {
      if (character === '.') return;

      let key = character;

      if (blink && (character === 'e' || character === 'h')) {
        key = y === 6 ? 'e' : 'b';
      }

      let color = colors[key];

      if (key === 'b') {
        if (y >= rows.length - 4 || (x >= width * 0.7 && y >= 3)) {
          color = type.shade;
        } else if (y <= 3 && x >= 5 && x <= 9) {
          color = type.light;
        }
      }

      put(x, y, 1, 1, color);
    });
  });

  (type.mk || []).forEach((mark) => {
    put(mark[0], mark[1], mark[2], mark[3], mark[4]);
  });

  return canvas;
}

const S = {};

for (const key in TYPES) {
  const type = TYPES[key];

  S[key] = {
    sit: bake(SIT, type),
    blink: bake(SIT, type, true),
    loaf: bake(LOAF, type)
  };
}

// ---------- game state and saving ----------

// The save includes the cats, coins, discoveries, decorations, and goals.
// When the player returns, needs change a little to make the sanctuary feel alive.

function mkCat(type, name, quirk) {
  return {
    id: Math.random() * 1e6 | 0,
    type,
    name: name || P(NAMES),
    q: quirk || P(Object.keys(QUIRKS)),
    x: R(40, 280),
    y: R(115, 165),
    tx: 0,
    ty: 0,
    state: 'sit',
    st: R(1, 3),
    dir: 1,
    hunger: 85,
    joy: 70,
    energy: 90,
    bt: 0,
    blink: 0,
    nb: R(1, 4),
    ct: 0,
    bat: 0,
    zt: 0,
    bond: 0,
    acc: ''
  };
}

let G = {
  coins: 10,
  cats: [],
  found: [],
  t: 0,
  bowl: 0,
  muted: false,
  saved: Date.now(),
  pets: 0,
  done: [],
  items: {},
  accs: {}
};

let away = 0;

try {
  const savedGame = JSON.parse(localStorage.getItem(SAVE));

  if (savedGame && Array.isArray(savedGame.cats)) {
    G = Object.assign(G, savedGame);

    // Offline progress is capped at six hours.
    away = Math.min((Date.now() - G.saved) / 1000, 6 * 3600);

    G.cats.forEach((cat) => {
      cat.hunger = Math.max(10, cat.hunger - away * 0.04);
      cat.joy = Math.max(15, cat.joy - away * 0.03);
      cat.energy = 100;
      cat.state = 'sit';
      cat.st = 1;

      Object.assign(cat, {
        bt: 0,
        blink: 0,
        nb: 2,
        ct: 0,
        bat: 0,
        zt: 0
      });
    });
  }
} catch (error) {
  // The game can start normally if there is no saved data.
}

const save = () => {
  G.saved = Date.now();

  try {
    localStorage.setItem(SAVE, JSON.stringify(G));
  } catch (error) {
    // Saving may be unavailable in private browsing.
  }
};

let sel = null;
let ball = null;
let mode = null;
let fx = [];
let clock = 0;
let hudT = 0;
let saveT = 0;

// ---------- simple chiptune sound effects ----------

// These tones are generated in the browser, so no audio files are needed.

let ac;

function tone(frequency, start, duration, type = 'square', to = null, volume = 0.06) {
  if (G.muted) return;

  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();

    if (ac.state === 'suspended') {
      ac.resume();
    }

    const time = ac.currentTime + start;
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);

    if (to) {
      oscillator.frequency.exponentialRampToValueAtTime(to, time + duration);
    }

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    oscillator.connect(gain).connect(ac.destination);

    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  } catch (error) {
    // Sound is optional; the game should still work without it.
  }
}

const sfx = {
  meow: (pitch) => {
    tone(pitch, 0, 0.26, 'sawtooth', pitch * 1.8, 0.05);
    tone(pitch * 3, 0.28, 0.08);
  },

  purr: () => {
    for (let i = 0; i < 6; i++) {
      tone(70 + (i % 2) * 12, i * 0.06, 0.05, 'sawtooth', null, 0.04);
    }
  },

  coin: () => {
    tone(880, 0, 0.06);
    tone(1320, 0.06, 0.12);
  },

  munch: () => {
    tone(180, 0, 0.05, 'square', 90);
    tone(180, 0.1, 0.05, 'square', 90);
  },

  bat: () => tone(400, 0, 0.07, 'triangle', 700),
  pop: () => tone(300, 0, 0.1, 'square', 600),
  deny: () => tone(150, 0, 0.15, 'square', 100),

  fanfare: () => {
    tone(660, 0, 0.08);
    tone(880, 0.08, 0.08);
    tone(1320, 0.16, 0.18);
  }
};

// ---------- background ----------

// The scenery is drawn once to an off-screen canvas. Only the sky, lighting,
// cats, and small moving details need to be redrawn during the game.

const hx = (hex) => hex[0] === '#'
  ? [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16))
  : hex.match(/\d+/g).map(Number);

const mix = (a, b, amount) =>
  'rgb(' + hx(a).map((value, i) => (value + (hx(b)[i] - value) * amount) | 0) + ')';

const dot = (x, y, radius) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 7);
  ctx.fill();
};

const bg = document.createElement('canvas');

bg.width = W;
bg.height = H;

(function () {
  const g = bg.getContext('2d');

  const blob = (x, y, radius, color) => {
    g.fillStyle = color;
    g.beginPath();
    g.arc(x, y, radius, 0, 7);
    g.fill();
  };

  const hill = (base, amplitude, color, shift) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, H);

    for (let x = 0; x <= W; x += 8) {
      const y = base - amplitude * (
        0.5 + 0.5 * Math.sin(x * 0.05 + shift) *
        Math.cos(x * 0.021 + shift * 2)
      );

      g.lineTo(x, y | 0);
    }

    g.lineTo(W, H);
    g.fill();
  };

  hill(104, 30, '#d3f0e1', 1);
  hill(110, 20, '#c3e9d4', 4);

  // Round blossom trees.
  [[34, 100], [292, 98], [262, 104]].forEach(([x, y]) => {
    g.fillStyle = '#e2c4b0';
    g.fillRect(x - 2, y - 2, 4, 10);

    blob(x, y - 8, 12, '#b9e4c9');
    blob(x - 8, y - 2, 8, '#a9dbbb');
    blob(x + 8, y - 3, 9, '#b9e4c9');

    blob(x - 3, y - 12, 3, '#ffc4d6');
    blob(x + 6, y - 9, 2.5, '#ffc4d6');
    blob(x - 9, y - 4, 2, '#ffc4d6');
  });

  const grass = g.createLinearGradient(0, 108, 0, H);

  grass.addColorStop(0, '#c9f0d8');
  grass.addColorStop(1, '#a9dfc0');

  g.fillStyle = grass;
  g.fillRect(0, 108, W, H);

  for (let i = 0; i < 44; i++) {
    const x = (i * 67 + 13) % 312 + 4;
    const y = 116 + (i * 41) % 58;

    if (i % 3) {
      g.fillStyle = '#98d3b0';
      g.fillRect(x, y, 1, 3);
      g.fillRect(x + 2, y + 1, 1, 2);
    } else {
      blob(x, y, 2, ['#ffb3cd', '#cdb8ff', '#ffe49a', '#ffc7a8'][i % 4]);

      g.fillStyle = '#fff';
      g.fillRect(x, y, 1, 1);
    }
  }
})();

const night = () => {
  const p = G.t % DAY / DAY;

  if (p < 0.55) return 0;
  if (p < 0.7) return (p - 0.55) / 0.15;
  if (p < 0.9) return 1;

  return 1 - (p - 0.9) / 0.1;
};

// ---------- cat behaviour ----------

// Each cat has a small state (walking, eating, sleeping, etc.).
// decide() chooses what to do next, and tick() updates that behaviour.

function go(cat, x, y, state) {
  cat.tx = x;
  cat.ty = y;
  cat.state = state;
  cat.st = 15;
}

function decide(cat) {
  if (cat.hunger < 45 && G.bowl > 0) {
    return go(
      cat,
      BOWL.x + R(-12, 8),
      BOWL.y + R(-3, 4),
      'goeat'
    );
  }

  if (ball) {
    cat.state = 'chase';
    cat.st = 99;
    return;
  }

  if (cat.energy < 40 || (night() > 0.6 && Math.random() < 0.5)) {
    if (G.items.cushion) {
      return go(
        cat,
        CUSH.x + R(-8, 8),
        CUSH.y + R(-2, 2),
        'gosleep'
      );
    }

    cat.state = 'sleep';
    cat.st = R(10, 20);
    return;
  }

  if (G.items.post && Math.random() < 0.25) {
    return go(
      cat,
      POST.x + R(-12, 12),
      POST.y + R(2, 6),
      'goscratch'
    );
  }

  if (Math.random() < 0.6) {
    go(cat, R(24, 296), R(114, 168), 'walk');
  } else {
    cat.state = 'sit';
    cat.st = R(1.5, 4);
  }
}

function burst(x, y, kind, count = 1) {
  for (let i = 0; i < count; i++) {
    fx.push({
      x: x + R(-6, 6),
      y,
      vx: R(-8, 8),
      vy: R(-26, -14),
      l: 1.2,
      k: kind
    });
  }
}

function tick(cat, dt) {
  const type = TYPES[cat.type];
  const state = cat.state;
  const sleeping = state === 'sleep';
  const n = night();

  cat.bt += dt;
  cat.nb -= dt;
  cat.blink -= dt;
  cat.bat -= dt;

  if (cat.nb < 0) {
    cat.blink = 0.15;
    cat.nb = R(2, 5);
  }

  // Needs slowly change while the cat is active.
  cat.hunger = C(
    cat.hunger -
    dt * 0.12 *
    (cat.q === 'greedy' ? 1.6 : 1) *
    (sleeping ? 0.4 : 1),
    0,
    100
  );

  cat.joy = C(
    cat.joy -
    dt * (
      0.07 +
      (cat.hunger < 15 ? 0.1 : 0) +
      (cat.q === 'play' ? 0.03 : 0)
    ),
    0,
    100
  );

  cat.energy = C(
    cat.energy +
    dt * (
      sleeping
        ? 1.4 * (G.items.cushion ? 1.5 : 1)
        : -(0.05 + n * 0.04) * (cat.q === 'lazy' ? 1.7 : 1)
    ),
    0,
    100
  );

  cat.st -= dt;

  if (state === 'scratch') {
    cat.joy = C(cat.joy + dt * 8, 0, 100);
  }

  cat.ct += dt;

  if (cat.ct > (G.items.plant ? 23 : 30) && cat.joy > 55) {
    cat.ct = 0;
    G.coins++;

    burst(cat.x, cat.y - 30, 'coin');
    sfx.coin();
  }

  if (sleeping) {
    cat.zt -= dt;

    if (cat.zt < 0) {
      cat.zt = 1.4;
      burst(cat.x + 8, cat.y - 12, 'z');
    }

    if (cat.st <= 0 || cat.energy >= 98) {
      decide(cat);
    }
  } else if (/^(walk|goeat|chase|gosleep|goscratch)$/.test(state)) {
    let tx = cat.tx;
    let ty = cat.ty;

    if (state === 'chase') {
      if (!ball) {
        cat.state = 'sit';
        cat.st = 1;
        return;
      }

      tx = ball.x;
      ty = ball.y;
    }

    const dx = tx - cat.x;
    const dy = ty - cat.y;
    const distance = Math.hypot(dx, dy);

    const speed =
      34 *
      type.spd *
      (cat.q === 'zoom' ? 1.7 : 1) *
      (state === 'chase' ? 1.6 : 1);

    if (distance < (state === 'chase' ? 12 : 3)) {
      if (state === 'goeat') {
        if (G.bowl > 0) {
          cat.state = 'eat';
          cat.st = 2.5;
        } else {
          cat.state = 'sit';
          cat.st = 1;
        }
      } else if (state === 'chase') {
        if (cat.bat <= 0) {
          cat.bat = 0.6;

          const angle =
            Math.atan2(ball.y - cat.y, ball.x - cat.x) +
            R(-0.8, 0.8);

          ball.vx = Math.cos(angle) * R(70, 120);
          ball.vy = Math.sin(angle) * R(40, 70);

          cat.joy = C(
            cat.joy + (cat.q === 'play' ? 14 : 8),
            0,
            100
          );

          burst(cat.x, cat.y - 28, 'heart');
          sfx.bat();
        }
      } else if (state === 'gosleep') {
        cat.state = 'sleep';
        cat.st = R(10, 20);
      } else if (state === 'goscratch') {
        cat.state = 'scratch';
        cat.st = 2.5;
      } else {
        cat.state = 'sit';
        cat.st = R(1, 4);
      }
    } else {
      cat.x += dx / distance * speed * dt;
      cat.y += dy / distance * speed * dt;

      if (Math.abs(dx) > 1) {
        cat.dir = Math.sign(dx);
      }
    }

    if (cat.st <= 0 && state !== 'chase') {
      cat.state = 'sit';
      cat.st = 1;
    }
  } else if (state === 'eat') {
    if (cat.st <= 0) {
      G.bowl = Math.max(0, G.bowl - 1);

      cat.hunger = C(cat.hunger + 35, 0, 100);
      cat.joy = C(cat.joy + 4, 0, 100);

      burst(cat.x, cat.y - 30, 'heart');
      sfx.munch();

      cat.state = 'sit';
      cat.st = 1;
    }
  } else if (cat.st <= 0) {
    decide(cat);
  }
}

// ---------- player actions ----------

let toastT;

function toast(message) {
  const element = $('toast');

  element.textContent = message;
  element.classList.add('show');

  clearTimeout(toastT);

  toastT = setTimeout(() => {
    element.classList.remove('show');
  }, 2400);
}

function feed() {
  if (G.coins < 3) {
    sfx.deny();
    return toast('not enough coins (pet your cats to earn some)');
  }

  if (G.bowl >= 6) {
    return toast('the bowl is already full');
  }

  G.coins -= 3;
  G.bowl = Math.min(6, G.bowl + 3);

  sfx.pop();
  toast('fresh food in the bowl');
}

function setMode(newMode) {
  mode = mode === newMode ? null : newMode;

  $('yarn').classList.toggle('on', mode === 'yarn');

  document.querySelector('.stage')
    .classList.toggle('yarn', mode === 'yarn');

  if (mode === 'yarn') {
    toast('click the grass to throw the yarn');
  }
}

const adoptCost = () => 15 * G.cats.length;

function pet(cat) {
  sel = cat;
  G.pets++;

  cat.bond = C((cat.bond || 0) + 4, 0, 100);
  cat.state = 'pet';
  cat.st = 1.3;
  cat.bt = 0;
  cat.dir = cat.dir || 1;

  const gain = cat.q === 'social' ? 20 : 12;

  if (cat.joy < 95) {
    G.coins++;
    sfx.coin();
  }

  cat.joy = C(cat.joy + gain, 0, 100);

  burst(cat.x, cat.y - 30, 'heart', 3);
  sfx.purr();
}

cv.addEventListener('pointerdown', (event) => {
  const rect = cv.getBoundingClientRect();

  const x = (event.clientX - rect.left) * W / rect.width;
  const y = (event.clientY - rect.top) * H / rect.height;

  if (mode === 'yarn' && y > 108) {
    ball = { x, y, vx: 0, vy: 0, life: 14 };

    setMode('yarn');
    sfx.pop();
    return;
  }

  const hit = G.cats
    .filter((cat) =>
      Math.abs(x - cat.x) < 20 &&
      y > cat.y - 40 &&
      y < cat.y + 4
    )
    .sort((a, b) => b.y - a.y)[0];

  if (hit) {
    if (hit.state === 'sleep') {
      hit.state = 'sit';
      hit.st = 1;
    }

    pet(hit);
  } else {
    sel = null;
  }
});

// ---------- adopting a cat ----------

// The player picks a type, then gets a random name and personality for that cat.

let firstRun = false;
let adopting = false;

function openPicker(first) {
  firstRun = first;

  $('modal').hidden = false;
  $('pickView').hidden = false;
  $('revealView').hidden = true;
  $('closeModal').hidden = first;

  $('pickSub').textContent = first
    ? "Choose wisely. Or don't. They're cats."
    : `A new friend costs ${adoptCost()}¢. Pick a box.`;

  const box = $('picks');
  box.innerHTML = '';

  Object.keys(TYPES).forEach((key, index) => {
    const button = document.createElement('button');
    const canvas = document.createElement('canvas');

    canvas.width = 28;
    canvas.height = 28;

    canvas.getContext('2d').drawImage(S[key].sit, 0, 0);

    button.type = 'button';
    button.append(canvas, `${index + 1} ${TYPES[key].n}`);

    button.onclick = () => adopt(key);

    box.append(button);
  });

  box.firstChild.focus();
}

function adopt(type) {
  if (!firstRun) {
    if (G.coins < adoptCost()) {
      sfx.deny();
      return toast('not enough coins');
    }

    G.coins -= adoptCost();
  }

  const catType = TYPES[type];
  const index = Math.random() * 4 | 0;
  const key = type + ':' + index;
  const isNew = !G.found.includes(key);

  if (isNew) {
    G.found.push(key);
  }

  const cat = mkCat(type);

  G.cats.push(cat);
  sel = cat;

  cat.y = 140;
  cat.x = R(120, 200);

  const revealCanvas = $('rCat').getContext('2d');

  revealCanvas.clearRect(0, 0, 28, 28);
  revealCanvas.drawImage(S[type].sit, 0, 0);

  $('rKick').textContent = catType.kick + (isNew ? ' · NEW!' : '');
  $('rWord').textContent = catType.outs[index][0];
  $('rCap').textContent = catType.outs[index][1];

  $('rTrait').textContent =
    `${cat.name.toUpperCase()} IS ${QUIRKS[cat.q][0]}: ${QUIRKS[cat.q][1]}`;

  $('pickView').hidden = true;
  $('revealView').hidden = false;

  const reveal = $('rCat');

  reveal.style.animation = 'none';
  void reveal.offsetWidth;
  reveal.style.animation = '';

  sfx.meow(catType.pitch);

  if (isNew) {
    sfx.fanfare();
  }

  save();
  $('rOk').focus();
}

const closeModal = () => {
  $('modal').hidden = true;
  save();
};

// ---------- buttons and keyboard controls ----------

$('feed').onclick = feed;
$('yarn').onclick = () => setMode('yarn');

$('adopt').onclick = () => {
  if (G.cats.length >= MAXCATS) {
    return toast('the sanctuary is full (6 cats max)');
  }

  openPicker(false);
};

$('closeModal').onclick = closeModal;
$('rOk').onclick = closeModal;

$('mute').onclick = () => {
  G.muted = !G.muted;
  $('mute').textContent = G.muted ? '♪ OFF' : '♪ ON';

  if (!G.muted) {
    sfx.pop();
  }
};

$('pname').onclick = () => {
  if (!sel) return;

  const name = prompt('Rename your cat:', sel.name);

  if (name && name.trim()) {
    sel.name = name.trim().slice(0, 10);
  }
};

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();

  if (!$('sheet').hidden) {
    if (key === 'escape') {
      $('sheet').hidden = true;
    }

    return;
  }

  if (!$('modal').hidden) {
    if (/^[1-4]$/.test(key) && !$('pickView').hidden) {
      adopt(Object.keys(TYPES)[key - 1]);
    } else if (key === 'escape' && !firstRun) {
      closeModal();
    }

    return;
  }

  if (key === 'f') {
    feed();
  } else if (key === 'y') {
    setMode('yarn');
  } else if (key === 'a') {
    $('adopt').click();
  } else if (key === 'm') {
    $('mute').click();
  } else if (key === 's') {
    openShop();
  } else if (key === 'g') {
    openGoals();
  } else if (key === 'escape') {
    sel = null;

    if (mode) {
      setMode(mode);
    }
  }
});

// ---------- goals, shop, and accessories ----------

const GOALS = [
  {
    id: 'pet10',
    t: 'Pet cats 10 times',
    n: 10,
    v: () => G.pets,
    r: 10
  },
  {
    id: 'cats3',
    t: 'Have 3 cats',
    n: 3,
    v: () => G.cats.length,
    r: 15
  },
  {
    id: 'kinds',
    t: 'Own all 4 kinds of cat',
    n: 4,
    v: () => new Set(G.cats.map((cat) => cat.type)).size,
    r: 25
  },
  {
    id: 'found8',
    t: 'Find 8 surprises',
    n: 8,
    v: () => G.found.length,
    r: 25
  },
  {
    id: 'decor',
    t: 'Buy 3 decorations',
    n: 3,
    v: () => Object.keys(G.items).length,
    r: 20
  },
  {
    id: 'day5',
    t: 'Live to day 5',
    n: 5,
    v: () => Math.floor(G.t / DAY) + 1,
    r: 30
  },
  {
    id: 'bond',
    t: "Max out a cat's bond",
    n: 1,
    v: () => G.cats.some((cat) => (cat.bond || 0) >= 100) ? 1 : 0,
    r: 40
  }
];

function goals() {
  GOALS.forEach((goal) => {
    if (!G.done.includes(goal.id) && goal.v() >= goal.n) {
      G.done.push(goal.id);
      G.coins += goal.r;

      toast(`goal done: ${goal.t}  +${goal.r}¢`);
      sfx.fanfare();
    }
  });
}

const sheet = (title, html) => {
  $('sheetTitle').textContent = title;
  $('sheetBody').innerHTML = html;
  $('sheet').hidden = false;
};

function openShop() {
  const row = (kind, key, item) => {
    const owned = !!G[kind][key];

    return `
      <div class="row">
        <b>${item.n}</b>
        <span>${item.d || 'dress-up for one cat'}</span>
        <button
          data-b="${kind}:${key}"
          ${owned || G.coins < item.cost ? 'disabled' : ''}
        >
          ${owned ? 'OWNED' : item.cost + '¢'}
        </button>
      </div>
    `;
  };

  const items = Object.entries(ITEMS)
    .map(([key, item]) => row('items', key, item))
    .join('');

  const accessories = Object.entries(ACCS)
    .map(([key, item]) => row('accs', key, item))
    .join('');

  sheet(`SHOP · ${G.coins}¢`, items + accessories);
}

function openGoals() {
  const rows = GOALS.map((goal) => {
    const value = Math.min(goal.v(), goal.n);
    const done = G.done.includes(goal.id);

    return `
      <div class="row goal ${done ? 'done' : ''}">
        <b>${done ? '✓ ' : ''}${goal.t}</b>
        <span>${value}/${goal.n} · +${goal.r}¢</span>
        <i style="--w:${value / goal.n * 100}%"></i>
      </div>
    `;
  }).join('');

  sheet('GOALS', rows);
}

$('sheetBody').onclick = (event) => {
  const button = event.target.closest('button[data-b]');

  if (!button || button.disabled) return;

  const [kind, key] = button.dataset.b.split(':');
  const item = (kind === 'items' ? ITEMS : ACCS)[key];

  if (G.coins < item.cost) {
    return sfx.deny();
  }

  G.coins -= item.cost;
  G[kind][key] = 1;

  sfx.fanfare();
  toast(item.n + ' bought!');

  save();
  openShop();
};

$('sheetClose').onclick = () => {
  $('sheet').hidden = true;
};

$('shop').onclick = openShop;
$('goals').onclick = openGoals;

$('pdress').onclick = () => {
  if (!sel) return;

  const ownedAccessories = [''].concat(
    Object.keys(ACCS).filter((key) => G.accs[key])
  );

  if (ownedAccessories.length === 1) {
    return toast('buy accessories in the shop (S)');
  }

  const currentIndex = ownedAccessories.indexOf(sel.acc || '');

  sel.acc = ownedAccessories[
    (currentIndex + 1) % ownedAccessories.length
  ];

  sfx.pop();
  burst(sel.x, sel.y - 36, 'heart', 2);
};

const bar = (id, value, color) => {
  const element = $(id);

  element.style.width = value + '%';
  element.style.background = value < 30 ? '#ff9aae' : color;
};

function hud() {
  const p = G.t % DAY / DAY;
  const n = night();

  $('coins').textContent = '¢ ' + G.coins;

  $('clock').textContent =
    `DAY ${Math.floor(G.t / DAY) + 1} · ` +
    `${n > 0.6 ? 'NIGHT' : p < 0.15 ? 'MORNING' : p < 0.55 ? 'DAY' : 'EVENING'}`;

  $('found').textContent = `✦ ${G.found.length}/${TOTAL}`;

  $('adopt').disabled = G.cats.length >= MAXCATS;
  $('adoptCost').textContent = `-${adoptCost()}¢ · A`;

  goals();

  $('panel').hidden = !sel;

  if (sel) {
    const bond = (sel.bond || 0) / 20 | 0;

    $('pname').textContent = sel.name.toUpperCase();

    $('pinfo').textContent =
      `${TYPES[sel.type].n} · ${QUIRKS[sel.q][0]} · ` +
      `${'♥'.repeat(bond) + '♡'.repeat(5 - bond)}`;

    bar('mH', sel.hunger | 0, '#ffc27a');
    bar('mJ', sel.joy | 0, '#ff9fc0');
    bar('mE', sel.energy | 0, '#8fdcc0');

    $('pdress').textContent =
      '✿ ' + (sel.acc ? ACCS[sel.acc].n : 'STYLE');
  }
}

// ---------- drawing the scene ----------

function px(rows, x, y, color, size = 2) {
  ctx.fillStyle = color;

  rows.forEach((row, j) => {
    [...row].forEach((character, i) => {
      if (character === 'x') {
        ctx.fillRect(x + i * size, y + j * size, size, size);
      }
    });
  });
}

function accessory(accessoryName, centerX, y) {
  if (accessoryName === 'bow') {
    ctx.fillStyle = '#ff8fab';

    ctx.fillRect(centerX + 7, y + 2, 4, 5);
    ctx.fillRect(centerX + 13, y + 2, 4, 5);

    ctx.fillStyle = '#ff5f8f';
    ctx.fillRect(centerX + 11, y + 3, 2, 3);
  }

  if (accessoryName === 'crown') {
    ctx.fillStyle = '#ffd96b';

    ctx.fillRect(centerX - 7, y - 1, 14, 4);
    ctx.fillRect(centerX - 7, y - 5, 3, 4);
    ctx.fillRect(centerX - 1, y - 7, 3, 6);
    ctx.fillRect(centerX + 4, y - 5, 3, 4);

    ctx.fillStyle = '#ff8fab';
    ctx.fillRect(centerX - 1, y, 3, 2);
  }

  if (accessoryName === 'flower') {
    ctx.fillStyle = '#ffb3cd';

    [[-14, 1], [-10, 1], [-12, -1], [-12, 3]].forEach(([dx, dy]) => {
      ctx.fillRect(centerX + dx, y + 2 + dy, 3, 3);
    });

    ctx.fillStyle = '#ffe49a';
    ctx.fillRect(centerX - 12, y + 3, 3, 3);
  }
}

function drawCat(cat) {
  const type = TYPES[cat.type];
  const sprites = S[cat.type];
  const sleeping = cat.state === 'sleep';

  const sprite = sleeping
    ? sprites.loaf
    : cat.blink > 0
      ? sprites.blink
      : sprites.sit;

  const width = sprite.width;
  const height = sprite.height;

  const moving = /^(walk|goeat|chase|gosleep|goscratch)$/.test(cat.state);

  const bob = moving
    ? -Math.abs(Math.sin(cat.bt * 9)) * 3
    : cat.state === 'pet'
      ? -Math.abs(Math.sin(cat.bt * 14)) * 3
      : cat.state === 'eat'
        ? Math.sin(cat.bt * 12) * 1.2
        : cat.state === 'scratch'
          ? Math.sin(cat.bt * 16) * 1.5
          : sleeping
            ? Math.sin(cat.bt * 2) * 0.8
            : Math.sin(cat.bt * 2 + cat.id) * 0.6;

  const x = cat.x - width / 2 | 0;
  const y = cat.y - height + bob | 0;

  // Small shadow under the cat.
  ctx.fillStyle = 'rgba(120,90,140,.17)';
  ctx.fillRect(x + 6, cat.y - 3, width - 12, 3);
  ctx.fillRect(x + 9, cat.y - 4, width - 18, 1);

  if (!sleeping) {
    // The tail moves while the cat is awake.
    const direction = cat.dir;
    const tailX = direction > 0 ? x + width - 6 : x + 4;
    const wag = Math.sin(G.t * 5 + cat.id) * 3 | 0;

    const tailSegment = (i) => [
      tailX + direction * i * 2,
      y + height - 9 - i * 2 + (i > 2 ? wag : 0)
    ];

    ctx.fillStyle = type.line;

    for (let i = 0; i < 5; i++) {
      const [tailPartX, tailPartY] = tailSegment(i);

      ctx.fillRect(tailPartX - 1, tailPartY - 1, 4, 4);
    }

    ctx.fillStyle = type.body;

    for (let i = 0; i < 5; i++) {
      const [tailPartX, tailPartY] = tailSegment(i);

      ctx.fillRect(tailPartX, tailPartY, 2, 2);
      ctx.fillRect(
        tailPartX + (direction > 0 ? 1 : -1),
        tailPartY,
        2,
        2
      );
    }
  }

  ctx.drawImage(sprite, x, y);

  if (cat.acc) {
    accessory(cat.acc, cat.x, y);
  }

  const selectedBob = G.t * 6 % 2 | 0;

  if (cat === sel) {
    ctx.fillStyle = '#ff8fab';

    ctx.fillRect(cat.x - 3, y - 11 - selectedBob, 6, 2);
    ctx.fillRect(cat.x - 2, y - 9 - selectedBob, 4, 2);
    ctx.fillRect(cat.x - 1, y - 7 - selectedBob, 2, 2);
  }

  if (!sleeping && cat.joy > 88) {
    px(HEART, cat.x + 12, y - 4 - selectedBob, '#ff8fab', 1);
  }

  const need = cat.hunger < 30 ? '!' : cat.joy < 25 ? '…' : '';

  if (need && !sleeping) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(cat.x + 12, y - 8, 12, 12);

    ctx.fillStyle = '#ffb3c6';
    ctx.fillRect(cat.x + 12, y + 4, 12, 1);

    ctx.fillStyle = OUT;
    ctx.font = 'bold 9px monospace';
    ctx.fillText(need, cat.x + 16, y + 2);
  }
}

function drawItem(key) {
  if (key === 'cushion') {
    ctx.fillStyle = 'rgba(120,90,140,.16)';
    ctx.fillRect(CUSH.x - 20, CUSH.y, 40, 4);

    ctx.fillStyle = '#d9ccf5';
    ctx.fillRect(CUSH.x - 20, CUSH.y - 8, 40, 9);
    ctx.fillRect(CUSH.x - 17, CUSH.y - 10, 34, 2);

    ctx.fillStyle = '#ece4fb';
    ctx.fillRect(CUSH.x - 16, CUSH.y - 9, 30, 2);

    ctx.fillStyle = '#ffb3c6';
    ctx.fillRect(CUSH.x - 1, CUSH.y - 11, 3, 3);
  }

  if (key === 'post') {
    ctx.fillStyle = '#d9ccf5';
    ctx.fillRect(POST.x - 9, POST.y - 3, 18, 4);

    ctx.fillStyle = '#f0d6b8';
    ctx.fillRect(POST.x - 3, POST.y - 26, 6, 24);

    ctx.fillStyle = '#d9b894';

    for (let j = 0; j < 6; j++) {
      ctx.fillRect(POST.x - 3, POST.y - 24 + j * 4, 6, 1);
    }

    ctx.fillStyle = '#ffb3c6';
    ctx.fillRect(POST.x - 6, POST.y - 29, 12, 4);
  }

  if (key === 'plant') {
    ctx.fillStyle = '#8fd6a8';

    dot(20, 112, 6);
    dot(28, 110, 7);
    dot(24, 104, 6);

    ctx.fillStyle = '#ffb597';
    ctx.fillRect(14, 118, 20, 3);

    ctx.fillStyle = '#ffcbb0';
    ctx.fillRect(16, 121, 16, 9);

    ctx.fillStyle = '#ffb3cd';
    dot(24, 100, 2);
  }
}

function lights(glow, n) {
  for (let i = 0; i < 21; i++) {
    const x = i * 16;
    const y = 94 + Math.sin(i * 0.9) * 3 | 0;
    const amount = 0.7 + 0.3 * Math.sin(G.t * 2 + i);

    if (glow) {
      ctx.fillStyle = `rgba(255,236,170,${n * 0.35 * amount})`;
      dot(x, y + 2, 6);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.fillRect(x, y - 2, 16, 1);

      ctx.fillStyle = ['#ffb3cd', '#ffe49a', '#b9e4c9', '#cdb8ff'][i % 4];
      ctx.fillRect(x - 1, y, 3, 4);
    }
  }
}

function render() {
  const n = night();
  const p = G.t % DAY / DAY;

  const warm = Math.max(
    0,
    1 - Math.abs(p - 0.02) / 0.1,
    1 - Math.abs(p - 0.6) / 0.1
  );

  const sky = ctx.createLinearGradient(0, 0, 0, 110);

  sky.addColorStop(
    0,
    mix(mix('#bfe0ff', '#3b3566', n), '#ffc9d9', warm * 0.5)
  );

  sky.addColorStop(
    1,
    mix(mix('#fff1f5', '#8c7cc0', n), '#ffd9b8', warm * 0.6)
  );

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars appear when it gets dark.
  if (n > 0.2) {
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = `rgba(255,253,246,${n * (0.4 + 0.6 * Math.sin(G.t * 2 + i))})`;
      ctx.fillRect((i * 53 + 7) % W, (i * 29) % 80, 2, 2);
    }
  }

  const sunX = 24 + p * 272;
  const sunY = 64 - Math.sin(p * Math.PI) * 46;
  const moon = n > 0.5;

  ctx.fillStyle = moon
    ? 'rgba(255,255,255,.22)'
    : 'rgba(255,236,170,.4)';

  dot(sunX, sunY, 15);

  ctx.fillStyle = moon ? '#f4f0ff' : '#ffeaa7';
  dot(sunX, sunY, 9);

  if (moon) {
    ctx.fillStyle = '#5b5090';
    dot(sunX + 4, sunY - 2, 7);
  }

  // Slowly moving clouds.
  [[0, 24, 7], [110, 14, 11], [190, 38, 5]].forEach(([base, y, speed]) => {
    const cloudX = ((base + G.t * speed / 4) % (W + 80)) - 40;

    ctx.fillStyle = `rgba(255,255,255,${0.9 - n * 0.55})`;

    dot(cloudX, y + 6, 7);
    dot(cloudX + 10, y + 2, 9);
    dot(cloudX + 22, y + 5, 8);
    dot(cloudX + 31, y + 8, 5);

    ctx.fillRect(cloudX, y + 8, 31, 6);
  });

  ctx.drawImage(bg, 0, 0);

  if (G.items.lights) {
    lights(false, n);
  }

  ['plant', 'cushion', 'post'].forEach((key) => {
    if (G.items[key]) {
      drawItem(key);
    }
  });

  // Food bowl.
  ctx.fillStyle = 'rgba(120,90,140,.16)';
  ctx.fillRect(BOWL.x - 12, BOWL.y + 2, 24, 3);

  ctx.fillStyle = '#ffb3c6';
  dot(BOWL.x, BOWL.y - 2, 11);

  ctx.fillStyle = '#ffd6e2';
  ctx.fillRect(BOWL.x - 11, BOWL.y - 6, 22, 3);

  ctx.fillStyle = '#ffe9f0';
  ctx.fillRect(BOWL.x - 9, BOWL.y - 5, 18, 2);

  ctx.fillStyle = '#c98a6b';

  for (let i = 0; i < G.bowl; i++) {
    ctx.fillRect(BOWL.x - 8 + i * 3, BOWL.y - 8 - (i % 2), 2, 3);
  }

  // Draw cats in order so the ones farther back appear behind the others.
  G.cats
    .slice()
    .sort((a, b) => a.y - b.y)
    .forEach(drawCat);

  // Yarn ball.
  if (ball) {
    ctx.fillStyle = 'rgba(120,90,140,.18)';
    ctx.fillRect(ball.x - 4, ball.y, 8, 2);

    ctx.fillStyle = '#ff9fc0';
    dot(ball.x, ball.y - 5, 5);

    ctx.fillStyle = '#ffc9dc';
    ctx.fillRect(ball.x - 3, ball.y - 8, 3, 2);

    ctx.fillStyle = '#fff';
    ctx.fillRect(ball.x - 3, ball.y - 6, 1, 4);
  }

  // Hearts, coins, and sleep effects.
  fx.forEach((effect) => {
    ctx.globalAlpha = C(effect.l, 0, 1);

    if (effect.k === 'heart') {
      px(HEART, effect.x | 0, effect.y | 0, '#ff7fa6');
    } else {
      ctx.fillStyle = effect.k === 'coin' ? '#d9a21b' : '#9f8bd6';
      ctx.font = 'bold 9px monospace';

      ctx.fillText(
        effect.k === 'coin' ? '+1¢' : 'z',
        effect.x | 0,
        effect.y | 0
      );
    }

    ctx.globalAlpha = 1;
  });

  if (n > 0) {
    ctx.fillStyle = `rgba(80,64,150,${n * 0.26})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (G.items.lights && n > 0.1) {
    lights(true, n);
  }

  // Petals during the day, fireflies at night.
  for (let i = 0; i < 14; i++) {
    if (n < 0.5) {
      ctx.fillStyle = `rgba(255,179,205,${0.85 - n})`;

      ctx.fillRect(
        ((i * 57 + G.t * 9) % (W + 10) - 5) | 0,
        ((i * 23 + G.t * (7 + i % 4)) % H) | 0,
        2,
        2
      );
    } else {
      const x = (i * 61) % W + Math.sin(G.t * 0.7 + i) * 14;
      const y = 100 + (i * 13) % 70 + Math.cos(G.t * 0.9 + i) * 8;
      const amount = n * (0.5 + 0.5 * Math.sin(G.t * 3 + i));

      ctx.fillStyle = `rgba(255,243,168,${amount * 0.3})`;
      ctx.fillRect(x - 2 | 0, y - 2 | 0, 5, 5);

      ctx.fillStyle = `rgba(255,250,200,${amount})`;
      ctx.fillRect(x | 0, y | 0, 2, 2);
    }
  }
}

// ---------- main game loop ----------

// dt is the time since the previous frame. Using it keeps movement and needs
// reasonably consistent on screens with different refresh rates.

function update(dt) {
  G.t += dt;

  G.cats.forEach((cat) => tick(cat, dt));

  if (ball) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    const friction = Math.pow(0.04, dt);

    ball.vx *= friction;
    ball.vy *= friction;

    if (ball.x < 8 || ball.x > W - 8) {
      ball.vx *= -1;
    }

    if (ball.y < 112 || ball.y > 172) {
      ball.vy *= -1;
    }

    ball.x = C(ball.x, 8, W - 8);
    ball.y = C(ball.y, 112, 172);

    ball.life -= dt;

    if (ball.life <= 0) {
      ball = null;
    }
  }

  fx.forEach((effect) => {
    effect.x += effect.vx * dt;
    effect.y += effect.vy * dt;
    effect.l -= dt;
  });

  fx = fx.filter((effect) => effect.l > 0);

  hudT -= dt;

  if (hudT < 0) {
    hudT = 0.2;
    hud();
  }

  saveT += dt;

  if (saveT > 5) {
    saveT = 0;
    save();
  }
}

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);

  last = now;

  update(dt);
  render();

  requestAnimationFrame(frame);
}

addEventListener('beforeunload', save);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    save();
  }
});

$('mute').textContent = G.muted ? '♪ OFF' : '♪ ON';

hud();

if (G.cats.length === 0) {
  openPicker(true);
} else {
  $('modal').hidden = true;

  if (away > 60) {
    toast('welcome back! your cats missed you');
  }
}

requestAnimationFrame(frame);