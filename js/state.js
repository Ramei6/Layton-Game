/**
 * GameState — single source of truth for everything.
 * All scenes and puzzles read from and write to this object.
 */
const GameState = {

  // Which coins have been collected per scene (prevents re-collecting)
  collectedCoins: {
    scene1: new Set(),
    scene2: new Set(),
    scene3: new Set(),
  },

  hintCoins: 0,
  catFound: false,

  puzzlesSolved: {
    p1: false,
    p2: false,
    p3: false,
    p4: false,
  },

  // Scene-specific flags
  gondolaUnlocked: false,

  // ── Hint coin helpers ──────────────────────────────────

  addHintCoin() {
    this.hintCoins++;
    this._updateCoinDisplay();
    gsap.fromTo('#hint-coin-counter',
      { scale: 1.35 },
      { scale: 1, duration: 0.4, ease: 'back.out(2)' }
    );
  },

  spendHintCoin() {
    if (this.hintCoins <= 0) return false;
    this.hintCoins--;
    this._updateCoinDisplay();
    return true;
  },

  _updateCoinDisplay() {
    const el = document.getElementById('hint-count');
    if (el) el.textContent = this.hintCoins;
  },
};