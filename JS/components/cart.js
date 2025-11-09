// Global cart management system
let cart = [];

// Load cart from localStorage on page load
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCounter();
        updateShoppingCartTotal();
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(product, size = null, quantity = 1) {
    // Check if item already exists in cart (same ID and size)
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && (item.size || '') === (size || '')
    );
    
    if (existingItemIndex > -1) {
        // Item exists, increase quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.discountedPrice || product.price, // Use discounted price if available
            image: product.image,
            size: size,
            quantity: quantity
        };
        cart.push(cartItem);
    }
    
    updateCartCounter();
    saveCartToStorage();
    
    // Show a success message (optional)
    console.log(`Added ${product.title} to cart!`);
    
    // You could add a toast notification here
    showAddToCartNotification(product.title);
}

// Remove item from cart
function removeFromCart(productId, size = '') {
    cart = cart.filter(item => !(item.id === productId && (item.size || '') === size));
    updateCartCounter();
    saveCartToStorage();
    updateShoppingCartTotal();
}

// Update cart counter in header
function updateCartCounter() {
    const cartCountElement = document.querySelector('.header-content__nav__right__cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Update shopping cart total
function updateShoppingCartTotal() {
    const cartTotalElement = document.getElementById('shoppingCartTotal');
    if (cartTotalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = total.toFixed(2);
    }
}

// Display cart items in sidebar
function displayShoppingCartItems() {
    const cartItemsContainer = document.getElementById('shoppingCartItems');
    if (!cartItemsContainer) return;

    // Clear existing items
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
            <div class="cart-item-details" style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                <div class="cart-item-title" style="font-size: 14px; font-weight: 500;">${item.title}${item.size ? ` - Size: ${item.size}` : ''}</div>
                <div class="cart-item-price" style="color: #666; font-size: 12px;">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 8px;">
                <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.size || ''}" style="width: 25px; height: 25px; border: 1px solid #ddd; background: #f9f9f9; border-radius: 3px; cursor: pointer;">−</button>
                <span class="quantity-display" style="font-size: 14px; font-weight: 500; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.size || ''}" style="width: 25px; height: 25px; border: 1px solid #ddd; background: #f9f9f9; border-radius: 3px; cursor: pointer;">+</button>
            </div>
            <span class="remove-item" data-id="${item.id}" data-size="${item.size || ''}" style="cursor: pointer; font-size: 20px; color: #999; padding: 5px; margin-left: 10px;">&times;</span>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    addShoppingCartEventListeners();
}

// Add event listeners for cart item buttons
function addShoppingCartEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('#shoppingCartItems .decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);
            if (itemIndex > -1 && cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
                updateCartCounter();
                displayShoppingCartItems();
                updateShoppingCartTotal();
                saveCartToStorage();
            }
        });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('#shoppingCartItems .increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);
            if (itemIndex > -1) {
                cart[itemIndex].quantity++;
                updateCartCounter();
                displayShoppingCartItems();
                updateShoppingCartTotal();
                saveCartToStorage();
            }
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('#shoppingCartItems .remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            removeFromCart(id, size);
            displayShoppingCartItems();
            updateShoppingCartTotal();
        });
    });
}

// Show add to cart notification (optional)
function showAddToCartNotification(productTitle) {
    // Create and show a simple notification
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
    
    // Fade in
    setTimeout(() => notification.style.opacity = '1', 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Checkout function (placeholder)
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Redirect to checkout page or handle checkout logic
    window.location.href = 'pages/checkout.html';
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    
    // Update shopping cart display when cart is opened
    const shoppingBagIcon = document.getElementById('shoppingBagIcon');
    if (shoppingBagIcon) {
        shoppingBagIcon.addEventListener('click', () => {
            displayShoppingCartItems();
        });
    }
});

// Export functions for use in other files
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