import {initializeSuccessModal, showSuccessModal} from './components/successmodal.js';


document.addEventListener('DOMContentLoaded', function() {
    initializeSuccessModal();

    // Get all accordion checkboxes
    const accordionCheckboxes = document.querySelectorAll('.accordion-checkbox');
    
    accordionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Find the corresponding content
            const header = this.nextElementSibling; // The label (header)
            const content = header.nextElementSibling; // The content div
            
            if (this.checked) {
                // Open accordion - calculate dynamic height
                openAccordion(content);
            } else {
                // Close accordion
                closeAccordion(content);
            }
        });
    });
    
    function openAccordion(content) {
        // Add active class for padding
        content.classList.add('active');
        
        // Get the actual height of the content
        const contentHeight = content.scrollHeight;
        
        // Set max-height to the actual content height + extra space
        content.style.maxHeight = (contentHeight + 300) + 'px';
      
    }
    
    function closeAccordion(content) {
        // Remove active class (removes padding)
        content.classList.remove('active');
        
        // Reset max-height to 0
        content.style.maxHeight = '0px';
    }
    
    // Optional: Close other accordions when opening one (single accordion behavior)
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

function formatCardNumber(input) {
    // Remove all non-numeric characters
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 16 digits
    value = value.substring(0, 16);
    
    // Add spaces every 4 digits
    let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Update input
    input.value = formattedValue;
}

document.getElementById('mestercard-number').addEventListener('input', function(e) {
    formatCardNumber(e.target);
});

// Handle paste events
document.getElementById('mestercard-number').addEventListener('paste', function(e) {
    setTimeout(() => formatCardNumber(e.target), 0);
});


// Import cart from cart.js
import { cart, removeFromCart, updateCartCounter, saveCartToStorage, updateShoppingCartTotal } from './components/cart.js';

function displayCheckoutItems() {
    const CheckoutItemsContainer = document.querySelector('.checkout-product__summary');
    if (!CheckoutItemsContainer) {
        console.error('Checkout container not found');
        return;
    }
    
    CheckoutItemsContainer.innerHTML = ''; // Clear existing items

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
                <button class="remove-item" data-id="${item.id}" data-size="${item.size || ''}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        CheckoutItemsContainer.appendChild(checkoutItem);
    });

    addCheckoutEventListeners();
    updateCheckoutTotal();
}

function addCheckoutEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.checkout-product__summary .decrease-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
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
        button.addEventListener('click', function(e) {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
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
    
    // Remove item buttons
    document.querySelectorAll('.checkout-product__summary .remove-item').forEach(button => {
        button.addEventListener('click', function(e) {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            removeFromCart(id, size);
            displayCheckoutItems();
            updateShoppingCartTotal();
            e.preventDefault();
        });
    });
}

function updateCheckoutTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update multiple total elements on the checkout page
    const checkoutTotal = document.getElementById('checkoutTotal');
    const totalAmountElements = document.querySelectorAll('#totalAmount');
    const subtotalElements = document.querySelectorAll('.subtotal-amount');
    
    if (checkoutTotal) {
        checkoutTotal.textContent = total.toFixed(2);
    }
    
    // Update all totalAmount elements (there are multiple in payment sections)
    totalAmountElements.forEach(element => {
        element.textContent = total.toFixed(2);
    });
    
    // Update subtotal elements (usually same as total unless shipping/taxes added)
    subtotalElements.forEach(element => {
        element.textContent = `$${total.toFixed(2)}`;
    });
}

