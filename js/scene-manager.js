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
      // Show loading indicator while image preloads
      LoadingIndicator.show();

      const img = new Image();
      img.onload = img.onerror = () => {
        // Image ready — hide indicator, then start transition
        LoadingIndicator.hide(() => {
          this._doTransition(targetId, onComplete, bgSrc);
        });
      };
      img.src = bgSrc;
    } else {
      this._doTransition(targetId, onComplete, null);
    }
  },

  _doTransition(targetId, onComplete, bgSrc) {
    const target = document.getElementById(targetId);
    if (!target) { console.error('SceneManager: screen not found:', targetId); return; }

    const hudScreens  = ['screen-scene', 'screen-puzzle'];
    const showHud     = hudScreens.includes(targetId);

    // Screens that need display:flex to activate their column/center layouts
    const flexScreens = ['screen-puzzle', 'screen-end'];

    const doShow = () => {
      this._activeId = targetId;

      if (bgSrc) {
        const bgEl = document.getElementById('scene-background');
        if (bgEl) {
          bgEl.src = bgSrc;
          // Only these two backgrounds get full centering instead of top-crop
          const centerFull = bgSrc.includes('scene3-restaurant')
                           || bgSrc.includes('mestre-street');
          bgEl.classList.toggle('bg-center-full', centerFull);
        }
      }
      // ← was always 'block' — now uses flex for screens that need it
      target.style.display = flexScreens.includes(targetId) ? 'flex' : 'block';

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