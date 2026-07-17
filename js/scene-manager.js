/**
 * SceneManager — fades between screens.
 * Usage: SceneManager.goTo('screen-scene', optionalCallback)
 */
const SceneManager = {

  _activeId: null,

  goTo(targetId, onComplete) {
    const target = document.getElementById(targetId);
    if (!target) { console.error('SceneManager: screen not found:', targetId); return; }

    // Screens that show the HUD
    const hudScreens = ['screen-scene', 'screen-puzzle'];
    const showHud = hudScreens.includes(targetId);

    const doShow = () => {
      this._activeId = targetId;
      target.style.display = 'block';
      gsap.fromTo(target,
        { opacity: 0 },
        { opacity: 1, duration: 0.55, ease: 'power1.inOut',
          onComplete: () => {
            if (onComplete) onComplete();
          }
        }
      );

      // HUD
      const hud = document.getElementById('hud');
      if (showHud) {
        hud.classList.remove('hidden');
        gsap.fromTo(hud, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      } else {
        hud.classList.add('hidden');
      }
    };

    // If there's a currently visible screen, fade it out first
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