//jumping buttons for checkout sections 
document.getElementById('proceedToShippingInfoBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const shippingInfo = document.getElementById('shippingInfoForm');
    shippingInfo.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('proceedToShippingBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const shippingInfo = document.getElementById('shippingInfo');
    shippingInfo.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('proceedToPaymentBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const paymentInfo = document.getElementById('paymentInfo');
    paymentInfo.scrollIntoView({ behavior: 'smooth' });
});


// Auto-fill shipping information for logged-in users
function autoFillShippingInfo() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userProfile = localStorage.getItem('userProfile');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (isLoggedIn) {
        if (userProfile) {
            // If we have saved profile data, use it
            try {
                const profile = JSON.parse(userProfile);
                fillShippingForm(profile);
                console.log('Shipping information auto-filled from saved profile');
            } catch (error) {
                console.error('Error parsing saved profile:', error);
            }
        } else if (userEmail && userName) {
            // If no saved profile but user is logged in, fill what we can
            const basicProfile = createBasicProfileFromLogin(userEmail, userName);
            fillShippingForm(basicProfile);
            console.log('Basic shipping information filled from login data');
            
            // Add save profile functionality
            addSaveProfileButton();
        }
    }
}

function fillShippingForm(profile) {
    const firstnameField = document.getElementById('firstname');
    const lastnameField = document.getElementById('lastname');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const addressField = document.getElementById('address');
    const cityField = document.getElementById('city');
    const zipField = document.getElementById('zip');
    
    if (firstnameField && profile.firstname) firstnameField.value = profile.firstname;
    if (lastnameField && profile.lastname) lastnameField.value = profile.lastname;
    if (emailField && profile.email) emailField.value = profile.email;
    if (phoneField && profile.phone) phoneField.value = profile.phone;
    if (addressField && profile.address) addressField.value = profile.address;
    if (cityField && profile.city) cityField.value = profile.city;
    if (zipField && profile.zip) zipField.value = profile.zip;
}

function createBasicProfileFromLogin(userEmail, userName) {
    // Convert userName back to first/last name (reverse the underscore replacement)
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

function addSaveProfileButton() {
    // Check if button already exists
    if (document.getElementById('saveProfileBtn')) return;
    
    // Find the shipping form
    const shippingForm = document.getElementById('checkoutForm');
    if (shippingForm) {
        // Create save profile button
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.id = 'saveProfileBtn';
        saveButton.className = 'main-btn';
        saveButton.style.marginTop = '10px';
        saveButton.textContent = 'Save This Information';
        
        // Add click handler
        saveButton.addEventListener('click', () => {
            saveCurrentFormDataAsProfile();
        });
        
        // Insert button after the "Go to shipping" button
        const goToShippingBtn = shippingForm.querySelector('button[type="submit"]');
        if (goToShippingBtn) {
            goToShippingBtn.parentNode.insertBefore(saveButton, goToShippingBtn.nextSibling);
        }
    }
}

function saveCurrentFormDataAsProfile() {
    const formData = new FormData(document.getElementById('checkoutForm'));
    
    const userProfile = {
        firstname: formData.get('firstname') || '',
        lastname: formData.get('lastname') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        address: formData.get('address') || '',
        city: formData.get('city') || '',
        zip: formData.get('zip') || ''
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    alert('Your information has been saved for future checkouts!');
    
    // Remove the save button since profile is now saved
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) saveBtn.remove();
    
    console.log('User profile saved from checkout form');
}

// Call displayCheckoutItems and auto-fill when page loads
window.addEventListener('load', () => {
    displayCheckoutItems();
    autoFillShippingInfo();
});



function processOrder() {
    // Here you would normally process the order, e.g., send data to server
    // For this example, we'll just show the success modal
    initializeSuccessModal();
    
    // Generate a random order ID and delivery date
    const orderId = '#' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const deliveryDate = '7-10 business days';
    
    showSuccessModal(orderId, deliveryDate);
}

// Add event listeners ONLY to Pay Now buttons inside accordion payment sections
// AND only if we're on the checkout page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're specifically on the checkout.html page
    const isCheckoutPage = window.location.pathname.includes('checkout.html');
    
    if (!isCheckoutPage) {
        return; // Exit early if not on checkout page
    }

    
    // Target only Pay Now buttons with the specific class
    const payNowButtons = document.querySelectorAll('.pay-now-btn');
    payNowButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            processOrder();
        });   
    });
});
