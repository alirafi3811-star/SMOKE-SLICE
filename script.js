const menuContainer = document.getElementById("menuContainer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartPanel = document.getElementById("cartPanel");
const cartButton = document.getElementById("cartButton");

let cart = [];

menu.forEach((item, index) => {

    const card = document.createElement("div");

    card.className = "food-card";

    card.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.category}</p>
        <h2>€${item.price.toFixed(2)}</h2>
        <button onclick="addToCart(${index})">
            Add To Cart
        </button>
    `;

    menuContainer.appendChild(card);

});

function addToCart(index) {

    cart.push(menu[index]);

    updateCart();

}

function updateCart() {

    document.getElementById("cartCount").innerText = cart.length;

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.price;

        cartItems.innerHTML += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>€${item.price.toFixed(2)}</span>
            </div>
        `;

    });

    cartTotal.innerText = "Total: €" + total.toFixed(2);

}

cartButton.onclick = () => {

    cartPanel.classList.toggle("open");

};
