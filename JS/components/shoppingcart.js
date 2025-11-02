const shoppingBagIcon = document.getElementById('shoppingBagIcon');
const shoppingBagOverlay = document.getElementById('shoppingCart');

//open shopping cart
shoppingBagIcon.addEventListener('click', () => {
    document.body.classList.add('show-cart');
});

//close shopping cart when clicking outside the cart content
shoppingBagOverlay.addEventListener('click', (event) => {
    if (event.target === shoppingBagOverlay) {
        document.body.classList.remove('show-cart');
    }
});

closeShoppingCart.addEventListener('click', () => {
    document.body.classList.remove('show-cart');
});

function openShoppingCart() {
    document.body.classList.add('show-cart');
    displayShoppingCartItems();
    updateShoppingCartTotal();
}

function closeShoppingCart() {
    document.body.classList.remove('show-cart');
}

function displayShoppingCartItems() {
    const cartItemsContainer = document.getElementById('shoppingCartItems');

    if (!cartItemsContainer) return;

    // Clear existing items
    cartItemsContainer.innerHTML = '';

    if (cartItemsContainer.length === 0) {
        cartItemsContainer.innerHTML = 'div class="empty-cart">Your cart is empty</div>';
        return;
    }

    cart.array.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
            <img src="${item.image.url}" alt="${item.title}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}${item.size ? ` - Size: ${item.size}` : ''}</div>
                <div class="cart-item-price">$${item.price}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.size || ''}">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.size || ''}">+</button>
            </div>
            <span class="remove-item" data-id="${item.id}" data-size="${item.size || ''}">&times;</span>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    addShoppingCartEventListeners();
}

function addShoppingCartEventListeners() {
     // Decrease quantity buttons
    document.querySelectorAll('#shoppingCartItems .decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id == id && (item.size || '') === size);
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
            const itemIndex = cart.findIndex(item => item.id == id && (item.size || '') === size);
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
            
            // Using the main removeFromCart function to ensure all systems stay in sync
            removeFromCart(id, size);
            
            // Update shopping cart sidebar displays
            displayShoppingCartItems();
            updateShoppingCartTotal();
        });
    });
}

function updateShoppingCartTotal() {
    const cartTotalElement = document.getElementById('shoppingCartTotal');
    if (!cartTotalElement) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}