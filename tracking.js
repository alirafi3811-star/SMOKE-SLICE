import { db, collection, onSnapshot, query, orderBy } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const trackBtn = document.getElementById('trackBtn');
  const trackingIdInput = document.getElementById('trackingIdInput');
  const searchBoxContainer = document.getElementById('searchBoxContainer');
  const trackingDisplayCard = document.getElementById('trackingDisplayCard');

  const displayOrderId = document.getElementById('displayOrderId');
  const currentStatusBadge = document.getElementById('currentStatusBadge');
  const timelineVisualizer = document.getElementById('timelineVisualizer');
  
  const lblCustName = document.getElementById('lblCustName');
  const lblCustAddress = document.getElementById('lblCustAddress');
  const lblOrderTotal = document.getElementById('lblOrderTotal');
  const itemsOrderedList = document.getElementById('itemsOrderedList');

  // URL Parsing check execution layer
  const urlParams = new URLSearchParams(window.location.search);
  const directId = urlParams.get('id');
  if (directId) {
    trackingIdInput.value = directId;
    initiateLiveListener(directId);
  }

  trackBtn.addEventListener('click', () => {
    const idVal = trackingIdInput.value.trim();
    if (idVal) initiateLiveListener(idVal);
  });

  function initiateLiveListener(orderId) {
    // Unsubscribe existing handles if any, query dynamic snapshot stream filtering targeting orderId
    const ordersRef = collection(db, "orders");
    
    // Using simple client filter over live socket flow
    onSnapshot(ordersRef, (snapshot) => {
      let foundDoc = null;
      snapshot.forEach(doc => {
        if (doc.data().orderId === orderId) {
          foundDoc = doc.data();
        }
      });

      if (foundDoc) {
        renderLiveProgress(foundDoc);
      } else {
        alert("Order tracker could not verify requested transaction footprint ID sequence.");
      }
    });
  }

  function renderLiveProgress(order) {
    searchBoxContainer.classList.add('hidden');
    trackingDisplayCard.classList.remove('hidden');

    displayOrderId.textContent = `#${order.orderId}`;
    currentStatusBadge.textContent = order.status.replace(/_/g, ' ');

    lblCustName.textContent = order.customer.name;
    lblCustAddress.textContent = `${order.customer.address} ${order.customer.apartment || ''}`;
    lblOrderTotal.textContent = `€${order.total.toFixed(2)}`;

    itemsOrderedList.innerHTML = order.items.map(i => `<div>• ${i.name} <strong>x${i.quantity}</strong></div>`).join('');

    // Dynamically design tracking steps depending on delivery or pickup classification pipeline
    let steps = [];
    if (order.deliveryType === 'delivery') {
      steps = [
        { key: 'placed', label: 'Order Placed' },
        { key: 'received', label: 'Order Confirmed & Received' },
        { key: 'preparing', label: 'Preparing in Kitchen' },
        { key: 'ready', label: 'Packaging Ready' },
        { key: 'out_for_delivery', label: 'Out for Delivery with Courier' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'completed', label: 'Transaction Completed' }
      ];
    } else {
      steps = [
        { key: 'placed', label: 'Order Placed' },
        { key: 'received', label: 'Order Confirmed & Received' },
        { key: 'preparing', label: 'Preparing in Kitchen' },
        { key: 'ready', label: 'Ready for Collection' },
        { key: 'picked_up', label: 'Picked Up by Customer' },
        { key: 'completed', label: 'Transaction Completed' }
      ];
    }

    // Determine current index mapping matrix
    let currentIdx = steps.findIndex(s => s.key === order.status);
    if (order.status === 'cancelled') {
      timelineVisualizer.innerHTML = `<div style="color:var(--red-glow); font-weight:700;">⚠️ This order has been cancelled by the restaurant.</div>`;
      currentStatusBadge.style.background = 'var(--red)';
      currentStatusBadge.style.color = 'var(--white)';
      return;
    }

    timelineVisualizer.innerHTML = '';
    steps.forEach((step, idx) => {
      const node = document.createElement('div');
      node.className = 'step-node';
      if (idx === currentIdx) node.classList.add('active');
      else if (idx < currentIdx) node.classList.add('complete');
      
      node.textContent = step.label;
      timelineVisualizer.appendChild(node);
    });
  }
});
