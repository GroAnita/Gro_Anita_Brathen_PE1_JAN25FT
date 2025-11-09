import { setupPagination, getPaginatedProducts, resetPagination } from './components/pagination.js';
import { showLoginModal } from './components/loginusermodal.js';
import { addToCart } from './components/cart.js';


const API_URL = 'https://v2.api.noroff.dev/online-shop';
const productsToDisplay = 12;
let allProducts = [];

const productCategories = {
        //Fashion
    "3b43b2e4-62b0-4c02-9166-dffa46a0388c": ["fashion"],
    "5391e16f-d88b-4747-a989-f17fb178459d": ["fashion"],
    "f7bdd538-3914-409d-bd71-8ef962a9a9dd": ["fashion"],
    "95dc28de-9ef6-4c67-808b-6431a5de43e8": ["fashion"],
    "7c6353ec-17a9-4a4d-a9d7-6997465367e1": ["fashion"],
    "f2d44fba-09a7-4ccb-9ceb-a6212bf5c213": ["fashion"],
    //Electronics
    "f99cafd2-bd40-4694-8b33-a6052f36b435": ["electronics"],
    "159fdd2f-2b12-46de-9654-d9139525ba87": ["electronics"],
    "83111322-05a9-4a93-bc81-7d6b58f1a707": ["electronics"],
    "1fd1ddca-0d38-4e41-aa62-a1a7a57cf4b5": ["electronics"],
    "10d6cc02-b282-46bb-b35c-dbc4bb5d91d9": ["electronics"],
    "31e3a66f-2dbe-47ae-b80d-d9e5814f3e32": ["electronics"],
    "5aa2e388-8dfb-4d70-b031-3732d8c6771a": ["electronics"],
    "3f328f02-715e-477f-9738-7934af4bc5b0": ["electronics"],
    "894ca18f-9725-40b3-9429-1420ee2054da": ["electronics"],
    "be5e376d-e657-4035-8916-1580c52f4e98": ["electronics"],
    "ce5b64e3-440d-46e5-952f-bfdbad8a48d2": ["electronics"],
    "f5d453d1-e811-4225-81ac-cee54ef0384b": ["electronics"],
    "f6712e3b-8050-4841-bd64-f332a48f7566": ["electronics"],
    "fbf07ebe-9f9a-4895-8a16-567acbbeef4e": ["electronics"],
    //health and beauty
    "109566af-c5c2-4f87-86cb-76f36fb8d378": ["health and beauty"],
    "414f5b60-c574-4a2f-a77b-3956b983495b": ["health and beauty"],
    "9be4812e-16b2-44e6-bc55-b3aef9db2b82": ["health and beauty"],
    "c0d245f1-58fa-4b15-aa0c-a704772a122b": ["health and beauty"],

};

function getProductCategories(productId) {
    return productCategories[productId] || [];
}

function isInCategory(productId, category) {
    const categories = getProductCategories(productId);
    return categories.includes(category);
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up category filter event listeners
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            resetPagination(); // Reset to page 1 when changing categories
            
            let productsToShow;
            if (category === 'all') {
                productsToShow = allProducts;
            } else {
                productsToShow = allProducts.filter(product => isInCategory(product.id, category));
            }
            
            // Use different approach based on screen size
            if (window.innerWidth <= 768) {
                // Mobile: Use load more approach
                displayedProducts = 0; // Reset displayed count
                renderProductsWithLoadMore(productsToShow);
            } else {
                // Desktop: Use pagination approach
                setupPagination(productsToShow.length, (page) => {
                    const paginatedProducts = getPaginatedProducts(productsToShow);
                    renderProducts(paginatedProducts);
                });
                const paginatedProducts = getPaginatedProducts(productsToShow);
                renderProducts(paginatedProducts);
            }
        });
    });
    
    // Fetch products after setting up listeners
    fetchProducts();
});

