/**
 * LoadingIndicator — small bottom-left animated card.
 * Shown while SceneManager preloads a background image.
 * Hidden before the screen fade-in begins.
 *
 * Show: LoadingIndicator.show()
 * Hide: LoadingIndicator.hide(onComplete)
 */
const LoadingIndicator = {

  show() {
    const el = document.getElementById('loading-indicator');
    if (!el) return;
    el.style.display = 'flex';
    gsap.fromTo(el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
    );
  },

  hide(onComplete) {
    const el = document.getElementById('loading-indicator');
    if (!el || el.style.display === 'none') {
      if (onComplete) onComplete();
      return;
    }
    gsap.to(el, {
      opacity: 0, y: 12, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        el.style.display = 'none';
        if (onComplete) onComplete();
      }
    });
  },
};