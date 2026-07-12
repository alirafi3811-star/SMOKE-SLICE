/* =========================================================================
   SMOKE & SLICE — SITE SCRIPT
   Sections: Navigation | Reveal animations | Menu rendering |
             Cart | Checkout | Toast
   Depends on MENU_DATA and ALLERGEN_LEGEND from menu.js (loaded first).
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ======================================================================
     1. NAVIGATION
     ====================================================================== */
  const siteHeader   = document.getElementById('siteHeader');
  const navToggle     = document.getElementById('navToggle');
  const navLinks      = document.getElementById('navLinks');
  const navBackdrop   = document.getElementById('navBackdrop');
  const navLinkItems  = document.querySelectorAll('.nav-link');

  function closeMobileNav() {
    navLinks.classList.remove('mobile-open');
    navToggle.classList.remove('open');
    navBackdrop.classList.remove('open');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    navToggle.classList.toggle('open', isOpen);
    navBackdrop.classList.toggle('open', isOpen);
  });
  navBackdrop.addEventListener('click', closeMobileNav);
  navLinkItems.forEach(link => link.addEventListener('click', closeMobileNav));

  // Shrink header + highlight active section on scroll
  const sections = ['home', 'menu', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);

    let current = sections[0];
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => { if (sec.offsetTop <= scrollPos) current = sec; });

    navLinkItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ======================================================================
     2. REVEAL-ON-SCROLL ANIMATIONS
     ====================================================================== */
  const revealTargets = document.querySelectorAll('.reveal, .menu-card, .delivery-card, .sauce-card');
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function observeReveal(el) { revealObserver.observe(el); }
  document.querySelectorAll('.reveal').forEach(observeReveal);

  /* ======================================================================
     3. MENU RENDERING
     ====================================================================== */
  const menuTabsEl  = document.getElementById('menuTabs');
  const menuGridEl  = document.getElementById('menuGrid');
  const allergenListEl = document.getElementById('allergenList');
  let activeCategory = MENU_DATA[0].id;

  function buildTabs() {
    menuTabsEl.innerHTML = MENU_DATA.map(cat => `
      <button class="menu-tab ${cat.id === activeCategory ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    menuTabsEl.querySelectorAll('.menu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeCategory = tab.dataset.cat;
        buildTabs();
        renderMenu();
      });
    });
  }

  function currencyFmt(num) {
    return '€' + num.toFixed(2);
  }

  function renderMenu() {
    const category = MENU_DATA.find(c => c.id === activeCategory);
    if (!category) return;

    if (category.id === 'sauces') {
      menuGridEl.style.display = 'none';
      renderSauces(category);
      return;
    }

    // remove any sauce grid leftover
    const existingSauceGrid = document.getElementById('sauceGrid');
    if (existingSauceGrid) existingSauceGrid.remove();
    menuGridEl.style.display = 'grid';

    menuGridEl.innerHTML = category.items.map(item => `
      <article class="menu-card reveal" data-id="${item.id}">
        <div class="menu-card-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="menu-card-cat">${category.label}</span>
        </div>
        <div class="menu-card-body">
          <div class="menu-card-top">
            <h3 class="menu-card-name">${item.name}</h3>
            <span class="menu-card-price">${currencyFmt(item.price)}</span>
          </div>
          <p class="menu-card-desc">${item.description}</p>
          ${item.allergens.length ? `<p class="menu-card-allergens">Allergens: ${item.allergens.join(', ')}</p>` : ''}
          <button class="add-to-cart" data-id="${item.id}" data-cat="${category.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add To Cart
          </button>
        </div>
      </article>
    `).join('');

    menuGridEl.querySelectorAll('.menu-card').forEach(observeReveal);
    bindAddToCartButtons();
  }

  function renderSauces(category) {
    let sauceGrid = document.getElementById('sauceGrid');
    if (!sauceGrid) {
      sauceGrid = document.createElement('div');
      sauceGrid.className = 'sauce-grid';
      sauceGrid.id = 'sauceGrid';
      menuGridEl.after(sauceGrid);
    }
    sauceGrid.innerHTML = category.items.map(item => `
      <div class="sauce-card reveal" data-id="${item.id}">
        <div class="sauce-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3e9d6" stroke-width="1.8"><path d="M8 2h8M9 2v5.5L4.5 15a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L15 7.5V2"/></svg>
        </div>
        <div class="sauce-name">${item.name}</div>
        <div class="sauce-price">${currencyFmt(item.price)}</div>
        <button class="add-to-cart" data-id="${item.id}" data-cat="${category.id}">Add</button>
      </div>
    `).join('');
    sauceGrid.querySelectorAll('.sauce-card').forEach(observeReveal);
    bindAddToCartButtons();
  }

  function buildAllergenLegend() {
    allergenListEl.innerHTML = Object.entries(ALLERGEN_LEGEND).map(([num, name]) => `
      <span><b>${num}</b> — ${name}</span>
    `).join('');
  }

  buildTabs();
  renderMenu();
  buildAllergenLegend();

  /* ======================================================================
     4. CART
     ====================================================================== */
  let cart = []; // { id, name, price, image, qty }

  const cartToggle   = document.getElementById('cartToggle');
  const cartClose     = document.getElementById('cartClose');
  const cartOverlay   = document.getElementById('cartOverlay');
  const cartPanel     = document.getElementById('cartPanel');
  const cartItemsEl   = document.getElementById('cartItems');
  const cartCountEl   = document.getElementById('cartCount');
  const cartTotalEl   = document.getElementById('cartTotal');
  const emptyCartBtn  = document.getElementById('emptyCartBtn');
  const checkoutBtn   = document.getElementById('checkoutBtn');

  function findMenuItem(id) {
    for (const cat of MENU_DATA) {
      const found = cat.items.find(i => i.id === id);
      if (found) return found;
    }
    return null;
  }

  function openCart() {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
  }
  function closeCart() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
  }
  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function addToCart(id) {
    const item = findMenuItem(id);
    if (!item) return;
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
    }
    renderCart();
    openCart();
    showToast(`${item.name} added to your order`);
  }

  function changeQty(id, delta) {
    const line = cart.find(c => c.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(c => c.id !== id);
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter(c => c.id !== id);
    renderCart();
  }

  function cartTotal() {
    return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  }

  function cartCount() {
    return cart.reduce((sum, c) => sum + c.qty, 0);
  }

  function renderCart() {
    cartCountEl.textContent = cartCount();
    cartTotalEl.textContent = currencyFmt(cartTotal());
    checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<div class="cart-empty">Your cart is empty. Add something delicious from the menu.</div>`;
      return;
    }

    cartItemsEl.innerHTML = cart.map(line => `
      <div class="cart-item" data-id="${line.id}">
        ${line.image
          ? `<img src="${line.image}" alt="${line.name}">`
          : `<div class="cart-item-noimg">${line.name.charAt(0)}</div>`}
        <div>
          <div class="cart-item-name">${line.name}</div>
          <div class="cart-item-price">${currencyFmt(line.price)} each</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-minus" data-id="${line.id}" aria-label="Decrease quantity">−</button>
            <span>${line.qty}</span>
            <button class="qty-plus" data-id="${line.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-item" data-id="${line.id}">Remove</button>
        </div>
      </div>
    `).join('');

    cartItemsEl.querySelectorAll('.qty-plus').forEach(btn =>
      btn.addEventListener('click', () => changeQty(btn.dataset.id, 1)));
    cartItemsEl.querySelectorAll('.qty-minus').forEach(btn =>
      btn.addEventListener('click', () => changeQty(btn.dataset.id, -1)));
    cartItemsEl.querySelectorAll('.remove-item').forEach(btn =>
      btn.addEventListener('click', () => removeItem(btn.dataset.id)));
  }

  function bindAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.id);
        btn.classList.add('added');
        const original = btn.innerHTML;
        btn.innerHTML = 'Added ✓';
        setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = original; }, 1100);
      });
    });
  }

  emptyCartBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  renderCart();

  /* ======================================================================
     5. CHECKOUT
     ====================================================================== */
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutBox   = document.getElementById('checkoutBox');

  function deliveryFee(distanceKey) {
    switch (distanceKey) {
      case '0-2': return { fee: 0, label: 'Free (0–2 km)' };
      case '2-5': return { fee: 3, label: '€3.00 (2–5 km)' };
      case '5-8': return { fee: 4, label: '€4.00 (5–8 km)' };
      case '8plus': return { fee: null, label: 'Restaurant will contact you regarding delivery fee' };
      default: return { fee: 0, label: '—' };
    }
  }

  function buildCheckoutForm() {
    const subtotal = cartTotal();

    checkoutBox.innerHTML = `
      <div class="checkout-head">
        <div>
          <h3>Complete Your Order</h3>
          <p>Cash on Delivery or Pay at Pickup — QR payment coming soon.</p>
        </div>
        <button class="icon-btn" id="checkoutClose" aria-label="Close checkout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <form id="orderForm">
        <div class="fulfilment-toggle">
          <label><input type="radio" name="fulfilment" value="delivery" checked><span>Delivery</span></label>
          <label><input type="radio" name="fulfilment" value="pickup"><span>Pickup</span></label>
        </div>

        <div class="form-grid">
          <div class="form-field full">
            <label for="custName">Customer Name</label>
            <input type="text" id="custName" name="custName" required placeholder="Full name">
          </div>
          <div class="form-field">
            <label for="custPhone">Phone Number</label>
            <input type="tel" id="custPhone" name="custPhone" required placeholder="+371 ...">
          </div>
          <div class="form-field">
            <label for="custEmail">Email</label>
            <input type="email" id="custEmail" name="custEmail" required placeholder="you@example.com">
          </div>

          <div class="form-field full" id="addressField">
            <label for="custAddress">Address</label>
            <input type="text" id="custAddress" name="custAddress" placeholder="Street and house number">
          </div>
          <div class="form-field" id="apartmentField">
            <label for="custApartment">Apartment</label>
            <input type="text" id="custApartment" name="custApartment" placeholder="Apt / unit (optional)">
          </div>
          <div class="form-field" id="postalField">
            <label for="custPostal">Postal Code</label>
            <input type="text" id="custPostal" name="custPostal" placeholder="LV-....">
          </div>

          <div class="form-field full" id="distanceField">
            <label for="custDistance">Distance From Restaurant</label>
            <select id="custDistance" name="custDistance">
              <option value="0-2">0–2 km — Free delivery</option>
              <option value="2-5">2–5 km — €3.00</option>
              <option value="5-8">5–8 km — €4.00</option>
              <option value="8plus">Over 8 km — restaurant will confirm fee</option>
            </select>
          </div>
        </div>

        <div class="payment-options">
          <label><input type="radio" name="payment" value="cash" checked> Cash on Delivery</label>
          <label><input type="radio" name="payment" value="pickup-pay"> Pay at Pickup</label>
        </div>

        <div class="form-field full" style="margin-bottom:22px;">
          <label for="custNotes">Special Instructions</label>
          <textarea id="custNotes" name="custNotes" placeholder="Allergies, extra sauce, cheese on fries, etc."></textarea>
        </div>

        <div class="order-summary">
          <h4>Order Summary</h4>
          <div id="summaryLines"></div>
          <div class="summary-line"><span>Subtotal</span><span>${currencyFmt(subtotal)}</span></div>
          <div class="summary-line" id="deliveryFeeLine"><span>Delivery Fee</span><span id="deliveryFeeAmount">Free (0–2 km)</span></div>
          <div class="summary-line total"><span>Grand Total</span><span id="grandTotalAmount">${currencyFmt(subtotal)}</span></div>
          <p class="delivery-note" id="deliveryNote"></p>
        </div>

        <button type="submit" class="btn btn-red btn-block">Place Order</button>
      </form>
    `;

    document.getElementById('checkoutClose').addEventListener('click', closeCheckout);

    const summaryLines = document.getElementById('summaryLines');
    summaryLines.innerHTML = cart.map(line => `
      <div class="summary-line"><span>${line.qty} × ${line.name}</span><span>${currencyFmt(line.price * line.qty)}</span></div>
    `).join('');

    const distanceField   = document.getElementById('distanceField');
    const addressField    = document.getElementById('addressField');
    const apartmentField  = document.getElementById('apartmentField');
    const postalField     = document.getElementById('postalField');
    const distanceSelect  = document.getElementById('custDistance');
    const feeAmountEl     = document.getElementById('deliveryFeeAmount');
    const grandTotalEl    = document.getElementById('grandTotalAmount');
    const deliveryNoteEl  = document.getElementById('deliveryNote');
    const addressInput    = document.getElementById('custAddress');

    function updateTotals() {
      const isDelivery = document.querySelector('input[name="fulfilment"]:checked').value === 'delivery';
      distanceField.style.display   = isDelivery ? '' : 'none';
      addressField.style.display    = isDelivery ? '' : 'none';
      apartmentField.style.display  = isDelivery ? '' : 'none';
      postalField.style.display     = isDelivery ? '' : 'none';
      addressInput.required = isDelivery;

      let grand = subtotal;
      if (isDelivery) {
        const { fee, label } = deliveryFee(distanceSelect.value);
        feeAmountEl.textContent = label;
        if (fee === null) {
          deliveryNoteEl.textContent = "Restaurant will contact you regarding delivery fee.";
          grandTotalEl.textContent = currencyFmt(subtotal) + ' + delivery TBC';
        } else {
          deliveryNoteEl.textContent = '';
          grand = subtotal + fee;
          grandTotalEl.textContent = currencyFmt(grand);
        }
      } else {
        feeAmountEl.textContent = 'Pickup — no fee';
        deliveryNoteEl.textContent = '';
        grandTotalEl.textContent = currencyFmt(subtotal);
      }
    }

    document.querySelectorAll('input[name="fulfilment"]').forEach(r => r.addEventListener('change', updateTotals));
    distanceSelect.addEventListener('change', updateTotals);
    updateTotals();

    document.getElementById('orderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitOrder(subtotal);
    });
  }

  function submitOrder(subtotal) {
    const form = document.getElementById('orderForm');
    const data = new FormData(form);
    const isDelivery = data.get('fulfilment') === 'delivery';
    const { fee, label } = isDelivery ? deliveryFee(data.get('custDistance')) : { fee: 0, label: 'Pickup' };
    const grand = fee === null ? subtotal : subtotal + fee;

    const orderLines = cart.map(l => `${l.qty}x ${l.name} — ${currencyFmt(l.price * l.qty)}`).join('%0A');

    const message =
      `*New Order — Smoke %26 Slice*%0A%0A` +
      `Name: ${encodeURIComponent(data.get('custName'))}%0A` +
      `Phone: ${encodeURIComponent(data.get('custPhone'))}%0A` +
      `Email: ${encodeURIComponent(data.get('custEmail'))}%0A` +
      `Fulfilment: ${isDelivery ? 'Delivery' : 'Pickup'}%0A` +
      (isDelivery ? `Address: ${encodeURIComponent(data.get('custAddress'))}, Apt ${encodeURIComponent(data.get('custApartment') || '-')}, ${encodeURIComponent(data.get('custPostal') || '-')}%0A` : '') +
      `Payment: ${data.get('payment') === 'cash' ? 'Cash on Delivery' : 'Pay at Pickup'}%0A%0A` +
      `Order:%0A${orderLines}%0A%0A` +
      `Subtotal: ${currencyFmt(subtotal)}%0A` +
      `Delivery: ${label}%0A` +
      `Grand Total: ${fee === null ? currencyFmt(subtotal) + ' + delivery TBC' : currencyFmt(grand)}%0A%0A` +
      `Notes: ${encodeURIComponent(data.get('custNotes') || '-')}`;

    const waLink = `https://wa.me/37129367093?text=${message}`;

    checkoutBox.innerHTML = `
      <div class="checkout-success">
        <div class="check-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>Order Ready To Send</h3>
        <p>Tap below to send your order details to Smoke &amp; Slice on WhatsApp, or call us directly to confirm. We'll reach out to arrange ${isDelivery ? 'delivery' : 'pickup'} and payment${fee === null ? ' — including your delivery fee, since you\'re over 8 km away' : ''}.</p>
        <div class="hero-actions" style="margin-bottom:16px;">
          <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-gold">Send Order via WhatsApp</a>
          <a href="tel:+37129367093" class="btn btn-outline">Call Instead</a>
        </div>
        <button class="cart-empty-btn" id="closeSuccessBtn">Close</button>
      </div>
    `;
    document.getElementById('closeSuccessBtn').addEventListener('click', () => {
      closeCheckout();
      cart = [];
      renderCart();
    });
  }

  function openCheckout() {
    if (cart.length === 0) return;
    buildCheckoutForm();
    checkoutModal.classList.add('open');
    closeCart();
  }
  function closeCheckout() {
    checkoutModal.classList.remove('open');
  }

  checkoutBtn.addEventListener('click', openCheckout);

  /* ======================================================================
     6. TOAST
     ====================================================================== */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

});
