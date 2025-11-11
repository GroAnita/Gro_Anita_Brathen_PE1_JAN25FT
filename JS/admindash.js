// Admin Dashboard Management
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    loadProducts();
});

function initializeAdminDashboard() {
    // Handle menu item clicks
    const menuItems = document.querySelectorAll('.admin-menu__item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle different sections
            const section = this.getAttribute('data-section');
            handleSectionChange(section);
        });
    });
}

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
            // TODO: Load orders
            break;
        case 'users':
            adminHeader.textContent = 'User Management';
            productGrid.style.display = 'none';
            // TODO: Load users
            break;
        case 'analytics':
            adminHeader.textContent = 'Analytics Dashboard';
            productGrid.style.display = 'none';
            // TODO: Load analytics
            break;
        case 'settings':
            adminHeader.textContent = 'Settings';
            productGrid.style.display = 'none';
            // TODO: Load settings
            break;
    }
}

async function loadProducts() {
    try {
        const response = await fetch('https://v2.api.noroff.dev/online-shop');
        const data = await response.json();
        const products = data.data || data;
        
        displayProductsInGrid(products.slice(0, 10)); // Limit to 10 products
    } catch (error) {
        console.error('Error loading products:', error);
        displayError('Failed to load products');
    }
}

function displayProductsInGrid(products) {
    const gridBody = document.getElementById('adminProductGrid');
    if (!gridBody) return;
    
    gridBody.innerHTML = ''; // Clear existing products
    
    products.forEach(product => {
        const row = createProductRow(product);
        gridBody.appendChild(row);
    });
}

function createProductRow(product) {
    const row = document.createElement('div');
    row.className = 'grid-row';
    row.setAttribute('data-product-id', product.id);
    
    // Get primary image
    const imageUrl = product.image?.url || product.image || '../images/placeholder.jpg';
    
    // Determine status
    const status = getProductStatus(product);
    
    // Format price
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

function getProductStatus(product) {
    // Random status for demo - in real app this would come from API
    const statuses = [
        { class: 'active', text: 'Active' },
        { class: 'inactive', text: 'Inactive' },
        { class: 'draft', text: 'Draft' }
    ];
    
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function editProduct(productId) {
    console.log('Edit product:', productId);
    alert(`Edit product ${productId} - This would open an edit modal in a real admin panel`);
}

function deleteProduct(productId) {
    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
        console.log('Delete product:', productId);
        alert(`Product ${productId} deleted - In a real admin panel, this would call an API`);
        
        // Remove from DOM for demo
        const row = document.querySelector(`[data-product-id="${productId}"]`);
        if (row) row.remove();
    }
}

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

// Add Product Modal Management
function initializeAddProductModal() {
    const addProductBtn = document.querySelector('.add-product-btn');
    const modal = document.getElementById('addProductModal');
    const closeBtn = document.getElementById('closeAddProductModal');
    const cancelBtn = document.getElementById('cancelAddProduct');
    const form = document.getElementById('addProductForm');
    
    // Open modal
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }
    
    // Close modal functions
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        form.reset(); // Clear form
    }
    
    // Close modal on X button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal on Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleAddProduct(form);
    });
    
    // Initialize image upload functionality
    initializeImageUploads();
    
    // Initialize price calculation
    initializePriceCalculation();
}

async function handleAddProduct(form) {
    const formData = new FormData(form);
    
    // Collect uploaded images
    const images = [];
    for (let i = 0; i < 6; i++) {
        const fileInput = document.getElementById(`image${i}`);
        if (fileInput && fileInput.files[0]) {
            images.push(fileInput.files[0]);
        }
    }
    
    const productData = {
        title: formData.get('title'),
        productId: formData.get('productId'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        discountPercent: formData.get('discountPercent') ? parseFloat(formData.get('discountPercent')) : 0,
        discountedPrice: formData.get('discountedPrice') ? parseFloat(formData.get('discountedPrice')) : null,
        brand: formData.get('brand'),
        stock: parseInt(formData.get('stock')),
        size: formData.get('size'),
        description: formData.get('description'),
        purchasedFrom: formData.get('purchasedFrom'),
        purchasedFor: formData.get('purchasedFor') ? parseFloat(formData.get('purchasedFor')) : null,
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
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding Product...';
        submitBtn.disabled = true;
        
        // In a real app, this would POST to your API
        // For demo purposes, we'll simulate adding to the grid
        await simulateAddProduct(productData);
        
        // Success feedback
        alert('Product added successfully!');
        
        // Close modal and reset form
        document.getElementById('addProductModal').classList.remove('active');
        document.body.style.overflow = '';
        form.reset();
        
        // Reload products to show the new one
        loadProducts();
        
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function simulateAddProduct(productData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, you would:
    // const response = await fetch('https://your-api.com/products', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': 'Bearer ' + token
    //     },
    //     body: JSON.stringify(productData)
    // });
    
    console.log('Product added (simulated):', productData);
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAddProductModal();
});

// Image Upload Management
function initializeImageUploads() {
    const imageBoxes = document.querySelectorAll('.image-upload-box');
    
    imageBoxes.forEach((box, index) => {
        const input = box.querySelector('.image-input');
        const placeholder = box.querySelector('.upload-placeholder');
        const preview = box.querySelector('.preview-image');
        const removeBtn = box.querySelector('.remove-image');
        
        // Handle file selection
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                    removeBtn.style.display = 'flex';
                    box.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Handle remove image
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            input.value = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            removeBtn.style.display = 'none';
            box.classList.remove('has-image');
        });
        
        // Handle click on box to trigger file input
        box.addEventListener('click', function() {
            if (!box.classList.contains('has-image')) {
                input.click();
            }
        });
    });
}

// Price Calculation Management
function initializePriceCalculation() {
    const priceInput = document.getElementById('productPrice');
    const discountPercentInput = document.getElementById('discountPercent');
    const discountedPriceInput = document.getElementById('discountedPrice');
    
    function calculateDiscountedPrice() {
        const price = parseFloat(priceInput.value) || 0;
        const discountPercent = parseFloat(discountPercentInput.value) || 0;
        
        if (price > 0 && discountPercent > 0) {
            const discountAmount = (price * discountPercent) / 100;
            const discountedPrice = price - discountAmount;
            discountedPriceInput.value = discountedPrice.toFixed(2);
        } else {
            discountedPriceInput.value = '';
        }
    }
    
    // Calculate when price or discount changes
    priceInput.addEventListener('input', calculateDiscountedPrice);
    discountPercentInput.addEventListener('input', calculateDiscountedPrice);
    
    // Allow manual editing of discounted price (overrides calculation)
    discountedPriceInput.addEventListener('focus', function() {
        this.removeAttribute('readonly');
    });
    
    discountedPriceInput.addEventListener('blur', function() {
        // If user manually entered a price, calculate the discount percentage
        const price = parseFloat(priceInput.value) || 0;
        const discountedPrice = parseFloat(this.value) || 0;
        
        if (price > 0 && discountedPrice > 0 && discountedPrice < price) {
            const discountAmount = price - discountedPrice;
            const discountPercent = (discountAmount / price) * 100;
            discountPercentInput.value = Math.round(discountPercent);
        }
        
        this.setAttribute('readonly', 'true');
    });
}

// Global functions for button clicks
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;