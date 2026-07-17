const Scene3Restaurant = {
  init() {
    document.getElementById('scene-background').src = 'assets/backgrounds/scene3-restaurant.jpg';
    SceneManager.goTo('screen-scene', () => {
      // TODO: sprites (chef), hotspots
    });
  },
};