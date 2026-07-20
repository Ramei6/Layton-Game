/**
 * Scene 1: Venice Bridge
 *
 * Elements:
 * - Background: venice canal + closed bridge
 * - Sprites: group (lady+kids), cat, gondola
 * - Hotspots: 3 hidden hint coins
 *
 * Flow:
 * - Click group → dialogue → Puzzle 1
 * - Click cat → easter egg dialogue → cat joins
 * - Click gondola → only works after puzzle 1 solved → Scene 2
 */
const Scene1Bridge = {

  init() {
    // Remove: document.getElementById('scene-background').src = '...'
    // SceneManager now handles this after preload

    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupSprites();
        this._setupHotspots();
        this._showLocationTag('Venice — Day 1');
      },
      'assets/backgrounds/scene1-venice-bridge.jpg'  // ← third argument
    );
  },


  _setupSprites() {
    const container = document.getElementById('scene-sprites');
    container.innerHTML = '';

    // ── Group (lady + kids) ── only shown if puzzle not yet solved
    if (!GameState.puzzlesSolved.p1) {
      const group = document.createElement('img');
      group.src       = 'assets/sprites/scene-group-bridge.png';
      group.id        = 'sprite-group';
      group.className = 'clickable-sprite';
      group.title     = 'A group of lost tourists';
      Object.assign(group.style, { position:'absolute', bottom:'80px', left:'180px', height:'290px' });
      group.addEventListener('click', () => this._onGroupClick());
      container.appendChild(group);

      // Gentle idle sway for group
      gsap.to(group, { rotation: 1.5, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: 'bottom center' });
    }

    // ── Cat ── only shown if not yet found
    if (!GameState.catFound) {
      const cat = document.createElement('img');
      cat.src       = 'assets/sprites/scene-cat.png';
      cat.id        = 'sprite-cat';
      cat.className = 'clickable-sprite';
      cat.title     = '...';
      Object.assign(cat.style, { position:'absolute', bottom:'108px', right:'310px', height:'72px' });
      cat.addEventListener('click', () => this._onCatClick());
      container.appendChild(cat);

      // Cat tail wag
      gsap.to(cat, { rotation: 3, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: 'bottom right' });
    }

    // ── Gondola ──
    const gondola = document.createElement('img');
    gondola.src   = 'assets/sprites/scene-gondola.png';
    gondola.id    = 'sprite-gondola';
    Object.assign(gondola.style, { position:'absolute', bottom:'30px', right:'150px', height:'165px' });

    if (GameState.gondolaUnlocked) {
      gondola.className = 'clickable-sprite';
      gondola.title     = 'Take the gondola';
      gondola.addEventListener('click', () => this._onGondolaClick());
    } else {
      gondola.style.cursor = 'default';
      gondola.style.opacity = '0.75';
    }

    // Gondola bobs on water
    gsap.to(gondola, { y: -6, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    container.appendChild(gondola);
  },

  _setupHotspots() {
    const container = document.getElementById('scene-hotspots');
    container.innerHTML = '';

    // Positions chosen to hide naturally in the background:
    // coin1: near a lamp post top-left, coin2: behind bridge arch, coin3: near waterline
    const coins = [
      { id: 'scene1-coin1', style: { top: '90px',  left: '55px' } },
      { id: 'scene1-coin2', style: { top: '180px', left: '620px' } },
      { id: 'scene1-coin3', style: { top: '390px', left: '480px' } },
    ];

    coins.forEach(({ id, style }) => {
      if (GameState.collectedCoins.scene1.has(id)) return;

      const coin = document.createElement('div');
      coin.className = 'hintcoin';
      coin.title = '?';
      Object.assign(coin.style, style);

      coin.addEventListener('click', (e) => {
        e.stopPropagation();
        GameState.collectedCoins.scene1.add(id);
        GameState.addHintCoin();
        gsap.to(coin, { scale: 1.6, opacity: 0, y: -35, duration: 0.5,
          onComplete: () => coin.remove()
        });
      });

      container.appendChild(coin);
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

  // ── Click handlers ──────────────────────────────────────────────

  _onGroupClick() {
    if (GameState.puzzlesSolved.p1) return;

    DialogueEngine.start([
      { character: 'Signora Rossi', portrait: 'lady',    side: 'left',
        text: "Oh! Signori, per favore — could you help? We have been going in circles for an hour!" },
      { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
        text: "Good afternoon. What seems to be the trouble?" },
      { character: 'Signora Rossi', portrait: 'lady',    side: 'left',
        text: "This bridge! It is closed for repairs. There is a gondola, but the children are too frightened..." },
      { character: 'Child',         portrait: 'kid',     side: 'left',
        text: "We want to get to Nonna! She is waiting on the other side!" },
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: "We can help you cross. But we need to be careful — the gondola only holds two, and we can't leave the children without an adult watching." },
      { character: 'Signora Rossi', portrait: 'lady',    side: 'left',
        text: "You are right. Can you work out the crossings, Detectives? I trust your method more than my own panicked mind!" },
    ], () => {
      Puzzle1Crossing.open();
    });
  },

  _onCatClick() {
    GameState.catFound = true;

    DialogueEngine.start([
      { character: '???',           portrait: 'cat',     side: 'left',
        text: "Meow... mrrr-wow..." },
      { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
        text: "Hello there, little one. Are you lost too?" },
      { character: '???',           portrait: 'cat',     side: 'left',
        text: "Mrrp." },
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: "Inspector... I think he wants to come with us." },
      { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
        text: "Every great detective novel has a cat. Welcome to the team." },
    ], () => {
      const cat = document.getElementById('sprite-cat');
      if (cat) gsap.to(cat, { opacity: 0, y: -20, duration: 0.5, onComplete: () => cat.remove() });
    });
  },

  _onGondolaClick() {
    if (!GameState.gondolaUnlocked) {
      gsap.to('#sprite-gondola', { x: 6, duration: 0.07, repeat: 4, yoyo: true, ease: 'none' });
      return;
    }
    Scene2StMarco.init();
  },

  // ── Called by Puzzle1 after solve ───────────────────────────────

  onPuzzleSolved() {
    // Return to the scene screen and then play the farewell dialogue.
    GameState.gondolaUnlocked = true;

    SceneManager.goTo('screen-scene', () => {
      this._setupSprites();   // rebuilds without group, gondola now clickable
      this._setupHotspots();
      this._showLocationTag('Venice — Day 1');

      DialogueEngine.start([
        { character: 'Signora Rossi', portrait: 'lady', side: 'left',
          text: "Mille grazie! You truly are remarkable detectives! Buona fortuna, my dears!" },
        { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
          text: "Enjoy the rest of your day, Signora." },
      ], () => {
        // Gondola pulse to draw attention
        gsap.to('#sprite-gondola', { y: -14, duration: 0.4, repeat: 3, yoyo: true, ease: 'power1.inOut' });
      });
    });
  },
};