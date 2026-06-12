/* ============================================================
   PANES — Product detail page logic
   Big configurator + live price + specs + related doors.
   ============================================================ */
(function () {
  const P = window.PANES;
  const { DOORS, FINISHES, CONFIG, unitSVG, doorSceneHTML, computePrice, shippingFor, specsFor, defaultSel, optA11y, optKeyboardNav } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });
  const qs = new URLSearchParams(location.search);

  let door = DOORS.find(d => d.name.toLowerCase() === (qs.get('door') || '').toLowerCase()) || DOORS[0];
  let sel = defaultSel(door);
  // restore a saved/shared build
  if (qs.get('b') && P.builds) {
    const b = P.builds.decode(qs.get('b'));
    if (b && b.product === 'door') {
      const d = DOORS.find(x => x.name === b.name);
      if (d) { door = d; sel = Object.assign(defaultSel(d), b.sel); }
    }
  }

  const visual = document.getElementById('visual');
  const info = document.getElementById('info');

  // keep the address bar in sync with the build, so refresh / copy-URL keeps it
  function syncURL() {
    if (!P.builds) return;
    const token = P.builds.encode({ product: 'door', name: door.name, sel });
    history.replaceState(null, '', '?door=' + encodeURIComponent(door.name) + '&b=' + token);
  }

  document.title = door.name + ' | doorbyyou';
  document.getElementById('crumbName').textContent = door.name;
  document.getElementById('crumbMat').textContent = door.material;

  function paintVisual() {
    visual.innerHTML = unitSVG(door, sel);
  }

  function optRow(items, key, render) {
    return `<div class="opt-row" data-key="${key}">${items.map((it, i) =>
      render(it, i, i === sel[key])).join('')}</div>`;
  }

  const HELP = CONFIG.help || {};
  const hintIco = (k) => HELP[k] ? `<button class="hint" type="button" data-tip="${HELP[k]}" aria-label="What is this?">?</button>` : '';

  /* collapsible option sections — open state survives re-renders */
  const secOpen = { layout: true };
  const VAL = {
    config: () => CONFIG.configurations[sel.config].label,
    height: () => CONFIG.heights[sel.height].label,
    size: () => CONFIG.sizes[sel.size].label,
    finish: () => FINISHES[CONFIG.finishKeys[sel.finish]].label,
    frame: () => FINISHES[CONFIG.finishKeys[sel.frame]].label,
    grooves: () => CONFIG.paintedGrooves[sel.grooves].label,
    glass: () => CONFIG.glass[sel.glass].label,
    transom: () => CONFIG.transoms[sel.transom].label,
    handle: () => CONFIG.handles[sel.handle].label,
    handleSide: () => CONFIG.handleSides[sel.handleSide].label,
    hinge: () => CONFIG.hinges[sel.hinge].label,
    jamb: () => CONFIG.jambs[sel.jamb].label,
    brickmould: () => CONFIG.brickmould[sel.brickmould].label,
    region: () => CONFIG.shipping.regions[sel.region].label,
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

  // transient +$/−$ pop next to the price when an option changes it
  function popDelta(diff) {
    if (!diff) return;
    const el = info.querySelector('.pdp-price');
    if (!el) return;
    const sp = document.createElement('span');
    sp.className = 'delta ' + (diff > 0 ? 'up' : 'down');
    sp.textContent = (diff > 0 ? '+' : '−') + fmt(Math.abs(diff));
    el.appendChild(sp);
    setTimeout(() => sp.remove(), 1500);
  }

  function paintInfo() {
    const fk = CONFIG.finishKeys;
    info.innerHTML = `
      <div class="eyebrow">${door.material} · ${door.style}</div>
      <h1>${door.name}</h1>
      <div class="pdp-price">${fmt(computePrice(door, sel))}<small>Configured price · before tax &amp; freight</small></div>
      <p class="pdp-desc">${door.desc} Finished identically inside and out, prepped for a multi-point lock and ready to drop into your opening.</p>

      ${sec('layout', 'Layout & size', ['config', 'height', 'size'], `
      <div class="grp">
        <div class="lbl"><span>Configuration${hintIco('config')}</span> <b>${CONFIG.configurations[sel.config].label}</b></div>
        ${optRow(CONFIG.configurations, 'config', (c, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${c.label}</button>`)}
      </div>
      <div class="grp">
        <div class="lbl">Height <b>${CONFIG.heights[sel.height].label}</b></div>
        ${optRow(CONFIG.heights, 'height', (h, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${h.label}</button>`)}
      </div>
      <div class="grp">
        <div class="lbl">Size <b>${CONFIG.sizes[sel.size].label}</b></div>
        ${optRow(CONFIG.sizes, 'size', (s, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${s.label}${s.add?' +'+fmt(s.add):''}</button>`)}
        <div class="size-help">Not sure which size? <a href="Measuring Guide.html">Read the measuring guide →</a></div>
      </div>`)}
      ${sec('colour', 'Colour & finish', ['finish', 'frame', 'grooves'], `
      <div class="grp">
        <div class="lbl">Slab colour <b>${FINISHES[fk[sel.finish]].label}</b></div>
        ${optRow(fk, 'finish', (k, i, on) => `<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`)}
      </div>
      <div class="grp">
        <div class="lbl">Frame colour <b>${FINISHES[fk[sel.frame]].label}</b></div>
        ${optRow(fk, 'frame', (k, i, on) => `<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`)}
      </div>
      <div class="grp">
        <div class="lbl"><span>Painted grooves${hintIco('grooves')}</span> <b>${CONFIG.paintedGrooves[sel.grooves].label}</b></div>
        ${optRow(CONFIG.paintedGrooves, 'grooves', (g, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${g.label}${g.add?' +'+fmt(g.add):''}</button>`)}
      </div>`)}
      ${sec('glass', 'Glass & transom', ['glass', 'transom'], `
      <div class="grp">
        <div class="lbl"><span>Decorative glass${hintIco('glass')}</span> <b>${CONFIG.glass[sel.glass].label}</b></div>
        ${optRow(CONFIG.glass, 'glass', (g, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${g.label}${g.price?' +'+fmt(g.price):''}</button>`)}
      </div>
      <div class="grp">
        <div class="lbl"><span>Transom${hintIco('transom')}</span> <b>${CONFIG.transoms[sel.transom].label}</b></div>
        ${optRow(CONFIG.transoms, 'transom', (t, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${t.label}${t.add?' +'+fmt(t.add):''}</button>`)}
      </div>`)}
      ${sec('hardware', 'Hardware', ['handle', 'handleSide', 'hinge'], `
      <div class="grp">
        <div class="lbl">Handle &amp; lock <b>${CONFIG.handles[sel.handle].label}</b></div>
        ${optRow(CONFIG.handles, 'handle', (h, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${h.label}${h.add?' +'+fmt(h.add):''}</button>`)}
      </div>
      <div class="grp">
        <div class="lbl"><span>Handle side${hintIco('handleSide')}</span> <b>${CONFIG.handleSides[sel.handleSide].label}</b></div>
        ${optRow(CONFIG.handleSides, 'handleSide', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}
      </div>
      <div class="grp">
        <div class="lbl"><span>Hinges${hintIco('hinge')}</span> <b>${CONFIG.hinges[sel.hinge].label}</b></div>
        ${optRow(CONFIG.hinges, 'hinge', (h, i, on) => `<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${CONFIG.hinges[i].label}${h.add?' +'+fmt(h.add):''}" style="background:${h.swatch}"></button>`)}
      </div>`)}
      ${sec('install', 'Frame & install', ['jamb', 'brickmould'], `
      <div class="grp">
        <div class="lbl"><span>Jamb size${hintIco('jamb')}</span> <b>${CONFIG.jambs[sel.jamb].label}</b></div>
        ${optRow(CONFIG.jambs, 'jamb', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}
      </div>
      <div class="grp">
        <div class="lbl"><span>Brick mould${hintIco('brickmould')}</span> <b>${CONFIG.brickmould[sel.brickmould].label}</b></div>
        ${optRow(CONFIG.brickmould, 'brickmould', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}${x.add?' +'+fmt(x.add):''}</button>`)}
      </div>`)}
      ${sec('delivery', 'Delivery', ['region'], `
      <div class="grp">
        <div class="lbl">Ship to <b>${CONFIG.shipping.regions[sel.region].label}</b></div>
        ${optRow(CONFIG.shipping.regions, 'region', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}
        <div class="ship-est" style="font-size:13.5px;color:var(--ink-2);margin:10px 0 4px;">Estimated freight to ${CONFIG.shipping.regions[sel.region].label}: <b style="color:var(--ink);">${fmt(shippingFor(sel))}</b> · added at checkout</div>
      </div>`)}

      <div class="pdp-cta">
        <button class="btn solid" id="addBtn">Add to cart · ${fmt(computePrice(door, sel))}</button>
        <button class="btn ghost" id="saveBtn">Save build</button>
      </div>
      <button class="btn ghost sm" id="sampleBtn" style="margin-top:12px;width:100%;justify-content:center;">Order stain colour samples · ${fmt(CONFIG.samplePrice)} ea</button>
      <div class="build-actions" style="margin-top:12px;">
        <button class="btn ghost sm" id="shareBtn" style="flex:1;justify-content:center;">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round"/></svg>Copy share link</button>
      </div>
      <button class="btn ghost sm" id="vizBtn" style="margin-top:12px;width:100%;justify-content:center;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M3 17l5-4 4 3 3-2 6 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        See it on your home
      </button>
      <div class="ship-note">
        <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12h18M21 6v12M3 12l4-4M3 12l4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>Ships Canada &amp; US</div>
        <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke-linejoin="round"/></svg>Lifetime warranty</div>
        <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>Ships in 4–5 weeks</div>
      </div>`;

    info.querySelectorAll('.osec-head').forEach(h => h.addEventListener('click', () => {
      const id = h.parentElement.dataset.sec;
      secOpen[id] = !secOpen[id];
      paintInfo();
    }));
    optA11y(info);

    info.querySelectorAll('.opt-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]'); if (!b) return;
        const key = row.dataset.key;
        const before = computePrice(door, sel) + shippingFor(sel);
        sel[key] = +b.dataset.i;
        const after = computePrice(door, sel) + shippingFor(sel);
        const visualKeys = ['config', 'finish', 'frame', 'glass', 'transom', 'hinge', 'handleSide', 'grooves', 'brickmould'];
        paintInfo();
        popDelta(after - before);
        if (visualKeys.includes(key)) paintVisual();
        paintThumbsActive();
        syncURL();
      });
    });

    const vb = info.querySelector('#vizBtn');
    if (vb) vb.addEventListener('click', () => P.openVisualizer(door, sel));

    const smp = info.querySelector('#sampleBtn');
    if (smp) smp.addEventListener('click', () => {
      P.cart.add({ key: `sample-${CONFIG.finishKeys[sel.finish]}`, title: 'Stain colour sample',
        sub: `${FINISHES[CONFIG.finishKeys[sel.finish]].label} chip · credited on a door order`,
        price: CONFIG.samplePrice, art: { kind: 'sample' } });
      P.cartToast('Colour sample');
    });

    const ab = info.querySelector('#addBtn');
    if (ab) ab.addEventListener('click', () => {
      const fk = CONFIG.finishKeys[sel.finish];
      P.cart.add({
        key: `door-${door.name}-${sel.config}-${sel.height}-${fk}-${sel.glass}-${sel.transom}`,
        title: door.name,
        sub: `${CONFIG.configurations[sel.config].label} · ${FINISHES[fk].label}${sel.transom?' · transom':''}`,
        price: computePrice(door, sel),
        art: { kind: 'door', name: door.name, finish: fk },
      });
      P.cartToast(door.name);
    });

    const buildOf = () => ({ product: 'door', name: door.name, sel: Object.assign({}, sel),
      price: computePrice(door, sel), title: door.name,
      sub: `${CONFIG.configurations[sel.config].label} · ${FINISHES[CONFIG.finishKeys[sel.finish]].label}` });
    const svb = info.querySelector('#saveBtn');
    if (svb) svb.addEventListener('click', () => {
      P.builds.save(buildOf());
      svb.textContent = 'Saved \u2713';
      P.builds.toast('Build saved', 'Saved.html');
    });
    const shb = info.querySelector('#shareBtn');
    if (shb) shb.addEventListener('click', async () => {
      const ok = await P.builds.copy(P.builds.shareURL(buildOf()));
      P.builds.toast(ok ? 'Share link copied to clipboard' : 'Copy failed \u2014 see address bar');
    });
  }

  /* finish thumbnails under the visual */
  const thumbs = document.getElementById('thumbs');
  function paintThumbs() {
    thumbs.innerHTML = CONFIG.finishKeys.map((k, i) =>
      `<button class="pdp-thumb ${i===sel.finish?'on':''}" data-i="${i}" title="${FINISHES[k].label}" aria-label="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`).join('');
    thumbs.querySelectorAll('.pdp-thumb').forEach(t => t.addEventListener('click', () => {
      sel.finish = +t.dataset.i; paintVisual(); paintInfo(); paintThumbsActive(); syncURL();
    }));
  }
  function paintThumbsActive() {
    thumbs.querySelectorAll('.pdp-thumb').forEach((t, i) => t.classList.toggle('on', i === sel.finish));
  }

  /* specs */
  function paintSpecs() {
    document.getElementById('specs').innerHTML = specsFor(door)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }

  /* related */
  function paintRelated() {
    const rel = DOORS.filter(d => d.name !== door.name && d.material === door.material).slice(0, 4);
    const pool = rel.length >= 4 ? rel : DOORS.filter(d => d.name !== door.name).slice(0, 4);
    document.getElementById('related').innerHTML = pool.map(d => `
      <a class="card" href="Door.html?door=${encodeURIComponent(d.name)}">
        <div class="stage"><span class="badge">${d.material}</span>${doorSceneHTML(d)}</div>
        <div class="info"><div class="top"><div class="name">${d.name}</div><div class="price">${fmt(computePrice(d, defaultSel(d)))}</div></div>
        <div class="from">${d.style} · Starting from</div></div>
      </a>`).join('');
  }

  /* accordion */
  document.getElementById('guide').addEventListener('click', (e) => {
    const head = e.target.closest('.acc-head'); if (!head) return;
    const item = head.parentElement;
    const body = item.querySelector('.acc-body');
    const open = item.classList.toggle('open');
    body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
  });
  // init open accordion height
  function initAcc() {
    const open = document.querySelector('.acc-item.open .acc-body');
    if (open) open.style.maxHeight = open.scrollHeight + 'px';
  }

  optKeyboardNav(info);
  paintVisual(); paintInfo(); paintThumbs(); paintSpecs(); paintRelated(); initAcc();
})();
