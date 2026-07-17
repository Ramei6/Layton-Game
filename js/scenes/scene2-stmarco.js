const Scene2StMarco = {
  init() {
    document.getElementById('scene-background').src = 'assets/backgrounds/scene2-stmarco.jpg';
    SceneManager.goTo('screen-scene', () => {
      // TODO: sprites (tourist, carnival after p2 solved), hotspots
    });
  },
  onPigeonsSolved() {
    // TODO: carnival character appears, dialogue, then Puzzle3Map.open()
  },
};