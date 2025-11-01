const API_URL = 'https://v2.api.noroff.dev/online-shop';
const productsToDisplay = 12;

async function fetchProducts() {
    try {
        const response = await fetch('https://v2.api.noroff.dev/online-shop');
        const data = await response.json();
        const limitedProducts = data.data.slice(0, productsToDisplay);
        renderProducts(limitedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    
    products.forEach(product => {
        // Debug: let's see what the product object looks like
        console.log('Product object:', product);
        console.log('Product.image:', product.image.url);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image.url}" alt="${product.title}">
            <h3>${product.title}</h3>
            ${product.discountedPrice && product.discountedPrice < product.price ? 
            `<p class="price strikethrough">$${product.price}</p>
            <p class="discounted-price">$${product.discountedPrice}</p>` :
            `<p class="price">$${product.price}</p>`
}
        `;
        
        container.appendChild(productCard);
    });
}

// Call the function when page loads
fetchProducts();