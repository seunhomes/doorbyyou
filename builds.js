/* ============================================================
   PANES — Saved & shareable builds
   Encodes a configuration into a compact URL token, persists a
   library of saved builds in localStorage, and builds share links.
   A "build" = { product:'door'|'window', name, sel, price, title, sub }
   ============================================================ */
(function () {
  const P = (window.PANES = window.PANES || {});
  const KEY = 'panes-builds-v1';

  /* base64url of a JSON payload (compact, robust for any sel shape) */
  function enc(obj) {
    const json = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function dec(str) {
    try {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) str += '=';
      return JSON.parse(decodeURIComponent(escape(atob(str))));
    } catch (e) { return null; }
  }

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); document.dispatchEvent(new CustomEvent('builds:change')); }

  const builds = {
    /* token <-> build */
    encode(build) { return enc({ p: build.product, n: build.name, s: build.sel }); },
    decode(code) {
      const o = dec(code);
      if (!o) return null;
      return { product: o.p, name: o.n, sel: o.s };
    },

    /* configurator deep-link that restores the build */
    shareURL(build) {
      const code = builds.encode(build);
      const page = build.product === 'window' ? 'Windows Configurator.html' : 'Configurator.html';
      return new URL(page + '?b=' + code, location.href).href;
    },

    /* persisted library */
    all: read,
    save(build) {
      const code = builds.encode(build);
      const list = read();
      const existing = list.find(b => b.code === code);
      if (existing) { existing.ts = Date.now(); }
      else list.unshift({
        code, product: build.product, name: build.name, sel: build.sel,
        price: build.price, title: build.title || build.name, sub: build.sub || '',
        ts: Date.now(),
      });
      write(list);
      return code;
    },
    has(build) { return read().some(b => b.code === builds.encode(build)); },
    remove(code) { write(read().filter(b => b.code !== code)); },
    clear() { write([]); },
    count() { return read().length; },
  };

  /* copy helper with graceful fallback */
  builds.copy = async function (text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {}
      document.body.removeChild(ta); return ok;
    }
  };

  /* small toast (mirrors cart toast styling) */
  builds.toast = function (msg, link) {
    let t = document.querySelector('.cart-toast');
    if (!t) { t = document.createElement('div'); t.className = 'cart-toast'; document.body.appendChild(t); }
    t.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12l4 4 10-10" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>${msg}</span>${link ? `<a href="${link}">${link.indexOf('Saved') > -1 ? 'View saved →' : 'Open →'}</a>` : ''}`;
    t.classList.add('show');
    clearTimeout(P._buildToastT);
    P._buildToastT = setTimeout(() => t.classList.remove('show'), 3200);
  };

  P.builds = builds;
})();
