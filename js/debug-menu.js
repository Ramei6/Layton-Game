/**
 * DebugMenu — press backtick (`) to toggle.
 * Lets you jump to any scene instantly.
 * DELETE this file (and its script tag) before gifting.
 */
const DebugMenu = {

  _visible: false,

  init() {
    // Build the menu DOM
    const menu = document.createElement('div');
    menu.id = 'debug-menu';
    Object.assign(menu.style, {
      position:        'absolute',
      top:             '50%',
      left:            '50%',
      transform:       'translate(-50%, -50%)',
      zIndex:          '9999',
      background:      'rgba(10, 8, 4, 0.97)',
      border:          '2px solid #c8a020',
      borderRadius:    '12px',
      padding:         '24px 32px',
      display:         'none',
      flexDirection:   'column',
      gap:             '10px',
      minWidth:        '260px',
    });

    const title = document.createElement('div');
    title.textContent = '🛠 Debug — Jump to Scene';
    Object.assign(title.style, {
      color:          '#f0d060',
      fontWeight:     'bold',
      fontSize:       '15px',
      letterSpacing:  '1px',
      marginBottom:   '6px',
      textAlign:      'center',
    });
    menu.appendChild(title);

    const scenes = [
      { label: 'Title Screen',       fn: () => SceneTitle.init()      },
      { label: 'Intro Sequence',     fn: () => SceneIntro.init()      },
      { label: 'Scene 1 — Bridge',   fn: () => Scene1Bridge.init()    },
      { label: 'Scene 2 — St Marco', fn: () => Scene2StMarco.init()   },
      { label: 'Scene 3 — Restaurant', fn: () => Scene3Restaurant.init() },
      { label: 'End Screen',         fn: () => SceneEnd.init()        },
      { label: '— Puzzle 1',         fn: () => Puzzle1Crossing.open() },
      { label: '— Puzzle 2',         fn: () => Puzzle2Pigeons.open()  },
      { label: '— Puzzle 3',         fn: () => Puzzle3Map.open()      },
      { label: '— Puzzle 4',         fn: () => Puzzle4Recipe.open()   },
    ];

    scenes.forEach(({ label, fn }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, {
        background:    label.startsWith('—')
                         ? 'rgba(200,160,32,0.08)'
                         : 'rgba(200,160,32,0.15)',
        border:        '1px solid rgba(200,160,32,0.35)',
        borderRadius:  '6px',
        color:         '#f5e8cc',
        padding:       '9px 16px',
        fontSize:      '14px',
        cursor:        'pointer',
        textAlign:     'left',
        fontFamily:    'inherit',
        transition:    'background 0.15s',
      });
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(200,160,32,0.32)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = label.startsWith('—')
          ? 'rgba(200,160,32,0.08)'
          : 'rgba(200,160,32,0.15)';
      });
      btn.addEventListener('click', () => {
        this.hide();
        fn();
      });
      menu.appendChild(btn);
    });

    const hint = document.createElement('div');
    hint.textContent = 'Press ² to close';
    Object.assign(hint.style, {
      color:      'rgba(255,255,255,0.25)',
      fontSize:   '11px',
      textAlign:  'center',
      marginTop:  '6px',
    });
    menu.appendChild(hint);

    document.getElementById('game-container').appendChild(menu);

    _cooldown: false,

    // Inside the event listener:
    window.addEventListener('keyup', (e) => {
    if (e.key === '²') {
        if (this._cooldown) return;
        this._cooldown = true;
        setTimeout(() => { this._cooldown = false; }, 300);

        this._visible ? this.hide() : this.show();
    }
    if (e.key === 'Escape') this.hide();
    });
  },

  show() {
    this._visible = true;
    const menu = document.getElementById('debug-menu');
    menu.style.display = 'flex';
    gsap.fromTo(menu,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }
    );
  },

  hide() {
    this._visible = false;
    const menu = document.getElementById('debug-menu');
    gsap.to(menu, {
      opacity: 0, scale: 0.92, duration: 0.15, ease: 'power2.in',
      onComplete: () => { menu.style.display = 'none'; },
    });
  },
};