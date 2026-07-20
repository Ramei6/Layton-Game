/**
 * Scene Intro — Cinematic opening sequence.
 *
 * Three beat types drive the sequence:
 *   { type: 'bg',       src: '...' }           — crossfades background, auto-advances
 *   { type: 'narrator', text: '...' }           — shows narrator card, waits for click
 *   { type: 'dialogue', character, portrait,    — collects consecutive dialogue beats
 *                        side, text }              and passes them to DialogueEngine
 *
 * To edit the story: only touch the BEATS array.
 * To add a background change: insert a { type:'bg', src:'...' } beat at the right point.
 */
const SceneIntro = {

  BEATS: [

    // ── ACT 1: Venice overview ──────────────────────────────────────
    { type: 'bg', src: 'assets/backgrounds/intro-venice-overview.jpg' },

    { type: 'narrator',
      text: 'Venice. A shimmering labyrinth of winding canals, ancient stone bridges, and sun-drenched piazzas. A city where every shadow seems to hide a story.' },

    { type: 'narrator',
      text: 'It had been a grueling but rewarding year. For the past twelve months, Apprentice Gabriel had studied exclusively under the brilliant teachings of Inspector Dasha.' },

    { type: 'narrator',
      text: 'Now, his apprenticeship was finally coming to an end. In just a few days, Gabriel would be officially promoted and allowed to take the title of a true detective.' },

    { type: 'narrator',
      text: 'To celebrate this milestone — and force him to take a well-deserved breath before the big day — Dasha had orchestrated the perfect getaway. An itinerary completely removed from their exhausting world of crime scenes and complex riddles.' },

    // ── ACT 2: Train arrival ────────────────────────────────────────
    { type: 'bg', src: 'assets/backgrounds/intro-train-arrival.jpg' },

    { type: 'narrator',
      text: 'At least, that was the idea. But the moment the train doors hissed open at Santa Lucia, the Inspector\'s legendary instincts refused to take a vacation.' },

    // ── ACT 3: Platform dialogue ────────────────────────────────────
    { type: 'bg', src: 'assets/backgrounds/intro-station-platform.jpg' },

    { type: 'dialogue', character: 'Inspector Dasha', portrait: 'dasha',   side: 'left',
      text: 'Just smell that air, Gabriel. Brine, roasted espresso... and undeniable intrigue.' },

    { type: 'dialogue', character: 'Gabriel',         portrait: 'gabriel', side: 'right',
      text: 'I am fairly certain that is just the scent of the lagoon, Inspector.' },

    { type: 'dialogue', character: 'Inspector Dasha', portrait: 'dasha',   side: 'left',
      text: 'Do not be so terribly grounded! Look around us. A city this historic does not just sit quietly. It is a giant, beautiful puzzle box — just waiting for someone to twist the dial.' },

    { type: 'dialogue', character: 'Gabriel',         portrait: 'gabriel', side: 'right',
      text: 'I thought the entire objective of this trip was to leave the puzzle boxes at home? You promised me a few days of total, blissful ignorance before I officially become a detective.' },

    { type: 'dialogue', character: 'Inspector Dasha', portrait: 'dasha',   side: 'left',
      text: 'Oh, I fully intend to keep that promise! But surely, if a mystery happens to stumble right into our path, it would be profoundly rude to ignore it.' },

    { type: 'dialogue', character: 'Gabriel',         portrait: 'gabriel', side: 'right',
      text: 'Naturally. Let us just hope the mysteries of Venice are polite enough to let us drop off our luggage at the hotel first.' },

    { type: 'dialogue', character: 'Inspector Dasha', portrait: 'dasha',   side: 'left',
      text: 'That is the spirit, my soon-to-be Detective! Onward!' },
  ],

  // ── Internal state ──────────────────────────────────────────────
  _index:          0,
  _narratorHandler: null,   // tracks active click listener for cleanup

  // ── Public entry point ──────────────────────────────────────────
  init() {
    this._index           = 0;
    this._narratorHandler = null;

    // Reset intro background
    const bg = document.getElementById('intro-background');
    bg.src = '';
    bg.style.opacity = '0';
    bg.removeAttribute('data-loaded');

    // Hide narrator overlay
    const overlay = document.getElementById('narrator-overlay');
    overlay.style.display  = 'none';
    overlay.style.opacity  = '0';
    document.getElementById('narrator-text').textContent = '';

    SceneManager.goTo('screen-intro', () => {
      this._processBeat();
    });
  },

  // ── Beat processor ──────────────────────────────────────────────
  _processBeat() {
    // Sequence complete — move to Scene 1
    if (this._index >= this.BEATS.length) {
      this._hideNarrator(() => Scene1Bridge.init());
      return;
    }

    const beat = this.BEATS[this._index];
    this._index++;

    switch (beat.type) {

      case 'bg':
        // Auto-advance: crossfade background then immediately process next beat
        this._changeBackground(beat.src, () => this._processBeat());
        break;

      case 'narrator':
        // Show narrator card and wait for click
        this._showNarrator(beat.text);
        break;

      case 'dialogue':
        // Collect ALL consecutive dialogue beats into one DialogueEngine call
        const lines = [beat];
        while (
          this._index < this.BEATS.length &&
          this.BEATS[this._index].type === 'dialogue'
        ) {
          lines.push(this.BEATS[this._index]);
          this._index++;
        }
        // Slide narrator out, then hand off to DialogueEngine
        this._hideNarrator(() => {
          DialogueEngine.start(lines, () => this._processBeat());
        });
        break;
    }
  },

  // ── Background crossfade ────────────────────────────────────────
  _changeBackground(src, onComplete) {
  const bg = document.getElementById('intro-background');

  // Preload new image first
  const img = new Image();
  img.onload = img.onerror = () => {

    if (!bg.getAttribute('data-loaded')) {
      // First background — just set and fade in
      bg.setAttribute('data-loaded', 'true');
      bg.src = src;
      gsap.to(bg, { opacity: 1, duration: 0.7, ease: 'power1.inOut', onComplete });

    } else {
      // Subsequent backgrounds — crossfade
      gsap.to(bg, {
        opacity: 0, duration: 0.4, ease: 'power1.in',
        onComplete: () => {
          bg.src = src;   // image already loaded — no flash
          gsap.to(bg, { opacity: 1, duration: 0.6, ease: 'power1.out', onComplete });
        }
      });
    }
  };
  img.src = src;
},

  // ── Narrator card ───────────────────────────────────────────────
  _showNarrator(text) {
    const overlay = document.getElementById('narrator-overlay');
    const textEl  = document.getElementById('narrator-text');

    // Clean up any previous click handler
    if (this._narratorHandler) {
      overlay.removeEventListener('click', this._narratorHandler);
      this._narratorHandler = null;
    }

    // Show overlay
    overlay.style.display = 'flex';
    gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power1.out' });

    // Typewriter
    textEl.textContent = '';
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      textEl.textContent = text.slice(0, charIndex);
      if (charIndex >= text.length) clearInterval(interval);
    }, 22);

    // Click handler: first click skips typewriter, second click advances
    this._narratorHandler = () => {
      if (charIndex < text.length) {
        // Skip to end of current text
        charIndex = text.length;
        textEl.textContent = text;
        clearInterval(interval);
        return; // wait for another click to advance
      }
      // Advance to next beat
      overlay.removeEventListener('click', this._narratorHandler);
      this._narratorHandler = null;
      this._processBeat();
    };

    // Small delay before accepting clicks (prevents accidental double-skip)
    setTimeout(() => {
      overlay.addEventListener('click', this._narratorHandler);
    }, 350);
  },

  // ── Hide narrator ───────────────────────────────────────────────
  _hideNarrator(onComplete) {
    const overlay = document.getElementById('narrator-overlay');

    // Already hidden
    if (overlay.style.display === 'none') {
      if (onComplete) onComplete();
      return;
    }

    // Clean up any active click handler
    if (this._narratorHandler) {
      overlay.removeEventListener('click', this._narratorHandler);
      this._narratorHandler = null;
    }

    gsap.to(overlay, {
      opacity: 0, duration: 0.3, ease: 'power1.in',
      onComplete: () => {
        overlay.style.display = 'none';
        if (onComplete) onComplete();
      }
    });
  },
};