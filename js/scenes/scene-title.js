const SceneTitle = {

  _phase: 0,
  _clickHandler: null,
  _pulseDelay: null,    // ← track the delayedCall so we can kill it

  init() {
    this._phase      = 0;
    this._pulseDelay = null;

    gsap.set('#title-subtitle',    { opacity: 0, y: 18 });
    gsap.set('#title-press-start', { opacity: 1, scale: 1 });

    SceneManager.goTo('screen-title', () => {
      gsap.delayedCall(0.5, () => this._startPulse('slow'));

      gsap.delayedCall(0.8, () => {
        this._clickHandler = () => this._handleClick();
        document.getElementById('screen-title')
          .addEventListener('click', this._clickHandler);
      });
    });
  },

  _startPulse(speed) {
    gsap.killTweensOf('#title-press-start');
    const duration = speed === 'fast' ? 0.55 : 1.2;
    gsap.to('#title-press-start', {
      opacity:  0.55,
      scale:    0.96,
      duration,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
    });
  },

  _handleClick() {

    if (this._phase === 0) {
      this._phase = 1;

      gsap.to('#title-subtitle', {
        opacity:  1,
        y:        0,
        duration: 0.75,
        ease:     'power2.out',
      });

      // Track this delayedCall so phase 2 can cancel it
      this._pulseDelay = gsap.delayedCall(0.8, () => this._startPulse('fast'));

    } else if (this._phase === 1) {
      this._phase = 2;

      // ← KEY FIX: kill the pending delayedCall before it fires _startPulse
      // and wipes out the flash animation's onComplete
      if (this._pulseDelay) {
        this._pulseDelay.kill();
        this._pulseDelay = null;
      }

      document.getElementById('screen-title')
        .removeEventListener('click', this._clickHandler);

      gsap.killTweensOf('#title-press-start');

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