const Scene3Restaurant = {
  _setBackground(title, accent, bgA, bgB) {
    const bg = document.getElementById('scene-background');
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <rect width="1280" height="720" fill="${bgA}" />
        <rect x="0" y="0" width="1280" height="720" fill="url(#g)" />
        <rect x="160" y="120" width="960" height="460" rx="28" fill="rgba(20,12,6,0.55)" stroke="rgba(255,215,120,0.3)" stroke-width="4" />
        <rect x="220" y="190" width="240" height="200" rx="18" fill="rgba(255,255,255,0.15)" />
        <rect x="500" y="220" width="300" height="160" rx="16" fill="rgba(255,255,255,0.1)" />
        <rect x="840" y="180" width="140" height="180" rx="16" fill="rgba(255,255,255,0.12)" />
        <circle cx="1030" cy="180" r="122" fill="${accent}" opacity="0.18" />
        <text x="640" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#f7e8bc">${title}</text>
        <text x="640" y="392" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="rgba(247,232,188,0.82)">A warm, candlelit trattoria</text>
      </svg>`;

    bg.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  },

  init() {
    this._setBackground("La Tana di Oberix", "#8d5e2b", "#2a1408", "#5d2b14");
    SceneManager.goTo('screen-scene', () => {
      document.getElementById('scene-sprites').innerHTML = '';
      document.getElementById('scene-hotspots').innerHTML = '';
    });
  },
};