/* =========================================================================
   SMOKE & SLICE — CUSTOMER CLIENT HANDLER (FIREBASE PATH)
   ========================================================================= */
import { db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

  /* ======================================================================
     1. NAVIGATION UTILITIES
     ====================================================================== */
  const siteHeader   = document.getElementById('siteHeader');
  const navToggle     = document.getElementById('navToggle');
  const navLinks      = document.getElementById('navLinks');
  const navBackdrop   = document.getElementById('navBackdrop');
  const navLinkItems  = document.querySelectorAll('.nav-link');

  function closeMobileNav() {
    if(navLinks) navLinks.classList.remove('mobile-open');
    if(navToggle) navToggle.classList.remove('open');
    if(navBackdrop) navBackdrop.classList.remove('open');
  }

  if(navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      navToggle.classList.toggle('open', isOpen);
      if(navBackdrop) navBackdrop.classList.toggle('open', isOpen);
    });
  }
  if(navBackdrop) navBackdrop.addEventListener('click', closeMobileNav);
  navLinkItems.forEach(link => link.addEventListener('click', closeMobileNav));

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  /* ======================================================================
     2. STOREFRONT DATA PLATFORM ENGINE
     ====================================================================== */
  let cart = [];
  const menuTabs = document.getElementById('menuTabs');
  const menuGrid = document.getElementById('menuGrid');
  const cartBadge = document.getElementById('cartBadge');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const emptyCartBtn = document.getElementById('emptyCartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutBox = document.getElementById('checkoutBox');

  // Load Categories & Items from menu.js smoothly
  if (typeof MENU_DATA !== 'undefined' && menuTabs && menuGrid) {
    initMenuStorefront();
  }

  function initMenuStorefront() {
    menuTabs.innerHTML = '';
    MENU_DATA.forEach((cat, index) => {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenuGrid(cat.items);
      });
      menuTabs.appendChild(btn);
    });
    // Render initial category items array load
    renderMenuGrid(MENU_DATA[0].items);
  }

  function renderMenuGrid(items) {
    menuGrid.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-item-card';
      
      const imgTemplate = item.image 
        ? `<div class="item-img-frame"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>` 
        : '';
        
      card.innerHTML = `
        ${imgTemplate}
        <div class="item-details">
          <div class="item-header-row">
            <h4>${item.name}</h4>
            <span class="price">€${item.price.toFixed(2)}</span>
          </div>
          <p class="description">${item.description || ''}</p>
          <button class="btn btn-outline btn-sm add-to-cart-trigger" style="margin-top:auto; width:100%;">Add Order</button>
        </div>
      `;

      card.querySelector('.add-to-cart-trigger').addEventListener('click', () => {
        addItemToCartMemory(item);
      });

      menuGrid.appendChild(card);
    });
  }

  /* ======================================================================
     3. SHOPPING CART CORE LOGIC
     ====================================================================== */
  function addItemToCartMemory(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ ...item, quantity: 1, customizations: "" });
    }
    updateCartUIState();
    showToastNotification(`${item.name} safely stored in cart.`);
  }

  function updateCartUIState() {
    // Count operations
    const totalCount = cart.reduce((acc, i) => acc + i.quantity, 0);
    if(cartBadge) cartBadge.textContent = totalCount;

    if (cart.length === 0) {
      if(cartItems) cartItems.innerHTML = '<div class="cart-empty">Your cart is empty. Add something delicious from the menu.</div>';
      if(cartTotal) cartTotal.textContent = '€0.00';
      if(checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if(checkoutBtn) checkoutBtn.disabled = false;
    if(cartItems) {
      cartItems.innerHTML = '';
      cart.forEach((item, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-row';
        itemRow.innerHTML = `
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; font-weight:500;">
              <span>${item.name} (x${item.quantity})</span>
              <span>€${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <input type="text" class="custom-note-field" placeholder="Instructions (e.g. no onions)" value="${item.customizations || ''}" data-index="${index}" style="width:100%; background:var(--black); border:1px solid var(--line); color:var(--cream); padding:4px 8px; font-size:12px; margin-top:4px;">
          </div>
          <button class="remove-item-btn" data-index="${index}" style="background:transparent; border:none; color:var(--red-glow); font-size:18px; cursor:pointer; padding-left:10px;">&times;</button>
        `;

        itemRow.querySelector('.custom-note-field').addEventListener('input', (e) => {
          cart[index].customizations = e.target.value;
        });

        itemRow.querySelector('.remove-item-btn').addEventListener('click', () => {
          cart.splice(index, 1);
          updateCartUIState();
        });

        cartItems.appendChild(itemRow);
      });
    }

    const priceCalculated = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    if(cartTotal) cartTotal.textContent = `€${priceCalculated.toFixed(2)}`;
  }

  // Bind Open/Close Triggers cleanly
  cartToggle?.addEventListener('click', () => {
    cartPanel?.classList.add('open');
    cartOverlay?.classList.add('open');
  });

  const closeCartPanel = () => {
    cartPanel?.classList.remove('open');
    cartOverlay?.classList.remove('open');
  };
  cartClose?.addEventListener('click', closeCartPanel);
  cartOverlay?.addEventListener('click', closeCartPanel);

  emptyCartBtn?.addEventListener('click', () => {
    cart = [];
    updateCartUIState();
  });

  /* ======================================================================
     4. DATA TRANSACTIONS CHECKOUT ARCHITECTURE
     ====================================================================== */
  checkoutBtn?.addEventListener('click', () => {
    closeCartPanel();
    if(checkoutModal) checkoutModal.classList.add('open');
    renderCheckoutFormFields();
  });

  function renderCheckoutFormFields() {
    if (!checkoutBox) return;
    checkoutBox.innerHTML = `
      <div style="padding:30px; background:var(--charcoal); border:1px solid var(--gold); position:relative; width:100%; max-width:500px; margin:40px auto; box-sizing:border-box;">
        <h3 style="font-family:'Cinzel', serif; color:var(--gold); margin-bottom:20px; text-align:center;">Finalize Operations Checkout</h3>
        <form id="storefrontCheckoutForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="custName" required placeholder="John Doe">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="custPhone" required placeholder="+371 20000000">
          </div>
          <div class="form-group">
            <label>Order Type Choice</label>
            <select id="custType" style="width:100%; background:var(--black-soft); border:1px solid var(--line); color:var(--cream); padding:12px; border-radius:4px;">
              <option value="pickup">Counter Pickup (Free)</option>
              <option value="delivery">Premium Delivery</option>
            </select>
          </div>
          <div class="form-group" id="addressFieldGroup" style="display:none;">
            <label>Delivery Destination Address</label>
            <input type="text" id="custAddress" placeholder="Street, House Number, Apartment">
          </div>
          <div class="form-group">
            <label>Kitchen Operation Special Instructions</label>
            <input type="text" id="custNotes" placeholder="Allergies, door codes, notes...">
          </div>
          <div style="display:flex; gap:10px; margin-top:30px;">
            <button type="button" id="cancelCheckoutBtn" class="btn btn-outline" style="flex:1;">Cancel</button>
            <button type="submit" class="btn btn-red" style="flex:1;">Submit Order</button>
          </div>
        </form>
      </div>
    `;

    const typeSelector = document.getElementById('custType');
    const addrGroup = document.getElementById('addressFieldGroup');
    const custAddr = document.getElementById('custAddress');

    typeSelector.addEventListener('change', (e) => {
      if (e.target.value === 'delivery') {
        addrGroup.style.display = 'block';
        custAddr.required = true;
      } else {
        addrGroup.style.display = 'none';
        custAddr.required = false;
        custAddr.value = '';
      }
    });

    document.getElementById('cancelCheckoutBtn').addEventListener('click', () => {
      checkoutModal.classList.remove('open');
    });

    document.getElementById('storefrontCheckoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        type: typeSelector.value,
        address: custAddr.value.trim(),
        notes: document.getElementById('custNotes').value.trim()
      };

      await handleOrderSubmission(payload);
    });
  }

  async function handleOrderSubmission(orderPayload) {
    try {
      // 1. Generate clean unique 4-digit tracking value code
      const trackingCode = Math.floor(1000 + Math.random() * 9000).toString();

      // 2. Format transactional parameters clean
      const structuredItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations || ""
      }));

      const finalPrice = parseFloat(document.getElementById('cartTotal').textContent.replace('€', ''));

      // 3. Assemble complete parameters object
      const finalOrderDocument = {
        trackingId: trackingCode,
        customerName: orderPayload.name,
        customerPhone: orderPayload.phone,
        orderType: orderPayload.type, 
        address: orderPayload.address || "",
        notes: orderPayload.notes || "",
        items: structuredItems,
        totalPrice: finalPrice,
        status: "Order Placed", 
        createdAt: serverTimestamp()
      };

      // 4. Update data instance dynamically to Cloud Firestore
      await addDoc(collection(db, "orders"), finalOrderDocument);
      
      // 5. Present structural receipt payload panel screen modules
      displayOrderSuccessScreen(trackingCode);

    } catch (error) {
      console.error("Firestore database submission error: ", error);
      alert("System error processing checkout. Please try again.");
    }
  }

  function displayOrderSuccessScreen(code) {
    if (!checkoutBox) return;

    checkoutBox.innerHTML = `
      <div class="success-panel" style="text-align:center; padding: 40px 20px; background:var(--charcoal); border:1px solid var(--gold); max-width:500px; margin:40px auto; box-sizing:border-box;">
        <div style="font-size: 48px; color: var(--gold); margin-bottom: 20px;">✓</div>
        <h2 style="font-family: 'Cinzel', serif; color: var(--cream); margin-bottom: 12px;">Order Placed!</h2>
        <p style="color: var(--cream-dim); margin-bottom: 24px;">Your order has been pushed to our kitchen dashboard system.</p>
        
        <div style="background: var(--black-soft); border: 1px solid var(--line); padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <span style="display:block; font-size: 12px; color: var(--gold); text-transform: uppercase; letter-spacing: 2px;">Your Tracking Pin</span>
          <strong style="font-size: 36px; color: var(--cream); font-family: 'Cinzel', serif; letter-spacing: 4px;">${code}</strong>
        </div>

        <p style="font-size: 13px; color: var(--cream-dim); margin-bottom: 24px;">
          Use this code on our Live Tracker page to follow progress in real time.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="tracking.html?code=${code}" class="btn btn-gold" style="display:block; text-align:center;">Track Live Progress</a>
          <button class="btn btn-outline" id="closeSuccessBtn">Return to Storefront</button>
        </div>
      </div>
    `;

    document.getElementById('closeSuccessBtn').addEventListener('click', () => {
      cart = [];
      updateCartUIState();
      checkoutModal.classList.remove('open');
      window.location.reload(); 
    });
  }

  /* ======================================================================
     5. TOAST NOTIFICATION HANDLERS
     ====================================================================== */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToastNotification(msg) {
    if(!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }
});