// Handle window resize to switch between mobile/desktop approaches
window.addEventListener('resize', () => {
    // Remove existing load more button if it exists
    const existingBtn = document.getElementById('loadMoreBtn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // Reset displayed products count
    displayedProducts = 0;
    
    // Re-fetch and display products with appropriate approach
    fetchProducts();
});

function getProductsPerPage() {
    return window.innerWidth <= 768 ? 6 : 12;
}

async function fetchProducts() {
    try {
        const response = await fetch('https://v2.api.noroff.dev/online-shop');
        const data = await response.json();
        allProducts = data.data;
        
        // Use different approach based on screen size
        if (window.innerWidth <= 768) {
            // Mobile: Use load more approach
            renderProductsWithLoadMore(allProducts);
        } else {
            // Desktop: Use pagination approach
            setupPagination(allProducts.length, (page) => {
                const paginatedProducts = getPaginatedProducts(allProducts);
                renderProducts(paginatedProducts);
            });
            const paginatedProducts = getPaginatedProducts(allProducts);
            renderProducts(paginatedProducts);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

let displayedProducts = 0;
const mobileProductsPerLoad = 6;
const desktopProductsPerLoad = 12;

function getProductsPerLoad() {
    return window.innerWidth <= 768 ? mobileProductsPerLoad : desktopProductsPerLoad;
}

function renderProductsWithLoadMore(products, isLoadMore = false) {
    const container = document.getElementById('products-container');
    const productsPerLoad = getProductsPerLoad();

    if (!isLoadMore) {
        container.innerHTML = '';
        displayedProducts = 0;
    }

    const productsToShow = products.slice(displayedProducts, displayedProducts + productsPerLoad);

    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <img src="${product.image.url}" alt="${product.title}" class="product-image">
            <h3>${product.title}</h3>
            ${product.discountedPrice && product.discountedPrice < product.price ? 
                `<p class="price strikethrough">$${product.price}</p>
                 <p class="discounted-price">$${product.discountedPrice}</p>` :
                `<p class="price">$${product.price}</p>`
            }
        `;

        container.appendChild(productCard);

        const productImage = productCard.querySelector('.product-image');
        productImage.addEventListener('click', () => {
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });
        
        // Add event listener for add to cart button (mobile version too)
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Adding to cart from mobile load more:', product.id);
                addToCart(product);
            });
        }

        // Add sale banner if product has discount
        if (product.discountedPrice && product.discountedPrice < product.price) {
            const saleBanner = document.createElement('div');
            saleBanner.className = 'sale-banner';
            saleBanner.textContent = 'ON SALE';
            productCard.appendChild(saleBanner);
        }
    });

    // Update count AFTER the loop
    displayedProducts += productsToShow.length;
    
    // Call updateLoadMoreButton ONCE after all products are added
    updateLoadMoreButton(products.length);
}

function updateLoadMoreButton(totalProducts) {
    let loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Create button if it doesn't exist
    if (!loadMoreBtn) {
        loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.className = 'load-more-btn';
        document.getElementById('products-container').after(loadMoreBtn);
        
        loadMoreBtn.addEventListener('click', () => {
            renderProductsWithLoadMore(allProducts, true);
        });
    }
    
    // Show/hide button based on conditions
    if (displayedProducts >= totalProducts) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    
    // Clear existing products first!
    container.innerHTML = '';
    
    products.forEach(product => {
        // This is creating the product card element
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        

        // This is the inner HTML for the product-card
        productCard.innerHTML = `
            <img src="${product.image.url}" alt="${product.title}" class="product-image">
            <h3>${product.title}</h3>
            <div class="price-container">
            ${product.discountedPrice && product.discountedPrice < product.price ? 
                `<p class="price strikethrough">$${product.price}</p>
                 <p class="discounted-price">$${product.discountedPrice}</p>` :
                `<p class="price">$${product.price}</p>`
            }
            </div>
            <button class="add-to-cart-btn">Add to Cart</button>
        `;
        
        container.appendChild(productCard);
        
        // Adding the click event to the image
        const productImage = productCard.querySelector('.product-image');
        productImage.addEventListener('click', () => {
            // sending the product ID to the product page
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });
        
        // Add event listener for add to cart button
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent triggering the image click
                console.log('Adding to cart from homepage:', product.id);
                addToCart(product);
            });
        }
        
        //My sales banner
        if (product.discountedPrice && product.discountedPrice < product.price) {
            const saleBanner = document.createElement('div');
            saleBanner.className = 'sale-banner';
            saleBanner.innerText = 'ON SALE';
            productCard.appendChild(saleBanner);
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const loginTrigger = document.querySelector('#loginModalTrigger');
    
    if (loginTrigger) {
        loginTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Open the login modal
            showLoginModal();
            
            // Close the hamburger menu after opening modal
            const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
            const hamburgerOverlay = document.getElementById('hamburgerOverlay');
            
            if (hamburgerMenuOverlay) {
                hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
            }
            if (hamburgerOverlay) {
                hamburgerOverlay.classList.remove('show');
            }
        });
    } else {
        console.error('Login trigger not found!');
    }
});