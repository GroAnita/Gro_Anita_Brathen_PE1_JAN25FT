import { displayShoppingCartItems, updateShoppingCartTotal } from './cart.js';

const shoppingBagIcon = document.getElementById('shoppingBagIcon');
const shoppingBagOverlay = document.getElementById('shoppingCart');
const closeShoppingCartBtn = document.getElementById('closeShoppingCartBtn');

/**
 * Opens the shopping cart when the shopping bag icon is clicked.
 * Adds the `.show-cart` class to the body.
 */
shoppingBagIcon.addEventListener('click', () => {
    document.body.classList.add('show-cart');
});

/**
 * Closes the shopping cart when the close button inside the cart is clicked.
 */
if (closeShoppingCartBtn) {
    closeShoppingCartBtn.addEventListener('click', () => {
        document.body.classList.remove('show-cart');
    });
}

/**
 * Closes the shopping cart if the user clicks outside of the cart content.
 * 
 * @param {MouseEvent} event - The click event used to detect the click target.
 */
document.addEventListener('click', (event) => {
    const shoppingCart = document.getElementById('shoppingCart');
    const shoppingBagIcon = document.getElementById('shoppingBagIcon');
    
    const clickInsideCart = shoppingCart.contains(event.target);
    const clickOnBagIcon = shoppingBagIcon.contains(event.target);

    // Only close if the cart is open AND the click is outside it.
    if (document.body.classList.contains('show-cart')) {
        if (!clickInsideCart && !clickOnBagIcon) {
            document.body.classList.remove('show-cart');
        }
    }
});

/**
 * Opens the shopping cart, renders items, and updates totals.
 */
function openShoppingCart() {
    document.body.classList.add('show-cart');
    displayShoppingCartItems();
    updateShoppingCartTotal();
}

/**
 * Closes the shopping cart by removing the `.show-cart` class.
 */
function closeShoppingCart() {
    document.body.classList.remove('show-cart');
}

// Cart functions are now handled by cart.js
