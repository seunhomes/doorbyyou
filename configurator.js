/* ============================================================
   doorbyyou — Guided step-by-step door configurator
   Design → Grain → Layout & size → Frame → Swing → Colour →
   Glass → Hardware → Review, with live preview.
   Every required choice must be made explicitly before the
   customer can continue — nothing is silently defaulted.
   ============================================================ */
(function () {
  const P = window.PANES;
  const { DOORS, FINISHES, CONFIG, unitSVG, doorSceneHTML, computePrice, shippingFor, defaultSel, optA11y, optKeyboardNav } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });
  const HW = CONFIG.hardware;
  const HELP = CONFIG.help || {};
  const hintIco = (k) => HELP[k] ? `<button class="hint" type="button" data-tip="${HELP[k]}" aria-label="What is this?">?</button>` : '';

  const STEPS = [
    { t: 'Design' }, { t: 'Grain' }, { t: 'Layout' }, { t: 'Frame' }, { t: 'Swing' },
    { t: 'Colour' }, { t: 'Glass' }, { t: 'Hardware' }, { t: 'Trim' }, { t: 'Your Home' }, { t: 'Review' },
  ];
  const REVIEW = STEPS.length - 1;
  const HOME = REVIEW - 1;   // optional photo step — never blocks Continue

  const qs = new URLSearchParams(location.search);
  let st = { step: 0, door: null, sel: null, picked: {}, view: 'ext',
    home: { url: null, x: 0.5, y: 0.62, scale: 0.42 } };   // photo composite (kept on-device only)

  const ALL_KEYS = ['grain','config','slSide','transom','slabW','height','frameFinish','brickmould','threshold','jamb',
    'swing','finish','interior','interiorC','frame','glassSL','glassTR',
    'hw','mpStyle','barSize','barColor','tLever','dbShape','dbColor',
    'trim','trimFinish','trimStyle','trimSize'];
  const pickAll = () => { ALL_KEYS.forEach(k => st.picked[k] = true); };

  // deep-link: ?door=Name preselects the design
  const pre = qs.get('door') && DOORS.find(d => d.name.toLowerCase() === qs.get('door').toLowerCase());
  if (pre) { st.door = pre; st.sel = defaultSel(pre); }
  // deep-link: ?b=token restores a saved/shared build (treated as fully chosen)
  if (qs.get('b') && P.builds) {
    const b = P.builds.decode(qs.get('b'));
    if (b && b.product === 'door') {
      const d = DOORS.find(x => x.name === b.name);
      if (d) { st.door = d; st.sel = Object.assign(defaultSel(d), b.sel); pickAll(); st.step = REVIEW; }
    }
  }

  const pane = document.getElementById('preview');
  const paneR = document.getElementById('pane');
  const backBtn = document.getElementById('back');
  const nextBtn = document.getElementById('next');
  const priceTag = document.getElementById('priceTag');
  const stepsEl = document.getElementById('steps');
  const headPrice = document.getElementById('headPrice');
  const headPriceVal = document.getElementById('headPriceVal');

  /* ---------- helpers over the data ---------- */
  const sel = () => st.sel;
  const grainKey = () => (CONFIG.grains[sel().grain] || {}).key;
  const hwKey = () => (HW.types[sel().hw] || {}).key;
  const mpKey = () => (HW.mpStyles[sel().mpStyle] || {}).key;
  const sidesN = () => (CONFIG.configurations[sel().config] || {}).sides || 0;
  const finLabel = (i) => (FINISHES[CONFIG.finishKeys[i]] || {}).label || '—';
  // which finishKeys indices are valid for the chosen grain
  const finishIdxFor = (gr) => CONFIG.finishKeys
    .map((k, i) => ({ k, i }))
    .filter(o => gr === 'smooth' ? FINISHES[o.k].palette : FINISHES[o.k].stain)
    .map(o => o.i);
  // custom slab size: cw/ch inches on sel when customSize is on
  const CW_MIN = 28, CW_MAX = 48, CH_MIN = 76, CH_MAX = 108;
  const customOK = () => { const s = sel(); return !!(s.customSize && s.cw >= CW_MIN && s.cw <= CW_MAX && s.ch >= CH_MIN && s.ch <= CH_MAX); };
  const effSlabW = () => customOK() ? sel().cw : CONFIG.slabWidths[sel().slabW].w;
  const effSlabH = () => customOK() ? sel().ch : CONFIG.slabHeights[sel().height].hIn;

  function pick(key, idx) {
    st.sel[key] = idx;
    st.picked[key] = true;
    // frame follows the slab colour until it's explicitly chosen (or Same-as-slab is on)
    if (key === 'finish' && (st.sel.frameSame || !st.picked.frame)) st.sel.frame = idx;
  }

  /* ---------- completion / validation ---------- */
  function missingFor(i) {
    if (!st.door || !st.sel) return ['a door design'];
    const s = sel(), p = st.picked, need = [];
    const req = (k, label) => { if (!p[k]) need.push(label); };
    switch (i) {
      case 0: if (!st.door) need.push('a door design'); break;
      case 1: req('grain', 'a grain'); break;
      case 2: req('config', 'a layout');
              if (sidesN() === 1) req('slSide', 'which side the sidelite goes');
              req('transom', 'a transom choice');
              if (s.customSize) {
                if (!(s.cw >= CW_MIN && s.cw <= CW_MAX)) need.push(`a custom width (${CW_MIN}–${CW_MAX}")`);
                if (!(s.ch >= CH_MIN && s.ch <= CH_MAX)) need.push(`a custom height (${CH_MIN}–${CH_MAX}")`);
              } else { req('slabW', 'slab width'); req('height', 'slab height'); }
              break;
      case 3: req('frameFinish', 'frame finish'); req('brickmould', 'brickmould');
              req('threshold', 'threshold / sill'); req('jamb', 'jamb size'); break;
      case 4: req('swing', 'swing & hinging'); break;
      case 5: req('finish', 'exterior colour'); req('interior', 'interior colour');
              if ((CONFIG.interiors[s.interior] || {}).custom) req('interiorC', 'the interior custom colour');
              req('frame', 'frame colour'); break;
      case 6: if (sidesN()) req('glassSL', 'sidelite glass');
              if (s.transom) req('glassTR', 'transom glass'); break;
      case 7: req('hw', 'a hardware package');
              if (hwKey() === 'mp') {
                req('mpStyle', 'multipoint style');
                if (mpKey() === 'bar') { req('barSize', 'pull bar size'); req('barColor', 'pull bar colour'); req('tLever', 't-lever style'); }
              }
              if (hwKey() === 'ball') { req('barSize', 'pull bar size'); req('barColor', 'pull bar colour'); req('dbShape', 'deadbolt shape'); req('dbColor', 'deadbolt colour'); }
              break;
      case 8: req('trim', 'trim or no trim');
              if (s.trim === 1) { req('trimFinish', 'painted or stained'); req('trimStyle', 'a trim style'); req('trimSize', 'a casing width'); }
              break;
    }
    return need;
  }
  const stepComplete = (i) => missingFor(i).length === 0;
  function firstIncomplete() {
    for (let i = 0; i < REVIEW; i++) if (!stepComplete(i)) return i;
    return REVIEW;
  }

  function syncURL() {
    if (!P.builds || !st.door) return;
    const token = P.builds.encode({ product: 'door', name: st.door.name, sel: st.sel });
    history.replaceState(null, '', '?b=' + token);
  }

  /* ---------- preview ---------- */
  // inches → display fraction in eighths, e.g. 37.5 → 37-1/2"
  function inFrac(v) {
    const w = Math.floor(v), f = Math.round((v - w) * 8);
    if (f === 0) return w + '"';
    if (f === 8) return (w + 1) + '"';
    const d = f % 2 ? [f, 8] : f % 4 ? [f / 2, 4] : [f / 4, 2];
    return w + '-' + d[0] + '/' + d[1] + '"';
  }
  // numeric unit size in inches — shared by the dims callouts and the scene composite
  function unitInches() {
    const s = sel(), cfg = CONFIG.configurations[s.config];
    const slabW = effSlabW(), slabH = effSlabH();
    const doorW = cfg.dbl ? slabW * 2 + 2.25 : slabW + 1.5;      // slab(s) + frame
    const slW = 14.75;                                            // sidelite incl. frame
    const w = doorW + cfg.sides * slW;
    const h = slabH + 3.375 + (s.transom ? (CONFIG.transoms[s.transom].arch ? 20 : 16) : 0);
    return { w: w, h: h, doorW: doorW, slW: slW };
  }
  // unit / rough-opening measurements from the current selection
  function computeDims() {
    const u = unitInches();
    return { w: inFrac(u.w), roW: inFrac(u.w + 1), h: inFrac(u.h), roH: inFrac(u.h + 0.5),
      door: inFrac(u.doorW), sl: inFrac(u.slW) };
  }
  /* home-photo composite: uploaded photo + draggable, scalable door overlay */
  function placeHomeDoor() {
    const stage = pane.querySelector('.hv-stage'), ov = pane.querySelector('.hv-door');
    if (!stage || !ov) return;
    const r = stage.getBoundingClientRect();
    ov.style.height = (r.height * st.home.scale * 1.18) + 'px';
    ov.style.left = (st.home.x * r.width) + 'px';
    ov.style.top = (st.home.y * r.height) + 'px';
  }
  function paintHomePreview() {
    pane.innerHTML = `
      <div class="hv-stage">
        <img src="${st.home.url}" alt="Your home">
        <div class="hv-door">${unitSVG(st.door, st.sel, { bare: true, noHandle: !st.picked.hw, noGrain: !st.picked.grain })}</div>
      </div>
      <div class="pv-cap"><span>Your home · ${st.door.name}</span><b>Drag the door into place · size slider on the right</b></div>`;
    pane.querySelector('.hv-stage img').addEventListener('load', placeHomeDoor);
    requestAnimationFrame(placeHomeDoor);
    const ov = pane.querySelector('.hv-door');
    ov.addEventListener('pointerdown', (e) => {
      const r = pane.querySelector('.hv-stage').getBoundingClientRect();
      const d = { sx: e.clientX, sy: e.clientY, px: st.home.x, py: st.home.y, r };
      ov.setPointerCapture(e.pointerId);
      ov.classList.add('dragging');
      const move = (ev) => {
        st.home.x = Math.min(1, Math.max(0, d.px + (ev.clientX - d.sx) / d.r.width));
        st.home.y = Math.min(1, Math.max(0, d.py + (ev.clientY - d.sy) / d.r.height));
        placeHomeDoor();
      };
      const up = () => {
        ov.classList.remove('dragging');
        ov.removeEventListener('pointermove', move);
        ov.removeEventListener('pointerup', up);
        ov.removeEventListener('pointercancel', up);
      };
      ov.addEventListener('pointermove', move);
      ov.addEventListener('pointerup', up);
      ov.addEventListener('pointercancel', up);
    });
  }

  function paintPreview() {
    if (!st.door) { pane.innerHTML = '<div class="empty">Pick a door design<br>to start your build</div>'; return; }
    if (st.step === 0) { pane.innerHTML = doorSceneHTML(st.door); return; }
    if (st.step === HOME && st.home.url) { paintHomePreview(); return; }
    const s = sel();
    const sized = customOK() || (!s.customSize && st.picked.slabW && st.picked.height);
    const bits = [st.door.name];
    if (sized) bits.push(customOK()
      ? `Custom ${inFrac(s.cw)} × ${inFrac(s.ch)}`
      : `${CONFIG.slabWidths[s.slabW].label} × ${CONFIG.slabHeights[s.height].hIn}"`);
    if (st.picked.swing) bits.push(`${s.handleSide === 0 ? 'Left' : 'Right'} hand hinge`, CONFIG.swings[s.swing].label);
    pane.innerHTML = unitSVG(st.door, st.sel, { dims: sized ? computeDims() : null, view: st.view,
      noHandle: st.step < 7 || !st.picked.hw, noGrain: !st.picked.grain }) + `
      <div class="pv-cap"><span>Live preview · ${st.view === 'int' ? 'interior' : 'exterior'} view</span><b>${bits.join(' · ')}</b></div>
      <div class="pv-toggle" role="group" aria-label="Preview side">
        <button type="button" class="${st.view !== 'int' ? 'on' : ''}" data-v="ext">Exterior</button>
        <button type="button" class="${st.view === 'int' ? 'on' : ''}" data-v="int">Interior</button>
      </div>`;
    pane.querySelectorAll('.pv-toggle button').forEach(b => b.addEventListener('click', () => {
      st.view = b.dataset.v;
      paintPreview();
    }));
  }

  function paintSteps() {
    const fi = firstIncomplete();
    stepsEl.innerHTML = STEPS.map((s, i) => {
      const done = i < fi;
      const reachable = i <= fi;
      return `<button type="button" class="step ${i === st.step ? 'active' : ''} ${done && i !== st.step ? 'done' : ''} ${reachable ? '' : 'locked'}" data-s="${i}">
        <span class="n">${done && i !== st.step
          ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : i + 1}</span><b>${s.t}</b></button>`;
    }).join('');
  }

  /* ---------- small render helpers ---------- */
  // option row where nothing is highlighted until the customer actually picks
  function row(key, items, render) {
    const on = (i) => st.picked[key] && sel()[key] === i;
    return `<div class="opt-row" data-key="${key}">${items.map((it, i) => render(it, i, on(i))).join('')}</div>`;
  }
  const btns = (key, items, extra = () => '') =>
    row(key, items, (x, i, on) => `<button class="opt-btn ${on ? 'on' : ''}" data-i="${i}">${x.label}${extra(x, i)}</button>`);
  function grp(key, title, inner, hintKey) {
    const chosen = st.picked[key];
    const val = chosen ? valLabel(key) : '<i class="tbc">select…</i>';
    return `<div class="grp req ${chosen ? 'ok' : ''}"><div class="lbl"><span>${title}${hintIco(hintKey || '')}</span> <b>${val}</b></div>${inner}</div>`;
  }
  function valLabel(key) {
    const s = sel();
    switch (key) {
      case 'grain': return CONFIG.grains[s.grain].label;
      case 'config': return CONFIG.configurations[s.config].label
        + (sidesN() === 1 && st.picked.slSide ? ` · sidelite ${s.slSide === 1 ? 'right' : 'left'}` : '');
      case 'slSide': return CONFIG.slSides[s.slSide || 0].label;
      case 'transom': return CONFIG.transoms[s.transom].label;
      case 'slabW': return customOK() ? `Custom ${inFrac(s.cw)}` : CONFIG.slabWidths[s.slabW].label;
      case 'height': return customOK() ? `Custom ${inFrac(s.ch)}` : CONFIG.slabHeights[s.height].label;
      case 'frameFinish': return CONFIG.frameFinishes[s.frameFinish].label;
      case 'brickmould': return CONFIG.brickmould[s.brickmould].label;
      case 'threshold': return CONFIG.thresholds[s.threshold].label;
      case 'jamb': return CONFIG.jambs[s.jamb].label;
      case 'finish': return finLabel(s.finish);
      case 'frame': return s.frameSame ? 'Same as slab' : finLabel(s.frame);
      case 'interior': { const it = CONFIG.interiors[s.interior];
        return it.custom ? (st.picked.interiorC ? 'Custom · ' + finLabel(s.interiorC) : 'Custom colour') : it.label; }
      case 'grooves': return CONFIG.paintedGrooves[s.grooves].label;
      case 'glassSL': return CONFIG.glassStyles[s.glassSL].label;
      case 'glassTR': return CONFIG.glassStyles[s.glassTR].label;
      case 'hw': return HW.types[s.hw].label;
      case 'mpStyle': return HW.mpStyles[s.mpStyle].label;
      case 'barSize': return HW.barSizes[s.barSize].label;
      case 'barColor': return HW.barColors[s.barColor].label;
      case 'tLever': return HW.tLevers[s.tLever].label;
      case 'dbShape': return HW.dbShapes[s.dbShape].label;
      case 'dbColor': return HW.dbColors[s.dbColor].label;
      case 'trim': return CONFIG.trim.options[s.trim || 0].label;
      case 'trimFinish': return CONFIG.trim.finishes[s.trimFinish].label;
      case 'trimStyle': return CONFIG.trim.styles[s.trimStyle].label;
      case 'trimSize': return CONFIG.trim.sizes[s.trimSize].label;
    }
    return '';
  }

  // header running total counts up/down to its new value instead of snapping
  let hpShown = 0, hpRaf = null;
  function rollHeadPrice(target) {
    if (target === hpShown) return;
    if (hpRaf) cancelAnimationFrame(hpRaf);
    // rAF pauses in hidden tabs — land on the final value instead of going stale
    if (document.hidden) { hpShown = target; headPriceVal.textContent = fmt(target); return; }
    const from = hpShown, t0 = performance.now(), DUR = 450;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / DUR);
      const ease = 1 - Math.pow(1 - p, 3);
      hpShown = Math.round(from + (target - from) * ease);
      headPriceVal.textContent = fmt(hpShown);
      if (p < 1) hpRaf = requestAnimationFrame(tick);
    };
    hpRaf = requestAnimationFrame(tick);
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

  /* ---------- pictograms ---------- */
  // layout icon: slab(s) + sidelites (+ transom hint)
  function layoutIcon(cfg) {
    const sl = cfg.sides, dbl = cfg.dbl;
    const dw = dbl ? 26 : 34, gap = 3, sw = 10;
    let x = 6, parts = '', total = (dbl ? dw * 2 + gap : dw) + sl * (sw + gap) + 12;
    const ox = (92 - total) / 2 + 6;
    x = ox;
    if (sl >= 1) { parts += `<rect x="${x}" y="14" width="${sw}" height="48" rx="1.5" class="li-g"/>`; x += sw + gap; }
    parts += `<rect x="${x}" y="12" width="${dw}" height="52" rx="1.5" class="li-d"/>`; x += dw + (dbl ? gap : 0);
    if (dbl) { parts += `<rect x="${x}" y="12" width="${dw}" height="52" rx="1.5" class="li-d"/>`; x += dw; }
    if (sl >= 2) { x += gap; parts += `<rect x="${x}" y="14" width="${sw}" height="48" rx="1.5" class="li-g"/>`; }
    return `<svg viewBox="0 0 104 72" class="li" aria-hidden="true">${parts}</svg>`;
  }
  // just the glass shape, centred — None stays empty
  function transomIcon(tr) {
    const glass = tr.h ? (tr.arch
      ? `<path d="M16 50 A 36 28 0 0 1 88 50 Z" class="li-g"/>`
      : `<rect x="16" y="28" width="72" height="18" rx="2" class="li-g"/>`) : '';
    return `<svg viewBox="0 0 104 72" class="li" aria-hidden="true">${glass}</svg>`;
  }
  // swing diagram: top view, viewed from outside (arc drawn into the swing space)
  function swingSVG(outswing, hingeLeft) {
    const W = 150, H = 112, oL = 40, oR = 104;
    const wy = outswing ? 34 : 78;                                  // wall sits so the swing has room
    const hx = hingeLeft ? oL : oR, ex = hingeLeft ? oR : oL;       // hinge + latch x
    const L = oR - oL;
    const ang = 62 * Math.PI / 180;
    const tipX = hx + Math.cos(ang) * L * (hingeLeft ? 1 : -1);
    const tipY = wy + Math.sin(ang) * L * (outswing ? 1 : -1);
    const sweep = (outswing ? !hingeLeft : hingeLeft) ? 0 : 1;
    return `<svg viewBox="0 0 ${W} ${H}" class="swg" aria-hidden="true">
      <text x="${W / 2}" y="12" class="swg-t">INSIDE</text>
      <text x="${W / 2}" y="${H - 4}" class="swg-t">OUTSIDE · YOU</text>
      <rect x="4" y="${wy - 3}" width="${oL - 4}" height="6" rx="2" class="swg-w"/>
      <rect x="${oR}" y="${wy - 3}" width="${W - oR - 4}" height="6" rx="2" class="swg-w"/>
      <line x1="${oL}" y1="${wy}" x2="${oR}" y2="${wy}" class="swg-c"/>
      <path d="M${ex} ${wy} A ${L} ${L} 0 0 ${sweep} ${tipX} ${tipY}" class="swg-arc"/>
      <line x1="${hx}" y1="${wy}" x2="${tipX}" y2="${tipY}" class="swg-d"/>
      <circle cx="${hx}" cy="${wy}" r="3.4" class="swg-h"/>
    </svg>`;
  }
  // small standalone glass swatch tile
  let _gseq = 0;
  function glassTile(styleIdx) {
    const g = CONFIG.glassStyles[styleIdx];
    const uid = 'gt' + (_gseq++);
    return `<svg viewBox="0 0 54 72" class="gt-svg" aria-hidden="true">
      <defs>${P.glassDefs(uid)}</defs>
      <rect x="1" y="1" width="52" height="70" rx="2" fill="#efece4" stroke="rgba(0,0,0,.15)"/>
      ${P.glassPanel(4, 4, 46, 64, g.tint, uid, false)}
    </svg>`;
  }

  /* ---------- step renderers ---------- */
  function stepDesign() {
    paneR.innerHTML = `
      <h2>Step 1 · Pick your design</h2>
      <p class="sub">${DOORS.length} woodgrain fibreglass designs. Pick the groove pattern you love — everything else comes next.</p>
      <div class="model-grid">
        ${DOORS.map(d => `<div class="model ${st.door && st.door.name === d.name ? 'on' : ''}" data-name="${d.name}">
          <div class="ms">${doorSceneHTML(d)}</div>
          <div class="mt"><b>${d.name}</b><span>${d.style} · from ${fmt(computePrice(d, defaultSel(d)))}</span></div>
        </div>`).join('')}
      </div>`;
    paneR.querySelectorAll('.model').forEach(m => m.addEventListener('click', () => {
      const fresh = !st.door || st.door.name !== m.dataset.name;
      st.door = DOORS.find(d => d.name === m.dataset.name);
      if (fresh) {
        const keep = st.sel;
        st.sel = keep ? Object.assign(defaultSel(st.door), keep, { finish: defaultSel(st.door).finish }) : defaultSel(st.door);
        if (st.picked.finish) st.sel.finish = keep.finish;   // they already chose a colour — keep it
      }
      paneR.querySelectorAll('.model').forEach(x => x.classList.remove('on'));
      m.classList.add('on');
      paintPreview(); paintSteps(); updateNav(); syncURL();
    }));
  }

  function stepGrain() {
    paneR.innerHTML = `
      <h2>Step 2 · Pick your grain</h2>
      <p class="sub">The texture of the fibreglass skin. Wood grains are stained; smooth is painted. ${hintIco('grain')}</p>
      <div class="cards" data-key="grain">
        ${CONFIG.grains.map((g, i) => `<button type="button" class="card ${st.picked.grain && sel().grain === i ? 'on' : ''}" data-i="${i}">
          <span class="grain-chip grain-${g.key}"></span>
          <h3>${g.label}</h3><p>${g.desc}</p>
        </button>`).join('')}
      </div>`;
    bindCards('grain', (i) => {
      // switching between stain-grade and paint-grade invalidates a colour pick
      const allowed = finishIdxFor(grainKey());
      if (!allowed.includes(sel().finish)) {
        sel().finish = allowed[0];
        // frame follows the new default unless the customer chose one explicitly
        if (st.sel.frameSame || !st.picked.frame) st.sel.frame = allowed[0];
        delete st.picked.finish;
      }
      // each grain opens in its signature tone until a colour is chosen
      if (!st.picked.finish) {
        const sig = grainKey() === 'mahogany' ? CONFIG.finishKeys.indexOf('mahogany')
          : grainKey() === 'oak' ? CONFIG.finishKeys.indexOf('golden-oak') : -1;
        if (sig >= 0 && allowed.includes(sig)) {
          sel().finish = sig;
          if (st.sel.frameSame || !st.picked.frame) st.sel.frame = sig;
        }
      }
    });
  }

  function stepLayout() {
    const s = sel();
    const wIn = effSlabW(), hIn = effSlabH();
    const sl = sidesN();
    const slGlassH = hIn - 15;
    const unitW = wIn * (CONFIG.configurations[s.config].dbl ? 2 : 1) + sl * 14 + 6;
    const cust = !!s.customSize;
    paneR.innerHTML = `
      <h2>Step 3 · Layout &amp; size</h2>
      <p class="sub">Choose how the unit is configured, then size the door slab. Glass sizes adjust to the slab automatically.</p>
      ${grp('config', 'Layout', row('config', CONFIG.configurations, (c, i, on) =>
        `<button type="button" class="lay-card ${on ? 'on' : ''}" data-i="${i}">${layoutIcon(c)}<span>${c.label}</span></button>`), 'config')}
      ${(st.picked.config && sidesN() === 1)
        ? grp('slSide', 'Sidelite side · viewed from outside', btns('slSide', CONFIG.slSides))
        : ''}
      ${grp('transom', 'Transom', row('transom', CONFIG.transoms, (t, i, on) =>
        `<button type="button" class="lay-card ${on ? 'on' : ''}" data-i="${i}">${transomIcon(t)}<span>${t.label}</span></button>`), 'transom')}
      ${grp('slabW', 'Slab width', btns('slabW', CONFIG.slabWidths, (x) => x.std ? ' · standard' : ''), 'slab')}
      ${grp('height', 'Slab height', btns('height', CONFIG.slabHeights, (x) => x.std ? ' · standard' : ''), 'slab')}
      <div class="grp">
        <div class="lbl">Custom size <b>${customOK() ? `${inFrac(s.cw)} × ${inFrac(s.ch)}` : cust ? '<span class="tbc">enter both sizes</span>' : ''}</b></div>
        <button type="button" class="opt-btn ${cust ? 'on' : ''}" id="customToggle">${cust ? 'Using a custom size — tap for standard sizes' : 'Need a size not listed? Enter a custom size'}</button>
        ${cust ? `
        <div class="custom-size">
          <label>Width <input type="number" id="cwIn" min="${CW_MIN}" max="${CW_MAX}" step="0.125" value="${s.cw || ''}" placeholder="e.g. 37"> in</label>
          <label>Height <input type="number" id="chIn" min="${CH_MIN}" max="${CH_MAX}" step="0.125" value="${s.ch || ''}" placeholder="e.g. 84"> in</label>
        </div>
        <p class="mini-note">Width ${CW_MIN}–${CW_MAX}" · height ${CH_MIN}–${CH_MAX}", in ⅛" steps. Custom sizes are priced as the nearest standard size — the final price is confirmed on your quote.</p>` : ''}
      </div>
      <div class="size-note">
        <b>Your glass sizes</b>
        <span>Slab: ${wIn}" × ${hIn}"</span>
        ${sl ? `<span>Sidelite glass: ≈ 8" × ${slGlassH}" ${sl > 1 ? '(×2)' : ''}</span>` : ''}
        ${s.transom ? `<span>Transom glass: ≈ ${unitW - 8}" × ${CONFIG.transoms[s.transom].arch ? '16' : '12'}"</span>` : ''}
        <em>Approximate — exact glass sizes are confirmed on your shop drawing.</em>
      </div>
      <div class="size-help">Not sure which size? <a href="Measuring Guide.html">Read the measuring guide →</a></div>`;
    // picking a preset switches custom off; the toggle flips modes
    bindRows({ slabW: () => { st.sel.customSize = false; }, height: () => { st.sel.customSize = false; },
      config: () => { if (sidesN() !== 1) delete st.picked.slSide; } });
    paneR.querySelector('#customToggle').addEventListener('click', () => {
      const before = price();
      st.sel.customSize = !st.sel.customSize;
      afterChange(before);
    });
    // live preview/price while typing — no pane re-render, so focus survives
    ['cwIn', 'chIn'].forEach((id) => {
      const el = paneR.querySelector('#' + id);
      if (!el) return;
      el.addEventListener('input', () => {
        const v = parseFloat(el.value);
        st.sel[id === 'cwIn' ? 'cw' : 'ch'] = isNaN(v) ? null : Math.round(v * 8) / 8;
        paintPreview(); paintSteps(); updateNav(); syncURL();
      });
      el.addEventListener('change', () => render());   // blur/enter refreshes labels + glass note
    });
  }

  function stepFrame() {
    paneR.innerHTML = `
      <h2>Step 4 · Frame</h2>
      <p class="sub">The frame, trim and sill that finish the unit into your wall.</p>
      ${grp('frameFinish', 'Frame finish', btns('frameFinish', CONFIG.frameFinishes), 'frameFinish')}
      ${grp('brickmould', 'Brickmould', btns('brickmould', CONFIG.brickmould), 'brickmould')}
      ${grp('threshold', 'Threshold / sill', row('threshold', CONFIG.thresholds, (t, i, on) =>
        `<button type="button" class="opt-btn sw-btn ${on ? 'on' : ''}" data-i="${i}"><span class="dot" style="background:${t.swatch}"></span>${t.label}</button>`), 'threshold')}
      ${grp('jamb', 'Jamb size', btns('jamb', CONFIG.jambs, (x) => x.note ? ` <small>· ${x.note}</small>` : ''), 'jamb')}`;
    bindRows();
  }

  function stepSwing() {
    const combos = [
      { swing: 0, left: true,  label: 'Inswing · hinges left' },
      { swing: 0, left: false, label: 'Inswing · hinges right' },
      { swing: 1, left: true,  label: 'Outswing · hinges left' },
      { swing: 1, left: false, label: 'Outswing · hinges right' },
    ];
    const s = sel();
    const cur = (c) => st.picked.swing && s.swing === c.swing && ((s.handleSide === 0) === c.left);
    paneR.innerHTML = `
      <h2>Step 5 · Operation &amp; hinging</h2>
      <p class="sub">Stand <b>outside</b>, facing your door — every diagram below is that view. ${hintIco('swing')}</p>
      <div class="cards four" data-key="swingcombo">
        ${combos.map((c, i) => `<button type="button" class="card swing-card ${cur(c) ? 'on' : ''}" data-i="${i}">
          ${swingSVG(c.swing === 1, c.left)}<h3>${c.label.split(' · ')[0]}</h3><p>${c.label.split(' · ')[1]}, handle on the ${c.left ? 'right' : 'left'}</p>
        </button>`).join('')}
      </div>
      <p class="note">Inswing opens into the house (most common). Outswing opens toward you — great for wind resistance and tight hallways. Hinge side is where the door pivots, viewed from outside.</p>`;
    paneR.querySelectorAll('.swing-card').forEach(b => b.addEventListener('click', () => {
      const c = combos[+b.dataset.i];
      const before = price();
      pick('swing', c.swing);
      // hinges left (from outside) ⇒ handle on the right
      st.sel.handleSide = c.left ? 0 : 1;
      afterChange(before);
    }));
  }

  function stepColour() {
    const s = sel();
    const allowed = finishIdxFor(grainKey());
    const fk = CONFIG.finishKeys;
    const swRow = (key, idxs, onIdx, pickedFlag) =>
      `<div class="opt-row" data-key="${key}">${idxs.map(i =>
        `<button type="button" class="opt-sw ${pickedFlag && onIdx === i ? 'on' : ''}" data-i="${i}" title="${finLabel(i)}" style="background:${FINISHES[fk[i]].swatch}"></button>`).join('')}</div>`;
    const interior = CONFIG.interiors[s.interior] || {};
    paneR.innerHTML = `
      <h2>Step 6 · Paint, stain &amp; colour</h2>
      <p class="sub">${grainKey() === 'smooth' ? 'Painted colours for your smooth slab.' : 'Stain tones for your woodgrain slab.'} Inside and out, factory finished.</p>
      ${grp('finish', 'Exterior slab colour', swRow('finish', allowed, s.finish, st.picked.finish))}
      <div class="grp"><div class="lbl"><span>Painted grooves${hintIco('grooves')}</span> <b>${valLabel('grooves')}</b></div>
        ${row('grooves', CONFIG.paintedGrooves, (x, i, on) => `<button class="opt-btn ${(st.picked.grooves ? on : s.grooves === i) ? 'on' : ''}" data-i="${i}">${x.label}</button>`)}
        <div class="mini-note">Groove paint stays in the grooves — the slab colour is untouched.</div></div>
      ${grp('interior', 'Interior colour', row('interior', CONFIG.interiors, (x, i, on) =>
          `<button class="opt-btn ${on ? 'on' : ''}" data-i="${i}">${x.label}</button>`)
        + ((interior.custom && st.picked.interior) ? swRow('interiorC', fk.map((_, i) => i), s.interiorC, st.picked.interiorC) : ''), 'interior')}
      ${grp('frame', 'Frame colour',
        `<div class="opt-row" data-key="frameSame"><button type="button" class="opt-btn same-chip ${s.frameSame ? 'on' : ''}" data-i="0">Same as slab</button></div>`
        + swRow('frame', fk.map((_, i) => i), s.frame, st.picked.frame && !s.frameSame))}
      <div class="safety-note">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3.5c3.5 3.9 6 7.2 6 10.2a6 6 0 01-12 0c0-3 2.5-6.3 6-10.2z" stroke-linejoin="round"/></svg>
        Screen colours are approximate — real stain varies with grain and light. Order a ${fmt(CONFIG.samplePrice)} sample chip at Review; it's credited on your door order.
      </div>`;
    bindRows({
      finish: () => {}, grooves: () => {}, interiorC: () => {},
      interior: () => { if (!(CONFIG.interiors[sel().interior] || {}).custom) delete st.picked.interiorC; },
      frame: () => { st.sel.frameSame = false; },
    });
    const sc = paneR.querySelector('.same-chip');
    if (sc) sc.addEventListener('click', () => {
      const before = price();
      st.sel.frameSame = true;
      st.sel.frame = sel().finish;
      st.picked.frame = true;
      afterChange(before);
    });
  }

  function stepGlass() {
    const s = sel(), sl = sidesN(), tr = s.transom;
    const tiles = (key) => row(key, CONFIG.glassStyles, (g, i, on) =>
      `<button type="button" class="gt ${on ? 'on' : ''}" data-i="${i}">${glassTile(i)}<span>${g.label}</span></button>`);
    paneR.innerHTML = `
      <h2>Step 7 · Glass</h2>
      <p class="sub">Decorative glass for your sidelites and transom — the door slab itself stays solid.</p>
      ${(!sl && !tr) ? `<div class="empty-note">Your layout has no sidelites or transom, so there’s no glass to choose — carry on to hardware.
        Want glass? Go back to <b>Layout</b> and add sidelites or a transom.</div>` : ''}
      ${sl ? grp('glassSL', `Sidelite glass ${sl > 1 ? '· both sidelites' : ''}`, `<div class="gt-grid">${tiles('glassSL')}</div>`) : ''}
      ${tr ? grp('glassTR', 'Transom glass', `<div class="gt-grid">${tiles('glassTR')}</div>`) : ''}
      <div class="safety-note">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l8 3v6c0 4.5-3.4 7.6-8 9-4.6-1.4-8-4.5-8-9V6l8-3z" stroke-linejoin="round"/><path d="M8.5 12l2.4 2.4 4.6-4.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        All glass comes standard with <b>safety tempered glass</b>.
      </div>`;
    bindRows();
  }

  function stepHardware() {
    const s = sel(), k = hwKey();
    const showBar = (k === 'mp' && mpKey() === 'bar' && st.picked.mpStyle) || k === 'ball';
    const swBtns = (key, items) => row(key, items, (x, i, on) =>
      `<button type="button" class="opt-btn sw-btn ${on ? 'on' : ''}" data-i="${i}"><span class="dot" style="background:${x.swatch}"></span>${x.label}</button>`);
    paneR.innerHTML = `
      <h2>Step 8 · Hardware</h2>
      <p class="sub">How your door locks and what you pull on.</p>
      <div class="cards" data-key="hw">
        ${HW.types.map((t, i) => `<button type="button" class="card ${st.picked.hw && s.hw === i ? 'on' : ''}" data-i="${i}">
          <h3>${t.label}${t.placeholder ? ' <span class="ph">options TBD</span>' : ''}</h3><p>${t.desc}</p>
        </button>`).join('')}
      </div>
      ${st.picked.hw && k === 'mp' ? grp('mpStyle', 'Multipoint handle style', btns('mpStyle', HW.mpStyles)) : ''}
      ${st.picked.hw && showBar ? grp('barSize', 'Pull bar size', btns('barSize', HW.barSizes)) : ''}
      ${st.picked.hw && showBar ? grp('barColor', 'Pull bar colour <small>· placeholder range</small>', swBtns('barColor', HW.barColors)) : ''}
      ${st.picked.hw && k === 'mp' && mpKey() === 'bar' && st.picked.mpStyle
        ? grp('tLever', 'Interior T-lever', btns('tLever', HW.tLevers), 'tlever') : ''}
      ${st.picked.hw && k === 'ball' ? grp('dbShape', 'Deadbolt', btns('dbShape', HW.dbShapes)) : ''}
      ${st.picked.hw && k === 'ball' && st.picked.dbShape ? grp('dbColor', 'Deadbolt colour', swBtns('dbColor', HW.dbColors)) : ''}
      ${st.picked.hw && k === 'digital' ? `<div class="empty-note">We’ll confirm keypad / smart-lock models with you on the quote — the prep is included in this build.</div>` : ''}
      ${st.picked.hw && k === 'none' ? `<div class="empty-note">Prep only · double bore. The slab arrives ready for the hardware you supply.</div>` : ''}`;
    bindRows();
    bindCards('hw', () => {
      // switching package invalidates the sub-choices — make them re-choose
      ['mpStyle', 'barSize', 'barColor', 'tLever', 'dbShape', 'dbColor'].forEach(k2 => delete st.picked[k2]);
    });
  }

  function hardwareSummary() {
    const s = sel(), k = hwKey();
    if (k === 'mp') {
      let out = 'Multipoint · ' + HW.mpStyles[s.mpStyle].label;
      if (mpKey() === 'bar') out += ` ${HW.barSizes[s.barSize].label} ${HW.barColors[s.barColor].label} · T-lever ${HW.tLevers[s.tLever].label.toLowerCase()}`;
      return out;
    }
    if (k === 'ball') return `Pull bar ${HW.barSizes[s.barSize].label} ${HW.barColors[s.barColor].label} + ball catch · Deadbolt ${HW.dbShapes[s.dbShape].label.toLowerCase()} ${HW.dbColors[s.dbColor].label.toLowerCase()}`;
    if (k === 'digital') return 'Digital / smart lock · model TBD';
    return 'None · prep only, double bore';
  }

  function reviewRows() {
    const s = sel(), d = st.door;
    const interior = CONFIG.interiors[s.interior] || {};
    const rows = [
      ['Design', `${d.name} · ${d.material}`],
      ['Grain', valLabel('grain')],
      ['Layout', valLabel('config')],
      ['Transom', valLabel('transom')],
      ['Slab size', customOK()
        ? `Custom · ${inFrac(s.cw)} × ${inFrac(s.ch)} (priced as nearest standard)`
        : `${CONFIG.slabWidths[s.slabW].label} × ${CONFIG.slabHeights[s.height].label}`],
      ['Frame', `${valLabel('frameFinish')} · jamb ${valLabel('jamb')}`],
      ['Brickmould', valLabel('brickmould')],
      ['Threshold / sill', valLabel('threshold')],
      ['Swing', `${CONFIG.swings[s.swing].label} · hinges ${s.handleSide === 0 ? 'left' : 'right'} (from outside)`],
      ['Exterior colour', finLabel(s.finish)],
      ['Interior colour', interior.custom ? 'Custom · ' + finLabel(s.interiorC) : interior.label],
      ['Frame colour', s.frameSame ? `Same as slab · ${finLabel(s.frame)}` : finLabel(s.frame)],
      ['Painted grooves', valLabel('grooves')],
    ];
    if (sidesN()) rows.push(['Sidelite glass', valLabel('glassSL') + ' · tempered']);
    if (s.transom) rows.push(['Transom glass', valLabel('glassTR') + ' · tempered']);
    rows.push(['Hardware', hardwareSummary()]);
    rows.push(['Interior trim', s.trim === 1
      ? `${valLabel('trimStyle')} · ${valLabel('trimSize')} · ${valLabel('trimFinish')}`
      : 'None']);
    return rows;
  }

  function stepTrim() {
    const s = sel(), T = CONFIG.trim;
    const hasTrim = st.picked.trim && s.trim === 1;
    paneR.innerHTML = `
      <h2>Step 9 · Interior trim</h2>
      <p class="sub">Casing that finishes the interior side of the opening. Skip it if your installer is handling trim.</p>
      <div class="cards" data-key="trim">
        ${T.options.map((o, i) => `<button type="button" class="card ${st.picked.trim && s.trim === i ? 'on' : ''}" data-i="${i}">
          <h3>${o.label}</h3><p>${o.desc}</p>
        </button>`).join('')}
      </div>
      ${hasTrim ? grp('trimFinish', 'Trim finish', btns('trimFinish', T.finishes)) : ''}
      ${hasTrim && st.picked.trimFinish ? grp('trimStyle', 'Style <span class="ph">placeholder range</span>', btns('trimStyle', T.styles)) : ''}
      ${hasTrim && st.picked.trimFinish ? grp('trimSize', 'Casing width <span class="ph">placeholder range</span>', btns('trimSize', T.sizes)) : ''}
      ${hasTrim ? `<p class="note">Style and casing-width options are placeholders — exact trim profiles and pricing are confirmed on your quote.</p>` : ''}`;
    bindRows();
    bindCards('trim', () => {
      // switching between trim / no trim resets the sub-choices
      ['trimFinish', 'trimStyle', 'trimSize'].forEach(k => delete st.picked[k]);
    });
  }

  function stepHome() {
    const has = !!st.home.url;
    paneR.innerHTML = `
      <h2>Step 10 · See it on your home</h2>
      <p class="sub">Optional. Upload a photo of your entrance and place your ${st.door.name} right on it. The photo stays on this device — it's never uploaded anywhere.</p>
      ${has ? `
        <div class="grp"><div class="lbl">Door size on photo</div>
          <input type="range" id="hvSize" min="18" max="86" value="${Math.round(st.home.scale * 100)}" style="width:100%;">
        </div>
        <div class="build-actions">
          <button class="btn ghost sm" id="hvChange" type="button">Change photo</button>
          <button class="btn ghost sm" id="hvReset" type="button">Reset position</button>
          <button class="btn ghost sm" id="hvRemove" type="button">Remove photo</button>
        </div>
        <p class="note">Drag the door on the photo to line it up with your opening, then use the slider to match its size.</p>`
      : `
        <div class="hv-drop" id="hvDrop">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M3 17l5-4 4 3 3-2 6 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p>Drop a photo of your home's entrance here</p>
          <button class="btn solid sm" id="hvPick" type="button">Choose photo</button>
          <span>Tip: a straight-on shot of your doorway works best</span>
        </div>
        <p class="note">This step is optional — hit Continue to go straight to your review.</p>`}
      <input type="file" id="hvFile" accept="image/*" hidden>`;
    const fileIn = paneR.querySelector('#hvFile');
    const loadPhoto = (f) => {
      if (!f || !f.type.startsWith('image/')) return;
      if (st.home.url) URL.revokeObjectURL(st.home.url);
      st.home.url = URL.createObjectURL(f);
      st.home.x = 0.5; st.home.y = 0.62;
      render();
    };
    fileIn.addEventListener('change', (e) => loadPhoto(e.target.files && e.target.files[0]));
    const on = (id, ev, fn) => { const el = paneR.querySelector(id); if (el) el.addEventListener(ev, fn); };
    on('#hvPick', 'click', () => fileIn.click());
    on('#hvChange', 'click', () => fileIn.click());
    on('#hvReset', 'click', () => { st.home.x = 0.5; st.home.y = 0.62; placeHomeDoor(); });
    on('#hvRemove', 'click', () => { URL.revokeObjectURL(st.home.url); st.home.url = null; render(); });
    on('#hvSize', 'input', () => { st.home.scale = +paneR.querySelector('#hvSize').value / 100; placeHomeDoor(); });
    const drop = paneR.querySelector('#hvDrop');
    if (drop) {
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', (e) => {
        e.preventDefault(); drop.classList.remove('over');
        loadPhoto(e.dataTransfer.files && e.dataTransfer.files[0]);
      });
    }
  }

  function stepReview() {
    const s = st.sel, d = st.door;
    const rows = reviewRows();
    paneR.innerHTML = `
      <h2>Review your build</h2>
      <p class="sub">Every choice, confirmed. Final measurements are checked before production.</p>
      <div class="summary">
        ${rows.map(([k, v]) => `<div class="srow"><span>${k}</span><span>${v}</span></div>`).join('')}
        <div class="srow"><span>Freight · ${CONFIG.shipping.regions[s.region].label}</span><span>${fmt(shippingFor(s))}</span></div>
        <div class="srow total"><span>Total incl. freight</span><b>${fmt(computePrice(d, s) + shippingFor(s))}</b></div>
      </div>
      <div class="grp"><div class="lbl">Ship to <b>${CONFIG.shipping.regions[s.region].label}</b></div>
        ${row('region', CONFIG.shipping.regions, (x, i, on) => `<button class="opt-btn ${s.region === i ? 'on' : ''}" data-i="${i}">${x.label}</button>`)}</div>
      <p class="sub" style="margin-top:16px;display:flex;gap:8px;align-items:center;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="1.6"><path d="M3 12h18M21 6v12M3 12l4-4M3 12l4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Ships in 4–5 weeks · lifetime warranty · all glass safety tempered</p>
      <div class="build-actions">
        <button class="btn ghost sm" id="saveBuild">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke-linejoin="round"/></svg>Save build</button>
        <button class="btn ghost sm" id="shareBuild">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round"/></svg>Copy share link</button>
        <button class="btn ghost sm" id="sampleBtn">Order stain samples · ${fmt(CONFIG.samplePrice)} ea</button>
        <button class="btn ghost sm" id="vizBtn">See it on your home</button>
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
    paneR.querySelectorAll('.opt-row[data-key="region"] [data-i]').forEach(b => b.addEventListener('click', () => {
      const before = price();
      st.sel.region = +b.dataset.i;
      afterChange(before);
    }));
    const build = () => ({ product: 'door', name: d.name, sel: s, price: computePrice(d, s),
      title: d.name, sub: `${CONFIG.configurations[s.config].label} · ${finLabel(s.finish)}` });
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
    const vb = paneR.querySelector('#vizBtn');
    if (vb) vb.addEventListener('click', () => { st.step = HOME; render(); });
    const smp = paneR.querySelector('#sampleBtn');
    if (smp) smp.addEventListener('click', () => {
      const key = CONFIG.finishKeys[s.finish];
      P.cart.add({ key: `sample-${key}`, title: 'Colour sample',
        sub: `${finLabel(s.finish)} chip · credited on a door order`,
        price: CONFIG.samplePrice, art: { kind: 'sample' } });
      P.cartToast('Colour sample');
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
        ...reviewRows().map(([k, v]) => k + ': ' + v),
        'Freight · ' + CONFIG.shipping.regions[s.region].label + ': ' + fmt(shippingFor(s)),
        'Total incl. freight: ' + fmt(computePrice(d, s) + shippingFor(s)), '',
        'Build link: ' + P.builds.shareURL(build()), '',
        'Name: ' + name, 'Email: ' + email,
        phone ? 'Phone: ' + phone : '', notes ? 'Notes: ' + notes : '',
      ].filter(Boolean).join('\n');
      location.href = 'mailto:' + CONFIG.quoteEmail
        + '?subject=' + encodeURIComponent('Quote request — ' + d.name)
        + '&body=' + encodeURIComponent(body);
      hint.style.color = '';
      hint.textContent = 'Your email app should open with the quote pre-filled — just hit send.';
    });
  }

  /* ---------- event binding ---------- */
  const price = () => st.door ? computePrice(st.door, st.sel) + shippingFor(st.sel) : 0;
  function afterChange(before) {
    RENDER[st.step]();
    paintPreview(); paintSteps(); updateNav(); syncURL();
    if (before != null) popDelta(price() - before);
  }
  // generic: click any [data-i] inside an .opt-row → pick(key, i)
  function bindRows(hooks = {}) {
    optA11y(paneR);
    paneR.querySelectorAll('.opt-row').forEach(rowEl => rowEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (!b || rowEl.dataset.key === 'frameSame' || rowEl.dataset.key === 'region') return;
      const before = price();
      pick(rowEl.dataset.key, +b.dataset.i);
      if (hooks[rowEl.dataset.key]) hooks[rowEl.dataset.key]();
      afterChange(before);
    }));
  }
  function bindCards(key, hook) {
    paneR.querySelectorAll(`[data-key="${key}"] .card`).forEach(c => c.addEventListener('click', () => {
      const before = price();
      pick(key, +c.dataset.i);
      if (hook) hook(+c.dataset.i);
      afterChange(before);
    }));
  }

  const RENDER = [stepDesign, stepGrain, stepLayout, stepFrame, stepSwing, stepColour, stepGlass, stepHardware, stepTrim, stepHome, stepReview];

  function updateNav() {
    backBtn.style.visibility = st.step === 0 ? 'hidden' : 'visible';
    const missing = missingFor(st.step);
    nextBtn.disabled = missing.length > 0;
    nextBtn.textContent = st.step === REVIEW ? 'Add to cart' : 'Continue';
    const showPrice = st.step >= 1 && st.door;
    priceTag.textContent = showPrice ? fmt(computePrice(st.door, st.sel)) : '';
    headPrice.hidden = !showPrice;
    if (showPrice) rollHeadPrice(computePrice(st.door, st.sel));
    let hint = document.getElementById('navHint');
    if (!hint) {
      hint = document.createElement('p');
      hint.id = 'navHint'; hint.className = 'nav-hint';
      nextBtn.closest('.cfg-nav').appendChild(hint);   // lives inside the sticky action bar
    }
    hint.textContent = missing.length ? 'Still to choose: ' + missing.join(', ') : '';
  }

  function render() {
    RENDER[st.step]();
    paintSteps(); paintPreview(); updateNav(); syncURL();
    paneR.scrollTop = 0;   // each step starts at the top of the pane's own scroll
    // land at the pinned-stepper position, not the page top — keeps the compact
    // layout once the customer is in the flow instead of re-showing the title
    const strip = stepsEl.closest('.cfg-sticky');
    const stripY = strip ? Math.max(0, strip.offsetTop - 76) : 0;
    window.scrollTo({ top: Math.min(window.scrollY, stripY), behavior: 'smooth' });
  }

  nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    if (st.step === REVIEW) {
      const fk = CONFIG.finishKeys[st.sel.finish];
      P.cart.add({
        key: `door-${st.door.name}-${st.sel.config}-${st.sel.height}-${fk}-${st.sel.glassSL}-${st.sel.transom}-${Date.now()}`,
        title: st.door.name,
        sub: `${CONFIG.configurations[st.sel.config].label} · ${FINISHES[fk].label}${st.sel.transom ? ' · transom' : ''}`,
        price: computePrice(st.door, st.sel),
        art: { kind: 'door', name: st.door.name, finish: fk },
      });
      P.cartToast(st.door.name);
      nextBtn.textContent = 'Added ✓';
      setTimeout(() => { location.href = 'Cart.html'; }, 900);
      return;
    }
    st.step++; render();
  });
  backBtn.addEventListener('click', () => { if (st.step > 0) { st.step--; render(); } });
  stepsEl.addEventListener('click', (e) => {
    const s = e.target.closest('.step'); if (!s) return;
    const target = +s.dataset.s;
    if (target <= firstIncomplete()) { st.step = target; render(); }
  });

  optKeyboardNav(paneR);
  render();
})();
