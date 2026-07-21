const Scene2StMarco = {

  DEBUG: false,

  init() {
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupSprites();   // clears #scene-sprites, adds characters + zones
        this._setupHotspots();  // clears #scene-hotspots, adds coins
        this._showLocationTag('Venice — Piazza San Marco');
      },
      'assets/backgrounds/smbg.png'
    );
  },

  // ══════════════════════════════════════════════════════════════════
  // SPRITES + ZONES
  // Both go into #scene-sprites. Sprites first, zones on top.
  // _setupSprites() clears the container — _setupZones() does NOT.
  // ══════════════════════════════════════════════════════════════════

  _setupSprites() {
    const container = document.getElementById('scene-sprites');
    container.innerHTML = '';   // ← single clear, here only

    // ── Dog — always visible, mirrored ──────────────────────────────
    const dog = document.createElement('img');
    dog.src   = 'assets/sprites/dog.png';
    dog.id    = 'sprite-dog';
    Object.assign(dog.style, {
      position:  'absolute',
      height:    '200px',
      width:     'auto',
      bottom:    '120px',
      left:      '300px',
      filter:    'drop-shadow(1px 3px 6px rgba(0,0,0,0.5))',
      transform: 'scaleX(-1)',   // mirrored
      zIndex:    '8',
      cursor:    'default',      // zone handles clicks
    });
    container.appendChild(dog);

    // ── Tourist (animated 2 frames) — hidden after puzzle 2 ─────────
    if (!GameState.puzzlesSolved.p2) {
      const tourist = document.createElement('img');
      tourist.src = 'assets/sprites/guyf1.png';
      tourist.id  = 'sprite-tourist';
      Object.assign(tourist.style, {
        position: 'absolute',
        height:   '800px',
        width:    'auto',
        bottom:   '-10px',
        left:     '500px',
        filter:   'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))',
        zIndex:   '9',
        cursor:   'default',     // zone handles clicks, NOT the img
      });

      this._animateSprite(tourist, [
        'assets/sprites/guyf1.png',
        'assets/sprites/guyf2.png',
      ], 3);

      container.appendChild(tourist);
    }

    // ── Carnival — only after p2 solved, before p3 solved ───────────
    if (GameState.puzzlesSolved.p2 && !GameState.puzzlesSolved.p3) {
      this._spawnCarnival(container);
    }

    // ── Invisible click zones (appended after sprites) ───────────────
    this._setupZones(container);
  },

  _setupZones(container) {
    // container = #scene-sprites — already cleared by _setupSprites()
    // Do NOT clear here — sprites are already in it

    const makeZone = (id, style, color) => {
      const zone = document.createElement('div');
      zone.id = id;
      Object.assign(zone.style, {
        position:      'absolute',
        cursor:        'pointer',
        pointerEvents: 'auto',
        background:    this.DEBUG ? `rgba(${color},0.3)`            : 'transparent',
        outline:       this.DEBUG ? `2px solid rgba(${color},0.9)`  : 'none',
        zIndex:        '20',
        ...style,
      });
      zone.title = '';
      return zone;
    };

    // Tourist zone — upper body only, not the full 800px sprite
    if (!GameState.puzzlesSolved.p2) {
      const z = makeZone('zone-tourist', {
        left:   '600px',
        top:    '300px',
        width:  '150px',
        height: '250px',
      }, '255,165,0');
      z.addEventListener('click', () => this._onTouristClick());
      container.appendChild(z);
    }

    // Dog zone
    const dz = makeZone('zone-dog', {
      left:   '310px',
      top:    '450px',
      width:  '80px',
      height: '100px',
    }, '0,200,100');
    dz.addEventListener('click', () => this._onDogClick());
    container.appendChild(dz);
  },

  _spawnCarnival(container) {
    // container = #scene-sprites passed from _setupSprites
    const carnival = document.createElement('img');
    carnival.src   = 'assets/sprites/scene-carnival.png';
    carnival.id    = 'sprite-carnival';
    Object.assign(carnival.style, {
      position: 'absolute',
      height:   '240px',
      width:    'auto',
      bottom:   '80px',
      right:    '180px',
      cursor:   'pointer',
      filter:   'drop-shadow(2px 4px 10px rgba(0,0,0,0.6))',
      opacity:  '0',
      zIndex:   '10',
    });
    carnival.addEventListener('click', () => this._onCarnivalClick());
    container.appendChild(carnival);

    gsap.fromTo(carnival,
      { x: 120, opacity: 0 },
      { x: 0,   opacity: 1, duration: 0.7, ease: 'power2.out' }
    );
  },

  // ══════════════════════════════════════════════════════════════════
  // HINT COINS — #scene-hotspots only
  // ══════════════════════════════════════════════════════════════════

  _setupHotspots() {
    const container = document.getElementById('scene-hotspots');
    container.innerHTML = '';   // ← clears any leftover coins from previous scene

    const coins = [
      { id: 'scene2-coin1', style: { top: '30px',  left: '380px' } },
      { id: 'scene2-coin2', style: { top: '220px', left: '235px' } },
      { id: 'scene2-coin3', style: { top: '200px', left: '495px' } },
    ];

    coins.forEach(({ id, style }) => {
      if (GameState.collectedCoins.scene2.has(id)) return;

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
        GameState.collectedCoins.scene2.add(id);
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

  // ══════════════════════════════════════════════════════════════════
  // SPRITE FRAME CYCLER
  // ══════════════════════════════════════════════════════════════════

  _animateSprite(imgEl, frames, fps = 3) {
    let current = 0;
    const timer = setInterval(() => {
      current     = (current + 1) % frames.length;
      imgEl.src   = frames[current];
    }, 1000 / fps);
    imgEl._animTimer = timer;
  },

  // ══════════════════════════════════════════════════════════════════
  // LOCATION TAG
  // ══════════════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════════════
  // EXCLAMATION MARK
  // ══════════════════════════════════════════════════════════════════

  _showExclamation(onComplete) {
    const el = document.createElement('div');
    el.id = 'exclamation-mark-sm';
    Object.assign(el.style, {
      position:       'absolute',
      left:           '620px',
      top:            '285px',
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

  // ══════════════════════════════════════════════════════════════════
  // CLICK HANDLERS
  // ══════════════════════════════════════════════════════════════════

  _onTouristClick() {
    if (GameState.puzzlesSolved.p2) return;

    this._showExclamation(() => {
      DialogueEngine.start([
        { character: 'Tourist',            portrait: 'guy',     side: 'left',
          text: '"Help! HELP! They just keep coming! I only had a sandwich!"' },
        { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
          text: '"Sir, calm down. How long have you been standing there?"' },
        { character: 'Tourist',            portrait: 'guy',     side: 'left',
          text: '"Since 10am! The square is completely full at noon — I need to know when to run!"' },
        { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
          text: '"Each bird calls another and they arrive one per minute... this is a doubling problem!"' },
        { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
          text: '"Precisely. Gabriel — if the square is full at 12:00, when is it half full?"' },
      ], () => Puzzle2Pigeons.open());
    });
  },

  _onDogClick() {
    DialogueEngine.start([
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: '"Inspector, I think this dog is also investigating something."' },
      { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
        text: '"Leave it to Venice to have its own detective dog."' },
    ], () => { });
  },

  _onCarnivalClick() {
    if (GameState.puzzlesSolved.p3) return;

    DialogueEngine.start([
      { character: '???',                portrait: 'carnival', side: 'left',
        text: '"Brava, Detectives. Most impressive."' },
      { character: 'Inspector Dasha',    portrait: 'dasha',    side: 'right',
        text: '"Who are you?"' },
      { character: '???',                portrait: 'carnival', side: 'left',
        text: '"A friend. I have been watching your deductions with great interest."' },
      { character: '???',                portrait: 'carnival', side: 'left',
        text: '"Consider this a gift. It will show you exactly where your next adventure begins."' },
      { character: 'Apprentice Gabriel', portrait: 'gabriel',  side: 'right',
        text: '"A... map?"' },
      { character: '???',                portrait: 'carnival', side: 'left',
        text: '"Buona fortuna, Ispettore."' },
    ], () => Puzzle3Map.open());
  },

  // ══════════════════════════════════════════════════════════════════
  // PUZZLE CALLBACKS
  // ══════════════════════════════════════════════════════════════════

  onPigeonsSolved() {
    DialogueEngine.start([
      { character: 'Tourist',            portrait: 'guy',     side: 'left',
        text: '"11:59?! I have been here since 10am for THIS?! I need to leave NOW!"' },
      { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
        text: '"Run, sir. Run now."' },
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: '"Inspector... there is someone watching us from the far end of the square."' },
    ], () => {
      GameState.puzzlesSolved.p2 = true;

      // Kill animation timer and fade out tourist
      const tourist = document.getElementById('sprite-tourist');
      if (tourist) {
        if (tourist._animTimer) clearInterval(tourist._animTimer);
        gsap.to(tourist, {
          opacity: 0, duration: 0.4,
          onComplete: () => tourist.remove(),
        });
      }

      // Remove tourist click zone
      const zone = document.getElementById('zone-tourist');
      if (zone) zone.remove();

      // Spawn carnival character
      const container = document.getElementById('scene-sprites');
      this._spawnCarnival(container);
    });
  },

  onMapSolved() {
    DialogueEngine.start([
      { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
        text: '"Mestre. Of course — just across the Ponte della Libertà."' },
      { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
        text: '"La Tana di Oberix... do you know it, Inspector?"' },
      { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
        text: '"I know we need to take the train. Come on, Detective."' },
    ], () => this._trainTransition());
  },

  // ══════════════════════════════════════════════════════════════════
  // TRAIN TRANSITION
  // ══════════════════════════════════════════════════════════════════

  _trainTransition() {
    document.getElementById('scene-sprites').innerHTML  = '';
    document.getElementById('scene-hotspots').innerHTML = '';
    gsap.to('#scene-location-tag', { opacity: 0, duration: 0.3 });

    const trainSrc = 'assets/backgrounds/transition-train.jpg';
    const img      = new Image();

    img.onload = img.onerror = () => {
      const bgEl = document.getElementById('scene-background');
      gsap.to(bgEl, {
        opacity: 0, duration: 0.5,
        onComplete: () => {
          bgEl.src = trainSrc;
          gsap.to(bgEl, {
            opacity: 1, duration: 0.6,
            onComplete: () => {
              this._showLocationTag('Venice → Mestre — On the Train');
              setTimeout(() => {
                DialogueEngine.start([
                  { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
                    text: '"I still cannot believe we are working on your birthday trip."' },
                  { character: 'Inspector Dasha',    portrait: 'dasha',   side: 'right',
                    text: '"We are not working. We are having an adventure. There is a difference."' },
                  { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
                    text: '"Of course, Inspector."' },
                ], () => setTimeout(() => Scene3Restaurant.init(), 1000));
              }, 800);
            },
          });
        },
      });
    };
    img.src = trainSrc;
  },
};