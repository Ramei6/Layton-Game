/**
 * Entry point. Runs after all scripts and assets are loaded.
 */
window.addEventListener('load', () => {
  _resizeGame();
  window.addEventListener('resize', _resizeGame);
  DebugMenu.init();   // ← garde, sert à naviguer entre écrans
  SceneTitle.init();
});

function _resizeGame() {
  const container = document.getElementById('game-container');
  const scaleX = window.innerWidth  / 1280;
  const scaleY = window.innerHeight / 720;
  const scale  = Math.min(scaleX, scaleY);
  container.style.transform = `scale(${scale})`;
}