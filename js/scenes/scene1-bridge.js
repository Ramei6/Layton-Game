const Scene1Bridge = {

  init() {
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupZones();
        this._setupHotspots();
        this._showLocationTag('Venice — Day 1');
      },
      'assets/backgrounds/scene1-venice-bridge.jpg'
    );
  },

  _setupZones() {
    const container = document.getElementById('scene-sprites');
    container.innerHTML = '';

    const DEBUG = false;

    const makeZone = (id, style, color) => {
      const zone = document.createElement('div');
      zone.id = id;
      Object.assign(zone.style, {
        position:      'absolute',
        cursor:        'pointer',
        pointerEvents: 'auto',
        background:    DEBUG ? `rgba(${color},0.35)` : 'transparent',
        outline:       DEBUG ? `2px solid rgba(${color},0.9)` : 'none',
        ...style,
      });
      zone.title = '';
      return zone;
    };

    // ── Grandma zone ────────────────────────────────────────────────
    if (!GameState.puzzlesSolved.p1) {
      const z = makeZone('zone-grandma', {
        left: '550px', top: '220px', width: '95px', height: '195px',
      }, '255,0,0');
      z.addEventListener('click', () => this._onGrandmaClick());
      container.appendChild(z);
    }

    // ── Kids zone ───────────────────────────────────────────────────
    if (!GameState.puzzlesSolved.p1) {
      const z = makeZone('zone-kids', {
        left: '845px', top: '295px', width: '195px', height: '175px',
      }, '255,0,0');
      z.addEventListener('click', () => this._onKidsClick());
      container.appendChild(z);
    }

    // ── Gondola zone ────────────────────────────────────────────────
    const gz = makeZone('zone-gondola', {
      left:   '810px',
      top:    '205px',
      width:  '190px',
      height: '115px',
      cursor: GameState.gondolaUnlocked ? 'pointer' : 'default',
    }, '0,100,255');
    gz.addEventListener('click', () => {
      GameState.gondolaUnlocked
        ? this._onGondolaClick()
        : this._onGondolaLocked();
    });
    container.appendChild(gz);
  },

  _setupHotspots() {
    const container = document.getElementById('scene-hotspots');
    container.innerHTML = '';

    const coins = [
      { id: 'scene1-coin1', style: { top: '175px', left: '715px' } },
      { id: 'scene1-coin2', style: { top: '130px', left: '20px'  } },
      { id: 'scene1-coin3', style: { top: '50px',  left: '1050px'} },
    ];

    coins.forEach(({ id, style }) => {
      if (GameState.collectedCoins.scene1.has(id)) return;

      const coin = document.createElement('div');
      Object.assign(coin.style, {
        position:      'absolute',
        width:         '44px',
        height:        '44px',
        cursor:        'default',
        opacity:       '0',
        pointerEvents: 'auto',
        zIndex:        '5',
        ...style,
      });
      coin.title = '';

      coin.addEventListener('click', (e) => {
        e.stopPropagation();
        GameState.collectedCoins.scene1.add(id);
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

  // ── Exclamation mark animation ────────────────────────────────────
  // Appears above a position, holds briefly, fades out, then fires onComplete

  _showExclamation(onComplete) {
    const el = document.createElement('div');
    el.id = 'exclamation-mark';

    // Position above grandma's head
    // Grandma zone: left 550, width 95 → center ≈ 597
    // Grandma zone: top 220 → exclamation sits ~55px above that
    Object.assign(el.style, {
      position:       'absolute',
      left:           '579px',
      top:            '158px',
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

    // Animate: pop in → hold → float up and fade out → callback
    gsap.fromTo(el,
      { scale: 0, opacity: 0 },
      {
        scale: 1.2, opacity: 1, duration: 0.22, ease: 'back.out(2.5)',
        onComplete: () => {
          gsap.to(el, {
            scale: 1, duration: 0.1,
            onComplete: () => {
              // Subtle bounce loop while holding
              gsap.to(el, { y: -5, duration: 0.35, repeat: 2, yoyo: true, ease: 'sine.inOut' });
              // After hold, float up and vanish
              gsap.to(el, {
                y: -22, opacity: 0, duration: 0.35, delay: 0.9, ease: 'power1.in',
                onComplete: () => {
                  el.remove();
                  if (onComplete) onComplete();
                },
              });
            },
          });
        },
      }
    );
  },

  // ── Click handlers ─────────────────────────────────────────────────

  // Kids: short dialogue only, no puzzle trigger
  _onKidsClick() {
    if (GameState.puzzlesSolved.p1) return;

    DialogueEngine.start([
      { character: 'Child', side: 'left',
        text: 'We want to go to the other side but the bridge is closed...' },
      { character: 'Child', side: 'left',
        text: 'Please help our grandma to find a solution!' },
    ], () => { /* returns to scene, nothing else */ });
  },

  // Grandma: exclamation → full dialogue → puzzle
  _onGrandmaClick() {
    if (GameState.puzzlesSolved.p1) return;

    // Show exclamation mark first, then start dialogue
    this._showExclamation(() => {
      DialogueEngine.start([
        { character: 'Signora Rossi',      portrait: 'lady',    side: 'left',
          text: 'Oh! Signori, per favore — could you help us?' },
        { character: 'Dasha',    portrait: 'dasha',   side: 'right',
          text: 'Good afternoon. What seems to be the trouble?' },
        { character: 'Signora Rossi',      portrait: 'lady',    side: 'left',
          text: 'This bridge! It is closed for repairs. Could you help? We have been stuck for half an hour...' },
        { character: 'Child',     side: 'left',
          text: 'We want to get ice cream with Nonna! It is just on the other side!' },
        { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
          text: 'Let us help them! It looks like this gondola can take two people at a time.' },
        { character: 'Signora Rossi',      portrait: 'lady',    side: 'left',
          text: 'But these little ragazzi always bring trouble. Between themselves they play and stay calm...' },
        { character: 'Signora Rossi',      portrait: 'lady',    side: 'left',
          text: 'But...' },
        { character: 'Signora Rossi',      portrait: 'lady',    side: 'left',
          text: 'As soon as there is an adult with them, they fight for attention — unless they all have someone looking over them individually.' },
        { character: 'Dasha',    portrait: 'dasha',   side: 'right',
          text: 'I see! Gabriel, there is a clear solution to this problem!' },
      ], () => {
        Puzzle1Crossing.open();
      });
    });
  },

  _onGondolaLocked() {
    gsap.to('#screen-scene', {
      x: 4, duration: 0.07, repeat: 3, yoyo: true, ease: 'none',
      onComplete: () => gsap.set('#screen-scene', { x: 0 }),
    });
  },

  _onGondolaClick() {
    Scene2StMarco.init();
  },

  // ── Called by Puzzle 1 on solve ────────────────────────────────────

  onPuzzleSolved() {
    GameState.gondolaUnlocked = true;

    // Return to scene FIRST, then set up zones and start dialogue
    SceneManager.goTo(
      'screen-scene',
      () => {
        this._setupZones();
        this._setupHotspots();
        this._showLocationTag('Venice — Day 1');

        DialogueEngine.start([
          { character: 'Signora Rossi',   portrait: 'lady',  side: 'left',
            text: 'Mille grazie! You truly are remarkable detectives!' },
          { character: 'Dasha', portrait: 'dasha', side: 'right',
            text: 'Glad we could help. Enjoy the rest of your day, Signora.' },
          { character: 'Signora Rossi',   portrait: 'lady',  side: 'left',
            text: "Let's take the gondola now! Buona fortuna, my dears!" },
        ], () => {
          // Pulse gondola zone to draw attention after dialogue ends
          gsap.to('#zone-gondola', {
            opacity: 0.4, duration: 0.4, repeat: 5, yoyo: true,
            onComplete: () => gsap.set('#zone-gondola', { opacity: 0 }),
          });
        });
      },
      'assets/backgrounds/scene1-venice-bridge.jpg'
    );
  },
};