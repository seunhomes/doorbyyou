/* ============================================================
   PANES — Cart + checkout page logic
   ============================================================ */
(function () {
  const P = window.PANES;
  const { cart, DOORS, FINISHES, doorSceneHTML } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cartView = document.getElementById('cartView');
  const checkoutView = document.getElementById('checkoutView');
  const okScreen = document.getElementById('okScreen');
  const linesEl = document.getElementById('lines');
  const title = document.getElementById('coTitle');
  const eyebrow = document.getElementById('crumbEyebrow');

  /* thumbnail for a line item from its art hint */
  function thumb(it) {
    const a = it.art || {};
    try {
      if (a.kind === 'door') {
        const d = DOORS.find(x => x.name === a.name);
        if (d) return doorSceneHTML(Object.assign({}, d, { finish: a.finish || d.finish }), { noHandle: true });
      }
      if (a.kind === 'window' && P.windowSVG) {
        const w = (P.WINDOWS || []).find(x => x.name === a.name);
        if (w) return P.windowSVG(w, a.finish);
      }
      if (a.kind === 'patio' && P.patioSVG) {
        const p = (P.PATIO || []).find(x => x.name === a.name);
        if (p) return P.patioSVG(p, a.finish);
      }
    } catch (e) {}
    return `<svg viewBox="0 0 40 60" class="door-svg"><rect x="6" y="2" width="28" height="56" rx="2" fill="#cfc7b6"/></svg>`;
  }

  let stage = 'cart';

  function renderCart() {
    const items = cart.all();
    if (!items.length) {
      title.textContent = 'Your cart is empty';
      eyebrow.textContent = 'Your cart';
      document.querySelector('.co-grid').style.display = 'none';
      if (!document.getElementById('emptyState')) {
        const e = document.createElement('div');
        e.id = 'emptyState'; e.className = 'empty-cart';
        e.innerHTML = `<h2>Nothing here yet</h2><p>Browse the collection and add a door, window or full configuration.</p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <a class="btn solid" href="Entry Doors.html">Shop entry doors</a>
            <a class="btn ghost" href="Configurator.html">Open configurator</a></div>`;
        cartView.appendChild(e);
      }
      return;
    }
    title.textContent = 'Cart';
    linesEl.innerHTML = items.map(it => `
      <div class="line" data-key="${it.key}">
        <div class="thumb">${thumb(it)}</div>
        <div>
          <div class="nm">${it.title}</div>
          <div class="sb">${it.sub || ''}</div>
          <button class="rm" data-key="${it.key}">Remove</button>
        </div>
        <div style="display:flex;align-items:center;gap:18px;">
          <div class="qty" data-key="${it.key}">
            <button data-d="-1">−</button><span>${it.qty}</span><button data-d="1">+</button>
          </div>
          <div class="lp">${fmt(it.price * it.qty)}</div>
        </div>
      </div>`).join('');
    paintSummary(document.getElementById('summary'), true);
  }

  function paintSummary(el, withCheckoutBtn) {
    if (!el) return;
    const sub = cart.subtotal();
    const tax = sub * 0.0825;
    const total = sub + tax;
    el.innerHTML = `
      <h3>Order summary</h3>
      <div class="srow"><span>Subtotal</span><span>${fmt(sub)}</span></div>
      <div class="srow"><span>Shipping</span><span>Free</span></div>
      <div class="srow"><span>Estimated tax</span><span>${fmt(tax)}</span></div>
      <div class="srow big"><span>Total</span><b>${fmt(total)}</b></div>
      ${withCheckoutBtn
        ? `<button class="btn solid" id="toCheckout">Checkout</button><a class="btn ghost" href="Entry Doors.html" style="width:100%;justify-content:center;margin-top:10px;">Continue shopping</a>`
        : `<button class="btn solid" id="placeOrder">Place order · ${fmt(total)}</button><button class="btn ghost" id="backToCart" style="width:100%;justify-content:center;margin-top:10px;">Back to cart</button>`}
      <div class="co-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke-linejoin="round"/></svg>Final measurements are confirmed by our team before anything goes into production.</div>`;
  }

  /* events */
  linesEl.addEventListener('click', (e) => {
    const rm = e.target.closest('.rm');
    if (rm) { cart.remove(rm.dataset.key); return; }
    const q = e.target.closest('.qty button');
    if (q) {
      const key = q.closest('.qty').dataset.key;
      const it = cart.all().find(i => i.key === key);
      if (it) cart.setQty(key, it.qty + (+q.dataset.d));
    }
  });

  cartView.addEventListener('click', (e) => {
    if (e.target.id === 'toCheckout') showCheckout();
  });
  checkoutView.addEventListener('click', (e) => {
    if (e.target.id === 'backToCart') showCart();
    if (e.target.id === 'placeOrder') placeOrder();
  });

  function showCart() {
    stage = 'cart';
    cartView.classList.remove('hide'); checkoutView.classList.remove('on'); okScreen.classList.remove('on');
    renderCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showCheckout() {
    if (!cart.all().length) return;
    stage = 'checkout';
    cartView.classList.add('hide'); checkoutView.classList.add('on');
    title.textContent = 'Checkout'; eyebrow.textContent = 'Secure checkout';
    paintSummary(document.getElementById('summary2'), false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function placeOrder() {
    const form = document.getElementById('coForm');
    if (!form.reportValidity()) return;
    cart.clear();
    checkoutView.classList.remove('on'); cartView.classList.add('hide');
    document.querySelector('.co-head').style.display = 'none';
    okScreen.classList.add('on');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('cart:change', () => { if (stage === 'cart') renderCart(); });

  showCart();
})();
