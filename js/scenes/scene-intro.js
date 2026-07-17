/**
 * Story intro — series of text cards, click to advance.
 * Edit CARDS array to change the story text.
 */
const SceneIntro = {

  CARDS: [
    "After a year of rigorous training under Inspector Dasha's wing, Apprentice Gabriel had finally earned his official detective title.",
    "To celebrate, Dasha had organised something special: a trip to Venice — city of canals, masks, and mystery.",
    "Gabriel had been looking forward to it for weeks. A real holiday. No cases, no clues, no puzzles.",
    "But as their train pulled into Venice Santa Lucia station, Dasha felt a familiar sensation...",
    "\"Gabriel,\" she said quietly, scanning the platform. \"Something tells me Venice has a few mysteries of its own.\"",
    "\"With respect, Inspector,\" Gabriel replied, \"you say that everywhere.\"",
    "She smiled. He wasn't wrong.",
  ],

  _index: 0,
  _clickHandler: null,

  init() {
    this._index = 0;

    SceneManager.goTo('screen-intro', () => {
      this._showCard(0);

      this._clickHandler = () => this._handleClick();
      document.getElementById('screen-intro').addEventListener('click', this._clickHandler);
    });
  },

  _showCard(i) {
    const textEl = document.getElementById('intro-text');
    gsap.to(textEl, {
      opacity: 0, duration: 0.25,
      onComplete: () => {
        textEl.textContent = this.CARDS[i];
        gsap.to(textEl, { opacity: 1, duration: 0.4 });
      }
    });
  },

  _handleClick() {
    this._index++;
    if (this._index >= this.CARDS.length) {
      document.getElementById('screen-intro').removeEventListener('click', this._clickHandler);
      Scene1Bridge.init();
    } else {
      this._showCard(this._index);
    }
  },
};