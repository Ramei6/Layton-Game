/**
 * PuzzleShell — the reusable puzzle screen wrapper.
 *
 * Each puzzle calls:  PuzzleShell.open(config)
 *
 * config = {
 *   id:            'p1',              // matches GameState.puzzlesSolved key
 *   number:        '01',              // displayed as "Puzzle 01"
 *   title:         'The Crossing',    // displayed in header
 *   description:   '<p>...</p>',      // HTML, shown in left panel
 *   hints:         ['hint1', ...],    // array of hint strings
 *   init:          (container) => {}, // function that builds puzzle UI into right panel
 *   checkSolution: () => boolean,     // returns true if current state is correct
 *   onSolve:       () => {},          // called after player clicks Continue on success
 * }
 */
const PuzzleShell = {

  _config: null,
  _hintsUsed: 0,

  open(config) {
    this._config = config;
    this._hintsUsed = 0;

    // Populate header
    document.getElementById('puzzle-number').textContent    = `Puzzle ${config.number}`;
    document.getElementById('puzzle-title-text').textContent = config.title;
    document.getElementById('puzzle-description').innerHTML  = config.description;

    // Reset hint area
    document.getElementById('puzzle-hint-text').classList.add('hidden');
    document.getElementById('puzzle-hint-text').textContent = '';

    // Reset result overlay
    document.getElementById('puzzle-result').classList.add('hidden');

    // Inject puzzle-specific UI into right panel
    const panel = document.getElementById('puzzle-right-panel');
    panel.innerHTML = '';
    config.init(panel);

    // Wire buttons (replace old listeners by cloning)
    const hintBtn   = document.getElementById('puzzle-hint-btn');
    const submitBtn = document.getElementById('puzzle-submit-btn');

    const newHint   = hintBtn.cloneNode(true);
    const newSubmit = submitBtn.cloneNode(true);
    hintBtn.parentNode.replaceChild(newHint, hintBtn);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);

    newHint.addEventListener('click',   () => this._useHint());
    newSubmit.addEventListener('click', () => this._submit());

    // Navigate to puzzle screen
    SceneManager.goTo('screen-puzzle');
  },

  _useHint() {
    const { hints } = this._config;

    if (this._hintsUsed >= hints.length) {
      this._shakeElement('#puzzle-hint-btn', 'No more hints!');
      return;
    }

    if (!GameState.spendHintCoin()) {
      this._shakeElement('#puzzle-hint-btn', "You need a hint coin! Collect them in scenes.");
      return;
    }

    const hintEl = document.getElementById('puzzle-hint-text');
    hintEl.textContent = hints[this._hintsUsed];
    hintEl.classList.remove('hidden');
    gsap.from(hintEl, { opacity: 0, y: 8, duration: 0.3 });
    this._hintsUsed++;
  },

  _submit() {
    const isCorrect = this._config.checkSolution();
    const result    = document.getElementById('puzzle-result');
    const inner     = document.getElementById('puzzle-result-inner');
    const text      = document.getElementById('puzzle-result-text');
    const btn       = document.getElementById('puzzle-result-btn');

    result.classList.remove('hidden');

    if (isCorrect) {
      inner.style.background = 'rgba(0, 30, 0, 0.95)';
      text.textContent = '🎉 Brilliant deduction!';
      gsap.from(inner, { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });

      GameState.puzzlesSolved[this._config.id] = true;

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', () => {
        result.classList.add('hidden');
        this._config.onSolve();
      });

    } else {
      inner.style.background = 'rgba(40, 0, 0, 0.95)';
      text.textContent = '❌ Not quite... Think again!';
      gsap.from(inner, { x: -12, duration: 0.07, repeat: 5, yoyo: true, ease: 'none' });

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', () => result.classList.add('hidden'));
    }
  },

  _shakeElement(selector, msg) {
    gsap.to(selector, { x: 8, duration: 0.07, repeat: 4, yoyo: true, ease: 'none' });
    // Optional: show small toast — add later
    console.info(msg);
  },
};