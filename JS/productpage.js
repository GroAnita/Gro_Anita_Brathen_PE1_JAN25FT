import {
    formatProductPrice,
    hasDiscount,
    createSalesBanner,
    magnifyProductImage,
    shareButtonSetup,
    getProductTags
} from './utils.js';

import { favoriteHeart, toggleFavorite } from './global.js';
import { addToCart } from './components/cart.js';

// GET PRODUCT ID FROM URL
const urlParams = new URLSearchParams(window.location.search);
const currentProductId = urlParams.get('id');

/**
 * Fetch detailed information about a single product from the API.
 *
 * @async
 * @function fetchProductDetails
 * @param {string} productId - The ID of the product to load.
 * @returns {Promise<Object|null>} The product data object, or null if the request failed.
 */
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/online-shop/${productId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();
        return product.data;

    } catch (error) {
        console.error("Product fetch error:", error);
        return null;
    }
}

/**
 * Gets product data and renders the full product page:
 * - Product image
 * - Price block (including the discount handling)
 * - Tags
 * - Favorite icon
 * - Reviews section
 * - Add-to-cart button
 * - Share button
 * - Image magnifier
 *
 * Also initializes all interactive elements such as tabs and favorite toggles.
 *
 * @async
 * @function displayProductDetails
 * @returns {Promise<void>}
 */
async function displayProductDetails() {
    if (!currentProductId) {
        console.error("No product ID in URL");
        return;
    }

    const productData = await fetchProductDetails(currentProductId);
    if (!productData) return;

    const productPageBox = document.querySelector('.productpage-box');
    if (!productPageBox) return;

    const imageUrl = productData.image?.url || '/images/placeholder-product.jpg';
    const priceHTML = formatProductPrice(productData);
    const tags = getProductTags(productData);

    productPageBox.innerHTML = `
        <div class="productpage-image">
            <div class="image-wrapper">
                <img class="product-image" src="${imageUrl}" alt="${productData.title}">
                ${favoriteHeart(productData.id)}
            </div>

            <div class="product-tags">
                ${tags.map(tag => `<span class="tag"> - ${tag}</span>`).join('')}
            </div>
        </div>

        <div class="productpage-details">
            <h1 class="product-title">${productData.title}</h1>
            ${priceHTML}
            <p class="product-description">${productData.description}</p>

            <div class="productpage-actions">
                <button class="add-to-cart-btn">Add to Cart</button>
            </div>
        </div>
    `;

    magnifyProductImage('.image-wrapper', 1.25);

    if (hasDiscount(productData)) {
        const banner = createSalesBanner();
        document.querySelector('.image-wrapper').appendChild(banner);
    }

    shareButtonSetup('.image-wrapper', window.location.href, productData.title);

    // Heart icon setup (placed in timeout to ensure DOM is updated)
    setTimeout(() => {
        const heartIcon = document.querySelector('.product-favorite-icon');
        if (heartIcon) {
            heartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = heartIcon.dataset.productId;
                toggleFavorite(productId, heartIcon);
            });
        }
    }, 0);

    displayReviews(productData.reviews || []);
    setupAddToCartButton(productData);
}

/**
 * Calculates the average star rating from a list of reviews.
 *
 * @function calculateAverageRating
 * @param {Array<{rating: number}>} reviews - List of review objects.
 * @returns {number} The average rating, rounded to one decimal place.
 */
function calculateAverageRating(reviews) {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / reviews.length).toFixed(1));
}

/**
 * Generates HTML for star-rating.
 *
 * @function createStarRating
 * @param {number} rating - Rating value between 0–5.
 * @param {boolean} [showDecimal=false] - Whether to show "(4.5)" after the stars.
 * @returns {string} HTML markup for star icons.
 */
function createStarRating(rating, showDecimal = false) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';

    if (showDecimal) html += ` <span class="rating-number">(${rating})</span>`;

    return html;
}

/**
 * Renders the list of product reviews and updates:
 * - Star rating badge
 * - Review count
 * - Review items in the list
 *
 * @function displayReviews
 * @param {Array<Object>} reviews - List of review objects.
 * @returns {void}
 */
function displayReviews(reviews) {
    const list = document.getElementById('reviewsList');
    const ratingEl = document.getElementById('productRating');
    const countEl = document.getElementById('reviewCount');

    if (!list) return;

    const avg = calculateAverageRating(reviews);
    ratingEl.innerHTML = createStarRating(avg, true);
    countEl.textContent = `(${reviews.length} review${reviews.length !== 1 ? 's' : ''})`;

    list.querySelectorAll('.review-item').forEach(el => el.remove());

    if (!reviews.length) {
        list.innerHTML = `<div class="no-reviews"><p>No reviews yet.</p></div>`;
        return;
    }

    reviews.forEach(r => {
        const item = document.createElement('div');
        item.className = 'review-item';

        item.innerHTML = `
            <div class="review-header">
                <strong>${r.username}</strong>
                <div class="review-rating">${createStarRating(r.rating)}</div>
            </div>
            <div class="review-content">
                <p>${r.description}</p>
            </div>
        `;

        list.appendChild(item);
    });
}

/**
 * Connects the "Add to Cart" button to the cart.
 * @function setupAddToCartButton
 * @param {Object} productData - The full product object to be added to the cart.
 * @returns {void}
 */
function setupAddToCartButton(productData) {
    const btn = document.querySelector('.add-to-cart-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(productData);
    });
}

/**
 * Initializes my product page tabs:
 * - "Reviews"
 * - "Shipping Information"
 *
 * Handles switching the active state of tabs and panes.
 *
 * @function initializeTabs
 * @returns {void}
 */
function initializeTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            buttons.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

/**
 * Entry point for the product page.
 * Loads:
 * - Product details
 * - Reviews
 * - Tabs
 *
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    displayProductDetails();
    initializeTabs();
});
