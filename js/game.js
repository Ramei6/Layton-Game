/**
 * Entry point. Runs after all scripts and assets are loaded.
 */
window.addEventListener('load', () => {
  _resizeGame();
  window.addEventListener('resize', _resizeGame);
  DebugMenu.init();   // ← add this
  SceneTitle.init();
});

function _resizeGame() {
  const container = document.getElementById('game-container');
  const scaleX = window.innerWidth  / 1280;
  const scaleY = window.innerHeight / 720;
  const scale  = Math.min(scaleX, scaleY);
  container.style.transform = `scale(${scale})`;
}
// CALIBRATION HELPER — remove before gifting
let _lastCoords = { x: 0, y: 0 };

document.getElementById('game-container').addEventListener('click', (e) => {
  const rect  = e.currentTarget.getBoundingClientRect();
  const scale = rect.width / 1280;
  const x     = Math.round((e.clientX - rect.left) / scale);
  const y     = Math.round((e.clientY - rect.top)  / scale);
  _lastCoords = { x, y };

  // Show a small dot at the clicked position
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position:      'absolute',
    left:          x + 'px',
    top:           y + 'px',
    width:         '10px',
    height:        '10px',
    borderRadius:  '50%',
    background:    '#ff3333',
    border:        '2px solid #fff',
    transform:     'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex:        '9999',
    opacity:       '0.7',
  });
  document.getElementById('game-container').appendChild(dot);

  // Fade out and remove after 2s
  gsap.to(dot, {
    opacity: 0, scale: 0, duration: 0.4, delay: 1.6,
    onComplete: () => dot.remove(),
  });

  console.log(`x: ${x}px, y: ${y}px`);
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'c' || e.key === 'C') {
    const text = `left: ${_lastCoords.x}px; top: ${_lastCoords.y}px;`;
    navigator.clipboard.writeText(text).then(() => {

      // Flash the dot red → white to confirm copy
      const confirm = document.createElement('div');
      Object.assign(confirm.style, {
        position:      'absolute',
        left:          _lastCoords.x + 'px',
        top:           _lastCoords.y + 'px',
        width:         '18px',
        height:        '18px',
        borderRadius:  '50%',
        background:    '#ff3333',
        border:        '2px solid #fff',
        transform:     'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex:        '9999',
        fontSize:      '9px',
        color:         '#fff',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        fontWeight:    'bold',
      });
      confirm.textContent = '✓';
      document.getElementById('game-container').appendChild(confirm);

      gsap.fromTo(confirm,
        { scale: 0.5, opacity: 1 },
        { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.out',
          onComplete: () => confirm.remove(),
        }
      );

      console.log(`Copied → ${text}`);
    });
  }
});