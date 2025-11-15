// Global cart management system
/** 
 * @typedef {Object} CartItem
 * @property {string} id - The product ID.
 * @property {string} title - The product title.
 * @property {number} price - The price (discounted or regular).
 * @property {Object} image - The product image object.
 * @property {string|null} size - Selected size (if applicable).
 * @property {number} quantity - How many of this item is in the cart.
 */

/**
 * The shopping cart array.
 * Stores all items the user has added to the cart.
 * Each item contains product data such as id, title, price, size, and quantity.
 * @type {Array<Object>}
 */
let cart = [];

/**
 * Loads the cart from localStorage into memory.
 * Restores cart count and total price.
 */
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCounter();
        updateShoppingCartTotal();
    }
}

/**
 * Saves the current cart state to localStorage.
 */
function saveCartToStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

/**
 * Adds a product to the cart. 
 * If item already exists (same id + size), quantity is increased.
 *
 * @param {Object} product - The product to add.
 * @param {string|null} [size=null] - Optional size variant.
 * @param {number} [quantity=1] - Quantity to add.
 */
function addToCart(product, size = null, quantity = 1) {
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && (item.size || '') === (size || '')
    );
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.discountedPrice || product.price,
            image: product.image,
            size: size,
            quantity: quantity
        };
        cart.push(cartItem);
    }
    
    updateCartCounter();
    saveCartToStorage();

    console.log(`Added ${product.title} to cart!`);
    showAddToCartNotification(product.title);
}

/**
 * Removes a specific item (id + size) from the cart.
 * 
 * @param {string} productId - The ID of the product to remove.
 * @param {string|null} [size=''] - Size variant to remove.
 */
function removeFromCart(productId, size = '') {
    cart = cart.filter(item => !(item.id === productId && (item.size || '') === size));
    updateCartCounter();
    saveCartToStorage();
    updateShoppingCartTotal();
}

/**
 * Updates the cart item count displayed in the header.
 */
function updateCartCounter() {
    const cartCountElement = document.querySelector('.header-content__nav__right__cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

/**
 * Calculates and updates the cart total price shown in the checkout sidebar.
 */
function updateShoppingCartTotal() {
    const cartTotalElement = document.getElementById('shoppingCartTotal');
    if (cartTotalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = total.toFixed(2);
    }
}

/**
 * Renders all cart items in the shopping cart sidebar.
 * Clears previous items and attaches event listeners to buttons.
 */
function displayShoppingCartItems() {
    const cartItemsContainer = document.getElementById('shoppingCartItems');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
            gap: 10px;
        `;

        cartItem.innerHTML = `
            <img src="${item.image.url}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}${item.size ? ` - Size: ${item.size}` : ''}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.size || ''}">−</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.size || ''}">+</button>
            </div>
            <span class="remove-item" data-id="${item.id}" data-size="${item.size || ''}">&times;</span>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    addShoppingCartEventListeners();
}

/**
 * Adds event listeners to all cart buttons:
 * - Increase quantity
 * - Decrease quantity
 * - Remove item
 */
function addShoppingCartEventListeners() {
    document.querySelectorAll('#shoppingCartItems .decrease-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);
            if (itemIndex > -1 && cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
                updateCartCounter();
                displayShoppingCartItems();
                updateShoppingCartTotal();
                saveCartToStorage();
                e.preventDefault();
                e.stopPropagation();
            }
            
        });
    });
    
    document.querySelectorAll('#shoppingCartItems .increase-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);
            if (itemIndex > -1) {
                cart[itemIndex].quantity++;
                updateCartCounter();
                displayShoppingCartItems();
                updateShoppingCartTotal();
                saveCartToStorage();
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
    
    document.querySelectorAll('#shoppingCartItems .remove-item').forEach(button => {
        button.addEventListener('click', function(e) {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            removeFromCart(id, size);
            displayShoppingCartItems();
            updateShoppingCartTotal();
            e.preventDefault();
            e.stopPropagation();
        });
    });
}

/**
 * Shows a temporary green toast-style notification after adding a product.
 * 
 * @param {string} productTitle - The product title to show in the message.
 */
function showAddToCartNotification(productTitle) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = `✓ Added "${productTitle}" to cart!`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.opacity = '1', 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Redirects user to checkout page.
 * Handles paths for root or /pages/ structures.
 */
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    if (window.location.pathname.includes('checkout.html')) {
        console.log('Already on checkout page');
        return;
    }

    const currentPath = window.location.pathname;
    let checkoutPath = currentPath.includes('/pages/')
        ? 'checkout.html'
        : 'pages/checkout.html';

    window.location.href = checkoutPath;
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();

    const shoppingBagIcon = document.getElementById('shoppingBagIcon');
    if (shoppingBagIcon) {
        shoppingBagIcon.addEventListener('click', () => {
            displayShoppingCartItems();
        });
    }
});

// Make checkout globally accessible
window.checkout = checkout;

export { 
    addToCart, 
    removeFromCart, 
    updateCartCounter, 
    displayShoppingCartItems, 
    updateShoppingCartTotal,
    saveCartToStorage,
    cart,
    checkout
};
