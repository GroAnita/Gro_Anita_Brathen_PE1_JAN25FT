// Admin Dashboard Management

/**
 * Initializes the admin dashboard and loads products on DOM ready.
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    loadProducts();
});

/**
 * Sets up navigation behavior for the admin dashboard menu.
 */
function initializeAdminDashboard() {
    const menuItems = document.querySelectorAll('.admin-menu__item');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const section = this.getAttribute('data-section');
            handleSectionChange(section);
        });
    });
}

/**
 * Changes the dashboard's active section and updates the header.
 * @param {string} section - The section identifier.
 */
function handleSectionChange(section) {
    const adminHeader = document.querySelector('.admin-header h1');
    const productGrid = document.querySelector('.admin-product-grid');

    switch(section) {
        case 'products':
            adminHeader.textContent = 'Product Management';
            productGrid.style.display = 'block';
            loadProducts();
            break;
        case 'orders':
            adminHeader.textContent = 'Order Management';
            productGrid.style.display = 'none';
            break;
        case 'users':
            adminHeader.textContent = 'User Management';
            productGrid.style.display = 'none';
            break;
        case 'analytics':
            adminHeader.textContent = 'Analytics Dashboard';
            productGrid.style.display = 'none';
            break;
        case 'settings':
            adminHeader.textContent = 'Settings';
            productGrid.style.display = 'none';
            break;
    }
}

/**
 * Fetches product data from the API and displays the first 10 items.
 */
async function loadProducts() {
    try {
        const response = await fetch('https://v2.api.noroff.dev/online-shop');
        const data = await response.json();
        const products = data.data || data;

        displayProductsInGrid(products.slice(0, 10));
    } catch (error) {
        console.error('Error loading products:', error);
        displayError('Failed to load products');
    }
}

/**
 * Renders products inside the admin product grid.
 * @param {Array<Object>} products - Array of product objects.
 */
function displayProductsInGrid(products) {
    const gridBody = document.getElementById('adminProductGrid');
    if (!gridBody) return;

    gridBody.innerHTML = '';

    products.forEach(product => {
        const row = createProductRow(product);
        gridBody.appendChild(row);
    });
}

/**
 * Creates a product row for the admin grid.
 * @param {Object} product - Product data object.
 * @returns {HTMLDivElement} DOM element representing a product row.
 */
