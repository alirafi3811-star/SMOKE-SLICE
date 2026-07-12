/* =========================================================================
   SMOKE & SLICE — CUSTOMER CLIENT HANDLER (FIREBASE PATH)
   Add these imports at the absolute top line of your script.js file.
   ========================================================================= */
import { db, collection, addDoc, serverTimestamp } from './firebase.js';

// Find the function where checkout form data is validated and order is finished:
async function handleOrderSubmission(orderPayload) {
  try {
    // 1. Generate a clean tracking pin (4-digit string)
    const trackingCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 2. Format items from the shopping cart array
    const structuredItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      customizations: item.customizations || ""
    }));

    // 3. Assemble structural document payload parameters
    const finalOrderDocument = {
      trackingId: trackingCode,
      customerName: orderPayload.name,
      customerPhone: orderPayload.phone,
      orderType: orderPayload.type, // 'delivery' or 'pickup'
      address: orderPayload.address || "",
      notes: orderPayload.notes || "",
      items: structuredItems,
      totalPrice: parseFloat(document.getElementById('cartTotal').textContent.replace('€', '')),
      status: "Order Placed", 
      createdAt: serverTimestamp()
    };

    // 4. Save to Cloud Firestore
    await addDoc(collection(db, "orders"), finalOrderDocument);
    
    // 5. Present success feedback module inside checkout screen
    displayOrderSuccessScreen(trackingCode);

  } catch (error) {
    console.error("Firestore database submission error: ", error);
    alert("System error processing checkout. Please try again.");
  }
}

function displayOrderSuccessScreen(code) {
  const checkoutBox = document.getElementById('checkoutBox');
  if (!checkoutBox) return;

  checkoutBox.innerHTML = `
    <div class="success-panel" style="text-align:center; padding: 40px 20px;">
      <div style="font-size: 48px; color: var(--gold); margin-bottom: 20px;">✓</div>
      <h2 style="font-family: 'Cinzel', serif; color: var(--cream); margin-bottom: 12px;">Order Placed!</h2>
      <p style="color: var(--cream-dim); margin-bottom: 24px;">Your order has been pushed to our kitchen dashboard system.</p>
      
      <div style="background: var(--charcoal); border: 1px solid var(--line); padding: 16px; border-radius: 4px; margin-bottom: 24px;">
        <span style="display:block; font-size: 12px; color: var(--gold); text-transform: uppercase; letter-spacing: 2px;">Your Tracking Pin</span>
        <strong style="font-size: 36px; color: var(--cream); font-family: 'Cinzel', serif; letter-spacing: 4px;">${code}</strong>
      </div>

      <p style="font-size: 13px; color: var(--cream-dim); margin-bottom: 24px;">
        Use this code on our Live Tracker page to follow progress in real time.
      </p>

      <div class="hero-actions" style="display: flex; flex-direction: column; gap: 12px;">
        <a href="tracking.html?code=${code}" class="btn btn-gold">Track Live Progress</a>
        <button class="btn btn-outline" id="closeSuccessBtn">Return to Storefront</button>
      </div>
    </div>
  `;

  document.getElementById('closeSuccessBtn').addEventListener('click', () => {
    // Clear cart memory array
    cart = [];
    if (typeof renderCart === 'function') renderCart();
    window.location.reload(); 
  });
}
