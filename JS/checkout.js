import { initializeSuccessModal, showSuccessModal } from './components/successmodal.js';

/**
 * Initializes accordion functionality and the success modal when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeSuccessModal();

    // Get all accordion checkboxes
    const accordionCheckboxes = document.querySelectorAll('.accordion-checkbox');

    accordionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const header = this.nextElementSibling; // The <label> element
            const content = header.nextElementSibling; // The accordion content div

            if (this.checked) {
                openAccordion(content);
            } else {
                closeAccordion(content);
            }
        });
    });

    /**
     * Opens an accordion section by expanding height.
     * @param {HTMLElement} content - Accordion content element.
     */
    function openAccordion(content) {
        content.classList.add('active');
        const contentHeight = content.scrollHeight;
        content.style.maxHeight = (contentHeight + 300) + 'px';
    }

    /**
     * Closes an accordion section by collapsing height.
     * @param {HTMLElement} content - Accordion content element.
     */
    function closeAccordion(content) {
        content.classList.remove('active');
        content.style.maxHeight = '0px';
    }

    /**
     * Optional helper to close all other accordion sections.
     * @param {HTMLInputElement} currentCheckbox - The checkbox that was clicked.
     */
    function closeOtherAccordions(currentCheckbox) {
        accordionCheckboxes.forEach(checkbox => {
            if (checkbox !== currentCheckbox && checkbox.checked) {
                checkbox.checked = false;
                const header = checkbox.nextElementSibling;
                const content = header.nextElementSibling;
                closeAccordion(content);
            }
        });
    }
});

/**
 * Formats a credit card number with spaces every 4 digits.
 * @param {HTMLInputElement} input - The card number input field.
 */
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formattedValue;
}

document.getElementById('mestercard-number').addEventListener('input', function (e) {
    formatCardNumber(e.target);
});

// Handle paste events
document.getElementById('mestercard-number').addEventListener('paste', function (e) {
    setTimeout(() => formatCardNumber(e.target), 0);
});


// Import cart from cart.js
import {
    cart,
    removeFromCart,
    updateCartCounter,
    saveCartToStorage,
    updateShoppingCartTotal
} from './components/cart.js';

/**
 * Renders all cart items into the checkout summary section.
 */
