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

import { 
    isValidEmail,
    isValidNorwegianPhone,
    isValidPostcode,
    isNonEmpty,
    attachInputIconValidation
} from './components/formValidation.js';

/**
 * @typedef {Object} CartItem
 * @property {string} id - Product ID.
 * @property {string} title - Product title.
 * @property {number} price - Unit price of the product.
 * @property {number} quantity - Quantity of this product in the cart.
 * @property {string|null} [size] - Selected size (if applicable).
 * @property {{url: string}|string|null} [image] - Image object or URL string.
 */

/**
 * @typedef {Object} OrderData
 * @property {string} name - Customer name.
 * @property {string} email - Customer email.
 * @property {string} address - Shipping address.
 * @property {string} phone - Customer phone number.
 * @property {string} orderId - Unique ID for this order.
 * @property {CartItem[]} items - Items included in the order.
 * @property {number} total - Total price of the order.
 * @property {string} orderDate - ISO string of order creation time.
 * @property {string} deliveryDate - Human-readable delivery date.
 */

/* PAGE INITIALIZATION */

/**
 * Initializes checkout page behavior when DOM is loaded:
 * - Success modal
 * - Checkout items display
 * - Autofill shipping info
 * - Accordion behavior
 * - Payment buttons
 * - Navigation between sections
 * - Input validation with checkmarks
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeSuccessModal(); 
    displayCheckoutItems();  
    autoFillShippingInfo();   
    setupAccordionListeners();
    setupPaymentButtons();
    setupCheckoutNavigation();

    // Real-time validation with the checkmarks
    attachInputIconValidation("firstname", isNonEmpty);
    attachInputIconValidation("lastname", isNonEmpty);
    attachInputIconValidation("address", isNonEmpty);
    attachInputIconValidation("city", isNonEmpty);
    attachInputIconValidation("email", isValidEmail);
    attachInputIconValidation("phone", isValidNorwegianPhone);
    attachInputIconValidation("zip", isValidPostcode);
});

/* CHECKOUT ORDER PROCESSING */

/**
 * Processes the current order:
 * - Generates order ID and delivery date
 * - Builds customer data
 * - Shows "processing" state
 * - Clears cart and saves order history after a delay
 * - Shows success modal
 *
 * @returns {void}
 */
export function processOrder() {
    const orderId = generateOrderId();
    const deliveryDate = calculateDeliveryDate();

    const totalAmount = cart.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    /** @type {OrderData} */
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

/**
 * Returns the value of an input element by its ID.
 *
 * @param {string} id - The ID of the input element.
 * @returns {string} The input value or an empty string if not found.
 */
function getVal(id) {
    return document.getElementById(id)?.value || "";
}

/**
 * Generates a order ID based on timestamp and random number.
 *
 * @returns {string} A unique order ID, e.g. "#RD-<timestamp>-12345".
 */
function generateOrderId() {
    const randomPart = Math.floor(Math.random() * 90000) + 10000;
    return `#RD-${Date.now()}-${randomPart}`;
}

/**
 * Calculates a delivery date 10 days from now.
 *
 * @returns {string} Readable delivery date (e.g. "January 1, 2025").
 */
function calculateDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 10);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

/**
 * Shows a "Processing Order..." state on all payment buttons
 * and disables them to prevent double submissions.
 *
 * @returns {void}
 */
function showOrderProcessing() {
    const submitButtons = document.querySelectorAll(".pay-now-btn");
    if (!submitButtons) return;

    submitButtons.forEach(button => {
        button.textContent = "Processing Order...";
        button.disabled = true;
    });
}

/**
 * Clears the cart data:
 * - Empties the cart array
 * - Updates localStorage
 * - Updates cart counter
 * - Clears checkout items UI
 * - Resets checkout total
 *
 * @returns {void}
 */
function clearCart() {
    cart.length = 0;
    saveCartToStorage();
    updateCartCounter();

    const itemsContainer = document.getElementById("checkoutItems");
    if (itemsContainer) itemsContainer.innerHTML = "";

    const totalEl = document.getElementById("checkoutTotal");
    if (totalEl) totalEl.textContent = "0.00";
}

/**
 * Saves an order to order history in localStorage.
 *
 * @param {OrderData} orderData - Data for the completed order.
 * @returns {void}
 */
function saveOrderHistory(orderData) {
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    orderHistory.push(orderData);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
}

/* CHECKOUT ITEMS DISPLAY & CART CONTROLS */

/**
 * Renders the items from the cart into the checkout summary section.
 * If the cart is empty, it shows an "empty" message.
 *
 * @returns {void}
 */
function displayCheckoutItems() {
    const container = document.querySelector('.checkout-product__summary');
    if (!container) {
        console.error('Checkout container not found');
        return;
    }

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

/**
 * Attaches event listeners to the checkout item controls:
 * - Increase the quantity
 * - Decrease the quantity
 * - Remove the item
 *
 * @returns {void}
 */
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

/**
 * Calculate and update the checkout total and subtotal values
 * in all the relevant UI locations.
 *
 * @returns {void}
 */
function updateCheckoutTotal() {
    const total = cart.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    document.querySelectorAll('.totalAmount').forEach(el => {
        el.textContent = total.toFixed(2);
    });

    document.querySelectorAll('.subtotal-amount').forEach(el => {
        el.textContent = `$${total.toFixed(2)}`;
    });

    const checkoutTotal = document.getElementById('checkoutTotal');
    if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);
}

/* ACCORDION & PAYMENT BEHAVIOR */

/**
 * Sets up accordion behavior for sections that use checkboxes
 * and to expand/collapse content.
 *
 * @returns {void}
 */
function setupAccordionListeners() {
    const checkboxes = document.querySelectorAll('.accordion-checkbox');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const content = cb.nextElementSibling?.nextElementSibling;
            if (!content) return;
            content.style.maxHeight = cb.checked
                ? content.scrollHeight + 300 + 'px'
                : '0px';
        });
    });
}

/**
 * Attaches click handlers to all ".pay-now-btn" elements:
 * - Validates the nearest form
 * - Calls processOrder() if its valid
 *
 * @returns {void}
 */
function setupPaymentButtons() {
    document.querySelectorAll('.pay-now-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();

            const parentAccordion = btn.closest('.accordion-content');
            const form = parentAccordion?.querySelector('form');
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            processOrder();
        });
    });
}

/* SHIPPING AUTOFILL & NAVIGATION */

/**
 * Autofills shipping input fields with stored user profile data from localStorage
 * if the user is logged in and a profile exists in localStorage.
 *
 * @returns {void}
 */
function autoFillShippingInfo() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');

    if (!isLoggedIn || !profile) return;

    ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'zip'].forEach(key => {
        const field = document.getElementById(key);
        if (field && profile[key]) field.value = profile[key];
    });
}

/**
 * Sets up navigation buttons that smoothly scroll the user
 * between checkout sections (order summary to shipping info to payment).
 *
 * @returns {void}
 */
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
                setTimeout(
                    () => window.scrollBy({ top: -50, behavior: 'smooth' }),
                    0
                );
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
                setTimeout(
                    () => window.scrollBy({ top: -50, behavior: 'smooth' }),
                    0
                );
            }
        });
    }

    if (proceedToPaymentBtn) {
        proceedToPaymentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const paymentSection = document.getElementById('paymentInfo');
            if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(
                    () => window.scrollBy({ top: -50, behavior: 'smooth' }),
                    0
                );
            }
        });
    }
}