function createProductRow(product) {
    const row = document.createElement('div');
    row.className = 'grid-row';
    row.setAttribute('data-product-id', product.id);

    const imageUrl = product.image?.url || product.image || '../images/placeholder.jpg';
    const status = getProductStatus(product);
    const price = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;

    row.innerHTML = `
        <div class="grid-cell">
            <img src="${imageUrl}" alt="${product.title}" class="admin-product-img" onerror="this.src='../images/placeholder.jpg'">
        </div>
        <div class="grid-cell">${truncateText(product.title, 25)}</div>
        <div class="grid-cell">${product.tags?.[0] || 'General'}</div>
        <div class="grid-cell">$${price}</div>
        <div class="grid-cell">${Math.floor(Math.random() * 10) + 1}</div>
        <div class="grid-cell">
            <span class="status-badge ${status.class}">${status.text}</span>
        </div>
        <div class="grid-cell">
            <button class="action-btn edit-btn" onclick="editProduct('${product.id}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return row;
}

/**
 * Returns a mock status for the product.
 * @returns {{class: string, text: string}} A random status object.
 */
function getProductStatus() {
    const statuses = [
        { class: 'active', text: 'Active' },
        { class: 'inactive', text: 'Inactive' },
        { class: 'draft', text: 'Draft' }
    ];

    return statuses[Math.floor(Math.random() * statuses.length)];
}

/**
 * Truncates text with ellipsis.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum allowed length.
 * @returns {string} Truncated text.
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Opens the edit modal for a product (demo only).
 * @param {string} productId
 */
function editProduct(productId) {
    console.log('Edit product:', productId);
    alert(`Edit product ${productId} - This would open an edit modal in a real admin panel`);
}

/**
 * Deletes a product row from the UI after confirmation.
 * @param {string} productId
 */
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        console.log('Delete product:', productId);
        alert(`Product ${productId} deleted (simulated)`);

        const row = document.querySelector(`[data-product-id="${productId}"]`);
        if (row) row.remove();
    }
}

/**
 * Displays an error message inside the admin grid.
 * @param {string} message - Error message to display.
 */
function displayError(message) {
    const gridBody = document.getElementById('adminProductGrid');
    if (gridBody) {
        gridBody.innerHTML = `
            <div class="grid-row">
                <div class="grid-cell" style="grid-column: 1 / -1; padding: 20px; text-align: center; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i> ${message}
                </div>
            </div>
        `;
    }
}

// --- Add Product Modal Management ---

/**
 * Initializes the add-product modal and related behaviors.
 */
function initializeAddProductModal() {
    const addProductBtn = document.querySelector('.add-product-btn');
    const modal = document.getElementById('addProductModal');
    const closeBtn = document.getElementById('closeAddProductModal');
    const cancelBtn = document.getElementById('cancelAddProduct');
    const form = document.getElementById('addProductForm');

    /** Opens the modal */
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /** Closes and resets the modal */
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        form.reset();
    }

    if (addProductBtn) addProductBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleAddProduct(form);
    });

    initializeImageUploads();
    initializePriceCalculation();
}

/**
 * Handles submission of the add product form.
 * @param {HTMLFormElement} form
 */
async function handleAddProduct(form) {
    const formData = new FormData(form);
    const images = [];

    for (let i = 0; i < 6; i++) {
        const fileInput = document.getElementById(`image${i}`);
        if (fileInput && fileInput.files[0]) images.push(fileInput.files[0]);
    }

    const productData = {
        title: formData.get('title'),
        productId: formData.get('productId'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        discountPercent: parseFloat(formData.get('discountPercent') || 0),
        discountedPrice: formData.get('discountedPrice') ? parseFloat(formData.get('discountedPrice')) : null,
        brand: formData.get('brand'),
        stock: parseInt(formData.get('stock')),
        size: formData.get('size'),
        description: formData.get('description'),
        purchasedFrom: formData.get('purchasedFrom'),
        purchasedFor: parseFloat(formData.get('purchasedFor')) || null,
        images: images
    };


    // Validate required fields
    if (!productData.title || !productData.productId || !productData.category || !productData.price || !productData.stock || !productData.description) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }

    // Validate at least one image
    if (images.length === 0) {
        alert('Please upload at least one product image');
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Adding Product...';
        submitBtn.disabled = true;

        await simulateAddProduct(productData);

        alert('Product added successfully!');

        document.getElementById('addProductModal').classList.remove('active');
        document.body.style.overflow = '';
        form.reset();

        loadProducts();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
    }
}

/**
 * Simulates sending product data to an API.
 * @param {Object} productData
 */
async function simulateAddProduct(productData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Product added (simulated):', productData);
}

document.addEventListener('DOMContentLoaded', function() {
    initializeAddProductModal();
});

/**
 * Initializes image upload boxes and preview/delete behavior.
 */
function initializeImageUploads() {
    const imageBoxes = document.querySelectorAll('.image-upload-box');

    imageBoxes.forEach((box, index) => {
        const input = box.querySelector('.image-input');
        const placeholder = box.querySelector('.upload-placeholder');
        const preview = box.querySelector('.preview-image');
        const removeBtn = box.querySelector('.remove-image');

        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
                removeBtn.style.display = 'flex';
                box.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        });

        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            input.value = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            removeBtn.style.display = 'none';
            box.classList.remove('has-image');
        });

        box.addEventListener('click', function() {
            if (!box.classList.contains('has-image')) input.click();
        });
    });
}

/**
 * Initializes automatic price & discount calculation logic.
 */
function initializePriceCalculation() {
    const priceInput = document.getElementById('productPrice');
    const discountPercentInput = document.getElementById('discountPercent');
    const discountedPriceInput = document.getElementById('discountedPrice');

    /**
     * Calculates discounted price based on percent.
     */
    function calculateDiscountedPrice() {
        const price = parseFloat(priceInput.value) || 0;
        const discountPercent = parseFloat(discountPercentInput.value) || 0;

        if (price > 0 && discountPercent > 0) {
            const discountAmount = (price * discountPercent) / 100;
            const finalPrice = price - discountAmount;
            discountedPriceInput.value = finalPrice.toFixed(2);
        } else {
            discountedPriceInput.value = '';
        }
    }

    priceInput.addEventListener('input', calculateDiscountedPrice);
    discountPercentInput.addEventListener('input', calculateDiscountedPrice);

    discountedPriceInput.addEventListener('focus', function() {
        this.removeAttribute('readonly');
    });

    discountedPriceInput.addEventListener('blur', function() {
        const price = parseFloat(priceInput.value) || 0;
        const discounted = parseFloat(this.value) || 0;

        if (price > 0 && discounted > 0 && discounted < price) {
            const discountPercent = ((price - discounted) / price) * 100;
            discountPercentInput.value = Math.round(discountPercent);
        }

        this.setAttribute('readonly', 'true');
    });
}

// Global button functions
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;