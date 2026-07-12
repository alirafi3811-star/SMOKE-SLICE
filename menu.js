/* =========================================================================
   SMOKE & SLICE — MENU DATA
   Source: official restaurant menu PDF. Names, prices and descriptions are
   reproduced exactly as provided — do not rename items or change prices.
   ========================================================================= */

const ALLERGEN_LEGEND = {
  1: "Cereals containing gluten",
  2: "Crustaceans",
  3: "Eggs",
  4: "Fish",
  5: "Peanuts",
  6: "Soybeans",
  7: "Milk (incl. lactose)",
  8: "Nuts",
  9: "Celery",
  10: "Mustard",
  11: "Sesame seeds",
  12: "Sulphur dioxide & sulphites",
  13: "Lupin",
  14: "Molluscs"
};

const MENU_DATA = [
  {
    id: "burgers",
    label: "Burgers",
    icon: "burger",
    items: [
      {
        id: "b1",
        name: "Juicy Cheeseburger",
        price: 8.90,
        description: "Homemade beef patty, cheddar, caramelised onions, tomato, pickles, lettuce, original sauce.",
        allergens: [1,3,5,6,7,8,9,10,11,12,13],
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "b2",
        name: "Jalapeno Boom Burger",
        price: 10.50,
        description: "Homemade beef patty, cheddar, pickled jalapenos, caramelised onions, tomato, lettuce, original sauce.",
        allergens: [1,3,5,6,7,8,9,10,11,12,13],
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "b3",
        name: "Super Healthy Veggie Burger",
        price: 9.90,
        description: "Homemade veggie patty, cheddar, caramelised onions, pickles, tomato, lettuce, veggie sauce.",
        allergens: [1,3,5,6,7,8,9,10,11,12,13],
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "b4",
        name: "Crispy Crown Chicken Burger",
        price: 8.90,
        description: "Breaded chicken breast patty, cheddar, fresh tomato, lettuce, sauce.",
        allergens: [1,3,5,6,7,8,9,10,11,12,13],
        image: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "b5",
        name: "Hawaiian Burger",
        price: 12.50,
        description: "Homemade beef patty, cheddar, caramelised onions, tomato, pickles, lettuce, original sauce, pineapple, mango chili sauce.",
        allergens: [1,3,5,6,7,8,9,10,11,12,13],
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80"
      }
    ]
  },
  {
    id: "pizza",
    label: "Pizza",
    icon: "pizza",
    items: [
      {
        id: "p1",
        name: "Margherita",
        price: 8.90,
        description: "Classic cheese pizza, tomato sauce & fresh basil.",
        allergens: [1,7,13],
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "p2",
        name: "Veggie-Loaded",
        price: 9.90,
        description: "Mixed vegetables, olives, artichokes & mushrooms.",
        allergens: [1,7,12,13],
        image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "p3",
        name: "Mushroom",
        price: 9.50,
        description: "Three types of mushroom, cheese & pizza sauce.",
        allergens: [1,6,7,12,13],
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "p4",
        name: "Mafiozza",
        price: 11.50,
        description: "Spicy pizza, bolognese, red sauce & cheese.",
        allergens: [1,6,7,9,12,13],
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "p5",
        name: "Quatro Formaggi",
        price: 9.90,
        description: "Mozzarella, cheddar, feta & blue cheese.",
        allergens: [1,7,12,13],
        image: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "p6",
        name: "Pollo Pizza",
        price: 10.90,
        description: "Red sauce, cheese, grilled chicken, mushrooms.",
        allergens: [1,6,7,12,13],
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80"
      }
    ]
  },
  {
    id: "pasta",
    label: "Pasta",
    icon: "pasta",
    items: [
      {
        id: "pa1",
        name: "Aglio E Olio",
        price: 7.50,
        description: "Olive oil, parsley & chili flakes.",
        allergens: [1],
        image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "pa2",
        name: "Al Pesto",
        price: 8.50,
        description: "Creamy basil sauce, hard cheese, pine nuts, garlic, olive oil.",
        allergens: [1,7,8,12],
        image: "https://images.unsplash.com/photo-1627042633145-b780d842ba45?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "pa3",
        name: "Bolognese",
        price: 9.00,
        description: "Pure ground beef tomato sauce, touch of cream.",
        allergens: [1,7,9,13],
        image: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "pa4",
        name: "Pollo La Favorita",
        price: 8.90,
        description: "Chicken pasta, creamy mushroom sauce, spring onion.",
        allergens: [1,7,13],
        image: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "pa5",
        name: "Gorgonzola",
        price: 9.90,
        description: "Creamy gorgonzola pasta with fresh parsley.",
        allergens: [1,7],
        image: "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?auto=format&fit=crop&w=900&q=80"
      }
    ]
  },
  {
    id: "snacks",
    label: "Snacks",
    icon: "snacks",
    items: [
      {
        id: "s1",
        name: "Chicken Wings",
        price: 5.50,
        description: "Coated in glaze and nuts.",
        allergens: [8],
        image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "s2",
        name: "Loaded Nachos",
        price: 4.90,
        description: "Tortilla chips loaded with melted cheese and house toppings.",
        allergens: [1,3,6,7,9,10,12],
        image: "https://images.unsplash.com/photo-1684353763409-9567253bd218?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "s3",
        name: "French Fries",
        price: 3.90,
        description: "Crisp golden fries. Add cheese +€1.50 or jalapenos +€1.00 — mention in Special Instructions at checkout.",
        allergens: [1,3,6,7,9,10,12],
        image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=80"
      }
    ]
  },
  {
    id: "sauces",
    label: "Sauces",
    icon: "sauce",
    items: [
      { id: "sc1", name: "Ketchup", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc2", name: "Mayonnaise", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc3", name: "BBQ Sauce", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc4", name: "Sriracha Mayo", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc5", name: "Sweet Chilli", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc6", name: "Chilli Mango", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc7", name: "Mustard", price: 0.90, description: "", allergens: [], image: "" },
      { id: "sc8", name: "Aioli", price: 0.90, description: "", allergens: [], image: "" }
    ]
  }
];
