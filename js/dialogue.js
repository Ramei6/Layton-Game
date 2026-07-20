/**
 * DialogueEngine — displays a sequence of dialogue lines with portraits.
 *
 * Usage:
 *   DialogueEngine.start([
 *     { character: 'Inspector Dasha', portrait: 'dasha',   side: 'left',  text: '...' },
 *     { character: 'Gabriel',         portrait: 'gabriel', side: 'right', text: '...' },
 *   ], onCompleteCallback);
 *
 * Portrait rules:
 *   - portrait maps to: assets/characters/{portrait}-idle.png / {portrait}-talk.png
 *   - 'gabriel' portrait is automatically mirrored (faces right)
 *   - side is kept in the data for DialogueEngine compatibility but no longer
 *     affects portrait position (always top-left above the box)
 *   - omit portrait for narrator/no-portrait lines
 */
const DialogueEngine = {

  _queue:       [],
  _index:       0,
  _isTyping:    false,
  _onComplete:  null,
  _typeTimer:   null,
  _talkTimer:   null,
  _clickHandler: null,

  // Portraits that face left by default and need mirroring
  MIRRORED_PORTRAITS: new Set(['gabriel']),
  NO_TALK_ANIM: new Set(['lady', 'kid']),  // portraits with idle-only assets

  start(lines, onComplete) {
    this._queue      = lines;
    this._index      = 0;
    this._onComplete = onComplete;

    const overlay          = document.getElementById('dialogue-overlay');
    const portraitContainer = document.getElementById('dialogue-portrait-container');

    // Reset portrait
    portraitContainer.style.display = 'none';
    document.getElementById('dialogue-portrait-img').src       = '';
    document.getElementById('dialogue-portrait-img').className = '';

    // Show cat companion if cat was found
    if (GameState.catFound) {
      document.getElementById('cat-companion').classList.remove('hidden');
    }

    // Show overlay and slide dialogue box up
    overlay.style.display = 'flex';
    const box = document.getElementById('dialogue-box');
    gsap.set(box, { y: 70, opacity: 0 });
    gsap.to(box, {
      y: 0, opacity: 1, duration: 0.38, ease: 'power2.out',
      onComplete: () => this._showLine(),
    });

    this._clickHandler = () => this._handleClick();
    overlay.addEventListener('click', this._clickHandler);
  },

  _showLine() {
    const line = this._queue[this._index];

    // ── Speaker name ──
    document.getElementById('dialogue-speaker-name').textContent = line.character || '';

    // ── Clear text ──
    const textEl = document.getElementById('dialogue-text-content');
    textEl.textContent = '';

    // ── Portrait ──
const portraitContainer = document.getElementById('dialogue-portrait-container');
const portraitImg       = document.getElementById('dialogue-portrait-img');

if (line.portrait) {

    // 1. Hide immediately — prevents the old portrait from flipping
    portraitImg.style.opacity = '0';

    // 2. Apply mirroring class BEFORE src — class now targets a blank/hidden img
    portraitImg.className = this.MIRRORED_PORTRAITS.has(line.portrait)
      ? 'mirrored'
      : '';

    // 3. Set new source
    portraitImg.src = `assets/characters/${line.portrait}-talk.png`;

    // 4. Reveal only once the new image has actually loaded
    portraitImg.onload = () => {
      gsap.to(portraitImg, { opacity: 1, duration: 0.12, ease: 'none' });
    };

    // Show container with slide-in on first appearance
    if (portraitContainer.style.display === 'none') {
      portraitContainer.style.display = 'block';
      gsap.from(portraitContainer, {
        y: -20, opacity: 0, duration: 0.3, ease: 'power2.out',
      });
    }

    this._startTalkAnim(line.portrait);

  } else {
    portraitContainer.style.display = 'none';
    this._stopTalkAnim(null);
  }

    // ── Typewriter ──
    this._isTyping = true;
    let i = 0;
    const text = line.text;

    this._typeTimer = setInterval(() => {
      i++;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(this._typeTimer);
        this._typeTimer = null;
        this._isTyping  = false;
        this._stopTalkAnim(line.portrait);
      }
    }, 26);
  },

  _startTalkAnim(portraitName) {
    if (!portraitName) return;
    if (this.NO_TALK_ANIM.has(portraitName)) return;  // ← skip animation
    if (this._talkTimer) clearInterval(this._talkTimer);

    let frame = true;
    this._talkTimer = setInterval(() => {
      const img = document.getElementById('dialogue-portrait-img');
      if (!img) return;
      // Preserve mirrored class while swapping src
      img.src = frame
        ? `assets/characters/${portraitName}-talk.png`
        : `assets/characters/${portraitName}-idle.png`;
      frame = !frame;
    }, 190);
  },

  _stopTalkAnim(portraitName) {
    if (this._talkTimer) {
      clearInterval(this._talkTimer);
      this._talkTimer = null;
    }
    if (portraitName) {
      const img = document.getElementById('dialogue-portrait-img');
      if (img) img.src = `assets/characters/${portraitName}-idle.png`;
    }
  },

  _handleClick() {
    // First click while typing: skip to end of current line
    if (this._isTyping) {
      clearInterval(this._typeTimer);
      this._typeTimer = null;
      this._isTyping  = false;
      const line = this._queue[this._index];
      document.getElementById('dialogue-text-content').textContent = line.text;
      this._stopTalkAnim(line.portrait);
      return;
    }

    // Advance to next line
    this._index++;
    if (this._index >= this._queue.length) {
      this._end();
    } else {
      this._showLine();
    }
  },

  _end() {
    if (this._typeTimer) clearInterval(this._typeTimer);
    if (this._talkTimer) clearInterval(this._talkTimer);

    const overlay = document.getElementById('dialogue-overlay');
    overlay.removeEventListener('click', this._clickHandler);

    const box = document.getElementById('dialogue-box');
    gsap.to(box, {
      y: 70, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        overlay.style.display = 'none';

        // Reset portrait
        const portraitContainer = document.getElementById('dialogue-portrait-container');
        const portraitImg       = document.getElementById('dialogue-portrait-img');
        portraitContainer.style.display = 'none';
        portraitImg.src       = '';
        portraitImg.className = '';

        // Reset other UI
        document.getElementById('cat-companion').classList.add('hidden');
        document.getElementById('dialogue-text-content').textContent = '';
        document.getElementById('dialogue-speaker-name').textContent = '';

        if (this._onComplete) this._onComplete();
      },
    });
  },
};