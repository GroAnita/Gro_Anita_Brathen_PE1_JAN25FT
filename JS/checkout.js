import {
    cart,
    removeFromCart,
    updateCartCounter,
    saveCartToStorage,
    updateShoppingCartTotal
} from './components/cart.js';

import {
    initializeSuccessModal,
    showSuccessModal
} from './components/successmodal.js';

/* ---------------------------
   PAGE INITIALIZATION
---------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    initializeSuccessModal(); 
    displayCheckoutItems();  
    autoFillShippingInfo();   
    setupAccordionListeners();
    setupPaymentButtons();
    setupCheckoutNavigation();
});

/* ---------------------------
   CHECKOUT ORDER PROCESSING
---------------------------- */

export function processOrder() {
    const orderId = generateOrderId();
    const deliveryDate = calculateDeliveryDate();

    const totalAmount = cart.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0);

    const customerData = {
        name: getVal("name"),
        email: getVal("email"),
        address: getVal("address"),
        phone: getVal("phone"),
        orderId,
        items: [...cart],
        total: totalAmount,
        orderDate: new Date().toISOString(),
        deliveryDate
    };

    showOrderProcessing();

    setTimeout(() => {
        clearCart();
        saveOrderHistory(customerData);
        showSuccessModal(orderId, deliveryDate);
    }, 2000);
}



function getVal(id) {
    return document.getElementById(id)?.value || "";
}

function generateOrderId() {
    const randomPart = Math.floor(Math.random() * 90000) + 10000;
    return `#RD-${Date.now()}-${randomPart}`;
}

function calculateDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 10);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function showOrderProcessing() {
    
    const submitButtons = document.querySelectorAll(".pay-now-btn");
    if (!submitButtons) return;

    submitButtons.forEach(button => {
        button.textContent = "Processing Order...";
        button.disabled = true;
    });
}

function clearCart() {
    cart.length = 0;
    saveCartToStorage();
    updateCartCounter();

    const itemsContainer = document.getElementById("checkoutItems");
    if (itemsContainer) itemsContainer.innerHTML = "";

    const totalEl = document.getElementById("checkoutTotal");
    if (totalEl) totalEl.textContent = "0.00";
}

function saveOrderHistory(orderData) {
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    orderHistory.push(orderData);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
}


function displayCheckoutItems() {
    const container = document.querySelector('.checkout-product__summary');
    if (!container) return console.error('Checkout container not found');

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-checkout">Your cart is empty</div>';
        return;
    }

    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'checkout-product__items';

        const imageUrl = item.image?.url ||
            (typeof item.image === "string" ? item.image : "../images/placeholder.jpg");

        el.innerHTML = `
            <h4 class="checkout-product__item-name">${item.title}</h4>
            <div class="checkout-product__image-container">
                <img src="${imageUrl}" alt="${item.title}">
            </div>
            <p class="checkout-product__item-price">$${(item.price * item.quantity).toFixed(2)}</p>
            <p class="checkout-product__item-size">${item.size || 'N/A'}</p>
            <div class="checkout-product__item-quantity">
                <button class="decrease-btn" data-id="${item.id}" data-size="${item.size || ''}"><i class="fa-solid fa-minus"></i></button>
                <span>${item.quantity}</span>
                <button class="increase-btn" data-id="${item.id}" data-size="${item.size || ''}"><i class="fa-regular fa-plus"></i></button>
            </div>
            <div class="checkout-product__remove-container">
                <button class="remove-item" data-id="${item.id}" data-size="${item.size || ''}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        container.appendChild(el);
    });

    addCheckoutEventListeners();
    updateCheckoutTotal();
}


function addCheckoutEventListeners() {
    document.querySelectorAll('.checkout-product__summary .decrease-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = btn.dataset.id;
            const size = btn.dataset.size || '';
            const index = cart.findIndex(item => item.id === id && (item.size || '') === size);

            if (index > -1 && cart[index].quantity > 1) {
                cart[index].quantity--;
                saveCartToStorage();
                updateCartCounter();
                displayCheckoutItems();
                updateShoppingCartTotal();
            }
            e.preventDefault();
        });
    });

    document.querySelectorAll('.checkout-product__summary .increase-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = btn.dataset.id;
            const size = btn.dataset.size || '';
            const index = cart.findIndex(item => item.id === id && (item.size || '') === size);

            if (index > -1) {
                cart[index].quantity++;
                saveCartToStorage();
                updateCartCounter();
                displayCheckoutItems();
                updateShoppingCartTotal();
            }
            e.preventDefault();
        });
    });

    document.querySelectorAll('.checkout-product__summary .remove-item').forEach(btn => {
        btn.addEventListener('click', e => {
            removeFromCart(btn.dataset.id, btn.dataset.size || '');
            saveCartToStorage();
            displayCheckoutItems();
            updateShoppingCartTotal();
            e.preventDefault();
        });
    });
}


function updateCheckoutTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    document.querySelectorAll('.totalAmount').forEach(el => el.textContent = total.toFixed(2));
    document.querySelectorAll('.subtotal-amount').forEach(el => el.textContent = `$${total.toFixed(2)}`);

    const checkoutTotal = document.getElementById('checkoutTotal');
    if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);
}



function setupAccordionListeners() {
    const checkboxes = document.querySelectorAll('.accordion-checkbox');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const content = cb.nextElementSibling.nextElementSibling;
            content.style.maxHeight = cb.checked ? content.scrollHeight + 300 + 'px' : '0px';
        });
    });
}


function setupPaymentButtons() {
    document.querySelectorAll('.pay-now-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();

            const parentAccordion = btn.closest('.accordion-content');
            const form = parentAccordion.querySelector('form');
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            processOrder();
        });
    });
}


function autoFillShippingInfo() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');

    if (!isLoggedIn || !profile) return;

    ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'zip'].forEach(key => {
        const field = document.getElementById(key);
        if (field && profile[key]) field.value = profile[key];
    });
}

function setupCheckoutNavigation() {
    const proceedToShippingInfoBtn = document.getElementById('proceedToShippingInfoBtn');
    const proceedToShippingBtn = document.getElementById('proceedToShippingBtn');
    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');

    if (proceedToShippingInfoBtn) {
        proceedToShippingInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const shippingInfoSection = document.getElementById('shippingInfoForm');
            if (shippingInfoSection) {
                shippingInfoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => window.scrollBy({ top: -50, behavior: 'smooth' }), );
            }
        });
    }

    if (proceedToShippingBtn) {
        proceedToShippingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Validate the form before proceeding
            const form = document.getElementById('checkoutForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const shippingSection = document.getElementById('shippingInfo');
            if (shippingSection) {
                shippingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => window.scrollBy({ top: -50, behavior: 'smooth' }), );
            }
        });
    }

    if (proceedToPaymentBtn) {
        proceedToPaymentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const paymentSection = document.getElementById('paymentInfo');
            if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => window.scrollBy({ top: -50, behavior: 'smooth' }), );
            }
        });
    }
}