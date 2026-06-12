/* ============================================================
   PANES — Standalone step configurator
   Material → Model → Configure → Review, with live preview.
   ============================================================ */
(function () {
  const P = window.PANES;
  const { DOORS, FINISHES, CONFIG, unitSVG, doorSceneHTML, computePrice, shippingFor, defaultSel, optA11y, optKeyboardNav } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  const qs = new URLSearchParams(location.search);
  let st = {
    step: 0,
    material: null,
    door: null,
    sel: null,
  };
  // deep-link: ?door=Name jumps straight to configure
  const pre = qs.get('door') && DOORS.find(d => d.name.toLowerCase() === qs.get('door').toLowerCase());
  if (pre) { st.material = pre.material; st.door = pre; st.sel = defaultSel(pre); st.step = 2; }
  // deep-link: ?b=token restores a saved/shared build
  if (qs.get('b') && P.builds) {
    const b = P.builds.decode(qs.get('b'));
    if (b && b.product === 'door') {
      const d = DOORS.find(x => x.name === b.name);
      if (d) { st.material = d.material; st.door = d; st.sel = Object.assign(defaultSel(d), b.sel); st.step = 2; }
    }
  }

  const pane = document.getElementById('preview');
  const paneR = document.getElementById('pane');
  const backBtn = document.getElementById('back');
  const nextBtn = document.getElementById('next');
  const priceTag = document.getElementById('priceTag');
  const stepsEl = document.getElementById('steps');

  // with a single material there is nothing to choose — start on Model
  const MATERIALS = [...new Set(DOORS.map(d => d.material))];
  const SKIP_MAT = MATERIALS.length === 1;
  if (SKIP_MAT) {
    st.material = MATERIALS[0];
    if (st.step === 0) st.step = 1;
    const m0 = stepsEl.querySelector('.step[data-s="0"]');
    if (m0) m0.style.display = 'none';
    stepsEl.querySelectorAll('.step').forEach((el, i) => { if (i > 0) el.querySelector('.n').textContent = i; });
  }
  const FIRST_STEP = SKIP_MAT ? 1 : 0;

  // keep the address bar in sync with the build, so refresh / copy-URL keeps it
  function syncURL() {
    if (!P.builds || !st.door || st.step < 2) return;
    const token = P.builds.encode({ product: 'door', name: st.door.name, sel: st.sel });
    history.replaceState(null, '', '?b=' + token);
  }

  function paintPreview() {
    if (!st.door) { pane.innerHTML = '<div class="empty">Choose a material and model<br>to preview your door</div>'; return; }
    pane.innerHTML = st.step >= 2 ? unitSVG(st.door, st.sel) : doorSceneHTML(st.door);
  }

  function paintSteps() {
    stepsEl.querySelectorAll('.step').forEach((el, i) => {
      el.classList.toggle('active', i === st.step);
      el.classList.toggle('done', i < st.step);
    });
  }

  /* ---- step renderers ---- */
  function stepMaterial() {
    const fg = DOORS.filter(d => d.material === 'Fiberglass');
    const stl = DOORS.filter(d => d.material === 'Steel');
    const min = (arr) => arr.length ? Math.min(...arr.map(d => computePrice(d, defaultSel(d)))) : 0;
    paneR.innerHTML = `
      <h2>Choose a material</h2>
      <p class="sub">Insulated, low-maintenance fibreglass slabs in a wood-grain finish, built to your exact size and stained to order.</p>
      <div class="mat-cards">
        <div class="mat-card ${st.material==='Fiberglass'?'on':''}" data-mat="Fiberglass">
          <h3>Fiberglass</h3>
          <p>Wood-grain skin, dent-proof and stainable, in oak / mahogany / teak species. The full range of groove designs.</p>
          <div class="from">${fg.length} models · from ${fmt(min(fg))}</div>
        </div>
        ${stl.length ? `<div class="mat-card ${st.material==='Steel'?'on':''}" data-mat="Steel">
          <h3>Steel</h3>
          <p>24-gauge galvanized face, polyurethane core. The most affordable secure entry.</p>
          <div class="from">${stl.length} models · from ${fmt(min(stl))}</div>
        </div>` : ''}
      </div>`;
    paneR.querySelectorAll('.mat-card').forEach(c => c.addEventListener('click', () => {
      st.material = c.dataset.mat;
      if (st.door && st.door.material !== st.material) { st.door = null; st.sel = null; }
      render();
    }));
  }

  function stepModel() {
    const list = DOORS.filter(d => d.material === st.material);
    paneR.innerHTML = `
      <h2>Choose a model</h2>
      <p class="sub">${list.length} ${st.material.toLowerCase()} designs. Pick one to configure — you can change the finish next.</p>
      <div class="model-grid">
        ${list.map(d => `<div class="model ${st.door&&st.door.name===d.name?'on':''}" data-name="${d.name}">
          <div class="ms">${doorSceneHTML(d)}</div>
          <div class="mt"><b>${d.name}</b><span>${d.style} · from ${fmt(computePrice(d, defaultSel(d)))}</span></div>
        </div>`).join('')}
      </div>`;
    paneR.querySelectorAll('.model').forEach(m => m.addEventListener('click', () => {
      st.door = DOORS.find(d => d.name === m.dataset.name);
      st.sel = defaultSel(st.door);
      paneR.querySelectorAll('.model').forEach(x => x.classList.remove('on'));
      m.classList.add('on');
      paintPreview(); updateNav();
    }));
  }

  function optRow(items, key, render) {
    return `<div class="opt-row" data-key="${key}">${items.map((it, i) => render(it, i, i === st.sel[key])).join('')}</div>`;
  }

  const HELP = CONFIG.help || {};
  const hintIco = (k) => HELP[k] ? `<button class="hint" type="button" data-tip="${HELP[k]}" aria-label="What is this?">?</button>` : '';

  /* collapsible option sections — open state survives re-renders */
  const secOpen = { layout: true };
  const VAL = {
    config: () => CONFIG.configurations[st.sel.config].label,
    height: () => CONFIG.heights[st.sel.height].label,
    size: () => CONFIG.sizes[st.sel.size].label,
    finish: () => FINISHES[CONFIG.finishKeys[st.sel.finish]].label,
    frame: () => FINISHES[CONFIG.finishKeys[st.sel.frame]].label,
    grooves: () => CONFIG.paintedGrooves[st.sel.grooves].label,
    glass: () => CONFIG.glass[st.sel.glass].label,
    transom: () => CONFIG.transoms[st.sel.transom].label,
    handle: () => CONFIG.handles[st.sel.handle].label,
    handleSide: () => CONFIG.handleSides[st.sel.handleSide].label,
    hinge: () => CONFIG.hinges[st.sel.hinge].label,
    jamb: () => CONFIG.jambs[st.sel.jamb].label,
    brickmould: () => CONFIG.brickmould[st.sel.brickmould].label,
    region: () => CONFIG.shipping.regions[st.sel.region].label,
  };
  function sec(id, title, keys, inner) {
    const open = !!secOpen[id];
    return `<div class="osec ${open ? 'open' : ''}" data-sec="${id}">
      <button class="osec-head" type="button" aria-expanded="${open}">
        <span class="osec-t">${title}</span>
        <span class="osec-sum">${open ? '' : keys.map(k => VAL[k]()).join(' · ')}</span>
        <svg class="osec-chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="osec-body">${inner}</div>
    </div>`;
  }

  // transient +$/−$ pop next to the running price when an option changes it
  function popDelta(diff) {
    if (!diff) return;
    const sp = document.createElement('span');
    sp.className = 'delta ' + (diff > 0 ? 'up' : 'down');
    sp.textContent = (diff > 0 ? '+' : '−') + fmt(Math.abs(diff));
    priceTag.appendChild(sp);
    setTimeout(() => sp.remove(), 1500);
  }

  function stepConfigure() {
    const fk = CONFIG.finishKeys, s = st.sel;
    paneR.innerHTML = `
      <h2>Configure ${st.door.name}</h2>
      <p class="sub">Live price updates as you build. Freight is added at checkout; lifetime warranty included.</p>
      ${sec('layout', 'Layout & size', ['config', 'height', 'size'], `
      <div class="grp"><div class="lbl"><span>Configuration${hintIco('config')}</span> <b>${CONFIG.configurations[s.config].label}</b></div>
        ${optRow(CONFIG.configurations,'config',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="grp"><div class="lbl">Height <b>${CONFIG.heights[s.height].label}</b></div>
        ${optRow(CONFIG.heights,'height',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="grp"><div class="lbl">Size <b>${CONFIG.sizes[s.size].label}</b></div>
        ${optRow(CONFIG.sizes,'size',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}
        <div class="size-help">Not sure which size? <a href="Measuring Guide.html">Read the measuring guide →</a></div></div>`)}
      ${sec('colour', 'Colour & finish', ['finish', 'frame', 'grooves'], `
      <div class="grp"><div class="lbl">Slab colour <b>${FINISHES[fk[s.finish]].label}</b></div>
        ${optRow(fk,'finish',(k,i,on)=>`<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`)}</div>
      <div class="grp"><div class="lbl">Frame colour <b>${FINISHES[fk[s.frame]].label}</b></div>
        ${optRow(fk,'frame',(k,i,on)=>`<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`)}</div>
      <div class="grp"><div class="lbl"><span>Painted grooves${hintIco('grooves')}</span> <b>${CONFIG.paintedGrooves[s.grooves].label}</b></div>
        ${optRow(CONFIG.paintedGrooves,'grooves',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>`)}
      ${sec('glass', 'Glass & transom', ['glass', 'transom'], `
      <div class="grp"><div class="lbl"><span>Decorative glass${hintIco('glass')}</span> <b>${CONFIG.glass[s.glass].label}</b></div>
        ${optRow(CONFIG.glass,'glass',(g,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${g.label}${g.price?' +'+fmt(g.price):''}</button>`)}</div>
      <div class="grp"><div class="lbl"><span>Transom${hintIco('transom')}</span> <b>${CONFIG.transoms[s.transom].label}</b></div>
        ${optRow(CONFIG.transoms,'transom',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>`)}
      ${sec('hardware', 'Hardware', ['handle', 'handleSide', 'hinge'], `
      <div class="grp"><div class="lbl">Handle &amp; lock <b>${CONFIG.handles[s.handle].label}</b></div>
        ${optRow(CONFIG.handles,'handle',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>
      <div class="grp"><div class="lbl"><span>Handle side${hintIco('handleSide')}</span> <b>${CONFIG.handleSides[s.handleSide].label}</b></div>
        ${optRow(CONFIG.handleSides,'handleSide',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="grp"><div class="lbl"><span>Hinges${hintIco('hinge')}</span> <b>${CONFIG.hinges[s.hinge].label}</b></div>
        ${optRow(CONFIG.hinges,'hinge',(x,i,on)=>`<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${x.label}${x.add?' +'+fmt(x.add):''}" style="background:${x.swatch}"></button>`)}</div>`)}
      ${sec('install', 'Frame & install', ['jamb', 'brickmould'], `
      <div class="grp"><div class="lbl"><span>Jamb size${hintIco('jamb')}</span> <b>${CONFIG.jambs[s.jamb].label}</b></div>
        ${optRow(CONFIG.jambs,'jamb',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>
      <div class="grp"><div class="lbl"><span>Brick mould${hintIco('brickmould')}</span> <b>${CONFIG.brickmould[s.brickmould].label}</b></div>
        ${optRow(CONFIG.brickmould,'brickmould',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}</div>`)}
      ${sec('delivery', 'Delivery', ['region'], `
      <div class="grp"><div class="lbl">Ship to <b>${CONFIG.shipping.regions[s.region].label}</b></div>
        ${optRow(CONFIG.shipping.regions,'region',(x,i,on)=>`<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}
        <div class="sub" style="margin:10px 0 0;">Estimated freight to ${CONFIG.shipping.regions[s.region].label}: <b>${fmt(shippingFor(s))}</b> · added at checkout</div></div>`)}
      <button class="btn ghost sm" id="sampleBtn" style="margin-top:16px;width:100%;justify-content:center;">Order stain colour samples · ${fmt(CONFIG.samplePrice)} ea</button>
      <button class="btn ghost sm" id="vizBtn" style="margin-top:10px;width:100%;justify-content:center;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M3 17l5-4 4 3 3-2 6 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        See it on your home
      </button>`;
    paneR.querySelectorAll('.osec-head').forEach(h => h.addEventListener('click', () => {
      const id = h.parentElement.dataset.sec;
      secOpen[id] = !secOpen[id];
      stepConfigure();
    }));
    optA11y(paneR);
    paneR.querySelectorAll('.opt-row').forEach(row => row.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      const before = computePrice(st.door, st.sel) + shippingFor(st.sel);
      st.sel[row.dataset.key] = +b.dataset.i;
      const after = computePrice(st.door, st.sel) + shippingFor(st.sel);
      stepConfigure(); paintPreview(); updateNav(); syncURL();
      popDelta(after - before);
    }));
    const vb = paneR.querySelector('#vizBtn');
    if (vb) vb.addEventListener('click', () => P.openVisualizer(st.door, st.sel));
    const smp = paneR.querySelector('#sampleBtn');
    if (smp) smp.addEventListener('click', () => {
      P.cart.add({ key: `sample-${fk[s.finish]}`, title: 'Stain colour sample',
        sub: `${FINISHES[fk[s.finish]].label} chip · credited on a door order`,
        price: CONFIG.samplePrice, art: { kind: 'sample' } });
      P.cartToast('Colour sample');
    });
  }

  function stepReview() {
    const s = st.sel, d = st.door;
    const rows = [
      ['Model', `${d.name} · ${d.material}`],
      ['Configuration', CONFIG.configurations[s.config].label],
      ['Height', CONFIG.heights[s.height].label],
      ['Size', CONFIG.sizes[s.size].label],
      ['Slab colour', FINISHES[CONFIG.finishKeys[s.finish]].label],
      ['Frame colour', FINISHES[CONFIG.finishKeys[s.frame]].label],
      ['Painted grooves', CONFIG.paintedGrooves[s.grooves].label],
      ['Decorative glass', CONFIG.glass[s.glass].label],
      ['Transom', CONFIG.transoms[s.transom].label],
      ['Handle & lock', `${CONFIG.handles[s.handle].label} · ${CONFIG.handleSides[s.handleSide].label}`],
      ['Jamb size', CONFIG.jambs[s.jamb].label],
      ['Brick mould', CONFIG.brickmould[s.brickmould].label],
      ['Hinges', CONFIG.hinges[s.hinge].label],
    ];
    paneR.innerHTML = `
      <h2>Review your build</h2>
      <p class="sub">Looks good? Add it to your cart — final measurements are confirmed before production.</p>
      <div class="summary">
        ${rows.map(([k,v]) => `<div class="srow"><span>${k}</span><span>${v}</span></div>`).join('')}
        <div class="srow"><span>Freight · ${CONFIG.shipping.regions[s.region].label}</span><span>${fmt(shippingFor(s))}</span></div>
        <div class="srow total"><span>Total incl. freight</span><b>${fmt(computePrice(d,s) + shippingFor(s))}</b></div>
      </div>
      <p class="sub" style="margin-top:16px;display:flex;gap:8px;align-items:center;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="1.6"><path d="M3 12h18M21 6v12M3 12l4-4M3 12l4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Ships in 4–5 weeks · lifetime warranty</p>
      <div class="build-actions">
        <button class="btn ghost sm" id="saveBuild">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke-linejoin="round"/></svg>Save build</button>
        <button class="btn ghost sm" id="shareBuild">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round"/></svg>Copy share link</button>
      </div>
      <div class="quote-box">
        <h3>Not ready to order? Get a written quote.</h3>
        <p>We'll confirm pricing, freight and lead time for this exact build — no obligation.</p>
        <div class="q-grid">
          <input id="qName" type="text" placeholder="Name" autocomplete="name">
          <input id="qEmail" type="email" placeholder="Email" autocomplete="email">
          <input id="qPhone" type="tel" placeholder="Phone · optional" autocomplete="tel">
          <textarea id="qNotes" rows="2" placeholder="Anything we should know? Rough opening size, timeline…"></textarea>
        </div>
        <button class="btn solid sm" id="quoteBtn" style="width:100%;justify-content:center;">Request my quote</button>
        <p class="q-hint" id="qHint"></p>
      </div>`;
    const build = () => ({ product: 'door', name: d.name, sel: s, price: computePrice(d, s),
      title: d.name, sub: `${CONFIG.configurations[s.config].label} · ${FINISHES[CONFIG.finishKeys[s.finish]].label}` });
    const sb = paneR.querySelector('#saveBuild');
    if (sb) sb.addEventListener('click', () => {
      P.builds.save(build());
      sb.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 12l4 4 10-10" stroke-linecap="round" stroke-linejoin="round"/></svg>Saved';
      P.builds.toast('Build saved', 'Saved.html');
    });
    const shb = paneR.querySelector('#shareBuild');
    if (shb) shb.addEventListener('click', async () => {
      const ok = await P.builds.copy(P.builds.shareURL(build()));
      P.builds.toast(ok ? 'Share link copied to clipboard' : 'Copy failed — link in address bar');
    });
    const qb = paneR.querySelector('#quoteBtn');
    if (qb) qb.addEventListener('click', () => {
      const name = paneR.querySelector('#qName').value.trim();
      const email = paneR.querySelector('#qEmail').value.trim();
      const phone = paneR.querySelector('#qPhone').value.trim();
      const notes = paneR.querySelector('#qNotes').value.trim();
      const hint = paneR.querySelector('#qHint');
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        hint.textContent = 'Please add your name and a valid email so we can reply.';
        hint.style.color = '#a33';
        return;
      }
      const body = [
        'Quote request — ' + d.name + ' (' + d.material + ')', '',
        ...rows.map(([k, v]) => k + ': ' + v),
        'Freight · ' + CONFIG.shipping.regions[s.region].label + ': ' + fmt(shippingFor(s)),
        'Total incl. freight: ' + fmt(computePrice(d, s) + shippingFor(s)), '',
        'Build link: ' + P.builds.shareURL(build()), '',
        'Name: ' + name,
        'Email: ' + email,
        phone ? 'Phone: ' + phone : '',
        notes ? 'Notes: ' + notes : '',
      ].filter(Boolean).join('\n');
      location.href = 'mailto:' + CONFIG.quoteEmail
        + '?subject=' + encodeURIComponent('Quote request — ' + d.name)
        + '&body=' + encodeURIComponent(body);
      hint.style.color = '';
      hint.textContent = 'Your email app should open with the quote pre-filled — just hit send.';
    });
  }

  const RENDER = [stepMaterial, stepModel, stepConfigure, stepReview];

  function updateNav() {
    backBtn.style.visibility = st.step === FIRST_STEP ? 'hidden' : 'visible';
    let ok = true;
    if (st.step === 0) ok = !!st.material;
    if (st.step === 1) ok = !!st.door;
    nextBtn.disabled = !ok;
    nextBtn.textContent = st.step === 3 ? 'Add to cart' : 'Continue';
    priceTag.textContent = (st.step >= 2 && st.door) ? fmt(computePrice(st.door, st.sel)) : '';
  }

  function render() {
    RENDER[st.step]();
    paintSteps(); paintPreview(); updateNav(); syncURL();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    if (st.step === 3) {
      const fk = CONFIG.finishKeys[st.sel.finish];
      P.cart.add({
        key: `door-${st.door.name}-${st.sel.config}-${st.sel.height}-${fk}-${st.sel.glass}-${st.sel.transom}-${Date.now()}`,
        title: st.door.name,
        sub: `${CONFIG.configurations[st.sel.config].label} · ${FINISHES[fk].label}${st.sel.transom?' · transom':''}`,
        price: computePrice(st.door, st.sel),
        art: { kind: 'door', name: st.door.name, finish: fk },
      });
      P.cartToast(st.door.name);
      nextBtn.textContent = 'Added ✓';
      setTimeout(() => { location.href = 'Cart.html'; }, 900);
      return;
    }
    if (st.step === 1 && !st.sel) st.sel = defaultSel(st.door);
    st.step++; render();
  });
  backBtn.addEventListener('click', () => { if (st.step > FIRST_STEP) { st.step--; render(); } });
  stepsEl.addEventListener('click', (e) => {
    const s = e.target.closest('.step'); if (!s) return;
    const target = +s.dataset.s;
    if (SKIP_MAT && target === 0) return;
    if (target < st.step || (target === 1 && st.material) || (target >= 2 && st.door)) { st.step = target; render(); }
  });

  optKeyboardNav(paneR);
  render();
})();
