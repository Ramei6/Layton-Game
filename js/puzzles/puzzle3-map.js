/**
 * Puzzle 3 — The Carnival's Gift
 *
 * A map of the Venice area. 5 clickable locations.
 * Clues on the left panel point to Mestre (mainland, train station).
 * Player clicks the correct destination to solve.
 *
 * Map image: assets/ui/map-venice.png (1280×720 region, see prompt below)
 * Clickable zones are defined as percentage-based areas over the image.
 */
const Puzzle3Map = {

  _selected: null,

  // Zone definitions: { id, label, x, y, width, height } in PIXELS on a 700×500 map image
  // Adjust these after you generate your map image to match where landmarks actually appear
  ZONES: [
    { id: 'murano',  label: 'Murano',         x: 420, y: 120, w: 90,  h: 60  },
    { id: 'burano',  label: 'Burano',          x: 530, y: 60,  w: 90,  h: 60  },
    { id: 'lido',    label: 'Lido di Venezia', x: 480, y: 310, w: 100, h: 55  },
    { id: 'mestre',  label: 'Mestre',          x: 80,  y: 200, w: 100, h: 60  },  // ← correct
    { id: 'venezia', label: 'Venice',          x: 290, y: 220, w: 110, h: 80  },
  ],

  open() {
    this._selected = null;

    PuzzleShell.open({
      id:     'p3',
      number: '03',
      title:  "The Carnival's Gift",
      description: `
        <p>The mysterious carnival figure has left you a map and five cryptic clues.</p>
        <br>
        <p><em>"Your next destination..."</em></p>
        <br>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:10px;">
          <li>🔹 <em>It is not surrounded by water.</em></li>
          <li>🔹 <em>It sits where the lagoon meets the mainland.</em></li>
          <li>🔹 <em>Every train from Venice stops here first.</em></li>
          <li>🔹 <em>It is the city next door — the one most visitors overlook.</em></li>
          <li>🔹 <em>La Tana di Oberix is waiting there.</em></li>
        </ul>
        <br>
        <p>Click the correct location on the map.</p>
      `,
      hints: [
        "The answer is not an island — Venice and its surrounding islands are all on water.",
        "Think about where the train from Venice goes before leaving the lagoon area entirely.",
        "Mestre is the mainland district directly connected to Venice by the Ponte della Libertà.",
      ],
      init:          (container) => this._render(container),
      checkSolution: ()          => this._selected === 'mestre',
      onSolve:       ()          => Scene2StMarco.onMapSolved(),
    });
  },

  _render(container) {
    this._selected = null;

    container.innerHTML = `
      <style>
        #map-wrap {
          position: relative;
          width: 700px;
          height: 500px;
          margin: auto;
          top: 50%;
          transform: translateY(-50%);
          user-select: none;
        }

        #map-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
          border: 2px solid rgba(200,160,32,0.4);
        }

        .map-zone {
          position: absolute;
          border: 2px solid rgba(200,160,32,0.0);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .map-zone:hover {
          background: rgba(200,160,32,0.18);
          border-color: rgba(200,160,32,0.7);
        }

        .map-zone.selected {
          background: rgba(200,160,32,0.30);
          border-color: #f0d060;
          box-shadow: 0 0 12px rgba(240,208,80,0.5);
        }

        .zone-label {
          background: rgba(10,8,2,0.82);
          color: #f5e8cc;
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 4px;
          pointer-events: none;
          white-space: nowrap;
          border: 1px solid rgba(200,160,32,0.3);
          opacity: 0;
          transition: opacity 0.15s;
        }

        .map-zone:hover .zone-label,
        .map-zone.selected .zone-label {
          opacity: 1;
        }

        /* Map pin shown on selected zone */
        .map-zone.selected::before {
          content: '📍';
          position: absolute;
          top: -22px;
          font-size: 18px;
          animation: pin-drop 0.3s ease-out;
        }

        @keyframes pin-drop {
          from { transform: translateY(-10px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      </style>

      <div id="map-wrap">
        <img id="map-img" src="assets/ui/map-venice.png" alt="Map of the Venice area">
        <!-- Zones injected by JS below -->
      </div>
    `;

    const wrap = container.querySelector('#map-wrap');

    this.ZONES.forEach(zone => {
      const el = document.createElement('div');
      el.className = 'map-zone';
      el.dataset.id = zone.id;

      Object.assign(el.style, {
        left:   zone.x + 'px',
        top:    zone.y + 'px',
        width:  zone.w + 'px',
        height: zone.h + 'px',
      });

      el.innerHTML = `<span class="zone-label">${zone.label}</span>`;

      el.addEventListener('click', () => {
        // Deselect all
        wrap.querySelectorAll('.map-zone').forEach(z => z.classList.remove('selected'));
        el.classList.add('selected');
        this._selected = zone.id;

        gsap.from(el, { scale: 1.15, duration: 0.25, ease: 'back.out(2)' });
      });

      wrap.appendChild(el);
    });
  },
};