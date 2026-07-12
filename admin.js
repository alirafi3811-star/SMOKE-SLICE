import { 
  db, 
  auth, 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const authGateSection = document.getElementById('authGateSection');
  const adminPanelDashboard = document.getElementById('adminPanelDashboard');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const ordersFeedStream = document.getElementById('ordersFeedStream');
  const statusFilterDropdown = document.getElementById('statusFilterDropdown');
  const revenueMetricDisplay = document.getElementById('revenueMetricDisplay');

  let currentLiveOrders = [];

  /* ======================================================================
     1. AUTH SYSTEM INTERFACE CONTROLLER LAYER
     ====================================================================== */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authGateSection.classList.add('hidden');
      adminPanelDashboard.classList.remove('hidden');
      initializeLiveStream();
    } else {
      authGateSection.classList.remove('hidden');
      adminPanelDashboard.classList.add('hidden');
    }
  });

  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert("Authentication mapping failure. Security checkpoint denied entry.");
    }
  });

  logoutBtn.addEventListener('click', () => signOut(auth));

  /* ======================================================================
     2. STREAM SYNCHRONIZATION AND RENDERING MATRIX
     ====================================================================== */
  function initializeLiveStream() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
      currentLiveOrders = [];
      let revenueCalculated = 0;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        currentLiveOrders.push({ docId: docSnap.id, ...data });
        
        if (data.status === 'completed' || data.status === 'delivered' || data.status === 'Delivered / Pickup Complete') {
          revenueCalculated += parseFloat(data.totalPrice || data.total || 0);
        }
      });

      revenueMetricDisplay.textContent = `€${revenueCalculated.toFixed(2)}`;
      renderFilteredFeed();
    });
  }

  statusFilterDropdown.addEventListener('change', renderFilteredFeed);

  function renderFilteredFeed() {
    ordersFeedStream.innerHTML = '';
    const filter = statusFilterDropdown.value;

    const filtered = currentLiveOrders.filter(o => {
      if (filter === 'all') return true;
      
      // Normalized tracking maps for matching custom variations
      if (filter === 'placed' && o.status === 'Order Placed') return true;
      if (filter === 'received' && o.status === 'Order Received') return true;
      if (filter === 'preparing' && o.status === 'Preparing') return true;
      if (filter === 'ready' && (o.status === 'Ready' || o.status === 'Ready for Pickup')) return true;
      if (filter === 'out_for_delivery' && o.status === 'Out for Delivery') return true;
      if (filter === 'completed' && (o.status === 'completed' || o.status === 'Delivered / Pickup Complete')) return true;
      if (filter === 'cancelled' && o.status === 'cancelled') return true;
      
      return o.status === filter;
    });

    if (filtered.length === 0) {
      ordersFeedStream.innerHTML = '<div style="color:var(--cream-dim); padding: 20px;">No active system records match the tracking scope criteria.</div>';
      return;
    }

    filtered.forEach(order => {
      const card = document.createElement('div');
      
      // Class modifier safely generated
      let safeStatusClass = 'placed';
      if (order.status === 'Order Placed') safeStatusClass = 'placed';
      else if (order.status === 'Order Received') safeStatusClass = 'received';
      else if (order.status === 'Preparing') safeStatusClass = 'preparing';
      else if (order.status === 'Ready' || order.status === 'Ready for Pickup') safeStatusClass = 'ready';
      else if (order.status === 'Out for Delivery') safeStatusClass = 'out_for_delivery';
      else if (order.status === 'Delivered / Pickup Complete' || order.status === 'completed') safeStatusClass = 'completed';
      else if (order.status === 'cancelled') safeStatusClass = 'cancelled';

      card.className = `order-admin-card status-${safeStatusClass}`;
      
      const itemsArray = order.items || [];
      const itemRows = itemsArray.map(i => `<div>• ${i.name} <strong>x${i.quantity}</strong> ${i.customizations ? `<small style="color:var(--gold); display:block; margin-left:10px;">(${i.customizations})</small>` : ''}</div>`).join('');
      
      let actionButtons = '';
      let actionClass = 'admin-card-actions';

      if (order.status === 'Order Placed' || order.status === 'placed') {
        actionClass += ' two-buttons';
        actionButtons = `
          <button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="Order Received">Accept</button>
          <button class="btn btn-outline btn-sm state-change" data-id="${order.docId}" data-target="cancelled">Cancel</button>
        `;
      } else if (order.status === 'Order Received' || order.status === 'received') {
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="Preparing">Cook</button>`;
      } else if (order.status === 'Preparing' || order.status === 'preparing') {
        const nextReadyState = (order.orderType === 'delivery') ? 'Ready' : 'Ready for Pickup';
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="${nextReadyState}">Ready</button>`;
      } else if (order.status === 'Ready' || order.status === 'Ready for Pickup' || order.status === 'ready') {
        if (order.orderType === 'delivery') {
          actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="Out for Delivery">Ship Out</button>`;
        } else {
          actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="Delivered / Pickup Complete">Picked Up</button>`;
        }
      } else if (order.status === 'Out for Delivery' || order.status === 'out_for_delivery') {
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="Delivered / Pickup Complete">Delivered</button>`;
      }

      const totalVal = parseFloat(order.totalPrice || order.total || 0);
      const displayType = (order.orderType || order.deliveryType || 'pickup').toUpperCase();

      card.innerHTML = `
        <div class="admin-card-header">
          <span class="admin-card-id">#${order.trackingId || 'UNKN'}</span>
          <span class="admin-card-type">${displayType}</span>
        </div>
        <div class="admin-card-body">
          <p><strong>Customer:</strong> ${order.customerName || 'Guest'}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
          ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
          <p><strong>Notes:</strong> <span style="color:var(--gold-bright);">${order.notes || 'None'}</span></p>
          <div class="admin-card-items">${itemRows || 'No items listed.'}</div>
          <p style="margin-top:10px; font-weight:600; text-align:right;">Total: €${totalVal.toFixed(2)}</p>
        </div>
        <div class="${actionClass}">
          ${actionButtons}
        </div>
      `;

      ordersFeedStream.appendChild(card);
    });

    // Hook reactive pipeline click event listeners
    ordersFeedStream.querySelectorAll('.state-change').forEach(button => {
      button.addEventListener('click', async (e) => {
        const docId = button.dataset.id;
        const targetStatus = button.dataset.target;
        
        try {
          const orderRef = doc(db, "orders", docId);
          await updateDoc(orderRef, { status: targetStatus });
        } catch (err) {
          console.error("Failed executing operational status transition update: ", err);
        }
      });
    });
  }
});
