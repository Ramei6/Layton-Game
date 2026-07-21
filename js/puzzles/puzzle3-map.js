/**
 * Puzzle 3: The Carnival's Gift
 *
 * A map of the Venice area. 5 clickable locations.
 * Clues on the left panel point to Mestre using logic and map visuals.
 * Player clicks the correct destination to solve.
 *
 * Map image: assets/ui/map-venice.png
 * Clickable zones are defined as percentage-based areas over the image.
 */
const Puzzle3Map = {

  _selected: null,

  // Zone definitions use frame-relative coordinates, matching the map panel.
  ZONES: [
    { id: 'murano',  label: 'Murano',         cx: 462, cy: 174, w: 64, h: 48 },
    { id: 'burano',  label: 'Burano',         cx: 600, cy: 174, w: 64, h: 48 },
    { id: 'lido',    label: 'Lido di Venezia', cx: 590, cy: 367, w: 64, h: 48 },
    { id: 'mestre',  label: 'Mestre',         cx: 64, cy: 143, w: 64, h: 48 },
    { id: 'venezia', label: 'Venice',         cx: 355, cy: 270, w: 64, h: 48 },
  ],

  open() {
    this._selected = null;
    this._hintUsed = 0;

    PuzzleShell.open({
      id: 'p3',
      number: '03',
      title: "The Carnival's Gift",
      layout: 'fullscreen',
      description: '',
      hints: [
        "Your destination is linked to Venice by a single bridge.",
      ],
      init:          (container) => this._render(container),
      checkSolution: ()          => this._selected === 'mestre',
      onSolve:       ()          => Scene2StMarco.onMapSolved(),
    });
  },

  _render(container) {
    this._selected = null;
    this._hintUsed = 0;

    container.innerHTML = `
      <style>
        #p3-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
          background: #13233d;
        }

        #p3-left {
          position: relative;
          width: 960px;
          flex-shrink: 0;
          height: 100%;
          overflow: hidden;
          background: #1a3050;
        }

        #p3-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          pointer-events: none;
        }

        #p3-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(5, 10, 24, 0.25), rgba(5, 10, 24, 0.65));
          pointer-events: none;
        }

        #p3-topbar {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
          pointer-events: none;
        }

        #p3-topbar > * { pointer-events: auto; }

        .p3-btn {
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

        .p3-btn:active { transform: scale(0.95); }
        .p3-btn-teal   { background-color: #559eab; }
        .p3-btn-orange { background-color: #e67e22; }

        .p3-btn .btn-text {
          position: relative;
          color: #f4ead5;
          z-index: 1;
          display: inline-block;
          line-height: 1.2;
        }

        .p3-btn .btn-text::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          z-index: -1;
          -webkit-text-stroke: 5px #000000;
        }

        .p3-hint-tracker {
          display: flex;
          gap: 4px;
        }

        .p3-hint-box {
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

        .p3-hint-box-available { background-color: #a8d5cf; }
        .p3-hint-box-used      { background-color: #f4ead5; }

        #p3-map-shell {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 90px 40px 40px;
          user-select: none;
        }

        #p3-map-frame {
          position: relative;
          width: 700px;
          height: 500px;
          overflow: hidden;
          background: transparent;
        }

        #p3-map-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          pointer-events: none;
        }

        .p3-map-zone {
          position: absolute;
          border: 2px solid rgba(200,160,32,0);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .p3-map-zone:hover {
          background: rgba(200,160,32,0.18);
          border-color: rgba(200,160,32,0.7);
        }

        .p3-map-zone.selected {
          background: rgba(200,160,32,0.30);
          border-color: #f0d060;
          box-shadow: 0 0 12px rgba(240,208,80,0.5);
        }

        .p3-zone-label {
          background: rgba(10,8,2,0.82);
          color: #f5e8cc;
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 4px;
          pointer-events: none;
          white-space: nowrap;
          border: 1px solid rgba(200,160,32,0.3);
          opacity: 0;
          transition: opacity 0.15s;
        }

        .p3-map-zone:hover .p3-zone-label,
        .p3-map-zone.selected .p3-zone-label {
          opacity: 1;
        }

        .p3-map-zone.selected::before {
          content: '📍';
          position: absolute;
          top: -22px;
          font-size: 18px;
          animation: pin-drop 0.3s ease-out;
        }

        @keyframes pin-drop {
          from { transform: translateY(-10px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }

        #p3-sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        #p3-sidebar-header {
          flex-shrink: 0;
          background: #130e04;
          border-bottom: 3px solid #7a500a;
          padding: 16px 20px;
        }

        #p3-sidebar-number {
          font-size: 12px;
          color: rgba(200, 160, 32, 0.65);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        #p3-sidebar-title {
          font-family: 'Playfair Display', 'Palatino Linotype', serif;
          font-style: italic;
          font-size: 20px;
          color: #f0d060;
          line-height: 1.3;
        }

        #p3-sidebar-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          background:
            radial-gradient(ellipse at 12% 15%, rgba(255,248,200,0.45) 0%, transparent 55%),
            linear-gradient(170deg, #f6e9b5 0%, #eed89a 35%, #f1e3ac 65%, #e8d492 100%);
          border-right: 3px solid #7a500a;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        #p3-rules {
          color: #1a0e04;
          font-size: 15px;
          line-height: 1.8;
        }

        #p3-rules strong { color: #5a1a04; }

        #p3-hint-area {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }

        #p3-hint-text {
          min-height: 44px;
          padding: 10px 12px;
          background: rgba(6, 4, 2, 0.08);
          border: 1px solid rgba(122, 80, 10, 0.25);
          border-radius: 8px;
          color: #3a2806;
          font-size: 13px;
          line-height: 1.6;
        }
      </style>

      <div id="p3-wrapper">
        <div id="p3-left">
          <img id="p3-bg" src="assets/ui/puzzle3bg.png" alt="">
          <div id="p3-overlay"></div>
          <div id="p3-topbar">
            <button id="p3-btn-restart" class="p3-btn p3-btn-teal">
              <span class="btn-text" data-text="RESTART">RESTART</span>
            </button>

            <div style="display:flex; gap:10px; align-items:center;">
              <button id="p3-btn-hints" class="p3-btn p3-btn-orange">
                <span class="btn-text" data-text="HINTS">HINTS</span>
                <div class="p3-hint-tracker" id="p3-hint-tracker">
                  <span class="p3-hint-box p3-hint-box-available" data-hint="0">1</span>
                </div>
              </button>

              <button id="p3-btn-quit" class="p3-btn p3-btn-teal">
                <span class="btn-text" data-text="QUIT">QUIT</span>
              </button>
            </div>
          </div>

          <div id="p3-map-shell">
            <div id="p3-map-frame">
              <img id="p3-map-img" src="assets/ui/map-venice.png" alt="Map of the Venice area">
            </div>
          </div>
        </div>

        <div id="p3-sidebar">
          <div id="p3-sidebar-header">
            <div id="p3-sidebar-number">Puzzle 03</div>
            <div id="p3-sidebar-title">The Carnival's Gift</div>
          </div>

          <div id="p3-sidebar-body">
            <div id="p3-rules">
              <p>The mysterious carnival figure left you the map and a riddle to solve.</p>
              <p><strong>Follow the logic to find your next destination:</strong></p>
              <p>1. Even cats enjoy moving to and from this place.</p>
              <p>2. It is not the most beautiful of its sisters but it's always the first to be looked at.</p>
              <p>3. The biggest bird watches over it.</p>
              <p>Choose the correct location on the map.</p>
            </div>

            <div id="p3-hint-area">
              <div id="p3-hint-text">Use your hint coins carefully... each hint reveals the next step.</div>
              <button id="p3-submit-btn" class="p3-btn p3-btn-teal"><span class="btn-text" data-text="SUBMIT">SUBMIT</span></button>
            </div>
          </div>
        </div>
      </div>
    `;

    const frame = container.querySelector('#p3-map-frame');

    this.ZONES.forEach(zone => {
      const el = document.createElement('div');
      el.className = 'p3-map-zone';
      el.dataset.id = zone.id;

      const left = zone.cx - zone.w / 2;
      const top  = zone.cy - zone.h / 2;

      Object.assign(el.style, {
        left:   left + 'px',
        top:    top + 'px',
        width:  zone.w + 'px',
        height: zone.h + 'px',
      });

      el.innerHTML = `<span class="p3-zone-label">${zone.label}</span>`;

      el.addEventListener('click', () => {
        frame.querySelectorAll('.p3-map-zone').forEach(z => z.classList.remove('selected'));
        el.classList.add('selected');
        this._selected = zone.id;
        gsap.from(el, { scale: 1.15, duration: 0.25, ease: 'back.out(2)' });
      });

      frame.appendChild(el);
    });

    container.querySelector('#p3-btn-restart').addEventListener('click', () => {
      this._selected = null;
      this._hintUsed = 0;
      frame.querySelectorAll('.p3-map-zone').forEach(zoneEl => zoneEl.classList.remove('selected'));
      container.querySelector('#p3-hint-tracker').querySelectorAll('.p3-hint-box').forEach((box) => {
        box.classList.remove('p3-hint-box-used');
        box.classList.add('p3-hint-box-available');
      });
      container.querySelector('#p3-hint-text').textContent = 'Use your hint coins carefully... each hint reveals the next step.';
    });

    container.querySelector('#p3-btn-quit').addEventListener('click', () => {
      Scene2StMarco.init();
    });

    container.querySelector('#p3-btn-hints').addEventListener('click', () => {
      if (this._hintUsed >= 1) return;
      if (!GameState.spendHintCoin()) return;
      const hintText = container.querySelector('#p3-hint-text');
      hintText.textContent = this._hintUsed === 0
        ? 'Your destination is linked to Venice by a single bridge.'
        : 'Look at the top left of the map. The blue water inlets right next to Mestre form the shape of a large bird facing the buildings.';
      const box = container.querySelector(`[data-hint="${this._hintUsed}"]`);
      if (box) {
        box.classList.remove('p3-hint-box-available');
        box.classList.add('p3-hint-box-used');
      }
      this._hintUsed++;
    });

    container.querySelector('#p3-submit-btn').addEventListener('click', () => {
      PuzzleShell.triggerSubmit();
    });
  },
};