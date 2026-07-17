/**
 * DialogueEngine — displays a sequence of dialogue lines with portraits.
 *
 * Usage:
 *   DialogueEngine.start([
 *     { character: 'Inspector Dasha', portrait: 'dasha', side: 'left', text: 'Hello!' },
 *     { character: 'Gabriel', portrait: 'gabriel', side: 'right', text: 'Indeed!' },
 *   ], () => { console.log('dialogue done'); });
 *
 * Each line: { character, portrait, side: 'left'|'right', text }
 * portrait maps to: assets/characters/{portrait}-idle.png and {portrait}-talk.png
 */
const DialogueEngine = {

  _queue: [],
  _index: 0,
  _isTyping: false,
  _onComplete: null,
  _typeTimer: null,
  _talkTimer: null,
  _clickHandler: null,

  start(lines, onComplete) {
    this._queue = lines;
    this._index = 0;
    this._onComplete = onComplete;

    const overlay = document.getElementById('dialogue-overlay');
    overlay.style.display = 'flex';

    // Show cat companion badge if cat was found
    if (GameState.catFound) {
      document.getElementById('cat-companion').classList.remove('hidden');
    }

    // Slide dialogue box up
    const box = document.getElementById('dialogue-box');
    gsap.set(box, { y: 70, opacity: 0 });
    gsap.to(box, { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out',
      onComplete: () => this._showLine()
    });

    this._clickHandler = () => this._handleClick();
    overlay.addEventListener('click', this._clickHandler);
  },

  _showLine() {
    const line = this._queue[this._index];

    // Speaker name
    document.getElementById('dialogue-speaker-name').textContent = line.character;

    // Clear text
    const textEl = document.getElementById('dialogue-text-content');
    textEl.textContent = '';

    // Portraits
    document.getElementById('dialogue-portrait-left').innerHTML  = '';
    document.getElementById('dialogue-portrait-right').innerHTML = '';

    if (line.portrait) {
      const img = document.createElement('img');
      img.src = `assets/characters/${line.portrait}-talk.png`;
      img.id  = '_active_portrait';

      if (line.side === 'right') {
        document.getElementById('dialogue-portrait-right').appendChild(img);
      } else {
        document.getElementById('dialogue-portrait-left').appendChild(img);
      }

      this._startTalkAnim(line.portrait);
    }

    // Typewriter
    this._isTyping = true;
    let i = 0;
    const text = line.text;

    this._typeTimer = setInterval(() => {
      i++;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(this._typeTimer);
        this._typeTimer = null;
        this._isTyping = false;
        this._stopTalkAnim(line.portrait);
      }
    }, 26);
  },

  _startTalkAnim(portraitName) {
    if (this._talkTimer) clearInterval(this._talkTimer);
    let frame = true;
    this._talkTimer = setInterval(() => {
      const img = document.getElementById('_active_portrait');
      if (img) {
        img.src = frame
          ? `assets/characters/${portraitName}-talk.png`
          : `assets/characters/${portraitName}-idle.png`;
        frame = !frame;
      }
    }, 190);
  },

  _stopTalkAnim(portraitName) {
    if (this._talkTimer) { clearInterval(this._talkTimer); this._talkTimer = null; }
    const img = document.getElementById('_active_portrait');
    if (img) img.src = `assets/characters/${portraitName}-idle.png`;
  },

  _handleClick() {
    // If still typing: skip to end of current line
    if (this._isTyping) {
      clearInterval(this._typeTimer);
      this._typeTimer = null;
      this._isTyping = false;
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
    if (this._typeTimer)  clearInterval(this._typeTimer);
    if (this._talkTimer)  clearInterval(this._talkTimer);

    const overlay = document.getElementById('dialogue-overlay');
    overlay.removeEventListener('click', this._clickHandler);

    const box = document.getElementById('dialogue-box');
    gsap.to(box, {
      y: 70, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        overlay.style.display = 'none';
        document.getElementById('cat-companion').classList.add('hidden');
        document.getElementById('dialogue-portrait-left').innerHTML  = '';
        document.getElementById('dialogue-portrait-right').innerHTML = '';
        document.getElementById('dialogue-text-content').textContent = '';
        if (this._onComplete) this._onComplete();
      }
    });
  },
};