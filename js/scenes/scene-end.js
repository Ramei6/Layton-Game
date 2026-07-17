const SceneEnd = {
  init() {
    SceneManager.goTo('screen-end', () => {
      // TODO: character images, love letter text
      gsap.from('#end-title', { scale: 0.5, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' });
    });
  },
};