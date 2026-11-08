import { Game } from './core/Game.js';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const app = document.getElementById('app');
const hudEls = {
  start: document.getElementById('start'),
  nogl: document.getElementById('nogl'),
  enter: document.getElementById('enter'),
};

if (!webglAvailable()) {
  hudEls.start.classList.add('hidden');
  hudEls.nogl.classList.remove('hidden');
} else {
  const game = new Game(app);

  window.__JINGSHAN__ = {
    game,
    engine: game.engine,
    player: game.player,
    maps: game.maps,
    hud: game.hud,
  };

  game.init().catch((err) => {
    console.error('[径山寺] 场景加载失败', err);
    hudEls.start.classList.add('hidden');
    hudEls.nogl.querySelector('.start-title').textContent = '场景加载失败';
    hudEls.nogl.querySelector('.start-desc').textContent =
      '请通过 HTTP 打开页面：在项目目录运行 python3 -m http.server 8000，再访问 http://localhost:8000/。';
    hudEls.nogl.classList.remove('hidden');
  });

  hudEls.enter.addEventListener('click', () => game.begin());
}
