/* ============================================================
   PANES — Windows step configurator
   Frame → Style → Configure → Review, with live preview.
   ============================================================ */
(function () {
  const P = window.PANES;
  const { WINDOWS, WINCONFIG, FINISHES, windowSVG, computeWinPrice, defaultWinSel, builds } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });
  const qs = new URLSearchParams(location.search);

  let st = { step: 0, win: null, sel: null };

  // deep-links
  const pre = qs.get('win') && WINDOWS.find(w => w.name.toLowerCase() === qs.get('win').toLowerCase());
  if (pre) { st.win = pre; st.sel = defaultWinSel(pre); st.step = 2; }
  if (qs.get('b') && builds) {
    const b = builds.decode(qs.get('b'));
    if (b && b.product === 'window') {
      const w = WINDOWS.find(x => x.name === b.name);
      if (w) { st.win = w; st.sel = Object.assign(defaultWinSel(w), b.sel); st.step = 2; }
    }
  }

  const pane = document.getElementById('preview');
  const paneR = document.getElementById('pane');
  const backBtn = document.getElementById('back');
  const nextBtn = document.getElementById('next');
  const priceTag = document.getElementById('priceTag');
  const stepsEl = document.getElementById('steps');

  const finOf = () => WINCONFIG.finishKeys[st.sel ? st.sel.finish : 0];

  function paintPreview() {
    if (!st.win) { pane.innerHTML = '<div class="empty">Choose a frame and style<br>to preview your window</div>'; return; }
    pane.innerHTML = windowSVG(st.win, finOf(), st.step >= 2 ? st.sel : null);
  }

  function paintSteps() {
    stepsEl.querySelectorAll('.step').forEach((el, i) => {
      el.classList.toggle('active', i === st.step);
      el.classList.toggle('done', i < st.step);
    });
  }

  /* ---- steps ---- */
  function stepFrame() {
    const min = Math.min(...WINDOWS.map(w => w.price));
    paneR.innerHTML = `
      <h2>Choose a frame</h2>
      <p class="sub">Every window is dual-pane Low-E and ENERGY STAR rated. Pick the frame material that fits your look and budget.</p>
      <div class="mat-cards">
        ${WINCONFIG.frames.map((fr, i) => `
          <div class="mat-card ${st.sel && st.sel.frame === i ? 'on' : ''}" data-i="${i}">
            <h3>${fr.label}</h3><p>${fr.desc}</p>
            <div class="from">${fr.mult === 1 ? 'from ' + fmt(min) : '+' + Math.round((fr.mult - 1) * 100) + '% premium'}</div>
          </div>`).join('')}
      </div>`;
    paneR.querySelectorAll('.mat-card').forEach(c => c.addEventListener('click', () => {
      if (!st.frame && st.frame !== 0) st.frame = 0;
      st.frame = +c.dataset.i;
      paneR.querySelectorAll('.mat-card').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      if (st.sel) st.sel.frame = st.frame;
      updateNav();
    }));
  }

  function stepStyle() {
    paneR.innerHTML = `
      <h2>Choose a style</h2>
      <p class="sub">${WINDOWS.length} window styles. Pick one to configure size, color, grids and glass.</p>
      <div class="model-grid">
        ${WINDOWS.map(w => `<div class="model ${st.win && st.win.name === w.name ? 'on' : ''}" data-name="${w.name}">
          <div class="ms">${windowSVG(w)}</div>
          <div class="mt"><b>${w.name}</b><span>${w.type} · ${fmt(w.price)}</span></div>
        </div>`).join('')}
      </div>`;
    paneR.querySelectorAll('.model').forEach(m => m.addEventListener('click', () => {
      st.win = WINDOWS.find(w => w.name === m.dataset.name);
      st.sel = defaultWinSel(st.win);
      st.sel.frame = st.frame || 0;
      paneR.querySelectorAll('.model').forEach(x => x.classList.remove('on'));
      m.classList.add('on');
      paintPreview(); updateNav();
    }));
  }

  function optRow(items, key, render) {
    return `<div class="opt-row" data-key="${key}">${items.map((it, i) => render(it, i, i === st.sel[key])).join('')}</div>`;
  }

  function stepConfigure() {
    const s = st.sel, fk = WINCONFIG.finishKeys;
    paneR.innerHTML = `
      <h2>Configure ${st.win.name}</h2>
      <p class="sub">Live price updates as you build. Ships free with a lifetime warranty.</p>
      <div class="grp"><div class="lbl">Frame <b>${WINCONFIG.frames[s.frame].label}</b></div>
        ${optRow(WINCONFIG.frames, 'frame', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="grp"><div class="lbl">Size <b>${WINCONFIG.sizes[s.size].label}</b></div>
        ${optRow(WINCONFIG.sizes, 'size', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="grp"><div class="lbl">Exterior color <b>${FINISHES[fk[s.finish]].label}</b></div>
        ${optRow(fk, 'finish', (k, i, on) => `<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`)}</div>
      <div class="grp"><div class="lbl">Grids <b>${WINCONFIG.grids[s.grid].label}</b></div>
        ${optRow(WINCONFIG.grids, 'grid', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>
      <div class="grp"><div class="lbl">Glass <b>${WINCONFIG.glass[s.glass].label}</b></div>
        ${optRow(WINCONFIG.glass, 'glass', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>
      <div class="grp"><div class="lbl">Interior finish <b>${WINCONFIG.interior[s.interior].label}</b></div>
        ${optRow(WINCONFIG.interior, 'interior', (x, i, on) => x.sw
          ? `<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${x.label}" style="background:${x.sw}"></button>`
          : `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="grp"><div class="lbl">Screen <b>${WINCONFIG.screens[s.screen].label}</b></div>
        ${optRow(WINCONFIG.screens, 'screen', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?(x.add>0?' +'+fmt(x.add):' '+fmt(x.add)):''}</button>`)}</div>`;
    paneR.querySelectorAll('.opt-row').forEach(row => row.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      st.sel[row.dataset.key] = +b.dataset.i;
      stepConfigure(); paintPreview(); updateNav();
    }));
  }

  function stepReview() {
    const s = st.sel, w = st.win;
    const rows = [
      ['Style', `${w.name} · ${w.type}`],
      ['Frame', WINCONFIG.frames[s.frame].label],
      ['Size', WINCONFIG.sizes[s.size].label],
      ['Exterior color', FINISHES[WINCONFIG.finishKeys[s.finish]].label],
      ['Grids', WINCONFIG.grids[s.grid].label],
      ['Glass', WINCONFIG.glass[s.glass].label],
      ['Interior', WINCONFIG.interior[s.interior].label],
      ['Screen', WINCONFIG.screens[s.screen].label],
    ];
    paneR.innerHTML = `
      <h2>Review your build</h2>
      <p class="sub">Looks good? Add it to your cart — final measurements are confirmed before production.</p>
      <div class="summary">
        ${rows.map(([k, v]) => `<div class="srow"><span>${k}</span><span>${v}</span></div>`).join('')}
        <div class="srow total"><span>Configured total</span><b>${fmt(computeWinPrice(w, s))}</b></div>
      </div>
      <div class="build-actions">
        <button class="btn ghost sm" id="saveBuild"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke-linejoin="round"/></svg>Save build</button>
        <button class="btn ghost sm" id="shareBuild"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round"/></svg>Copy share link</button>
      </div>`;
    const mk = () => ({ product: 'window', name: w.name, sel: s, price: computeWinPrice(w, s),
      title: w.name + ' Window', sub: `${WINCONFIG.sizes[s.size].label} · ${WINCONFIG.frames[s.frame].label} · ${FINISHES[WINCONFIG.finishKeys[s.finish]].label}` });
    const sb = paneR.querySelector('#saveBuild');
    if (sb) sb.addEventListener('click', () => {
      builds.save(mk());
      sb.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 12l4 4 10-10" stroke-linecap="round" stroke-linejoin="round"/></svg>Saved';
      builds.toast('Build saved', 'Saved.html');
    });
    const shb = paneR.querySelector('#shareBuild');
    if (shb) shb.addEventListener('click', async () => {
      const ok = await builds.copy(builds.shareURL(mk()));
      builds.toast(ok ? 'Share link copied to clipboard' : 'Copy failed — see address bar');
    });
  }

  const RENDER = [stepFrame, stepStyle, stepConfigure, stepReview];

  function updateNav() {
    backBtn.style.visibility = st.step === 0 ? 'hidden' : 'visible';
    let ok = true;
    if (st.step === 0) ok = (st.frame === 0 || st.frame > 0) && st.frame != null;
    if (st.step === 1) ok = !!st.win;
    nextBtn.disabled = !ok;
    nextBtn.textContent = st.step === 3 ? 'Add to cart' : 'Continue';
    priceTag.textContent = (st.step >= 2 && st.win) ? fmt(computeWinPrice(st.win, st.sel)) : '';
  }

  function render() {
    RENDER[st.step]();
    paintSteps(); paintPreview(); updateNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    if (st.step === 3) {
      const fk = WINCONFIG.finishKeys[st.sel.finish];
      P.cart.add({
        key: `win-${st.win.name}-${st.sel.frame}-${st.sel.size}-${fk}-${st.sel.grid}-${st.sel.glass}-${Date.now()}`,
        title: st.win.name + ' Window',
        sub: `${WINCONFIG.sizes[st.sel.size].label} · ${WINCONFIG.frames[st.sel.frame].label} · ${FINISHES[fk].label}`,
        price: computeWinPrice(st.win, st.sel),
        art: { kind: 'window', name: st.win.name, finish: fk },
      });
      P.cartToast(st.win.name + ' Window');
      nextBtn.textContent = 'Added ✓';
      setTimeout(() => { location.href = 'Cart.html'; }, 900);
      return;
    }
    if (st.step === 0 && st.frame == null) st.frame = 0;
    if (st.step === 1 && !st.sel) { st.sel = defaultWinSel(st.win); st.sel.frame = st.frame || 0; }
    st.step++; render();
  });
  backBtn.addEventListener('click', () => { if (st.step > 0) { st.step--; render(); } });
  stepsEl.addEventListener('click', (e) => {
    const s = e.target.closest('.step'); if (!s) return;
    const target = +s.dataset.s;
    if (target < st.step || (target === 1 && st.frame != null) || (target >= 2 && st.win)) { st.step = target; render(); }
  });

  // default frame selected
  if (st.frame == null) st.frame = 0;
  render();
})();
