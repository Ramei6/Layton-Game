const SceneManager = {

  _activeId: null,

  /**
   * Transition to a screen.
   * @param {string}   targetId   - ID of the screen div to show
   * @param {function} onComplete - fires after fade-in completes
   * @param {string}   [bgSrc]    - optional background image to preload before transitioning
   *                                only relevant for 'screen-scene'
   */
  goTo(targetId, onComplete, bgSrc) {

    if (bgSrc) {
      // Preload image silently before starting any transition
      const img = new Image();
      img.onload  = () => this._doTransition(targetId, onComplete, bgSrc);
      img.onerror = () => this._doTransition(targetId, onComplete, bgSrc); // never block on error
      img.src = bgSrc;
    } else {
      this._doTransition(targetId, onComplete, null);
    }
  },

  _doTransition(targetId, onComplete, bgSrc) {
    const target = document.getElementById(targetId);
    if (!target) {
      console.error('SceneManager: screen not found:', targetId);
      return;
    }

    const hudScreens = ['screen-scene', 'screen-puzzle'];
    const showHud    = hudScreens.includes(targetId);

    const doShow = () => {
      this._activeId = targetId;

      // Set background AFTER preload, right before fade-in — image is guaranteed ready
      if (bgSrc) {
        const bgEl = document.getElementById('scene-background');
        if (bgEl) bgEl.src = bgSrc;
      }

      target.style.display = 'block';
      gsap.fromTo(target,
        { opacity: 0 },
        { opacity: 1, duration: 0.55, ease: 'power1.inOut',
          onComplete: () => { if (onComplete) onComplete(); }
        }
      );

      const hud = document.getElementById('hud');
      if (showHud) {
        hud.classList.remove('hidden');
        gsap.fromTo(hud, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      } else {
        hud.classList.add('hidden');
      }
    };

    // Fade out current screen first, then show new one
    if (this._activeId && this._activeId !== targetId) {
      const current = document.getElementById(this._activeId);
      if (current) {
        gsap.to(current, {
          opacity: 0, duration: 0.45,
          onComplete: () => {
            current.style.display = 'none';
            doShow();
          }
        });
        return;
      }
    }

    doShow();
  },
};