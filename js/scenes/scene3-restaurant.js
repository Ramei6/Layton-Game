const Scene3Restaurant = {

  DEBUG: false,   // set true to see chef zone + coin outlines while calibrating

  init() {
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupSprites();
        this._setupHotspots();
        this._showLocationTag('Mestre - La Tana di Oberix');
      },
      'assets/backgrounds/scene3-restaurant.png'
    );
  },

  // ==================================================================
  // ZONES - clears #scene-sprites (only place that does), then appends
  // ==================================================================

  SHEET_SRC: 'assets/sprites/scene-carnival-transform.png', // confirme le nom exact

  // Rectangles de recadrage dans l'image source (pixels réels du PNG)
  FRAMES: [
      { x: 30,  y: 275,  w: 656, h: 910  },  // frame 0 - déguisé
      { x: 837, y: 261,  w: 918, h: 929  },  // frame 1 - mi-révélation
      { x: 440, y: 1272, w: 882, h: 1086 },  // frame 2 - Oberix révélé
    ],

  // Échelle unique appliquée aux 3 frames (garde leurs proportions relatives
  // intactes - ne PAS normaliser chaque frame à la même hauteur, sinon le
  // personnage "grossit" bizarrement entre les frames)
  DISPLAY_SCALE: 0.42, // à ajuster : 240 / 640 (hauteur frame 0 ≈ ancien scene-carnival.png)

  // Clears #scene-sprites (only place that does), builds the sprite, then
  // hands off to _setupZones() to append the click zone on top.
  // Construit le sprite + la zone. Vide #scene-sprites (seul endroit qui le fait).
  _setupSprites() {
    const container = document.getElementById('scene-sprites');
    container.innerHTML = '';

    this._buildRevealSprite(container, GameState.puzzlesSolved.p4 ? 2 : 0);
    this._setupZones(container);
  },

  _buildRevealSprite(container, startFrame) {
    const viewport = document.createElement('div');
    viewport.id = 'sprite-oberix-viewport';
    Object.assign(viewport.style, {
      position: 'absolute',
      overflow: 'hidden',
      zIndex:   '8',
      pointerEvents: 'none',   // la zone gère les clics, pas le sprite
      filter:   'drop-shadow(2px 4px 10px rgba(0,0,0,0.55))',
    });

    const sheet = document.createElement('img');
    sheet.id  = 'sprite-oberix-sheet';
    sheet.src = this.SHEET_SRC;
    Object.assign(sheet.style, { 
      position: 'absolute', 
      top: '0', 
      left: '0', 
      pointerEvents: 'none'   // ajouté : empêche l'img de capter les clics 
    });

    sheet.onload = () => {
      const s = this.DISPLAY_SCALE;
      sheet.style.width  = (sheet.naturalWidth  * s) + 'px';
      sheet.style.height = (sheet.naturalHeight * s) + 'px';
      this._showFrame(startFrame);
    };

    viewport.appendChild(sheet);
    container.appendChild(viewport);
  },

  // Positionne le viewport pour n'afficher qu'un rectangle donné du sheet.
  // L'ancrage (centre horizontal + ligne des pieds) vient de zone-chef,
  // donc les 3 frames restent "posées" au même endroit malgré leurs
  // tailles différentes.
  _showFrame(index) {
    const frame    = this.FRAMES[index];
    const s        = this.DISPLAY_SCALE;
    const viewport = document.getElementById('sprite-oberix-viewport');
    const sheet    = document.getElementById('sprite-oberix-sheet');
    if (!viewport || !sheet) return;

    const dispW = frame.w * s;
    const dispH = frame.h * s;

    viewport.style.width  = dispW + 'px';
    viewport.style.height = dispH + 'px';
    viewport.style.left   = (this._anchorCenterX() - dispW / 2) + 'px';
    viewport.style.top    = (this._anchorFeetY()   - dispH)      + 'px';

    gsap.set(sheet, { x: -frame.x * s, y: -frame.y * s });
  },

  // Dérive l'ancrage (centre + ligne du sol) depuis les coords de zone-chef,
  // donc tu n'as qu'un seul jeu de coordonnées à me donner.
  _anchorCenterX() {
    return this._ZONE.left + this._ZONE.width / 2;
  },
  _anchorFeetY() {
    return this._ZONE.top + this._ZONE.height;
  },

  // Mêmes coords que zone-chef - recalibre les deux ensemble.
  _ZONE: { left: 719, top: 282.5, width: 245, height: 353.5 },

  _setupZones(container) {
    const makeZone = (id, style, color) => {
      const zone = document.createElement('div');
      zone.id = id;
      Object.assign(zone.style, {
        position: 'absolute', cursor: 'pointer', pointerEvents: 'auto',
        background: this.DEBUG ? `rgba(${color},0.35)` : 'transparent',
        outline:    this.DEBUG ? `2px solid rgba(${color},0.9)` : 'none',
        ...style,
      });
      zone.title = '';
      return zone;
    };

    if (!GameState.puzzlesSolved.p4) {
      const z = makeZone('zone-chef', {
        left:   this._ZONE.left   + 'px',
        top:    this._ZONE.top    + 'px',
        width:  this._ZONE.width  + 'px',
        height: this._ZONE.height + 'px',
        zIndex: '20',   // ajouté : passe au-dessus du sprite (z-index:8)
      }, '255,140,0');
      z.addEventListener('click', () => this._onChefClick());
      container.appendChild(z);
    }
  },

  _playReveal(onComplete) {
    this._showFrame(1);
    setTimeout(() => {
      this._showFrame(2);
      setTimeout(onComplete, 500);
    }, 600);
  },

  // ==================================================================
  // HINT COINS - #scene-hotspots only
  // ==================================================================

  _setupHotspots() {
    const container = document.getElementById('scene-hotspots');
    container.innerHTML = '';

    const coins = [
      { id: 'scene3-coin1', style: { top: '16px',  left: '424px'  } },
      { id: 'scene3-coin2', style: { top: '351px', left: '1148px' } },
      { id: 'scene3-coin3', style: { top: '214px', left: '790px'  } },
    ];

    coins.forEach(({ id, style }) => {
      if (GameState.collectedCoins.scene3.has(id)) return;

      const coin = document.createElement('div');
      Object.assign(coin.style, {
        position:      'absolute',
        width:         '44px',
        height:        '44px',
        cursor:        'default',
        opacity:       this.DEBUG ? '0.6' : '0',
        pointerEvents: 'auto',
        zIndex:        '15',
        background:    this.DEBUG
          ? 'radial-gradient(circle, #ffe066 30%, #c8860a 100%)'
          : 'transparent',
        borderRadius:  '50%',
        border:        this.DEBUG ? '2px solid #ffcc00' : 'none',
        ...style,
      });
      coin.title = '';

      coin.addEventListener('click', (e) => {
        e.stopPropagation();
        GameState.collectedCoins.scene3.add(id);
        GameState.addHintCoin();
        coin.className     = 'hintcoin';
        coin.style.opacity = '1';
        coin.style.cursor  = 'default';
        gsap.to(coin, {
          scale: 1.6, opacity: 0, y: -35, duration: 0.55,
          onComplete: () => coin.remove(),
        });
      });

      container.appendChild(coin);
    });
  },

  // ==================================================================
  // LOCATION TAG
  // ==================================================================

  _showLocationTag(text) {
    const tag = document.getElementById('scene-location-tag');
    tag.textContent = text;
    gsap.fromTo(tag,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.3,
        onComplete: () => gsap.to(tag, { opacity: 0, duration: 0.5, delay: 2.5 }),
      }
    );
  },

  // ==================================================================
  // EXCLAMATION MARK - same pattern as scene1 / scene2
  // ==================================================================

  _showExclamation(onComplete) {
    const el = document.createElement('div');
    el.id = 'exclamation-mark-chef';
    Object.assign(el.style, {
      position:       'absolute',
      left:           '600px', top: '220px',   // PLACEHOLDER, above chef zone
      width:          '38px',
      height:         '38px',
      borderRadius:   '50%',
      background:     '#cc1100',
      color:          '#ffffff',
      fontSize:       '24px',
      fontWeight:     '900',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         '30',
      pointerEvents:  'none',
      boxShadow:      '0 3px 10px rgba(0,0,0,0.55)',
      lineHeight:     '1',
    });
    el.textContent = '!';
    document.getElementById('scene-sprites').appendChild(el);

    gsap.fromTo(el,
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, duration: 0.22, ease: 'back.out(2.5)',
        onComplete: () => {
          gsap.to(el, { scale: 1, duration: 0.1,
            onComplete: () => {
              gsap.to(el, { y: -5, duration: 0.35, repeat: 2, yoyo: true, ease: 'sine.inOut' });
              gsap.to(el, {
                y: -22, opacity: 0, duration: 0.35, delay: 0.9, ease: 'power1.in',
                onComplete: () => { el.remove(); if (onComplete) onComplete(); },
              });
            },
          });
        },
      }
    );
  },

  // ==================================================================
  // CLICK HANDLERS
  // ==================================================================

  _onChefClick() {
    if (GameState.puzzlesSolved.p4 || this._revealing) return;
    this._revealing = true;

    this._showExclamation(() => {
      const startDialogue = () => {
        this._revealing = false;
        DialogueEngine.start([
          { character: 'Chef Oberix', portrait: 'chef', side: 'left',
            text: 'Mamma mia, please forgive the theatrics! I am Chef Oberix, and this is my restaurant. I had to lure you all the way from San Marco to Mestre to be absolutely certain you were the master detectives the rumors spoke of!' },
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'You went through all that trouble and wore a mask just to test us?' },
          { character: 'Chef Oberix', portrait: 'chef', side: 'left',
            text: 'I needed minds sharp enough to solve the impossible. Tonight is the most important dinner of my life, but my ancestor\'s sacred recipe is completely scrambled. It is locked behind a culinary riddle I simply cannot decipher.' },
          { character: 'Chef Oberix', portrait: 'chef', side: 'left',
            text: 'Please, if you do not help me order these ingredients, my family legacy is ruined!' }, 
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'A historical riddle hidden in a family recipe? Now that is a mystery I cannot refuse. Gabriel, prepare to take notes.' },
          { character: 'Gabriel', portrait: 'gabriel', side: 'right',
            text: 'I am ready when you are, Inspector.' },
        ], () => Puzzle4Recipe.open());
      };

      this._revealed ? startDialogue() : this._playReveal(() => {
        this._revealed = true;
        startDialogue();
      });
    });
  },

  // ==================================================================
  // PUZZLE CALLBACK
  // ==================================================================

  onRecipeSolved() {
    GameState.puzzlesSolved.p4 = true;

    // Return to the restaurant scene FIRST, then play the closing dialogue -
    // same pattern as Scene1Bridge.onPuzzleSolved / Scene2StMarco.onPigeonsSolved
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupSprites();   // chef zone now hidden (p4 solved), sprite stays on revealed frame
        this._setupHotspots();
        this._showLocationTag('Mestre - La Tana di Oberix');

        DialogueEngine.start([
          { character: 'Chef Oberix', portrait: 'chef', side: 'left',
            text: 'Perfetto! The exact order! The Oberix legacy is saved!' },
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'It was a wonderfully crafted riddle, Chef. We are glad to help.' },
          { character: 'Chef Oberix', portrait: 'chef', side: 'left',
            text: 'You must stay! A grand feast for my saviors, completely on the house! But before we eat... Gabriel, my friend, do you not have something important to confess to the Inspector?' },
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'A confession? Gabriel, what is he talking about?' },
          { character: 'Gabriel', portrait: 'gabriel', side: 'right',
            text: 'Haha, well... surprise? The truth is, Inspector, none of this was a coincidence.' },
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'What do you mean?' },
          { character: 'Gabriel', portrait: 'gabriel', side: 'right',
            text: 'I organized this entire day from scratch. I paid the workers to put up those closed signs on the bridge. I hired the actor to get swarmed by pigeons in the piazza. I even asked Chef Oberix here to dress up in that carnival mask, hand us the map, and lead us to Mestre.' },
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'Wait, you planned this whole elaborate mystery... just for me?' },
          { character: 'Gabriel', portrait: 'gabriel', side: 'right',
            text: 'Every single puzzle, every clue, and every canal we crossed. Happy Birthday, Dasha. You are my absolute favorite detective, and you deserve the greatest adventure.' },
        ], () => {
          setTimeout(() => SceneEnd.init(), 800);
        });
      },
      'assets/backgrounds/scene3-restaurant.png'
    );
  },
};