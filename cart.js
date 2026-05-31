/* ============================================================
   PANES — shared cart (localStorage) + nav badge
   Include on every page that has a cart icon or Add-to-cart.
   API:  PANES.cart.add(item) / .all() / .setQty(id,n) / .remove(id)
         .count() / .subtotal()
   item: { key, title, sub, price, qty }
   ============================================================ */
(function () {
  const KEY = 'panes-cart-v1';
  const P = (window.PANES = window.PANES || {});

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); paintBadges(); document.dispatchEvent(new CustomEvent('cart:change')); }

  const cart = {
    all: read,
    count() { return read().reduce((n, i) => n + i.qty, 0); },
    subtotal() { return read().reduce((s, i) => s + i.price * i.qty, 0); },
    add(item) {
      const list = read();
      const ex = list.find(i => i.key === item.key);
      if (ex) ex.qty += item.qty || 1;
      else list.push(Object.assign({ qty: 1 }, item));
      write(list);
    },
    setQty(key, n) {
      let list = read();
      const it = list.find(i => i.key === key);
      if (it) { it.qty = Math.max(0, n); if (it.qty === 0) list = list.filter(i => i.key !== key); }
      write(list);
    },
    remove(key) { write(read().filter(i => i.key !== key)); },
    clear() { write([]); },
  };
  P.cart = cart;

  /* nav badge + make cart icons link to Cart.html */
  function paintBadges() {
    const n = cart.count();
    document.querySelectorAll('[aria-label="Cart"]').forEach(el => {
      if (el.tagName === 'BUTTON') {
        // convert button to link behaviour
        el.style.position = 'relative';
        el.onclick = () => (location.href = 'Cart.html');
      } else {
        el.style.position = 'relative';
      }
      let b = el.querySelector('.cart-count');
      if (!b) { b = document.createElement('span'); b.className = 'cart-count'; el.appendChild(b); }
      b.textContent = n;
      b.style.display = n > 0 ? 'grid' : 'none';
    });
  }

  /* toast on add */
  P.cartToast = function (title) {
    let t = document.querySelector('.cart-toast');
    if (!t) { t = document.createElement('div'); t.className = 'cart-toast'; document.body.appendChild(t); }
    t.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12l4 4 10-10" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>Added <b>${title}</b> to cart</span><a href="Cart.html">View cart →</a>`;
    t.classList.add('show');
    clearTimeout(P._toastT);
    P._toastT = setTimeout(() => t.classList.remove('show'), 3200);
  };

  document.addEventListener('DOMContentLoaded', paintBadges);
  if (document.readyState !== 'loading') paintBadges();
})();
