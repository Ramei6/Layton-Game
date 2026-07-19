/**
 * Title Screen — uses title-bg.jpg as full background.
 *
 * Phase 0 → click → Phase 1: "A trip in Venice" fades in
 * Phase 1 → click → Phase 2: PRESS START flashes, game starts
 */
const SceneTitle = {

  _phase: 0,
  _clickHandler: null,

  init() {
    this._phase = 0;

    // Reset state in case of re-visit
    gsap.set('#title-subtitle',    { opacity: 0, y: 18 });
    gsap.set('#title-press-start', { opacity: 1, scale: 1 });

    SceneManager.goTo('screen-title', () => {
      // Small entrance delay, then start the PRESS START pulse
      gsap.delayedCall(0.5, () => this._startPulse('slow'));

      // Wire click after animations settle
      gsap.delayedCall(0.8, () => {
        this._clickHandler = (e) => this._handleClick(e);
        document.getElementById('screen-title')
          .addEventListener('click', this._clickHandler);
      });
    });
  },

  // ── Pulse helper ─────────────────────────────────────────────
  _startPulse(speed) {
    gsap.killTweensOf('#title-press-start');

    const duration = speed === 'fast' ? 0.55 : 1.2;

    gsap.to('#title-press-start', {
      opacity: 0.65,
      scale:   0.96,
      duration,
      repeat:  -1,
      yoyo:    true,
      ease:    'sine.inOut',
    });
  },

  // ── Click handler ────────────────────────────────────────────
  _handleClick() {

    if (this._phase === 0) {
      // ── Phase 0 → 1: reveal subtitle ──
      this._phase = 1;

      gsap.to('#title-subtitle', {
        opacity:  1,
        y:        0,
        duration: 0.75,
        ease:     'power2.out',
      });

      // Speed up the pulse slightly as a cue to click again
      gsap.delayedCall(0.8, () => this._startPulse('fast'));

    } else if (this._phase === 1) {
      // ── Phase 1 → 2: flash then transition ──
      this._phase = 2;

      document.getElementById('screen-title')
        .removeEventListener('click', this._clickHandler);

      gsap.killTweensOf('#title-press-start');

      // Classic arcade "PRESS START accepted" flash
      gsap.to('#title-press-start', {
        opacity:  0,
        duration: 0.12,
        repeat:   5,
        yoyo:     true,
        ease:     'none',
        onComplete: () => SceneIntro.init(),
      });
    }
  },
};