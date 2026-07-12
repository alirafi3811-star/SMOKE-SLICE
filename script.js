import { db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  /* ======================================================================
     1. NAVIGATION & LAYOUT INITIALIZATION
     ====================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinkItems = document.querySelectorAll('.nav-link');

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

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  /* ======================================================================
     2. CART LOGIC STORAGE & ACTIONS
     ====================================================================== */
  let cart = [];
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalAmount = document.getElementById('cartTotal');
  const cartBadge = document.getElementById('cartBadge');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const emptyCartBtn = document.getElementById('emptyCartBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutBox = document.getElementById('checkoutBox');

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

  emptyCartBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
    showToast("Cart cleared.");
  });

  window.addToCart = function(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    renderCart();
    showToast(`${name} added to cart.`);
  };

  function updateQuantity(id, delta) {
    const idx = cart.findIndex(item => item.id === id);
    if (idx !== -1) {
      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
      }
      renderCart();
    }
  }

  function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty. Add something delicious from the menu.</div>';
      cartTotalAmount.textContent = '€0.00';
      cartBadge.textContent = '0';
      checkoutBtn.disabled = true;
      return;
    }

    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;
      totalItems += item.quantity;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn minus" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-id="${item.id}">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(row);
    });

    cartTotalAmount.textContent = `€${total.toFixed(2)}`;
    cartBadge.textContent = totalItems;
    checkoutBtn.disabled = false;

    cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(b => {
      b.addEventListener('click', () => updateQuantity(b.dataset.id, -1));
    });
    cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(b => {
      b.addEventListener('click', () => updateQuantity(b.dataset.id, 1));
    });
  }

  /* ======================================================================
     3. SYSTEM RENDERING FOR PRODUCTS
     ====================================================================== */
  const menuTabs = document.getElementById('menuTabs');
  const menuGrid = document.getElementById('menuGrid');

  function renderMenu() {
    if (!menuTabs || !menuGrid) return;
    menuTabs.innerHTML = '';
    menuGrid.innerHTML = '';

    MENU_DATA.forEach((cat, idx) => {
      const tab = document.createElement('button');
      tab.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
      tab.textContent = cat.label;
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');
        filterCategory(cat.id);
      });
      menuTabs.appendChild(tab);
    });

    if (MENU_DATA.length > 0) {
      filterCategory(MENU_DATA[0].id);
    }
  }

  function filterCategory(catId) {
    menuGrid.innerHTML = '';
    const category = MENU_DATA.find(c => c.id === catId);
    if (!category) return;

    category.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      const imgHtml = item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-img">` : '<div class="menu-img-placeholder">Smoke & Slice</div>';
      
      card.innerHTML = `
        ${imgHtml}
        <div class="menu-details">
          <div class="menu-meta">
            <h4 class="menu-name">${item.name}</h4>
            <span class="menu-price">€${item.price.toFixed(2)}</span>
          </div>
          <p class="menu-desc">${item.description || 'No description available.'}</p>
          <button class="btn btn-red btn-sm" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">Add to Order</button>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  }

  /* ======================================================================
     4. BACKEND INTEGRATED FIREBASE CHECKOUT SUBMISSION FLOW
     ====================================================================== */
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

  function buildCheckoutForm() {
    let subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    checkoutBox.innerHTML = `
      <div class="checkout-header">
        <h3>Complete Your Order</h3>
        <button class="icon-btn" id="closeCheckoutForm">&times;</button>
      </div>
      <form id="orderSubmissionForm" class="checkout-form">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="custName" required placeholder="E.g. John Doe">
        </div>
        <div class="form-group">
          <label>Phone Number *</label>
          <input type="tel" id="custPhone" required placeholder="E.g. +371 20000000">
        </div>
        <div class="form-group">
          <label>Order Fulfillment *</label>
          <select id="fulfillmentType">
            <option value="delivery">Delivery (€2.50)</option>
            <option value="pickup">Self-Pickup (Free)</option>
          </select>
        </div>
        <div id="deliveryFields">
          <div class="form-group">
            <label>Delivery Address *</label>
            <input type="text" id="custAddress" placeholder="Street, City">
          </div>
          <div class="form-group">
            <label>Apartment / Suite</label>
            <input type="text" id="custApartment" placeholder="Apt 4B">
          </div>
        </div>
        <div class="form-group">
          <label>Payment Method *</label>
          <select id="payMethod">
            <option value="card">Credit / Debit Card</option>
            <option value="cash">Cash on Delivery / Pickup</option>
          </select>
        </div>
        <div class="form-group">
          <label>Special Notes or Instructions</label>
          <textarea id="orderNotes" rows="2" placeholder="Allergies, delivery dropoff notes..."></textarea>
        </div>
        <div class="summary-breakdown">
          <div class="summary-line"><span>Subtotal:</span><span>€${subtotal.toFixed(2)}</span></div>
          <div class="summary-line"><span id="chargeLabel">Delivery Fee:</span><span id="chargeAmt">€2.50</span></div>
          <hr>
          <div class="summary-line total"><span>Total:</span><span id="finalOrderTotal">€${(subtotal + 2.50).toFixed(2)}</span></div>
        </div>
        <button type="submit" class="btn btn-red btn-block" style="margin-top: 15px;">PLACE ORDER</button>
      </form>
    `;

    document.getElementById('closeCheckoutForm').addEventListener('click', closeCheckout);
    
    const fulfillmentSelect = document.getElementById('fulfillmentType');
    const deliveryFields = document.getElementById('deliveryFields');
    const chargeLabel = document.getElementById('chargeLabel');
    const chargeAmt = document.getElementById('chargeAmt');
    const finalOrderTotal = document.getElementById('finalOrderTotal');
    const addressInput = document.getElementById('custAddress');

    fulfillmentSelect.addEventListener('change', () => {
      if (fulfillmentSelect.value === 'pickup') {
        deliveryFields.style.display = 'none';
        addressInput.required = false;
        chargeLabel.textContent = "Self-Pickup:";
        chargeAmt.textContent = "Free";
        finalOrderTotal.textContent = `€${subtotal.toFixed(2)}`;
      } else {
        deliveryFields.style.display = 'block';
        addressInput.required = true;
        chargeLabel.textContent = "Delivery Fee:";
        chargeAmt.textContent = "€2.50";
        finalOrderTotal.textContent = `€${(subtotal + 2.50).toFixed(2)}`;
      }
    });

    document.getElementById('orderSubmissionForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const isDelivery = fulfillmentSelect.value === 'delivery';
      const orderIdNum = Math.floor(1000 + Math.random() * 9000).toString(); 
      const finalTotal = isDelivery ? subtotal + 2.50 : subtotal;

      const orderPayload = {
        orderId: orderIdNum,
        customer: {
          name: document.getElementById('custName').value.trim(),
          phone: document.getElementById('custPhone').value.trim(),
          address: isDelivery ? addressInput.value.trim() : 'Self-Pickup',
          apartment: isDelivery ? document.getElementById('custApartment').value.trim() : '',
          notes: document.getElementById('orderNotes').value.trim()
        },
        items: cart,
        deliveryType: fulfillmentSelect.value,
        paymentMethod: document.getElementById('payMethod').value,
        subtotal: subtotal,
        deliveryFee: isDelivery ? 2.50 : 0.00,
        total: finalTotal,
        status: 'placed',
        createdAt: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "orders"), orderPayload);
        
        // Notify Owner via Free Telegram Channel Bot System Async
        sendTelegramNotification(orderPayload);

        // Success Output Confirmation Screen
        checkoutBox.innerHTML = `
          <div class="success-screen" style="text-align:center; padding: 40px 20px;">
            <div style="font-size: 48px; color: var(--gold); margin-bottom: 20px;">✓</div>
            <h3>Order Confirmed!</h3>
            <p style="margin: 15px 0; font-family: 'Cinzel', serif; font-size: 1.5rem; color: var(--gold-bright);">Order #${orderIdNum}</p>
            <p style="color: var(--cream-dim); font-size: 0.95rem;">Your real-time order tracking details are ready.</p>
            <div style="margin-top: 25px; display: flex; flex-direction: column; gap: 10px;">
              <a href="tracking.html?id=${orderIdNum}" class="btn btn-red">Go to Live Tracking Page</a>
              <button class="btn btn-outline" id="clearFinishBtn">Back to Main Screen</button>
            </div>
          </div>
        `;

        document.getElementById('clearFinishBtn').addEventListener('click', () => {
          closeCheckout();
          cart = [];
          renderCart();
        });

      } catch (err) {
        console.error("Error committing order to Firestore Database: ", err);
        showToast("Error processing order. Please try again.");
      }
    });
  }

  // Telegram Dynamic Forwarder
  function sendTelegramNotification(order) {
    const BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"; 
    const CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"; 
    if(BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN") return; // Skip if configuration variables are default

    let itemLines = order.items.map(i => `• ${i.name} x${i.quantity}`).join('\n');
    let message = `🔔 *New Order Received!* \n\n` +
                  `*Order ID:* #${order.orderId}\n` +
                  `*Customer:* ${order.customer.name}\n` +
                  `*Phone:* ${order.customer.phone}\n` +
                  `*Type:* ${order.deliveryType.toUpperCase()}\n` +
                  `*Address:* ${order.customer.address} ${order.customer.apartment}\n\n` +
                  `*Items Ordered:*\n${itemLines}\n\n` +
                  `*Total Amount:* €${order.total.toFixed(2)}`;

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
    }).catch(e => console.error("Telegram notification delivery failed:", e));
  }

  /* ======================================================================
     5. TOAST COMPONENT LOGIC
     ====================================================================== */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  // Bootstrap Execution Core
  renderMenu();
});
