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

  open() {
    this._selected = null;

    PuzzleShell.open({
      id: 'p2',
      number: '02',
      title: "The Pigeon's Hour",
      description: `
        <p>Every day, pigeons arrive at St Mark's Square.</p>
        <br>
        <p>Each pigeon calls for its best friend, who arrives exactly <strong>one minute later</strong>. The number of birds <strong>doubles every minute</strong>.</p>
        <br>
        <p>At <strong>12:00</strong>, the square is completely full of pigeons.</p>
        <br>
        <p>Our poor tourist wants to flee when the square is <strong>half full</strong>. At what time should he leave?</p>
      `,
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

    const options = ['11:00', '11:30', '11:58', '11:59'];

    container.innerHTML = `
      <style>
        #pigeon-wrap {
          height:100%; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:28px;
        }
        #pigeon-visual {
          font-size:52px; letter-spacing:6px; line-height:1.3;
          text-align:center; color:#f5e8cc;
        }
        #pigeon-options { display:flex; flex-direction:column; gap:14px; width:260px; }
        .pigeon-opt {
          padding:16px 24px; background:rgba(255,255,255,0.07);
          border:2px solid rgba(200,160,32,0.35); border-radius:10px;
          color:#f5e8cc; font-size:22px; text-align:center;
          cursor:pointer; font-family:inherit; transition:all 0.15s;
        }
        .pigeon-opt:hover  { background:rgba(255,255,255,0.14); border-color:#c8a020; }
        .pigeon-opt.chosen { background:rgba(200,160,32,0.25); border-color:#f0d060; color:#f0d060; }
      </style>

      <div id="pigeon-wrap">
        <div id="pigeon-visual">🐦🐦🐦<br>🐦🐦🐦🐦<br>🐦🐦🐦🐦🐦</div>
        <div id="pigeon-options">
          ${options.map(o => `<button class="pigeon-opt" data-val="${o}">${o}</button>`).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.pigeon-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pigeon-opt').forEach(b => b.classList.remove('chosen'));
        btn.classList.add('chosen');
        this._selected = btn.dataset.val;
      });
    });
  },
};