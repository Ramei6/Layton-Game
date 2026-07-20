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
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupSprites();
        this._setupHotspots();
        this._showLocationTag('Venice — Piazza San Marco');
      },
      'assets/backgrounds/scene2-stmarco.jpg'
    );
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
        text: '"Mestre. Of course — just across the Ponte della Libertà."' },
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: '"La Tana di Oberix... do you know the place?"' },
      { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
        text: '"I know we need to take the train. Come on, Detective."' },
    ], () => {

      // Clear sprites and hotspots first
      document.getElementById('scene-sprites').innerHTML  = '';
      document.getElementById('scene-hotspots').innerHTML = '';
      document.getElementById('scene-location-tag').style.opacity = '0';

      // Preload train background, THEN swap
      const trainSrc = 'assets/backgrounds/transition-train.jpg';
      const img = new Image();
      img.onload = img.onerror = () => {
        const bgEl = document.getElementById('scene-background');
        gsap.to(bgEl, {
          opacity: 0, duration: 0.4,
          onComplete: () => {
            bgEl.src = trainSrc;
            gsap.to(bgEl, { opacity: 1, duration: 0.5,
              onComplete: () => {
                // Train dialogue then proceed
                setTimeout(() => {
                  DialogueEngine.start([
                    { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
                      text: '"I still cannot believe we are working on your birthday trip."' },
                    { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
                      text: '"We are not working. We are having an adventure. There is a difference."' },
                  ], () => {
                    setTimeout(() => Scene3Restaurant.init(), 1500);
                  });
                }, 800);
              }
            });
          }
        });
      };
      img.src = trainSrc;
    });
  },
};