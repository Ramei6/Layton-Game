const Puzzle1Crossing = {

  CHARS: {
    dasha:   { label: 'Dasha',   src: 'assets/sprites/Dasha-icon.png', type: 'adult' },
    gabriel: { label: 'Gabriel', src: 'assets/sprites/gab-icon.png',   type: 'adult' },
    signora: { label: 'Signora', src: 'assets/sprites/oldlady.png',    type: 'adult' },
    kid1:    { label: 'Luca',    src: 'assets/sprites/kids.png',       type: 'kid'   },
    kid2:    { label: 'Sofia',   src: 'assets/sprites/kids.png',       type: 'kid'   },
    kid3:    { label: 'Marco',   src: 'assets/sprites/kids.png',       type: 'kid'   },
  },

  HINTS: [
    "Children alone on a bank with zero adults is perfectly fine — only mixed groups where kids outnumber adults are a problem.",
    "Start by sending two children across. The adults staying on bank A can supervise the remaining child.",
    "At some point you will need to bring an adult back to balance numbers. This is the key move.",
  ],

  // ── Layout — tune these if positions are off ──────────────────────
  LAYOUT: {
    SPRITE_H:        88,
    SPRITE_H_BOAT:   68,
    BOAT_BOTTOM:     70,
    BOAT_LEFT_X:     180,
    BOAT_RIGHT_X:    650,
    BOAT_ROTATE_A:   20,    // ← was -22, now 60 clockwise (bottom goes left)
    BOAT_ROTATE_B:  -20,    // ← was 0, now 20 counter-clockwise (leans left)
  },
  DEBUG_BANKS: false,  // set true to see bank zones as coloured overlays

  _state:      null,
  _moves:      0,
  _animating:  false,
  _hintsUsed:  0,

  // ══════════════════════════════════════════════════════════════════
  // ENTRY POINT
  // ══════════════════════════════════════════════════════════════════

  open() {
    PuzzleShell.open({
      id:            'p1',
      number:        '01',
      title:         'The Gondola Crossing',
      layout:        'fullscreen',          // ← key flag
      // description/hints handled internally in sidebar
      description:   '',
      hints:         [],
      init:          (container) => this._render(container),
      checkSolution: ()          => this._checkWin(),
      onSolve:       ()          => Scene1Bridge.onPuzzleSolved(),
    });
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // Container is now the full #puzzle-right-panel: 1280 × 720 px
  // ══════════════════════════════════════════════════════════════════

  _render(container) {
    this._resetState();

    container.innerHTML = `
      <style>

        /* ── Outer wrapper: scene left + sidebar right ─────────────── */
        #p1-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
        }

        /* ── Left: 960px game scene ────────────────────────────────── */
        #p1-left {
          position: relative;
          width: 960px;
          flex-shrink: 0;
          height: 100%;
          overflow: hidden;
          background: #1a3050;   /* fallback while image loads */
        }

        #p1-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          pointer-events: none;
        }

        /* ── Top chrome ────────────────────────────────────────────── */
        #p1-topbar {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 30;
          pointer-events: none;
        }

        #p1-topbar > * { pointer-events: auto; }

        /* ── Pixel buttons ─────────────────────────────────────── */
        .p1-btn {
          position: relative;
          border: 4px solid #000000;
          padding: 10px 14px;
          cursor: pointer;
          font-family: 'Press Start 2P', monospace;
          font-size: 0.7rem;
          outline: none;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform 0.1s;
          letter-spacing: 1px;
        }

        .p1-btn:active { transform: scale(0.95); }

        .p1-btn-teal   { background-color: #559eab; }
        .p1-btn-orange { background-color: #e67e22; }

        .btn-text {
          position: relative;
          color: #f4ead5;
          z-index: 1;
        }

        .btn-text::before {
          content: attr(data-text);
          position: absolute;
          left: 0; top: 0;
          z-index: -1;
          -webkit-text-stroke: 5px #000000;
        }

        /* Hint tracker boxes */
        .hint-tracker {
          display: flex;
          gap: 4px;
        }

        .hint-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 26px;
          border: 3px solid #000000;
          font-family: 'Press Start 2P', monospace;
          font-size: 0.65rem;
          color: #000000;
          padding-top: 2px;
        }

        .hint-box-available { background-color: #a8d5cf; }  /* teal = available */
        .hint-box-used      { background-color: #f4ead5; }  /* cream = used      */

        #p1-moves-display {
          background: rgba(0, 0, 0, 0.72);
          border: 2px solid #c8a020;
          border-radius: 8px;
          padding: 6px 20px;
          color: #f0d060;
          font-size: 15px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        /* ── Bank zones ─────────────────────────────────────────── */
        #p1-bank-left, #p1-bank-right {
          position: absolute;
          bottom: 60px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          z-index: 10;
        }

        /* Left bank — diagonal staircase matching canal perspective */
        #p1-bank-left {
          left: 10px;
          width: 200px;
          flex-direction: column;          /* stack vertically */
          align-items: flex-start;
          transform: skewY(-10deg);        /* lean left to match cobblestone angle */
          transform-origin: bottom left;
          outline:    ${ this.DEBUG_BANKS ? '2px solid rgba(255,80,0,0.8)'  : 'none' };
          background: ${ this.DEBUG_BANKS ? 'rgba(255,80,0,0.12)'           : 'transparent' };
        }

        /* Counteract the skew on individual characters so faces stay upright */
        #p1-bank-left .p1-char {
          transform: skewY(10deg);
        }

        /* Right bank — straight, flat row from the right edge */
        #p1-bank-right {
          right: 10px;
          width: 200px;
          flex-direction: row;             /* horizontal row */
          flex-wrap: wrap-reverse;
          align-items: flex-end;
          justify-content: flex-end;
          outline:    ${ this.DEBUG_BANKS ? '2px solid rgba(0,100,255,0.8)' : 'none' };
          background: ${ this.DEBUG_BANKS ? 'rgba(0,100,255,0.12)'          : 'transparent' };
        }

        /* ── Character sprites ─────────────────────────────────────── */
        .p1-char {
          height: ${ this.LAYOUT.SPRITE_H }px;
          width: auto;
          cursor: pointer;
          display: block;
          filter: drop-shadow(1px 4px 6px rgba(0,0,0,0.6));
          transition: transform 0.12s, filter 0.12s;
          flex-shrink: 0;
        }
        .p1-char:hover {
          transform: translateY(-6px) scale(1.08);
          filter: drop-shadow(1px 8px 12px rgba(0,0,0,0.75)) brightness(1.12);
        }
        #p1-boat-passengers .p1-char {
          height: ${ this.LAYOUT.SPRITE_H_BOAT }px;
        }

        /* ── Boat ──────────────────────────────────────────────────── */
        #p1-boat-wrap {
          position: absolute;
          bottom: ${ this.LAYOUT.BOAT_BOTTOM }px;
          left: ${ this.LAYOUT.BOAT_LEFT_X }px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          z-index: 15;
          cursor: pointer;
        }

        #p1-boat-passengers {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          min-height: 24px;
        }

        #p1-boat-img {
          width: 160px;
          height: auto;
          display: block;
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.55));
          transition: filter 0.15s;
        }
        #p1-boat-wrap:hover #p1-boat-img {
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.6)) brightness(1.1);
        }

        #p1-boat-label {
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.75);
          text-shadow: 0 1px 4px rgba(0,0,0,0.95);
          pointer-events: none;
        }

        /* ── Status bar ────────────────────────────────────────────── */
        #p1-status {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(6, 4, 2, 0.82);
          border: 1px solid rgba(200,160,32,0.4);
          border-radius: 20px;
          padding: 6px 24px;
          color: #f5e8cc;
          font-size: 13px;
          white-space: nowrap;
          z-index: 30;
          pointer-events: none;
          max-width: 88%;
          text-align: center;
        }

        /* ── Bank invalid flash ────────────────────────────────────── */
        .bank-danger {
          background: rgba(200, 20, 20, 0.22) !important;
          outline: 2px solid rgba(200,20,20,0.8) !important;
          border-radius: 6px;
        }

        /* ════════════════════════════════════════════════════════════
           RIGHT SIDEBAR — 320px parchment panel
        ════════════════════════════════════════════════════════════ */
        #p1-sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* Dark header tab matching dialogue name tab aesthetic */
        #p1-sidebar-header {
          flex-shrink: 0;
          background: #130e04;
          border-bottom: 3px solid #7a500a;
          padding: 16px 20px;
        }

        #p1-sidebar-number {
          font-size: 12px;
          color: rgba(200,160,32,0.65);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        #p1-sidebar-title {
          font-family: 'Playfair Display', 'Palatino Linotype', serif;
          font-style: italic;
          font-size: 20px;
          color: #f0d060;
          line-height: 1.3;
        }

        /* Parchment body — matches dialogue box aesthetic */
        #p1-sidebar-body {
          flex: 1;
          overflow-y: auto;
          padding: 22px 20px;
          background:
            radial-gradient(ellipse at 12% 15%, rgba(255,248,200,0.45) 0%, transparent 55%),
            linear-gradient(170deg, #f6e9b5 0%, #eed89a 35%, #f1e3ac 65%, #e8d492 100%);
          border-right: 3px solid #7a500a;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        #p1-sidebar-body::-webkit-scrollbar { width: 4px; }
        #p1-sidebar-body::-webkit-scrollbar-thumb {
          background: rgba(122,80,10,0.4);
          border-radius: 2px;
        }

        /* Rules text */
        #p1-rules {
          color: #1a0e04;
          font-size: 15px;
          line-height: 1.85;
        }

        #p1-rules strong { color: #5a1a04; }
        #p1-rules em     { font-style: italic; color: #3a2806; }

        /* Instruction list */
        #p1-instructions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 4px;
          border-top: 1px solid rgba(122,80,10,0.3);
        }

        .p1-instr {
          font-size: 13px;
          color: #3a2806;
          line-height: 1.5;
        }
        .p1-instr strong { color: #5a1a04; }

        /* Hint area */
        #p1-hint-area {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }

        #p1-hint-btn {
          width: 100%;
          padding: 10px 0;
          background: #1e3a1e;
          border: 2px solid #3a6a3a;
          border-radius: 8px;
          color: #88d888;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
          letter-spacing: 1px;
        }
        #p1-hint-btn:hover { background: #2a4e2a; }

        #p1-hint-text {
          background: rgba(0,50,0,0.15);
          border: 1px solid rgba(58,106,58,0.5);
          border-radius: 8px;
          padding: 12px 14px;
          color: #2a4a2a;
          font-size: 13px;
          line-height: 1.65;
          display: none;
        }

        /* Sidebar footer — submit button */
        #p1-sidebar-footer {
          flex-shrink: 0;
          padding: 16px 20px;
          background: #130e04;
          border-top: 3px solid #7a500a;
          border-right: 3px solid #7a500a;
        }

        #p1-submit {
          width: 100%;
          padding: 13px 0;
          background: #c8a020;
          color: #130e04;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          font-family: inherit;
          letter-spacing: 2px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        #p1-submit:hover  { background: #f0d060; }
        #p1-submit:active { transform: scale(0.97); }

      </style>

      <div id="p1-wrapper">

        <!-- ── Left: game scene ─────────────────────────────────────── -->
        <div id="p1-left">

          <img id="p1-bg" src="assets/ui/puzzle1bg.png" alt="">

          <div id="p1-topbar">
            <button id="p1-btn-restart" class="p1-btn p1-btn-teal">
              <span class="btn-text" data-text="RESTART">RESTART</span>
            </button>

            <div id="p1-moves-display">
              Moves: <span id="p1-moves-count">0</span>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <button id="p1-btn-hints" class="p1-btn p1-btn-orange">
                <span class="btn-text" data-text="HINTS">HINTS</span>
                <div class="hint-tracker" id="p1-hint-tracker">
                  <span class="hint-box hint-box-available" data-hint="0">1</span>
                  <span class="hint-box hint-box-available" data-hint="1">2</span>
                  <span class="hint-box hint-box-available" data-hint="2">3</span>
                </div>
              </button>

              <button id="p1-btn-quit" class="p1-btn p1-btn-teal">
                <span class="btn-text" data-text="QUIT">QUIT</span>
              </button>
            </div>
          </div>

          <div id="p1-bank-left"></div>
          <div id="p1-bank-right"></div>

          <div id="p1-boat-wrap">
            <div id="p1-boat-passengers"></div>
            <img id="p1-boat-img" src="assets/sprites/gondola2D.png" alt="Gondola">
            <div id="p1-boat-label">CLICK TO CROSS →</div>
          </div>

          <div id="p1-status">Click a character to board the gondola</div>

        </div>

        <!-- ── Right: sidebar ───────────────────────────────────────── -->
        <div id="p1-sidebar">

          <div id="p1-sidebar-header">
            <div id="p1-sidebar-number">Puzzle 01</div>
            <div id="p1-sidebar-title">The Gondola Crossing</div>
          </div>

          <div id="p1-sidebar-body">

            <div id="p1-rules">
              The gondola carries <strong>at most 2</strong> and needs
              <strong>at least 1</strong> to cross.<br><br>
              Children must <em>never outnumber</em> adults on either
              bank — or they will cause chaos!
            </div>

            <div id="p1-instructions">
              <div class="p1-instr"><strong>Click character</strong> → boards gondola</div>
              <div class="p1-instr"><strong>Click gondola</strong> → crosses the canal</div>
              <div class="p1-instr"><strong>Click passenger</strong> → disembarks</div>
            </div>


          <div id="p1-hint-text"></div>
          </div>

          <div id="p1-sidebar-footer">
            <button id="p1-submit">Submit Answer</button>
          </div>

        </div>

      </div>
    `;
    // After innerHTML is set, set initial boat rotation
    gsap.set('#p1-boat-wrap', {
      left:     this.LAYOUT.BOAT_LEFT_X,
      rotation: this.LAYOUT.BOAT_ROTATE_A,   // ← add this
      transformOrigin: 'center bottom',       // ← rotate around the waterline
    });

    // ── Button events ──────────────────────────────────────────────

    document.getElementById('p1-btn-restart').addEventListener('click', () => {
      if (this._animating) return;
      this._resetState();
      this._updateBoatLabel();
      gsap.set('#p1-boat-wrap', { left: this.LAYOUT.BOAT_LEFT_X });
      this._updateScene();
      this._setStatus('Reset — try again!');
    });

    document.getElementById('p1-btn-quit').addEventListener('click', () => {
      Scene1Bridge.init();
    });

    document.getElementById('p1-boat-wrap').addEventListener('click', () => {
      this._cross();
    });

    document.getElementById('p1-submit').addEventListener('click', () => {
      PuzzleShell.triggerSubmit();
    });

    document.getElementById('p1-btn-hints').addEventListener('click', () => {
      this._useHint();
    });

    // ── Initial scene render ───────────────────────────────────────
    this._updateScene();
    this._updateBoatLabel();
  },

  // ══════════════════════════════════════════════════════════════════
  // HINT (handled locally in fullscreen mode)
  // ══════════════════════════════════════════════════════════════════

  _useHint() {
    if (this._hintsUsed >= this.HINTS.length) {
      this._shake('#p1-btn-hints');
      this._setStatus('No more hints available!');
      return;
    }
    if (!GameState.spendHintCoin()) {
      this._shake('#p1-btn-hints');
      this._setStatus('No hint coins! Find them hidden in the scene.');
      return;
    }

    const hintEl = document.getElementById('p1-hint-text');
    hintEl.textContent    = this.HINTS[this._hintsUsed];
    hintEl.style.display  = 'block';
    gsap.from(hintEl, { opacity: 0, y: 6, duration: 0.3 });

    // Mark this hint box as used
    const box = document.querySelector(`[data-hint="${this._hintsUsed}"]`);
    if (box) {
      box.classList.remove('hint-box-available');
      box.classList.add('hint-box-used');
    }

    this._hintsUsed++;
  },

  // ══════════════════════════════════════════════════════════════════
  // SCENE UPDATERS
  // ══════════════════════════════════════════════════════════════════

  _updateScene() {
    this._renderBank('p1-bank-left',  this._state.bankA, 'bankA');
    this._renderBank('p1-bank-right', this._state.bankB, 'bankB');
    this._renderPassengers();
    this._updateMovesDisplay();
  },

  _renderBank(elId, chars, location) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    chars.forEach(id => {
      el.appendChild(this._makeSprite(id, () => this._tokenClick(id, location)));
    });
  },

  _renderPassengers() {
    const el = document.getElementById('p1-boat-passengers');
    if (!el) return;
    el.innerHTML = '';
    this._state.boat.passengers.forEach(id => {
      const img = this._makeSprite(id, () => this._tokenClick(id, 'boat'));
      img.title = `${this.CHARS[id].label} — click to disembark`;
      el.appendChild(img);
    });
  },

  _makeSprite(id, onClick) {
    const img = document.createElement('img');
    img.src       = this.CHARS[id].src;
    img.alt       = this.CHARS[id].label;
    img.title     = this.CHARS[id].label;
    img.className = 'p1-char';
    img.addEventListener('click', onClick);
    return img;
  },

  _updateMovesDisplay() {
    const el = document.getElementById('p1-moves-count');
    if (el) el.textContent = this._moves;
  },

  _updateBoatLabel() {
    const el = document.getElementById('p1-boat-label');
    if (!el) return;
    el.textContent = this._state.boat.side === 'A'
      ? 'CLICK TO CROSS →'
      : '← CLICK TO CROSS';
  },

  // ══════════════════════════════════════════════════════════════════
  // GAME LOGIC — unchanged from original
  // ══════════════════════════════════════════════════════════════════

  _resetState() {
    this._state = {
      bankA: ['dasha', 'gabriel', 'signora', 'kid1', 'kid2', 'kid3'],
      bankB: [],
      boat:  { side: 'A', passengers: [] },
    };
    this._moves     = 0;
    this._animating = false;
    this._hintsUsed = 0;
  },

  _tokenClick(charId, location) {
    if (this._animating) return;

    const { boat }       = this._state;
    const currentBankKey = boat.side === 'A' ? 'bankA' : 'bankB';

    if (location === 'boat') {
      boat.passengers = boat.passengers.filter(c => c !== charId);
      this._state[currentBankKey].push(charId);
      this._updateScene();
      this._setStatus('');

    } else if (location === currentBankKey) {
      if (boat.passengers.length >= 2) {
        this._shake('#p1-boat-wrap');
        this._setStatus('The gondola is full! (max 2)');
        return;
      }
      this._state[currentBankKey] = this._state[currentBankKey].filter(c => c !== charId);
      boat.passengers.push(charId);
      this._updateScene();
      this._setStatus('');

    } else {
      this._setStatus('That character is on the other bank!');
    }
  },

  _cross() {
    if (this._animating) return;

    const { boat } = this._state;

    if (boat.passengers.length === 0) {
      this._shake('#p1-boat-wrap');
      this._setStatus('Someone needs to row!');
      return;
    }

    const fromKey = boat.side === 'A' ? 'bankA' : 'bankB';
    const toKey   = boat.side === 'A' ? 'bankB' : 'bankA';
    const toSide  = boat.side === 'A' ? 'B'     : 'A';

    const newFrom = [...this._state[fromKey]];
    const newTo   = [...this._state[toKey], ...boat.passengers];

    const fromOk = this._isValidBank(newFrom);
    const toOk   = this._isValidBank(newTo);

    if (!fromOk || !toOk) {
      if (!fromOk) this._flashBank('p1-bank-left');
      if (!toOk)   this._flashBank('p1-bank-right');
      this._setStatus('⚠️ The children would be left unguarded!');
      return;
    }

    this._animating        = true;
    this._state[toKey]     = newTo;
    boat.passengers        = [];
    boat.side              = toSide;
    this._moves++;

    const targetX = toSide === 'B'
      ? this.LAYOUT.BOAT_RIGHT_X
      : this.LAYOUT.BOAT_LEFT_X;
    const targetRotation = toSide === 'B' ? this.LAYOUT.BOAT_ROTATE_B : this.LAYOUT.BOAT_ROTATE_A;

    gsap.to('#p1-boat-wrap', {
      left: targetX, duration: 0.75, ease: 'power2.inOut',
      rotation: targetRotation,

      onComplete: () => {
        this._animating = false;
        this._updateScene();
        this._updateBoatLabel();

        if (this._checkWin()) {
          this._setStatus('🎉 Everyone is across!');
          gsap.delayedCall(0.9, () => PuzzleShell.triggerSubmit()); // ← uses public method
        } else {
          this._setStatus(`Crossed to bank ${toSide}. Who rows back?`);
        }
      },
    });
  },

  _isValidBank(chars) {
    const adults = chars.filter(c => ['dasha', 'gabriel', 'signora'].includes(c)).length;
    const kids   = chars.filter(c => c.startsWith('kid')).length;
    return !(adults > 0 && kids > adults);
  },

  _checkWin() {
    return this._state.bankB.length === 6 && this._state.boat.passengers.length === 0;
  },

  _setStatus(msg) {
    const el = document.getElementById('p1-status');
    if (el) el.textContent = msg || 'Click a character to board the gondola';
  },

  _flashBank(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.classList.add('bank-danger');
    setTimeout(() => el.classList.remove('bank-danger'), 700);
  },

  _shake(selector) {
    gsap.to(selector, {
      x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: 'none',
      onComplete: () => gsap.set(selector, { x: 0 }),
    });
  },
};