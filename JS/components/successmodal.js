 

 
 
 const successModalHTML = `
    <div id="purchaseSuccessModal" class="alert-modal">
        <div class="alert-modal-content success-modal">
            <span class="success-close">&times;</span>
            <div class="success-icon">✅</div>
            <h3>Purchase Confirmed!</h3>
            <div class="purchase-details">
                <p><strong>Thank you for your purchase!</strong></p>
                <div class="purchase-info">
                    <p><strong>Order ID:</strong> <span id="purchaseId">#123456</span></p>
                    <p><strong>Estimated Delivery:</strong> <span id="deliveryDate">7-10 business days</span></p>
                </div>
                <p class="success-message">Your order has been successfully processed and will be shipped soon.</p>
            </div>
            <button id="successOkBtn" class="alert-btn success-btn">Continue Shopping</button>
        </div>
    </div>
`;

function showSuccessModal(orderId, deliveryDate) {
    const modal = document.getElementById('purchaseSuccessModal');
    const orderIdSpan = document.getElementById('purchaseId');
    const deliveryDateSpan = document.getElementById('deliveryDate');
    
    if (orderIdSpan) orderIdSpan.textContent = orderId;
    if (deliveryDateSpan) deliveryDateSpan.textContent = deliveryDate;
    
    if (modal) {
        modal.style.display = 'block';
    }
}

function initializeSuccessModal() {
    const modal = document.getElementById('purchaseSuccessModal');
    const closeBtn = document.querySelector('.success-close');
    const okBtn = document.getElementById('successOkBtn');
    
    function closeModal() {
        modal.style.display = 'none';
        // Redirect to home page
        window.location.href = 'index.html';
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (okBtn) okBtn.addEventListener('click', closeModal);
}

document.addEventListener('DOMContentLoaded', initializeSuccessModal);


export { showSuccessModal, initializeSuccessModal };