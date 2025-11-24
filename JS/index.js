import { setupPagination, getPaginatedProducts, resetPagination } from './components/pagination.js';
import { addToCart } from './components/cart.js';

const API_URL = 'https://v2.api.noroff.dev/online-shop';

let allProducts = [];
let displayedProducts = 0;

const mobileProductsPerLoad = 6;
const desktopProductsPerLoad = 12;

/* -------------------------------
   CATEGORY HELPERS
--------------------------------*/
const productCategories = {
    // ... unchanged ...
};

function getProductCategories(productId) {
    return productCategories[productId] || [];
}

function isInCategory(productId, category) {
    return getProductCategories(productId).includes(category);
}

/* -------------------------------
   MAIN PAGE LOAD
--------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
    setupCategoryFilters();
    await fetchProducts();
});

/* -------------------------------
   CATEGORY FILTERS
--------------------------------*/
function setupCategoryFilters() {
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            resetPagination();

            const productsToShow =
                category === 'all'
                    ? allProducts
                    : allProducts.filter(p => isInCategory(p.id, category));

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
}

/* -------------------------------
   FETCH PRODUCTS
--------------------------------*/
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
        console.error("Error fetching products:", error);
    }
}

/* -------------------------------
   LOAD MORE (MOBILE)
--------------------------------*/
function getProductsPerLoad() {
    return window.innerWidth <= 768 ? mobileProductsPerLoad : desktopProductsPerLoad;
}

function renderProductsWithLoadMore(products, isLoadMore = false) {
    const container = document.getElementById('products-container');
    const perLoad = getProductsPerLoad();

    if (!isLoadMore) {
        container.innerHTML = '';
        displayedProducts = 0;
    }

    const productsToShow = products.slice(displayedProducts, displayedProducts + perLoad);

    productsToShow.forEach(product => {
        container.appendChild(createProductCard(product));
    });

    displayedProducts += productsToShow.length;
    updateLoadMoreButton(products.length);
}

function updateLoadMoreButton(totalProducts) {
    let btn = document.getElementById('loadMoreBtn');

    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'loadMoreBtn';
        btn.textContent = 'Load More';
        btn.className = 'load-more-btn';
        document.getElementById('products-container').after(btn);

        btn.addEventListener('click', () => {
            renderProductsWithLoadMore(allProducts, true);
        });
    }

    btn.style.display =
        displayedProducts >= totalProducts ? 'none' :
        window.innerWidth <= 768 ? 'block' : 'none';
}

/* -------------------------------
   DESKTOP RENDER
--------------------------------*/
function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    products.forEach(product => {
        container.appendChild(createProductCard(product));
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
        <img src="${product.image.url}" alt="${product.title}" class="product-image">
        <h3>${product.title}</h3>
        <div class="price-container">
            ${product.discountedPrice && product.discountedPrice < product.price
                ? `<p class="price strikethrough">$${product.price}</p>
                   <p class="discounted-price">$${product.discountedPrice}</p>`
                : `<p class="price">$${product.price}</p>`}
        </div>
        <button class="add-to-cart-btn">Add to Cart</button>
    `;

    card.querySelector('.product-image').addEventListener('click', () => {
        window.location.href = `pages/productpage.html?id=${product.id}`;
    });

    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    });

    if (product.discountedPrice && product.discountedPrice < product.price) {
        const saleBanner = document.createElement('div');
        saleBanner.className = 'sale-banner';
        saleBanner.innerText = 'ON SALE';
        card.appendChild(saleBanner);
    }

    return card;
}



