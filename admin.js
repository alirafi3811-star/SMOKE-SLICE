import { db, auth, collection, doc, updateDoc, onSnapshot, query, orderBy, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase.js';

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
        
        if (data.status === 'completed' || data.status === 'delivered') {
          revenueCalculated += data.total;
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

    const filtered = currentLiveOrders.filter(o => filter === 'all' || o.status === filter);

    if (filtered.length === 0) {
      ordersFeedStream.innerHTML = '<div style="color:var(--cream-dim);">No active system records match the tracking scope criteria.</div>';
      return;
    }

    filtered.forEach(order => {
      const card = document.createElement('div');
      card.className = `order-admin-card status-${order.status}`;
      
      const itemRows = order.items.map(i => `<div>${i.name} <strong>x${i.quantity}</strong></div>`).join('');
      
      let actionButtons = '';
      if (order.status === 'placed') {
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="received">Accept</button>
                         <button class="btn btn-outline btn-sm state-change" data-id="${order.docId}" data-target="cancelled">Cancel</button>`;
      } else if (order.status === 'received') {
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="preparing">Cook</button>`;
      } else if (order.status === 'preparing') {
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="ready">Ready</button>`;
      } else if (order.status === 'ready') {
        if (order.deliveryType === 'delivery') {
          actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="out_for_delivery">Ship Out</button>`;
        } else {
          actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="completed">Picked Up</button>`;
        }
      } else if (order.status === 'out_for_delivery') {
        actionButtons = `<button class="btn btn-red btn-sm state-change" data-id="${order.docId}" data-target="completed">Delivered</button>`;
      }

      card.innerHTML = `
        <div class="admin-card-header">
          <span class="admin-card-id">#${order.orderId}</span>
          <span class="admin-card-type">${order.deliveryType}</span>
        </div>
        <div class="admin-card-body">
          <p><strong>Customer:</strong> ${order.customer.name}</p>
          <p><strong>Phone:</strong> ${order.customer.phone}</p>
          <p><strong>Address:</strong> ${order.customer.address} ${order.customer.apartment || ''}</p>
          <p><strong>Notes:</strong> <span style="color:var(--gold-bright);">${order.customer.notes || 'None'}</span></p>
          <div class="admin-card-items">${itemRows}</div>
          <p style="margin-top:10px; font-weight:600; text-align:right;">Total: €${order.total.toFixed(2)}</p>
        </div>
        <div class="admin-card-actions">
          ${actionButtons}
        </div>
      `;

      ordersFeedStream.appendChild(card);
    });

    // Attach dynamic click event interceptors to update status instantly
    ordersFeedStream.querySelectorAll('.state-change').forEach(button => {
      button.addEventListener('click', async (e) => {
        const docId = button.dataset.id;
        const targetStatus = button.dataset.target;
        
        try {
          const orderRef = doc(db, "orders", docId);
          await updateDoc(orderRef, { status: targetStatus });
        } catch (err) {
          console.error("Failed executing operational transaction status change: ", err);
        }
      });
    });
  }
});
