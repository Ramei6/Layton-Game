/**
 * Puzzle 1 — The Gondola Crossing (Missionaries & Cannibals variant)
 *
 * Characters: Dasha, Gabriel, Signora (adults) + Kid1, Kid2, Kid3
 * Boat capacity: 2. Needs at least 1 to cross.
 * Constraint: On any bank — if adults > 0 AND kids > adults → invalid
 * (Classic MC constraint: 0 adults + kids alone is VALID)
 *
 * Solution exists in 11 moves (classic 3+3 solution).
 */
const Puzzle1Crossing = {

  CHARS: {
    dasha:   { label: 'Dasha',   emoji: '🕵️', type: 'adult' },
    gabriel: { label: 'Gabriel', emoji: '🎓', type: 'adult' },
    signora: { label: 'Signora', emoji: '👵', type: 'adult' },
    kid1:    { label: 'Luca',    emoji: '👦', type: 'kid' },
    kid2:    { label: 'Sofia',   emoji: '👧', type: 'kid' },
    kid3:    { label: 'Marco',   emoji: '👦', type: 'kid' },
  },

  _state: null,

  open() {
    PuzzleShell.open({
      id: 'p1',
      number: '01',
      title: 'The Gondola Crossing',
      description: `
        <p>The gondola can carry <strong>at most 2 people</strong> and needs <strong>at least 1</strong> to cross.</p>
        <br>
        <p>If there are <strong>more children than adults</strong> on either bank, the children start crying and the adults lose control.</p>
        <br>
        <p><strong>Adults:</strong> Dasha 🕵️ &nbsp; Gabriel 🎓 &nbsp; Signora 👵</p>
        <p><strong>Children:</strong> Luca 👦 &nbsp; Sofia 👧 &nbsp; Marco 👦</p>
        <br>
        <p>Get all six to the <strong>other bank</strong> safely.</p>
      `,
      hints: [
        "You can leave children alone on a bank only if there are NO adults there at all.",
        "Start by sending children across without adults — that's valid if the bank they leave has adults remaining.",
        "The key sequence involves moving kids over first, then swapping to move adults across in the middle.",
      ],
      init:          (container) => this._render(container),
      checkSolution: ()          => this._checkWin(),
      onSolve:       ()          => Scene1Bridge.onPuzzleSolved(),
    });
  },

  _resetState() {
    this._state = {
      bankA: ['dasha', 'gabriel', 'signora', 'kid1', 'kid2', 'kid3'],
      bankB: [],
      boat:  { side: 'A', passengers: [] },
    };
  },

  _render(container) {
    this._resetState();

    container.innerHTML = `
      <style>
        #crossing-wrap { height:100%; display:flex; flex-direction:column; gap:8px; }
        #crossing-banks { flex:1; display:flex; gap:8px; min-height:0; }
        .c-bank {
          flex:1; border-radius:10px; padding:10px;
          border:2px solid rgba(200,160,32,0.3);
          background:rgba(0,0,0,0.25);
          display:flex; flex-direction:column; gap:6px;
          overflow:hidden;
        }
        .c-bank-label { font-size:13px; color:#c8a020; letter-spacing:1px; margin-bottom:4px; }
        .c-chars { display:flex; flex-wrap:wrap; gap:6px; flex:1; align-content:flex-start; }
        #boat-col {
          width:130px; flex-shrink:0;
          display:flex; flex-direction:column; align-items:center; gap:8px;
        }
        #boat-box {
          background:rgba(30,60,100,0.4); border:2px solid #4080b0;
          border-radius:12px; width:100%; padding:8px;
          display:flex; flex-direction:column; align-items:center; gap:6px;
          flex:1;
        }
        .boat-label { font-size:12px; color:#80c8f0; letter-spacing:1px; }
        #boat-chars { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; }
        .c-cross-btn {
          width:100%; padding:8px 0; background:#4080b0; color:white;
          border:none; border-radius:7px; font-size:14px; cursor:pointer;
          font-family:inherit; transition:background 0.15s;
        }
        .c-cross-btn:hover { background:#5090c0; }
        .c-reset-btn {
          width:100%; padding:6px 0; background:#3a1a0a; color:#c8a020;
          border:1px solid #c8a020; border-radius:7px; font-size:12px;
          cursor:pointer; font-family:inherit;
        }
        .ctoken {
          width:52px; height:52px; border-radius:8px;
          background:rgba(255,255,255,0.08); border:2px solid rgba(255,255,255,0.25);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.12s; user-select:none;
          font-size:20px;
        }
        .ctoken:hover { background:rgba(255,255,255,0.18); transform:scale(1.08); }
        .ctoken.adult { border-color:rgba(240,208,80,0.5); }
        .ctoken.kid   { border-color:rgba(140,220,100,0.5); }
        .ctoken .clabel { font-size:8px; color:rgba(255,255,255,0.6); margin-top:1px; }
        #c-status {
          height:36px; background:rgba(0,0,0,0.4); border-radius:6px;
          display:flex; align-items:center; justify-content:center;
          color:#f5e8cc; font-size:14px; flex-shrink:0; padding:0 12px;
        }
        .bank-invalid { border-color:#e04040 !important; }
      </style>

      <div id="crossing-wrap">
        <div id="crossing-banks">

          <div class="c-bank" id="bank-a-el">
            <div class="c-bank-label">🏛️ THIS SIDE</div>
            <div class="c-chars" id="bank-a-chars"></div>
          </div>

          <div id="boat-col">
            <div id="boat-box">
              <div class="boat-label">⛵ GONDOLA</div>
              <div id="boat-chars"></div>
              <div class="boat-label" id="boat-side-lbl">Side: A</div>
            </div>
            <button class="c-cross-btn" id="cross-btn">Cross →</button>
            <button class="c-reset-btn" id="reset-btn">↺ Reset</button>
          </div>

          <div class="c-bank" id="bank-b-el">
            <div class="c-bank-label">🌿 OTHER SIDE</div>
            <div class="c-chars" id="bank-b-chars"></div>
          </div>

        </div>
        <div id="c-status">Click a character to board the gondola</div>
      </div>
    `;

    document.getElementById('cross-btn').addEventListener('click',  () => this._cross());
    document.getElementById('reset-btn').addEventListener('click',  () => {
      this._resetState();
      this._updateUI();
      this._setStatus('Reset. Start again!');
    });

    this._updateUI();
  },

  _updateUI() {
    const { bankA, bankB, boat } = this._state;
    this._fillBank('bank-a-chars', bankA, 'bankA');
    this._fillBank('bank-b-chars', bankB, 'bankB');
    this._fillBank('boat-chars',   boat.passengers, 'boat');
    document.getElementById('boat-side-lbl').textContent = `Side: ${boat.side}`;
    document.getElementById('cross-btn').textContent = boat.side === 'A' ? 'Cross → B' : '← Cross A';
  },

  _fillBank(elId, chars, location) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    chars.forEach(id => {
      const ch  = this.CHARS[id];
      const tok = document.createElement('div');
      tok.className = `ctoken ${ch.type}`;
      tok.innerHTML = `${ch.emoji}<div class="clabel">${ch.label}</div>`;
      tok.addEventListener('click', () => this._tokenClick(id, location));
      el.appendChild(tok);
    });
  },

  _tokenClick(charId, location) {
    const { boat } = this._state;
    const currentBankKey = boat.side === 'A' ? 'bankA' : 'bankB';
    const beforeState = JSON.parse(JSON.stringify(this._state));

    if (location === 'boat') {
      // Disembark back to current bank.
      boat.passengers = boat.passengers.filter(c => c !== charId);
      this._state[currentBankKey].push(charId);

      if (!this._isValidState()) {
        this._state = beforeState;
        this._updateUI();
        this._setStatus('That would leave the children overwhelmed!');
        return;
      }

    } else if (location === currentBankKey) {
      // Board from current bank. The safety rule is checked when the boat actually crosses.
      if (boat.passengers.length >= 2) { this._setStatus('The gondola is full! (max 2)'); return; }
      this._state[currentBankKey] = this._state[currentBankKey].filter(c => c !== charId);
      boat.passengers.push(charId);

    } else {
      this._setStatus("That character is on the other bank!");
      return;
    }

    this._updateUI();
    this._setStatus('');
  },

  _isValidState() {
    return this._isValidBank(this._state.bankA) && this._isValidBank(this._state.bankB);
  },

  _cross() {
    const { boat } = this._state;

    if (boat.passengers.length === 0) {
      gsap.to('#cross-btn', { x: 7, duration: 0.07, repeat: 4, yoyo: true });
      this._setStatus('Someone needs to row!');
      return;
    }

    const fromKey = boat.side === 'A' ? 'bankA' : 'bankB';
    const toKey   = boat.side === 'A' ? 'bankB' : 'bankA';
    const toSide  = boat.side === 'A' ? 'B' : 'A';

    const newFrom = [...this._state[fromKey]];               // already minus passengers
    const newTo   = [...this._state[toKey], ...boat.passengers];

    const fromOk  = this._isValidBank(newFrom);
    const toOk    = this._isValidBank(newTo);

    if (!fromOk || !toOk) {
      if (!fromOk) { this._flashBank('bank-a-el'); }
      if (!toOk)   { this._flashBank('bank-b-el'); }
      this._setStatus("⚠️ That would leave the children overwhelmed!");
      return;
    }

    // Execute
    this._state[toKey]      = newTo;
    boat.passengers         = [];
    boat.side               = toSide;

    this._updateUI();
    this._setStatus(`Crossed to bank ${toSide}. Select who rows back (or submit if done).`);
  },

  _isValidBank(chars) {
    const adults = chars.filter(c => ['dasha','gabriel','signora'].includes(c)).length;
    const kids   = chars.filter(c => c.startsWith('kid')).length;
    // Classic MC: only invalid if adults present AND outnumbered by kids
    return !(adults > 0 && kids > adults);
  },

  _checkWin() {
    const { bankB, boat } = this._state;
    return bankB.length === 6 && boat.passengers.length === 0;
  },

  _setStatus(msg) {
    const el = document.getElementById('c-status');
    if (el) el.textContent = msg || 'Click a character to board the gondola';
  },

  _flashBank(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.classList.add('bank-invalid');
    setTimeout(() => el.classList.remove('bank-invalid'), 700);
  },
};