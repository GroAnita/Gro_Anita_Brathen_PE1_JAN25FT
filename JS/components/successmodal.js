/**
 * Success Modal HTML Template
 */
const successModalHTML = `
    <div id="purchaseSuccessModal" class="alert-modal">
        <div class="alert-modal-content success-modal">
            <span class="success-close">&times;</span>
            <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
            <h3>Purchase Confirmed!</h3>
            <div class="purchase-details">
                <p><strong>Thank you for your purchase!</strong></p>
                <div class="purchase-info">
                    <p><strong>Order ID:</strong> <span id="purchaseId">#123456</span></p>
                    <p><strong>Estimated Delivery:</strong> <span id="deliveryDate">7-10 business days</span></p>
                </div>
                <p class="success-message">Your order has been successfully processed and will be shipped soon.</p>
                <p class="success-message">You will receive a confirmation email with your order details.</p>
            </div>
            <button id="successOkBtn" class="alert-btn success-btn">Continue Shopping</button>
        </div>
    </div>
`;

/**
 * Injects the modal into the DOM & initializes functionality.
 */
export function initializeSuccessModal() {
    // 1. Inject ONLY once
    if (!document.getElementById('purchaseSuccessModal')) {
        document.body.insertAdjacentHTML('beforeend', successModalHTML);
    }

    const modal = document.getElementById('purchaseSuccessModal');
    const closeBtn = modal.querySelector('.success-close');
    const okBtn = modal.querySelector('#successOkBtn');

    /** Redirect Home based on current path */
    function redirectToHome() {
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = './index.html';
        }
    }

    /** Close the modal */
    function closeModal() {
        modal.style.display = 'none';
        redirectToHome();
    }

    closeBtn.addEventListener('click', closeModal);
    okBtn.addEventListener('click', closeModal);

    // Optional: click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * Displays success modal with the given order data.
 * @param {string} orderId
 * @param {string} deliveryDate
 */
export function showSuccessModal(orderId, deliveryDate) {
    const modal = document.getElementById('purchaseSuccessModal');
    const orderIdSpan = document.getElementById('purchaseId');
    const deliveryDateSpan = document.getElementById('deliveryDate');

    if (!modal) return;

    orderIdSpan.textContent = orderId;
    deliveryDateSpan.textContent = deliveryDate;

    modal.style.display = 'block';
}
