const menuContainer = document.getElementById("menuContainer");

let cart = [];

menu.forEach((item,index)=>{

const card=document.createElement("div");

card.className="food-card";

card.innerHTML=`

<h3>${item.name}</h3>

<p>${item.category}</p>

<h2>€${item.price.toFixed(2)}</h2>

<button onclick="addToCart(${index})">

Add To Cart

</button>

`;

menuContainer.appendChild(card);

});

function addToCart(index){

cart.push(menu[index]);

document.getElementById("cartCount").innerText=cart.length;

alert(menu[index].name+" added to cart.");

}
