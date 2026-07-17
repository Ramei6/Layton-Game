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
  onMapSolved() {
  // Brief dialogue then transition to train
  DialogueEngine.start([
    { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
      text: "Mestre. Of course — just across the bridge. That's where we need to go." },
    { character: 'Apprentice Gabriel', portrait: 'gabriel', side: 'right',
      text: "La Tana di Oberix... do you know it?" },
    { character: 'Inspector Dasha', portrait: 'dasha', side: 'right',
      text: "I know we need to take the train. Come on." },
  ], () => {
    SceneManager.goTo('screen-scene', () => {
      // Train transition — swap background, no sprites
      document.getElementById('scene-background').src = 'assets/backgrounds/transition-train.jpg';
      document.getElementById('scene-sprites').innerHTML   = '';
      document.getElementById('scene-hotspots').innerHTML  = '';

      // Small delay then go to restaurant
      setTimeout(() => Scene3Restaurant.init(), 3500);
    });
  });
},
};