/**
 * Title Screen
 *
 * Phase 0 → click → Phase 1: "in Venice" fades in, outfits swap to tourist
 * Phase 1 → click → game starts (scene-intro)
 */
const SceneTitle = {

  _phase: 0,
  _clickHandler: null,

  init() {
    this._phase = 0;

    // Reset character images to normal outfits
    document.getElementById('char-gabriel-title').src = 'assets/characters/gabriel-fullbody-normal.png';
    document.getElementById('char-dasha-title').src   = 'assets/characters/dasha-fullbody-normal.png';

    // Hide "in Venice" immediately (opacity:0 set in CSS, but reset after possible re-visit)
    gsap.set('#title-venice', { opacity: 0, y: 20 });

    SceneManager.goTo('screen-title', () => {

      // Characters slide in from sides
      gsap.from('#char-gabriel-title', { x: -320, opacity: 0, duration: 0.9, delay: 0.2, ease: 'power2.out' });
      gsap.from('#char-dasha-title',   { x:  320, opacity: 0, duration: 0.9, delay: 0.2, ease: 'power2.out' });

      // Title drops down
      gsap.from('#title-main', { y: -50, opacity: 0, duration: 0.8, delay: 0.7 });

      // Attach click after animations settle
      setTimeout(() => {
        this._clickHandler = () => this._handleClick();
        document.getElementById('screen-title').addEventListener('click', this._clickHandler);
      }, 1500);
    });
  },

  _handleClick() {
    if (this._phase === 0) {
      // ── Phase 0 → 1: reveal "in Venice" + swap outfits ──
      this._phase = 1;

      // "in Venice" appears
      gsap.to('#title-venice', { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' });

      // Brief fade-out/in on characters to swap outfits
      const gabImg   = document.getElementById('char-gabriel-title');
      const dashaImg = document.getElementById('char-dasha-title');

      gsap.to([gabImg, dashaImg], {
        opacity: 0, duration: 0.3, delay: 0.2,
        onComplete: () => {
          gabImg.src   = 'assets/characters/gabriel-fullbody-tourist.png';
          dashaImg.src = 'assets/characters/dasha-fullbody-tourist.png';
          gsap.to([gabImg, dashaImg], { opacity: 1, duration: 0.4 });
        }
      });

      // Update click prompt text
      document.querySelector('#screen-title .click-prompt').textContent = 'Click to play';

    } else if (this._phase === 1) {
      // ── Phase 1 → start game ──
      this._phase = 2;
      document.getElementById('screen-title').removeEventListener('click', this._clickHandler);
      SceneIntro.init();
    }
  },
};