import { setupPagination, getPaginatedProducts, resetPagination } from './components/pagination.js';
import { showLoginModal } from './components/loginusermodal.js';
import { addToCart } from './components/cart.js';
import { backToTop } from './utils.js';
//import { getStock } from './components/stockManager.js';

/**
 * Base API URL for fetching products.
 * @type {string}
 */
const API_URL = 'https://v2.api.noroff.dev/online-shop';

/**
 * Stores all fetched products from the API.
 * @type {Product[]}
 */
let allProducts = [];

/**
 * @typedef {Object} ProductImage
 * @property {string} url - URL of the product image.
 * @property {string} alt - Alternative text for the image.
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Product ID.
 * @property {string} title - Product title.
 * @property {string} description - Product description.
 * @property {number} price - Original price.
 * @property {number} discountedPrice - Discounted price (if available).
 * @property {ProductImage} image - Product image object.
 */

/**
 * Mapping of product IDs to their category group(s).
 * @type {Record<string, string[]>}
 */
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
    //Health & Beauty
    "109566af-c5c2-4f87-86cb-76f36fb8d378": ["health and beauty"],
    "414f5b60-c574-4a2f-a77b-3956b983495b": ["health and beauty"],
    "9be4812e-16b2-44e6-bc55-b3aef9db2b82": ["health and beauty"],
    "c0d245f1-58fa-4b15-aa0c-a704772a122b": ["health and beauty"],
};

/**
 * Returns the categories for a given product ID.
 * @param {string} productId
 * @returns {string[]} Categories associated with the product.
 */
function getProductCategories(productId) {
    return productCategories[productId] || [];
}

/**
 * Checks if a product belongs to a given category.
 * @param {string} productId - ID of the product.
 * @param {string} category - Category name to check.
 * @returns {boolean} Whether the product is in the category.
 */
function isInCategory(productId, category) {
    const categories = getProductCategories(productId);
    return categories.includes(category);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            resetPagination();

            let productsToShow =
                category === 'all'
                    ? allProducts
                    : allProducts.filter(product => isInCategory(product.id, category));

            if (window.innerWidth <= 768) {
                displayedProducts = 0;
                renderProductsWithLoadMore(productsToShow);
            } else {
                setupPagination(productsToShow.length, () => {
                    renderProducts(getPaginatedProducts(productsToShow));
                });
                renderProducts(getPaginatedProducts(productsToShow));
            }
        });
    });

    fetchProducts();
});

window.addEventListener('resize', () => {
    const existingBtn = document.getElementById('loadMoreBtn');
    if (existingBtn) existingBtn.remove();

    displayedProducts = 0;
    fetchProducts();
});

/**
 * Fetches products from the API and renders them depending on screen size.
 * @returns {Promise<void>}
 */
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allProducts = data.data;

        if (window.innerWidth <= 768) {
            renderProductsWithLoadMore(allProducts);
        } else {
            setupPagination(allProducts.length, () => {
                renderProducts(getPaginatedProducts(allProducts));
            });
            renderProducts(getPaginatedProducts(allProducts));
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

/**
 * Tracks the number of products currently displayed in mobile mode.
 * @type {number}
 */
let displayedProducts = 0;

/** @type {number} */
const mobileProductsPerLoad = 6;

/** @type {number} */
const desktopProductsPerLoad = 12;

/**
 * Determines how many products to load depending on screen size.
 * @returns {number}
 */
function getProductsPerLoad() {
    return window.innerWidth <= 768 ? mobileProductsPerLoad : desktopProductsPerLoad;
}

/**
 * Renders products with a "Load More" button strategy (mobile).
 * @param {Product[]} products - Products to show.
 * @param {boolean} [isLoadMore=false] - True if loading additional items rather than resetting.
 */
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
            ${product.discountedPrice && product.discountedPrice < product.price
                ? `<p class="price strikethrough">$${product.price}</p>
                   <p class="discounted-price">$${product.discountedPrice}</p>`
                : `<p class="price">$${product.price}</p>`
            }
        `;

        container.appendChild(productCard);

        productCard.querySelector('.product-image').addEventListener('click', () => {
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });

        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
            });
        }

        if (product.discountedPrice && product.discountedPrice < product.price) {
            const saleBanner = document.createElement('div');
            saleBanner.className = 'sale-banner';
            saleBanner.textContent = 'ON SALE';
            productCard.appendChild(saleBanner);
        }
    });

    displayedProducts += productsToShow.length;
    updateLoadMoreButton(products.length);
}

/**
 * Creates or updates the "Load More" button.
 * @param {number} totalProducts - Total number of items available.
 */
function updateLoadMoreButton(totalProducts) {
    let loadMoreBtn = document.getElementById('loadMoreBtn');

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

    loadMoreBtn.style.display =
        displayedProducts >= totalProducts
            ? 'none'
            : window.innerWidth <= 768
                ? 'block'
                : 'none';
}

/**
 * Renders product cards (desktop version with pagination).
 * @param {Product[]} products - Products to render.
 */
function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <img src="${product.image.url}" alt="${product.title}" class="product-image">
            <h3>${product.title}</h3>
            <div class="price-container">
                ${product.discountedPrice && product.discountedPrice < product.price
                    ? `<p class="price strikethrough">$${product.price}</p>
                       <p class="discounted-price">$${product.discountedPrice}</p>`
                    : `<p class="price">$${product.price}</p>`
                }
            </div>
            <button class="add-to-cart-btn">Add to Cart</button>
        `;

        container.appendChild(productCard);

        productCard.querySelector('.product-image').addEventListener('click', () => {
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });

        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
        });

        if (product.discountedPrice && product.discountedPrice < product.price) {
            const saleBanner = document.createElement('div');
            saleBanner.className = 'sale-banner';
            saleBanner.innerText = 'ON SALE';
            productCard.appendChild(saleBanner);
        }
    });
}

/**
 * Sets up login modal trigger and closes hamburger on activation.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginTrigger = document.querySelector('#loginModalTrigger');

    if (loginTrigger) {
        loginTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();

            const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
            const hamburgerOverlay = document.getElementById('hamburgerOverlay');

            if (hamburgerMenuOverlay) hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
            if (hamburgerOverlay) hamburgerOverlay.classList.remove('show');
        });
    } else {
        console.error('Login trigger not found!');
    }
});

