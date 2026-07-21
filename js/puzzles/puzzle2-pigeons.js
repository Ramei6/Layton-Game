/**
 * Puzzle 2 — The Pigeon Hour
 *
 * The square fills completely with pigeons at 12:00.
 * The population doubles every minute.
 * At what time is the square HALF full?
 * Answer: 11:59
 */
const Puzzle2Pigeons = {

  _selected: null,
  _hintUsed: 0,

  open() {
    this._selected = null;
    this._hintUsed = 0;

    PuzzleShell.open({
      id: 'p2',
      number: '02',
      title: "The Pigeon's Hour",
      layout: 'fullscreen',
      description: '',
      hints: [
        "If the square doubles every minute, think backwards from 12:00.",
        "Half of the full square is exactly one doubling-step before full. Work backwards from 12:00 by one minute.",
      ],
      init:          (container) => this._render(container),
      checkSolution: ()          => this._selected === '11:59',
      onSolve:       ()          => Scene2StMarco.onPigeonsSolved(),
    });
  },

  _render(container) {
    this._selected = null;
    this._hintUsed = 0;

    const options = ['11:00', '11:30', '11:45', '11:59'];

    container.innerHTML = `
      <style>
        #p2-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
          background: #13233d;
        }

        #p2-left {
          position: relative;
          width: 960px;
          flex-shrink: 0;
          height: 100%;
          overflow: hidden;
          background: #1a3050;
        }

        #p2-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          pointer-events: none;
        }

        #p2-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(5, 10, 24, 0.25), rgba(5, 10, 24, 0.65));
          pointer-events: none;
        }

        #p2-topbar {
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

        #p2-topbar > * { pointer-events: auto; }

        .p2-btn {
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

        .p2-btn:active { transform: scale(0.95); }

        .p2-btn-teal   { background-color: #559eab; }
        .p2-btn-orange { background-color: #e67e22; }

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

        .p2-hint-tracker {
          display: flex;
          gap: 4px;
        }

        .p2-hint-box {
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

        .p2-hint-box-available { background-color: #a8d5cf; }
        .p2-hint-box-used      { background-color: #f4ead5; }

        #p2-visual {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 78px;
          letter-spacing: 10px;
          line-height: 1.1;
          text-align: center;
          color: #f5e8cc;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.55);
          z-index: 10;
        }

        #p2-sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        #p2-sidebar-header {
          flex-shrink: 0;
          background: #130e04;
          border-bottom: 3px solid #7a500a;
          padding: 16px 20px;
        }

        #p2-sidebar-number {
          font-size: 12px;
          color: rgba(200, 160, 32, 0.65);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        #p2-sidebar-title {
          font-family: 'Playfair Display', 'Palatino Linotype', serif;
          font-style: italic;
          font-size: 20px;
          color: #f0d060;
          line-height: 1.3;
        }

        #p2-sidebar-body {
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

        #p2-rules {
          color: #1a0e04;
          font-size: 15px;
          line-height: 1.8;
        }

        #p2-rules strong { color: #5a1a04; }

        #p2-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .p2-opt {
          position: relative;
          width: 100%;
          padding: 12px 16px;
          border: 4px solid #000000;
          background-color: #e67e22;
          color: #f4ead5;
          font-size: 0.82rem;
          text-align: center;
          cursor: pointer;
          font-family: 'Press Start 2P', monospace;
          letter-spacing: 1px;
          transition: transform 0.1s;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
        }

        .p2-opt:active { transform: scale(0.97); }
        .p2-opt:hover { transform: translateY(-2px); }
        .p2-opt.chosen {
          background-color: #559eab;
          color: #f4ead5;
        }

        .p2-opt .btn-text {
          position: relative;
          color: #f4ead5;
          z-index: 1;
          display: inline-block;
          line-height: 1.2;
          text-shadow: none;
        }

        .p2-opt .btn-text::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          z-index: -1;
          -webkit-text-stroke: 5px #000000;
        }

        #p2-hint-area {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }

        #p2-hint-text {
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

      <div id="p2-wrapper">
        <div id="p2-left">
          <img id="p2-bg" src="assets/ui/puzzle2bg.png" alt="">
          <div id="p2-overlay"></div>
          <div id="p2-topbar">
            <button id="p2-btn-restart" class="p2-btn p2-btn-teal">
              <span class="btn-text" data-text="RESTART">RESTART</span>
            </button>

            <div style="display:flex; gap:10px; align-items:center;">
              <button id="p2-btn-hints" class="p2-btn p2-btn-orange">
                <span class="btn-text" data-text="HINTS">HINTS</span>
                <div class="p2-hint-tracker" id="p2-hint-tracker">
                  <span class="p2-hint-box p2-hint-box-available" data-hint="0">1</span>
                  <span class="p2-hint-box p2-hint-box-available" data-hint="1">2</span>
                  <span class="p2-hint-box p2-hint-box-available" data-hint="2">3</span>
                </div>
              </button>

              <button id="p2-btn-quit" class="p2-btn p2-btn-teal">
                <span class="btn-text" data-text="QUIT">QUIT</span>
              </button>
            </div>
          </div>
        </div>

        <div id="p2-sidebar">
          <div id="p2-sidebar-header">
            <div id="p2-sidebar-number">Puzzle 02</div>
            <div id="p2-sidebar-title">The Pigeon's Hour</div>
          </div>

          <div id="p2-sidebar-body">
            <div id="p2-rules">
              <p>Every day, pigeons arrive at <strong>Piazza San Marco</strong>.</p>
              <p>Each pigeon brings a friend exactly one minute later, and the flock doubles every minute.</p>
              <p>At <strong>12:00</strong>, the square is completely full. When should the tourist leave if he wants to flee when the square is only <strong>half full</strong>?</p>
            </div>

            <div id="p2-options">
              ${options.map(o => `<button class="p2-btn p2-btn-orange p2-opt" data-val="${o}"><span class="btn-text" data-text="${o}">${o}</span></button>`).join('')}
            </div>

            <div id="p2-hint-area">
              <div id="p2-hint-text">Use your hint coins carefully — each hint reveals the next step.</div>
              <button id="p2-submit-btn" class="p2-btn p2-btn-teal"><span class="btn-text" data-text="SUBMIT">SUBMIT</span></button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.p2-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.p2-opt').forEach(b => b.classList.remove('chosen'));
        btn.classList.add('chosen');
        this._selected = btn.dataset.val;
      });
    });

    container.querySelector('#p2-btn-restart').addEventListener('click', () => {
      this._selected = null;
      this._hintUsed = 0;
      container.querySelectorAll('.p2-opt').forEach(b => b.classList.remove('chosen'));
      container.querySelector('#p2-hint-tracker').querySelectorAll('.p2-hint-box').forEach((box, index) => {
        box.classList.remove('p2-hint-box-used');
        box.classList.add('p2-hint-box-available');
      });
    });

    container.querySelector('#p2-btn-quit').addEventListener('click', () => {
      Scene2StMarco.init();
    });

    container.querySelector('#p2-btn-hints').addEventListener('click', () => {
      if (this._hintUsed >= 3) return;
      if (!GameState.spendHintCoin()) return;
      const hintText = container.querySelector('#p2-hint-text');
      hintText.textContent = this._hintUsed === 0
        ? 'Think backwards from 12:00. If the flock doubles each minute, the half-full point is one minute earlier.'
        : 'The square is half full exactly one step before it becomes completely full.';
      const box = container.querySelector(`[data-hint="${this._hintUsed}"]`);
      if (box) {
        box.classList.remove('p2-hint-box-available');
        box.classList.add('p2-hint-box-used');
      }
      this._hintUsed++;
    });

    container.querySelector('#p2-submit-btn').addEventListener('click', () => {
      PuzzleShell.triggerSubmit();
    });
  },
};