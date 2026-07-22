/**
 * Puzzle 4: La Ricetta Sacra (The Sacred Recipe)
 *
 * 6 ingredient layers, randomised on open. Click one to select (highlight),
 * click another to swap positions. Correct order (bottom of dish → top):
 *   focaccia, tomato_sauce, mozzarella, prosciutto, basil, olive_oil
 *
 * Display is REVERSED — top of screen = top of the dish, so the visual
 * stack reads top-to-bottom as: olive_oil, basil, prosciutto, mozzarella,
 * tomato_sauce, focaccia.
 *
 * Solvable from the clues alone — hints are optional scaffolding.
 */
const Puzzle4Recipe = {

  INGREDIENTS: {
    focaccia:     { label: '🍞 Focaccia',            color: '#d8b06a' },
    tomato_sauce: { label: '🍅 Salsa di Pomodoro',   color: '#b5432f' },
    mozzarella:   { label: '🧀 Mozzarella',          color: '#f3ecd4' },
    prosciutto:   { label: '🥩 Prosciutto',          color: '#d98b8b' },
    basil:        { label: '🌿 Basilico',            color: '#4f7a3d' },
    olive_oil:    { label: "🫒 Olio d'Oliva",        color: '#8a9a3d' },
  },

  // index 0 = bottom of dish, index 5 = top
  CORRECT_ORDER: ['focaccia', 'tomato_sauce', 'mozzarella', 'prosciutto', 'basil', 'olive_oil'],

  CLUES: [
    'La focaccia va sul fondo.',
    'La salsa di pomodoro copre la base.',
    'La mozzarella riposa tra la salsa e il prosciutto.',
    'Il prosciutto non è sopra il basilico.',
    'Il basilico corona il tutto.',
    "L'olio d'oliva è l'ultimo tocco.",
  ],

  HINTS: [
    'Start with certainties: focaccia is the bottom layer, olive oil is the top.',
    "Tomato sauce 'covers the base' — it sits directly above the focaccia.",
    'Mozzarella sits between the tomato sauce and the prosciutto. Basil is second from the top.',
  ],

  _order:      [], // top-of-screen → bottom-of-screen, i.e. reversed CORRECT_ORDER when solved
  _selected:   null,
  _hintsUsed:  0,
  _animating:  false,

  open() {
    PuzzleShell.open({
      id:            'p4',
      number:        '04',
      title:         'La Ricetta Sacra',
      layout:        'fullscreen',
      description:   '',
      hints:         [],
      init:          (container) => this._render(container),
      checkSolution: ()          => this._checkWin(),
      onSolve:       ()          => Scene3Restaurant.onRecipeSolved(),
    });
  },

  _render(container) {
    this._resetState();

    container.innerHTML = `
      <style>
        #p4-wrapper { display:flex; width:100%; height:100%; }

        #p4-left {
          position:relative; width:960px; flex-shrink:0; height:100%;
          overflow:hidden; background:#241407;
        }
        #p4-bg {
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; object-position:center center; pointer-events:none;
          opacity:0.55;
        }
        #p4-scene-overlay {
          position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(20,10,4,0.35), rgba(20,10,4,0.75));
          pointer-events:none;
        }

        #p4-topbar {
          position:absolute; top:12px; left:12px; right:12px;
          display:flex; align-items:center; justify-content:space-between;
          z-index:30; pointer-events:none;
        }
        #p4-topbar > * { pointer-events:auto; }

        .p4-btn {
          position:relative; border:4px solid #000; padding:10px 14px;
          cursor:pointer; font-family:'Press Start 2P', monospace; font-size:0.7rem;
          outline:none; box-shadow:none; display:flex; align-items:center;
          justify-content:center; gap:10px; transition:transform 0.1s; letter-spacing:1px;
        }
        .p4-btn:active { transform:scale(0.95); }
        .p4-btn-teal   { background-color:#559eab; }
        .p4-btn-orange { background-color:#e67e22; }

        .p4-btn .btn-text {
          position:relative; color:#f4ead5; z-index:1; display:inline-block; line-height:1.2;
        }
        .p4-btn .btn-text::before {
          content:attr(data-text); position:absolute; left:0; top:0; z-index:-1;
          -webkit-text-stroke:5px #000;
        }

        .p4-hint-tracker { display:flex; gap:4px; }
        .p4-hint-box {
          display:flex; align-items:center; justify-content:center;
          width:22px; height:26px; border:3px solid #000;
          font-family:'Press Start 2P', monospace; font-size:0.65rem; color:#000; padding-top:2px;
        }
        .p4-hint-box-available { background-color:#a8d5cf; }
        .p4-hint-box-used      { background-color:#f4ead5; }

        /* ── The dish stack ─────────────────────────────────────────── */
        #p4-plate-shell {
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:14px;
          padding:100px 60px 60px; z-index:10;
        }

        #p4-plate-label {
          font-family:'Press Start 2P', monospace; font-size:0.7rem;
          color:#f0d060; text-align:center; letter-spacing:1px; margin-bottom:4px;
        }

        #p4-stack {
          width:100%; max-width:560px;
          display:flex; flex-direction:column; gap:8px;
        }

        .p4-layer {
          position:relative;
          display:flex; align-items:center; justify-content:center;
          height:64px; border:4px solid #000; border-radius:8px;
          font-family:'Press Start 2P', monospace; font-size:0.72rem;
          color:#241407; cursor:pointer; user-select:none;
          box-shadow:0 4px 0 rgba(0,0,0,0.35);
          transition:transform 0.12s, box-shadow 0.12s;
        }
        .p4-layer:hover { transform:translateY(-3px); }
        .p4-layer.selected {
          outline:4px solid #f0d060; outline-offset:2px;
          transform:translateY(-5px) scale(1.02);
          box-shadow:0 8px 0 rgba(0,0,0,0.4);
        }

        #p4-status {
          font-family:'Press Start 2P', monospace; font-size:0.6rem;
          color:#f5e8cc; text-align:center; min-height:18px; letter-spacing:0.5px;
        }

        /* ── Sidebar (parchment, matches other puzzles) ───────────────── */
        #p4-sidebar { flex:1; display:flex; flex-direction:column; height:100%; overflow:hidden; }

        #p4-sidebar-header {
          flex-shrink:0; background:#130e04; border-bottom:3px solid #7a500a; padding:16px 20px;
        }
        #p4-sidebar-number {
          font-size:12px; color:rgba(200,160,32,0.65); letter-spacing:3px;
          text-transform:uppercase; margin-bottom:4px;
        }
        #p4-sidebar-title {
          font-family:'Playfair Display','Palatino Linotype',serif; font-style:italic;
          font-size:20px; color:#f0d060; line-height:1.3;
        }

        #p4-sidebar-body {
          flex:1; overflow-y:auto; padding:22px 20px;
          background:
            radial-gradient(ellipse at 12% 15%, rgba(255,248,200,0.45) 0%, transparent 55%),
            linear-gradient(170deg, #f6e9b5 0%, #eed89a 35%, #f1e3ac 65%, #e8d492 100%);
          border-right:3px solid #7a500a;
          display:flex; flex-direction:column; gap:16px;
        }
        #p4-sidebar-body::-webkit-scrollbar { width:4px; }
        #p4-sidebar-body::-webkit-scrollbar-thumb { background:rgba(122,80,10,0.4); border-radius:2px; }

        #p4-clues-title {
          font-size:13px; letter-spacing:2px; text-transform:uppercase;
          color:#5a1a04; border-bottom:1px solid rgba(122,80,10,0.3); padding-bottom:6px;
        }
        #p4-clues {
          display:flex; flex-direction:column; gap:8px; padding-top:2px;
        }
        .p4-clue {
          font-size:14px; line-height:1.55; color:#1a0e04; font-style:italic;
          padding-left:14px; position:relative;
        }
        .p4-clue::before { content:'•'; position:absolute; left:0; color:#7a500a; }

        #p4-hint-area {
          display:flex; flex-direction:column; gap:10px; margin-top:auto;
        }
        #p4-hint-text {
          background:rgba(0,50,0,0.10); border:1px solid rgba(58,106,58,0.4);
          border-radius:8px; padding:12px 14px; color:#2a4a2a; font-size:13px;
          line-height:1.6; display:none;
        }

        #p4-sidebar-footer {
          flex-shrink:0; padding:16px 20px; background:#130e04;
          border-top:3px solid #7a500a; border-right:3px solid #7a500a;
        }
        #p4-submit {
          width:100%; padding:13px 0; background:#c8a020; color:#130e04; border:none;
          border-radius:8px; font-size:16px; font-weight:bold; font-family:inherit;
          letter-spacing:2px; cursor:pointer; transition:background 0.15s, transform 0.1s;
        }
        #p4-submit:hover  { background:#f0d060; }
        #p4-submit:active { transform:scale(0.97); }
      </style>

      <div id="p4-wrapper">

        <div id="p4-left">
          <img id="p4-bg" src="assets/backgrounds/puzzle4bg.png" alt="">
          <div id="p4-scene-overlay"></div>

          <div id="p4-topbar">
            <button id="p4-btn-restart" class="p4-btn p4-btn-teal">
              <span class="btn-text" data-text="RESTART">RESTART</span>
            </button>
            <div style="display:flex; gap:10px; align-items:center;">
              <button id="p4-btn-hints" class="p4-btn p4-btn-orange">
                <span class="btn-text" data-text="HINTS">HINTS</span>
                <div class="p4-hint-tracker" id="p4-hint-tracker">
                  <span class="p4-hint-box p4-hint-box-available" data-hint="0">1</span>
                  <span class="p4-hint-box p4-hint-box-available" data-hint="1">2</span>
                  <span class="p4-hint-box p4-hint-box-available" data-hint="2">3</span>
                </div>
              </button>
              <button id="p4-btn-quit" class="p4-btn p4-btn-teal">
                <span class="btn-text" data-text="QUIT">QUIT</span>
              </button>
            </div>
          </div>

          <div id="p4-plate-shell">
            <div id="p4-plate-label">Click one layer, then click another to swap them</div>
            <div id="p4-stack"></div>
            <div id="p4-status">Rebuild the dish from Oberix's scrambled notes.</div>
          </div>
        </div>

        <div id="p4-sidebar">
          <div id="p4-sidebar-header">
            <div id="p4-sidebar-number">Puzzle 04</div>
            <div id="p4-sidebar-title">La Ricetta Sacra</div>
          </div>

          <div id="p4-sidebar-body">
            <div id="p4-clues-title">Oberix's Scattered Notes</div>
            <div id="p4-clues">
              ${this.CLUES.map(c => `<div class="p4-clue">${c}</div>`).join('')}
            </div>

            <div id="p4-hint-area">
              <div id="p4-hint-text"></div>
            </div>
          </div>

          <div id="p4-sidebar-footer">
            <button id="p4-submit">Submit Answer</button>
          </div>
        </div>

      </div>
    `;

    document.getElementById('p4-btn-restart').addEventListener('click', () => {
      if (this._animating) return;
      this._resetState();
      this._renderStack();
      this._setStatus("Reset — Oberix's notes are scrambled again.");
    });

    document.getElementById('p4-btn-quit').addEventListener('click', () => {
      Scene3Restaurant.init();
    });

    document.getElementById('p4-btn-hints').addEventListener('click', () => {
      this._useHint();
    });

    document.getElementById('p4-submit').addEventListener('click', () => {
      PuzzleShell.triggerSubmit();
    });

    this._renderStack();
  },

  _resetState() {
    // Shuffle until it's not already solved, so the puzzle always starts scrambled
    do {
      this._order = this._shuffled(this.CORRECT_ORDER);
    } while (this._order.join() === [...this.CORRECT_ORDER].reverse().join());

    this._selected  = null;
    this._hintsUsed = 0;
    this._animating = false;
  },

  _shuffled(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  _renderStack() {
    const stackEl = document.getElementById('p4-stack');
    if (!stackEl) return;
    stackEl.innerHTML = '';

    this._order.forEach((id) => {
      const ing = this.INGREDIENTS[id];
      const card = document.createElement('div');
      card.className = 'p4-layer';
      card.dataset.id = id;
      card.textContent = ing.label;
      card.style.background = ing.color;
      if (this._selected === id) card.classList.add('selected');

      card.addEventListener('click', () => this._onLayerClick(id));
      stackEl.appendChild(card);
    });
  },

  _onLayerClick(id) {
    if (this._animating) return;

    if (this._selected === null) {
      this._selected = id;
      this._renderStack();
      return;
    }

    if (this._selected === id) {
      this._selected = null;
      this._renderStack();
      return;
    }

    // Swap the two selected ingredients
    const a = this._order.indexOf(this._selected);
    const b = this._order.indexOf(id);
    [this._order[a], this._order[b]] = [this._order[b], this._order[a]];

    this._selected = null;
    this._animating = true;
    this._renderStack();

    gsap.from('#p4-stack .p4-layer', {
      scale: 0.94, duration: 0.18, ease: 'back.out(2)', stagger: 0,
      onComplete: () => { this._animating = false; },
    });

    this._setStatus('');
  },

  _checkWin() {
    // Display is top-to-bottom; CORRECT_ORDER is bottom-to-top, so compare reversed
    const target = [...this.CORRECT_ORDER].reverse();
    return this._order.every((id, i) => id === target[i]);
  },

  _useHint() {
    if (this._hintsUsed >= this.HINTS.length) {
      this._shake('#p4-btn-hints');
      this._setStatus('No more hints available!');
      return;
    }
    if (!GameState.spendHintCoin()) {
      this._shake('#p4-btn-hints');
      this._setStatus('No hint coins! Find them hidden in the scene.');
      return;
    }

    const hintEl = document.getElementById('p4-hint-text');
    hintEl.textContent   = this.HINTS[this._hintsUsed];
    hintEl.style.display = 'block';
    gsap.from(hintEl, { opacity: 0, y: 6, duration: 0.3 });

    const box = document.querySelector(`#p4-hint-tracker [data-hint="${this._hintsUsed}"]`);
    if (box) {
      box.classList.remove('p4-hint-box-available');
      box.classList.add('p4-hint-box-used');
    }
    this._hintsUsed++;
  },

  _setStatus(msg) {
    const el = document.getElementById('p4-status');
    if (el) el.textContent = msg || "Rebuild the dish from Oberix's scrambled notes.";
  },

  _shake(selector) {
    gsap.to(selector, {
      x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: 'none',
      onComplete: () => gsap.set(selector, { x: 0 }),
    });
  },
};