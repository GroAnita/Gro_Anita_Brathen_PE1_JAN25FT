import { displayShoppingCartItems, updateShoppingCartTotal } from './cart.js';

const shoppingBagIcon = document.getElementById('shoppingBagIcon');
const shoppingBagOverlay = document.getElementById('shoppingCart');
const closeShoppingCartBtn = document.getElementById('closeShoppingCartBtn');

//open shopping cart
shoppingBagIcon.addEventListener('click', () => {
    document.body.classList.add('show-cart');
});

//close shopping cart with close button
if (closeShoppingCartBtn) {
    closeShoppingCartBtn.addEventListener('click', () => {
        document.body.classList.remove('show-cart');
    });
}

//close shopping cart when clicking outside the cart content
document.addEventListener('click', (event) => {
    const shoppingCart = document.getElementById('shoppingCart');
    const shoppingBagIcon = document.getElementById('shoppingBagIcon');
    
    // Check if cart is open and click is outside cart and not on the icon
    if (document.body.classList.contains('show-cart')) {
        if (!shoppingCart.contains(event.target) && !shoppingBagIcon.contains(event.target)) {
            document.body.classList.remove('show-cart');
        }
    }
});


function openShoppingCart() {
    document.body.classList.add('show-cart');
    displayShoppingCartItems();
    updateShoppingCartTotal();
}

function closeShoppingCart() {
    document.body.classList.remove('show-cart');
}

// Cart functions are now handled by cart.js