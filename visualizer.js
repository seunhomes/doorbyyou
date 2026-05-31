/* ============================================================
   PANES — Home Visualizer
   Upload a photo of your home, then drag & scale the configured
   door onto it to preview how it looks in place.
   Usage:  PANES.openVisualizer(door, sel)
   ============================================================ */
(function () {
  const P = window.PANES;
  let root, stage, photoImg, overlay, fileInput, sizeSlider, hint;
  let drag = null;
  const pos = { x: 0.5, y: 0.62, scale: 0.42 }; // relative placement
  let savedPhoto = null;

  function build() {
    root = document.createElement('div');
    root.className = 'viz-overlay';
    root.innerHTML = `
      <div class="viz-modal">
        <div class="viz-head">
          <div>
            <div class="viz-eyebrow">Home Visualizer</div>
            <div class="viz-title" id="vizTitle">See it on your home</div>
          </div>
          <button class="viz-close" id="vizClose" aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="viz-stage" id="vizStage">
          <div class="viz-empty" id="vizEmpty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M3 17l5-4 4 3 3-2 6 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <p>Upload a photo of your home's entrance</p>
            <button class="btn solid" id="vizUploadBig">Choose photo</button>
            <span class="viz-note">Tip: a straight-on shot of your doorway works best</span>
          </div>
          <div class="viz-door" id="vizDoor"></div>
        </div>
        <div class="viz-controls" id="vizControls">
          <button class="btn ghost sm" id="vizChange">Change photo</button>
          <div class="viz-size">
            <span>Size</span>
            <input type="range" id="vizSize" min="18" max="86" value="42" />
          </div>
          <button class="btn ghost sm" id="vizReset">Reset position</button>
          <div class="viz-spacer"></div>
          <span class="viz-hint" id="vizHint">Drag the door to position it</span>
        </div>
      </div>
      <input type="file" id="vizFile" accept="image/*" hidden />`;
    document.body.appendChild(root);

    stage = root.querySelector('#vizStage');
    overlay = root.querySelector('#vizDoor');
    fileInput = root.querySelector('#vizFile');
    sizeSlider = root.querySelector('#vizSize');
    hint = root.querySelector('#vizHint');

    root.querySelector('#vizClose').addEventListener('click', close);
    root.addEventListener('click', (e) => { if (e.target === root) close(); });
    root.querySelector('#vizUploadBig').addEventListener('click', () => fileInput.click());
    root.querySelector('#vizChange').addEventListener('click', () => fileInput.click());
    root.querySelector('#vizReset').addEventListener('click', () => { pos.x = 0.5; pos.y = 0.62; place(); });
    fileInput.addEventListener('change', onFile);
    sizeSlider.addEventListener('input', () => { pos.scale = +sizeSlider.value / 100; place(); });

    // drag
    overlay.addEventListener('pointerdown', (e) => {
      drag = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
      overlay.setPointerCapture(e.pointerId);
      overlay.classList.add('dragging');
    });
    overlay.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      pos.x = Math.min(1, Math.max(0, drag.px + (e.clientX - drag.sx) / r.width));
      pos.y = Math.min(1, Math.max(0, drag.py + (e.clientY - drag.sy) / r.height));
      place();
    });
    const endDrag = () => { drag = null; overlay.classList.remove('dragging'); };
    overlay.addEventListener('pointerup', endDrag);
    overlay.addEventListener('pointercancel', endDrag);

    // drag-and-drop a file onto the stage
    stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('over'); });
    stage.addEventListener('dragleave', () => stage.classList.remove('over'));
    stage.addEventListener('drop', (e) => {
      e.preventDefault(); stage.classList.remove('over');
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) loadPhoto(f);
    });
  }

  function onFile(e) { const f = e.target.files && e.target.files[0]; if (f) loadPhoto(f); }

  function loadPhoto(file) {
    const url = URL.createObjectURL(file);
    if (savedPhoto) URL.revokeObjectURL(savedPhoto);
    savedPhoto = url;
    let bg = stage.querySelector('.viz-photo');
    if (!bg) { bg = document.createElement('img'); bg.className = 'viz-photo'; stage.prepend(bg); }
    bg.src = url;
    root.querySelector('#vizEmpty').style.display = 'none';
    overlay.style.display = 'block';
    root.querySelector('#vizControls').style.display = 'flex';
    place();
  }

  function place() {
    const r = stage.getBoundingClientRect();
    const h = r.height * pos.scale * 1.18;
    overlay.style.height = h + 'px';
    overlay.style.left = (pos.x * r.width) + 'px';
    overlay.style.top = (pos.y * r.height) + 'px';
  }

  function close() { root.classList.remove('open'); document.body.style.overflow = ''; }

  P.openVisualizer = function (door, sel) {
    if (!root) build();
    root.querySelector('#vizTitle').textContent = 'See ' + door.name + ' on your home';
    overlay.innerHTML = P.unitSVG(door, sel, { bare: true });
    const svg = overlay.querySelector('svg');
    if (svg) { svg.style.height = '100%'; svg.style.width = 'auto'; svg.style.display = 'block'; svg.style.filter = 'drop-shadow(0 14px 26px rgba(0,0,0,.45))'; }
    // reset to empty-or-photo state
    if (savedPhoto) {
      root.querySelector('#vizEmpty').style.display = 'none';
      overlay.style.display = 'block';
      root.querySelector('#vizControls').style.display = 'flex';
      requestAnimationFrame(place);
    } else {
      root.querySelector('#vizEmpty').style.display = '';
      overlay.style.display = 'none';
      root.querySelector('#vizControls').style.display = 'none';
    }
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    sizeSlider.value = Math.round(pos.scale * 100);
  };
})();
