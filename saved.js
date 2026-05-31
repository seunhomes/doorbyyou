/* ============================================================
   PANES — Saved builds gallery
   ============================================================ */
(function () {
  const P = window.PANES;
  const { DOORS, FINISHES, CONFIG, unitSVG, doorSceneHTML, computePrice, builds, cart, cartToast } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  const grid = document.getElementById('grid');
  const clearBtn = document.getElementById('clearAll');
  const titleEl = document.getElementById('svTitle');

  function thumb(b) {
    if (b.product === 'door') {
      const d = DOORS.find(x => x.name === b.name);
      if (d) return unitSVG(d, Object.assign({}, b.sel));
    }
    if (b.product === 'window' && P.windowSVG) {
      const w = (P.WINDOWS || []).find(x => x.name === b.name);
      if (w) return P.windowSVG(w, b.sel && P.WINCONFIG ? P.WINCONFIG.finishKeys[b.sel.finish] : undefined, b.sel);
    }
    return `<svg class="door-svg" viewBox="0 0 40 60"><rect x="6" y="2" width="28" height="56" rx="2" fill="#cfc7b6"/></svg>`;
  }

  function priceOf(b) {
    if (b.product === 'door') {
      const d = DOORS.find(x => x.name === b.name);
      if (d) return computePrice(d, b.sel);
    }
    if (b.product === 'window' && P.computeWinPrice) {
      const w = (P.WINDOWS || []).find(x => x.name === b.name);
      if (w) return P.computeWinPrice(w, b.sel);
    }
    return b.price || 0;
  }

  function detailHref(b) {
    const code = builds.encode(b);
    if (b.product === 'window') return 'Windows Configurator.html?b=' + code;
    return 'Door.html?b=' + code;
  }

  function render() {
    const list = builds.all();
    titleEl.textContent = list.length ? `Saved builds · ${list.length}` : 'Saved builds';
    clearBtn.style.display = list.length ? '' : 'none';
    if (!list.length) {
      grid.outerHTML = `<div class="wrap"><div class="sv-empty" id="grid">
        <h2>No saved builds yet</h2>
        <p>Configure a door and tap <b>Save build</b> to keep it here — then share it or add it to your cart anytime.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <a class="btn solid" href="Configurator.html">Open configurator</a>
          <a class="btn ghost" href="Entry Doors.html">Browse doors</a></div></div></div>`;
      return;
    }
    grid.innerHTML = list.map(b => {
      const sub = b.sub || '';
      return `<div class="sv-card" data-code="${b.code}">
        <div class="sstage"><span class="pill">${b.product === 'window' ? 'Window' : 'Entry Door'}</span><div>${thumb(b)}</div></div>
        <div class="sbody">
          <div class="srow"><div class="nm">${b.name}</div><div class="pr">${fmt(priceOf(b))}</div></div>
          <div class="sb">${sub}</div>
          <div class="acts">
            <a class="btn ghost sm" href="${detailHref(b)}">Edit</a>
            <button class="btn solid sm addCart">Add to cart</button>
            <button class="iconbtn share" title="Copy share link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round"/></svg></button>
            <button class="iconbtn rm" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  document.body.addEventListener('click', (e) => {
    const card = e.target.closest('.sv-card'); if (!card) return;
    const code = card.dataset.code;
    const b = builds.all().find(x => x.code === code); if (!b) return;

    if (e.target.closest('.rm')) { builds.remove(code); return; }
    if (e.target.closest('.share')) {
      builds.copy(builds.shareURL(b)).then(ok => builds.toast(ok ? 'Share link copied to clipboard' : 'Copy failed — see address bar'));
      return;
    }
    if (e.target.closest('.addCart')) {
      let art = { kind: b.product, name: b.name };
      if (b.product === 'door' && b.sel) art.finish = CONFIG.finishKeys[b.sel.finish];
      else if (b.product === 'window' && b.sel && P.WINCONFIG) art.finish = P.WINCONFIG.finishKeys[b.sel.finish];
      cart.add({ key: code, title: b.name, sub: b.sub || '', price: priceOf(b), art });
      cartToast(b.name);
    }
  });

  clearBtn.addEventListener('click', () => { if (confirm('Remove all saved builds?')) builds.clear(); });
  document.addEventListener('builds:change', render);

  render();
})();
