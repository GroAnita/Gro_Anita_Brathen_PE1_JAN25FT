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
        <div class="grid-cell">${Math.floor(Math.random() * 50) + 1}</div>
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

// Global functions for button clicks
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;