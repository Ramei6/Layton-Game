const SceneEnd = {

  BG_SRC: 'assets/backgrounds/endbg.png',

  init() {
    LoadingIndicator.show();

    const img = new Image();
    img.onload = img.onerror = () => {
      LoadingIndicator.hide(() => {
        // Prep the background AND hide the title BEFORE the screen fades in,
        // so the fade reveals the finished state instead of the CSS defaults.
        this._setupBackground();
        gsap.set('#end-title', { scale: 0.5, opacity: 0 });

        SceneManager.goTo('screen-end', () => {
          // Screen is now fully faded in — safe to animate the title.
          gsap.to('#end-title', {
            scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.2,
          });
        });
      });
    };
    img.src = this.BG_SRC;
  },

  _setupBackground() {
    const screen = document.getElementById('screen-end');
    if (!screen) return;

    let bg = document.getElementById('end-bg-img');
    if (!bg) {
      bg = document.createElement('img');
      bg.id = 'end-bg-img';
      Object.assign(bg.style, {
        position:      'absolute',
        inset:          '0',
        width:          '100%',
        height:         '100%',
        objectFit:      'cover',
        objectPosition: 'center center',
        zIndex:         '0',
        pointerEvents:  'none',
      });
      screen.insertBefore(bg, screen.firstChild);
    }
    bg.src = this.BG_SRC; // already preloaded above, paints instantly

    let dark = document.getElementById('end-bg-dark');
    if (!dark) {
      dark = document.createElement('div');
      dark.id = 'end-bg-dark';
      Object.assign(dark.style, {
        position:      'absolute',
        inset:          '0',
        background:     'rgba(0, 0, 0, 0.55)', // ← adjust darkness here
        zIndex:         '1',
        pointerEvents:  'none',
      });
      screen.insertBefore(dark, bg.nextSibling);
    }
  },
};