import { Game } from './core/Game.js';

const boot = (window.__JINGSHAN_BOOT__ = {
  status: 'booting',
  error: null,
});

const app = document.getElementById('app');
const hudEls = {
  start: document.getElementById('start'),
  nogl: document.getElementById('nogl'),
  enter: document.getElementById('enter'),
  startNote: document.getElementById('startNote'),
};

if (window.matchMedia('(pointer: coarse)').matches && hudEls.startNote) {
  hudEls.startNote.textContent = '单指拖动画面环绕视角，左下摇杆移动';
}

function showFatal(title, desc, err) {
  boot.status = 'failed';
  boot.error = err ? String(err.stack || err) : null;

  hudEls.start?.classList.add('hidden');
  if (!hudEls.nogl) return;

  const titleEl = hudEls.nogl.querySelector('.start-title');
  const descEl = hudEls.nogl.querySelector('.start-desc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  hudEls.nogl.classList.remove('hidden');

  if (err) console.error(`[径山寺] ${title}`, err);
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2'));
  } catch {
    return false;
  }
}

if (!webglAvailable()) {
  showFatal(
    '无法开启山门',
    '当前浏览器不支持 WebGL2。请升级浏览器，或在浏览器设置中开启硬件加速后重试。',
  );
} else {
  let game;
  try {
    game = new Game(app);
  } catch (err) {
    showFatal(
      '启动失败',
      '页面初始化时发生错误。请打开开发者工具查看控制台，并把错误信息反馈给维护者。',
      err,
    );
  }

  if (game) {
    boot.status = 'loading';
    window.__JINGSHAN__ = {
      game,
      engine: game.engine,
      player: game.player,
      maps: game.maps,
      hud: game.hud,
    };

    game.init()
      .then(() => {
        boot.status = 'ready';
      })
      .catch((err) => {
        showFatal(
          '场景加载失败',
          '场景构建过程中发生错误。请打开开发者工具查看控制台；也可以先尝试刷新页面。',
          err,
        );
      });

    hudEls.enter?.addEventListener('click', () => game.begin());
  }
}
