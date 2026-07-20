const PuzzleShell = {

  _config:    null,
  _hintsUsed: 0,

  open(config) {
    this._config    = config;
    this._hintsUsed = 0;

    const isFullscreen = config.layout === 'fullscreen';

    const header     = document.getElementById('puzzle-header');
    const leftPanel  = document.getElementById('puzzle-left-panel');
    const footer     = document.getElementById('puzzle-footer');
    const rightPanel = document.getElementById('puzzle-right-panel');

    if (isFullscreen) {
      // ── Fullscreen: hide all standard chrome ──────────────────────
      header.style.display    = 'none';
      leftPanel.style.display = 'none';
      footer.style.display    = 'none';
      rightPanel.style.padding  = '0';
      rightPanel.style.overflow = 'hidden';

    } else {
      // ── Standard layout: restore chrome ───────────────────────────
      header.style.display    = 'flex';
      leftPanel.style.display = 'flex';
      footer.style.display    = 'flex';
      rightPanel.style.padding  = '20px';
      rightPanel.style.overflow = 'hidden';

      document.getElementById('puzzle-number').textContent     = `Puzzle ${config.number}`;
      document.getElementById('puzzle-title-text').textContent = config.title;
      document.getElementById('puzzle-description').innerHTML  = config.description;

      document.getElementById('puzzle-hint-text').classList.add('hidden');
      document.getElementById('puzzle-hint-text').textContent = '';

      // Re-wire buttons fresh (cloneNode removes old listeners)
      const hintBtn   = document.getElementById('puzzle-hint-btn');
      const submitBtn = document.getElementById('puzzle-submit-btn');
      const newHint   = hintBtn.cloneNode(true);
      const newSubmit = submitBtn.cloneNode(true);
      hintBtn.parentNode.replaceChild(newHint, hintBtn);
      submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
      newHint.addEventListener('click',   () => this._useHint());
      newSubmit.addEventListener('click', () => this._submit());
    }

    // Always reset result overlay
    document.getElementById('puzzle-result').classList.add('hidden');

    // Inject puzzle-specific UI
    rightPanel.innerHTML = '';
    config.init(rightPanel);

    SceneManager.goTo('screen-puzzle');
  },

  // ── Public: called by fullscreen puzzles ────────────────────────────
  triggerSubmit() { this._submit(); },

  // ── Internal ────────────────────────────────────────────────────────

  _useHint() {
    const { hints } = this._config;
    if (this._hintsUsed >= hints.length) return;
    if (!GameState.spendHintCoin()) {
      this._shake('#puzzle-hint-btn');
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
    let   btn       = document.getElementById('puzzle-result-btn');

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

  _shake(selector) {
    gsap.to(selector, { x: 8, duration: 0.07, repeat: 4, yoyo: true, ease: 'none' });
  },
};