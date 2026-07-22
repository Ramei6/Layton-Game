const Scene2StMarco = {

  DEBUG: false,

  init() {
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupSprites();
        this._setupHotspots();
        this._showLocationTag('Venice - Piazza San Marco');
      },
      'assets/backgrounds/smbg.png'
    );
  },

  // ==================================================================
  // SPRITES
  // Clears #scene-sprites, adds all visible images, then appends zones.
  // ==================================================================

  _setupSprites() {
    const container = document.getElementById('scene-sprites');
    container.innerHTML = '';   // single clear - here only

    // -- Dog - always visible, mirrored ------------------------------
    const dog = document.createElement('img');
    dog.src = 'assets/sprites/dog.png';
    dog.id  = 'sprite-dog';
    Object.assign(dog.style, {
      position:  'absolute',
      height:    '160px',
      width:     'auto',
      top:       '475px',
      left:      '462px',
      filter:    'drop-shadow(1px 3px 6px rgba(0,0,0,0.5))',
      transform: 'scaleX(-1)',
      zIndex:    '8',
      cursor:    'default',
    });
    container.appendChild(dog);

    // -- Tourist (animated) - hidden after puzzle 2 solved ------------
    if (!GameState.puzzlesSolved.p2) {
      const tourist = document.createElement('img');
      tourist.src = 'assets/sprites/guyf1.png';
      tourist.id  = 'sprite-tourist';
      Object.assign(tourist.style, {
        position: 'absolute',
        height:   '650px',
        width:    'auto',
        top:      '100px',
        left:     '700px',
        filter:   'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))',
        zIndex:   '9',
        cursor:   'default',     // zone handles clicks, not the img
      });

      this._animateSprite(tourist, [
        'assets/sprites/guyf1.png',
        'assets/sprites/guyf2.png',
      ], 3);

      container.appendChild(tourist);
    }

    // -- Carnival - only after p2 solved, before p3 solved -----------
    if (GameState.puzzlesSolved.p2 && !GameState.puzzlesSolved.p3) {
      this._spawnCarnival(container);
    }

    // -- Invisible click zones - appended after sprites ---------------
    this._setupZones(container);
  },

  // ==================================================================
  // ZONES
  // Receives the already-cleared container from _setupSprites().
  // Does NOT clear container - sprites are already in it.
  // ==================================================================

  _setupZones(container) {
    const makeZone = (id, style, color) => {
      const zone = document.createElement('div');
      zone.id = id;
      Object.assign(zone.style, {
        position:      'absolute',
        cursor:        'pointer',
        pointerEvents: 'auto',
        background:    this.DEBUG ? `rgba(${color},0.3)`           : 'transparent',
        outline:       this.DEBUG ? `2px solid rgba(${color},0.9)` : 'none',
        zIndex:        '20',
        ...style,
      });
      zone.title = '';
      return zone;
    };

    // Tourist zone - tune left/top/width/height after autocrop
    if (!GameState.puzzlesSolved.p2) {
      const z = makeZone('zone-tourist', {
        left:   '770px',
        top:    '380px',
        width:  '180px',
        height: '320px',
      }, '255,165,0');
      z.addEventListener('click', () => this._onTouristClick());
      container.appendChild(z);
    }

    // Dog zone - derived from center (359, 601)
    const dz = makeZone('zone-dog', {
      left:   '460px',
      top:    '510px',
      width:  '80px',
      height: '80px',
    }, '0,200,100');
    dz.addEventListener('click', () => this._onDogClick());
    container.appendChild(dz);
  },

  // ==================================================================
  // CARNIVAL
  // Called by _setupSprites() or onPigeonsSolved()
  // ==================================================================

  _spawnCarnival(container) {
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

  // ==================================================================
  // HINT COINS - #scene-hotspots only
  // ==================================================================

  _setupHotspots() {
    const container = document.getElementById('scene-hotspots');
    container.innerHTML = '';

    const coins = [
      { id: 'scene2-coin1', style: { top: '262px', left: '334px' } },
      { id: 'scene2-coin2', style: { top: '41px',  left: '510px' } },
      { id: 'scene2-coin3', style: { top: '63px',  left: '890px' } },
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

  // ==================================================================
  // SPRITE FRAME CYCLER
  // ==================================================================

  _animateSprite(imgEl, frames, fps = 3) {
    let current = 0;
    const timer = setInterval(() => {
      current   = (current + 1) % frames.length;
      imgEl.src = frames[current];
    }, 1000 / fps);
    imgEl._animTimer = timer;
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
  // EXCLAMATION MARK
  // ==================================================================

  _showExclamation(onComplete) {
    const el = document.createElement('div');
    el.id = 'exclamation-mark-sm';
    Object.assign(el.style, {
      position:       'absolute',
      left:           '820px',
      top:            '415px',
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
              gsap.to(el, {
                y: -5, duration: 0.35, repeat: 2,
                yoyo: true, ease: 'sine.inOut',
              });
              gsap.to(el, {
                y: -22, opacity: 0, duration: 0.35,
                delay: 0.9, ease: 'power1.in',
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

  _onTouristClick() {
    if (GameState.puzzlesSolved.p2) return;

    this._showExclamation(() => {
      DialogueEngine.start([
        { character: 'Tourist',
          portrait: 'guy', side: 'left',
          text: 'Help! I dropped my piece of focaccia and they are swarming me!' },
        { character: 'Dasha',
          portrait: 'dasha', side: 'right',
          text: 'Please calm down, sir. How can we assist you?' },
        { character: 'Tourist',
          portrait: 'guy', side: 'left',
          text: 'I love this place, but these pigeons are just too much! I want to leave right before the whole piazza gets crowded by them, but I need to figure out exactly when that will happen!' },
        { character: 'Gabriel',
          portrait: 'gabriel', side: 'right',
          text: 'You know, this exact situation reminds me of a puzzle...' },
      ], () => Puzzle2Pigeons.open());
    });
  },

  _onDogClick() {
    DialogueEngine.start([
      { character: 'Gabriel',
        portrait: 'gabriel', side: 'right',
        text: 'Aww what a cutiieeeeee. Look at him!' },
      { character: 'Dasha',
        portrait: 'dasha', side: 'right',
        text: 'I have to say that I may like this city... They even have dog detectives... He is investigating the piazza!' },
      { character: 'Gabriel',
        portrait: 'gabriel', side: 'right',
        text: 'I think he lost focus because of all these pigeons haha' },
      { character: 'Dog',
        side: 'left',
        text: 'rawf! *fakin pigey*, probably' },
    ], () => { });
  },

  _onCarnivalClick() {
    if (GameState.puzzlesSolved.p3) return;

    DialogueEngine.start([
      { character: '???',
        portrait: 'carnival', side: 'left',
        text: 'Brava, Detectives. Most impressive.' },
      { character: 'Dasha',
        portrait: 'dasha', side: 'right',
        text: 'Who are you?' },
      { character: '???',
        portrait: 'carnival', side: 'left',
        text: 'A friend. I have been watching your deductions with great interest.' },
      { character: '???',
        portrait: 'carnival', side: 'left',
        text: 'Consider this a gift. It will show you exactly where your next adventure begins.' },
      { character: 'Gabriel',
        portrait: 'gabriel', side: 'right',
        text: 'A... map?' },
      { character: '???',
        portrait: 'carnival', side: 'left',
        text: 'Buona fortuna, Ispettore.' },
    ], () => Puzzle3Map.open());
  },

  // ==================================================================
  // PUZZLE CALLBACKS
  // ==================================================================

  onPigeonsSolved() {
    SceneManager.goTo(
      'screen-scene',
      () => {
        DialogueEngine.start([
          { character: 'Tourist',
            portrait: 'guy', side: 'left',
            text: '11:59... Oh Shit! I have to go!!!! Thaaaaaank yooouuuuu' },
          { character: 'Dasha',
            portrait: 'dasha', side: 'right',
            text: 'Look at him go hehe' },
          { character: 'Gabriel',
            portrait: 'gabriel', side: 'right',
            text: 'Inspector, someone is getting close to us, watch out!' },
        ], () => {
          GameState.puzzlesSolved.p2 = true;

          // Kill animation and remove tourist sprite
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

          // Spawn carnival
          const container = document.getElementById('scene-sprites');
          this._spawnCarnival(container);
        });
      },
      'assets/backgrounds/smbg.png'
    );
  },

  onMapSolved() {
    DialogueEngine.start([
      { character: 'Dasha',
        portrait: 'dasha', side: 'right',
        text: "Mestre. Of course, just across the Ponte della Libertà. Let's jump on the train!" },
    ], () => this._trainTransition());
  },

  // ==================================================================
  // TRAIN TRANSITION
  // ==================================================================

  _trainTransition() {
    SceneManager.goTo(
      'screen-scene',
      () => {
        document.getElementById('scene-sprites').innerHTML  = '';
        document.getElementById('scene-hotspots').innerHTML = '';
        gsap.to('#scene-location-tag', { opacity: 0, duration: 0.3 });

        const trainSrc = 'assets/backgrounds/transition-train.png';
        const img      = new Image();

        img.onload = img.onerror = () => {
          const bgEl = document.getElementById('scene-background');
          gsap.to(bgEl, {
            opacity: 0, duration: 0.45,
            onComplete: () => {
              bgEl.src = trainSrc;
              gsap.to(bgEl, {
                opacity: 1, duration: 0.6,
                onComplete: () => {
                  this._showLocationTag('Venice to Mestre - On the Train');
                  setTimeout(() => {
                    DialogueEngine.start([
                      { character: 'Gabriel',
                        portrait: 'gabriel', side: 'right',
                        text: 'I still cannot believe we are working on your birthday trip.' },
                      { character: 'Dasha',
                        portrait: 'dasha', side: 'right',
                        text: 'We are not working. We are having an adventure. There is a difference.' },
                      { character: 'Gabriel',
                        portrait: 'gabriel', side: 'right',
                        text: 'Of course, Inspector.' },
                    ], () => this._mestreArrival());
                  }, 800);
                },
              });
            },
          });
        };
        img.src = trainSrc;
      }
    );
  },

  // ── Mestre street — Gabriel spots something, leads to the restaurant ──
  _mestreArrival() {
    const bgEl     = document.getElementById('scene-background');
    const streetSrc = 'assets/backgrounds/mestre-street.png'; // ← rename to your actual asset

    const img = new Image();
    img.onload = img.onerror = () => {
      gsap.to(bgEl, {
        opacity: 0, duration: 0.45,
        onComplete: () => {
          bgEl.src = streetSrc;
          bgEl.classList.add('bg-center-full');
          gsap.to(bgEl, {
            opacity: 1, duration: 0.6,
            onComplete: () => {
              setTimeout(() => {
                DialogueEngine.start([
                  { character: 'Gabriel',
                    portrait: 'gabriel', side: 'right',
                    text: 'Inspector, I saw something, follow me!' },
                ], () => Scene3Restaurant.init());
              }, 400);
            },
          });
        },
      });
    };
    img.src = streetSrc;
  },
};