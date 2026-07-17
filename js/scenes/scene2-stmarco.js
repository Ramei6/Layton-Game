const Scene2StMarco = {
  _setBackground(title, accent, bgA, bgB) {
    const bg = document.getElementById('scene-background');
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <rect width="1280" height="720" fill="${bgA}" />
        <rect x="0" y="0" width="1280" height="720" fill="url(#g)" />
        <path d="M0 520 C220 450, 360 420, 560 460 C740 495, 930 530, 1280 470 L1280 720 L0 720 Z" fill="${bgB}" opacity="0.95" />
        <circle cx="1040" cy="180" r="120" fill="${accent}" opacity="0.18" />
        <circle cx="278" cy="175" r="88" fill="#ffffff" opacity="0.12" />
        <rect x="120" y="120" width="1040" height="460" rx="24" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="4" />
        <text x="640" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#f7e8bc">${title}</text>
        <text x="640" y="395" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="rgba(247,232,188,0.82)">A new scene begins</text>
      </svg>`;

    bg.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  },

  init() {
    this._setBackground("St Mark's Square", "#c79a3b", "#0f2b3e", "#195a7a");
    SceneManager.goTo('screen-scene', () => {
      document.getElementById('scene-sprites').innerHTML = '';
      document.getElementById('scene-hotspots').innerHTML = '';
      this._showLocationTag("St Mark's Square");
    });
  },

  _showLocationTag(text) {
    const tag = document.getElementById('scene-location-tag');
    tag.textContent = text;
    gsap.fromTo(tag,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.3,
        onComplete: () => {
          gsap.to(tag, { opacity: 0, duration: 0.5, delay: 2.5 });
        }
      }
    );
  },

  onPigeonsSolved() {
    // TODO: carnival character appears, dialogue, then Puzzle3Map.open()
  },

  onMapSolved() {
    DialogueEngine.start([
      { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
        text: "Mestre. Of course — just across the bridge. That's where we need to go." },
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: "La Tana di Oberix... do you know it?" },
      { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
        text: "I know we need to take the train. Come on." },
    ], () => {
      SceneManager.goTo('screen-scene', () => {
        this._setBackground("Journey to Mestre", "#4c3a2b", "#1b3248", "#5a7f90");
        document.getElementById('scene-sprites').innerHTML = '';
        document.getElementById('scene-hotspots').innerHTML = '';

        setTimeout(() => Scene3Restaurant.init(), 3500);
      });
    });
  },
};