function displayCheckoutItems() {
    const CheckoutItemsContainer = document.querySelector('.checkout-product__summary');
    if (!CheckoutItemsContainer) {
        console.error('Checkout container not found');
        return;
    }

    CheckoutItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        CheckoutItemsContainer.innerHTML = '<div class="empty-checkout">Your cart is empty</div>';
        return;
    }

    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-product__items';

        checkoutItem.innerHTML = `
            <h4 class="checkout-product__item-name">${item.title}</h4>
            <div class="checkout-product__image-container">
                <img src="${item.image.url}" alt="${item.title}">
            </div>
            <p class="checkout-product__item-price">$${(item.price * item.quantity).toFixed(2)}</p>
            <p class="checkout-product__item-size">${item.size || 'N/A'}</p>
            <div class="checkout-product__item-quantity">
                <button class="decrease-btn" data-id="${item.id}" data-size="${item.size || ''}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-btn" data-id="${item.id}" data-size="${item.size || ''}">+</button>
            </div>
            <div class="checkout-product__remove-container">
                <button class="remove-item" data-id="${item.id}" data-size="${item.size || ''}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        CheckoutItemsContainer.appendChild(checkoutItem);
    });

    addCheckoutEventListeners();
    updateCheckoutTotal();
}

/**
 * Adds increment, decrement, and remove event listeners for checkout items.
 */
function addCheckoutEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.checkout-product__summary .decrease-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            const id = this.dataset.id;
            const size = this.dataset.size || '';
            const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);

            if (itemIndex > -1 && cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
                updateCartCounter();
                displayCheckoutItems();
                updateShoppingCartTotal();
                saveCartToStorage();
            }
            e.preventDefault();
        });
    });

    // Increase quantity buttons
    document.querySelectorAll('.checkout-product__summary .increase-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            const id = this.dataset.id;
            const size = this.dataset.size || '';
            const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);

            if (itemIndex > -1) {
                cart[itemIndex].quantity++;
                updateCartCounter();
                displayCheckoutItems();
                updateShoppingCartTotal();
                saveCartToStorage();
            }
            e.preventDefault();
        });
    });

    // Remove item
    document.querySelectorAll('.checkout-product__summary .remove-item').forEach(button => {
        button.addEventListener('click', function (e) {
            const id = this.dataset.id;
            const size = this.dataset.size || '';
            removeFromCart(id, size);
            displayCheckoutItems();
            updateShoppingCartTotal();
            e.preventDefault();
        });
    });
}

/**
 * Recalculates and updates all checkout totals (subtotal & total).
 */
function updateCheckoutTotal() {
    const total = cart.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
    );

    const checkoutTotal = document.getElementById('checkoutTotal');
    const totalAmountElements = document.querySelectorAll('#totalAmount');
    const subtotalElements = document.querySelectorAll('.subtotal-amount');

    if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);

    totalAmountElements.forEach(el => el.textContent = total.toFixed(2));
    subtotalElements.forEach(el => el.textContent = `$${total.toFixed(2)}`);
}

// --- Smooth scroll buttons ---
document.getElementById('proceedToShippingInfoBtn').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('shippingInfoForm').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('proceedToShippingBtn').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('shippingInfo').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('proceedToPaymentBtn').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('paymentInfo').scrollIntoView({ behavior: 'smooth' });
});

/**
 * Automatically fills shipping info for logged-in users.
 */
function autoFillShippingInfo() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userProfile = localStorage.getItem('userProfile');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (isLoggedIn) {
        if (userProfile) {
            try {
                fillShippingForm(JSON.parse(userProfile));
            } catch (err) {
                console.error('Bad profile JSON', err);
            }
        } else if (userEmail && userName) {
            const profile = createBasicProfileFromLogin(userEmail, userName);
            fillShippingForm(profile);
            addSaveProfileButton();
        }
    }
}

/**
 * Fills checkout form fields with a profile object.
 * @param {Object} profile
 */
function fillShippingForm(profile) {
    const fields = ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'zip'];
    fields.forEach(key => {
        const field = document.getElementById(key);
        if (field && profile[key]) field.value = profile[key];
    });
}

/**
 * Builds a basic profile from login info.
 * @param {string} userEmail
 * @param {string} userName
 * @returns {Object}
 */
function createBasicProfileFromLogin(userEmail, userName) {
    const nameParts = userName.replace(/_/g, ' ').split(' ');
    return {
        firstname: nameParts[0] || '',
        lastname: nameParts.slice(1).join(' ') || '',
        email: userEmail,
        phone: '',
        address: '',
        city: '',
        zip: ''
    };
}

/**
 * Creates a “Save This Information” button under the checkout form.
 */
function addSaveProfileButton() {
    if (document.getElementById('saveProfileBtn')) return;

    const shippingForm = document.getElementById('checkoutForm');
    if (!shippingForm) return;

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.id = 'saveProfileBtn';
    saveBtn.className = 'main-btn';
    saveBtn.style.marginTop = '10px';
    saveBtn.textContent = 'Save This Information';

    saveBtn.addEventListener('click', saveCurrentFormDataAsProfile);

    const submitBtn = shippingForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.after(saveBtn);
}

/**
 * Saves the current checkout form fields into localStorage.
 */
function saveCurrentFormDataAsProfile() {
    const formData = new FormData(document.getElementById('checkoutForm'));

    const userProfile = {};
    ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'zip']
        .forEach(field => userProfile[field] = formData.get(field) || '');

    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    alert('Your information has been saved for future checkouts!');

    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) saveBtn.remove();
}

window.addEventListener('load', () => {
    displayCheckoutItems();
    autoFillShippingInfo();
});

/**
 * Simulates order processing and shows the success modal.
 */
function processOrder() {
    initializeSuccessModal();

    const orderId = '#' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const deliveryDate = '7-10 business days';

    showSuccessModal(orderId, deliveryDate);
}

/**
 * Adds event listeners for "Pay Now" buttons, only on checkout page.
 */
document.addEventListener('DOMContentLoaded', function () {
    const isCheckout = window.location.pathname.includes('checkout.html');
    if (!isCheckout) return;

    document.querySelectorAll('.pay-now-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            processOrder();
        });
    });
});

