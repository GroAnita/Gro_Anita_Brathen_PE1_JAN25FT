// JSDoc-enhanced Product Page Script
import { formatProductPrice, hasDiscount, createSalesBanner, magnifyProductImage, shareButtonSetup } from './utils.js';
import { showLoginModal } from './components/loginusermodal.js';
import { addToCart } from './components/cart.js';
import { getStock, reserveStock } from '../stockManager.js';

let currentProductId = null;
const urlParams = new URLSearchParams(window.location.search);
currentProductId = urlParams.get('id');

/**
 * Fetch detailed data for a single product.
 * @async
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<Object|null>} The full product response object, or null if the request fails.
 */
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/online-shop/${productId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
}

/**
 * Display product details on the product page.
 * Fetches, inserts HTML, updates DOM, and initializes features.
 * @async
 * @returns {Promise<void>}
 */
async function displayProductDetails() {
    if (!currentProductId) {
        console.error('No product ID found in URL');
        return;
    }

    const product = await fetchProductDetails(currentProductId);
    if (!product) {
        console.error('Failed to load product details');
        return;
    }

    /** @type {Object} */
    const productData = product.data;

    const productPageBox = document.querySelector('.productpage-box');
    if (productPageBox) {
        const imageUrl = productData.image?.url || '/images/placeholder-product.jpg';
        const productTitle = productData.title || 'Product Title';
        const productDesc = productData.description || 'No description available';
        const priceHTML = formatProductPrice(productData);

        productPageBox.innerHTML = `
            <div class="productpage-image">
                <div class="image-wrapper">
                    <img class="product-image" src="${imageUrl}" alt="${productTitle}">
                </div>
            </div>
            <div class="productpage-details">
                <h1 class="product-title">${productTitle}</h1>
                ${priceHTML}
                <p class="product-description">${productDesc}</p>
                <div class="productpage-actions">
                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        `;

        magnifyProductImage('.image-wrapper', 1.25);

        if (hasDiscount(productData)) {
            const imageContainer = document.querySelector('.image-wrapper');
            const salesBanner = createSalesBanner();
            imageContainer.appendChild(salesBanner);
        }
    }

    // Update DOM safely
    const titleEl = document.querySelector('.product-title');
    const priceEl = document.querySelector('.product-price');
    const descEl = document.querySelector('.product-description');
    const imageEl = document.querySelector('.product-image');

    if (titleEl) titleEl.textContent = productData.title;
    if (priceEl) priceEl.textContent = `$${productData.price.toFixed(2)}`;
    if (descEl) descEl.textContent = productData.description;
    if (imageEl && productData.image?.url) {
        imageEl.src = productData.image.url;
        imageEl.alt = productData.title;
    }

    const reviewsToDisplay = productData.reviews || [];
    displayReviews(reviewsToDisplay);

    shareButtonSetup('.image-wrapper', window.location.href, productData.title);
    setupAddToCartButton(productData);
}

// Insert static info/tabs section
const productPageOtherInfoBox = document.querySelector('.productpage-otherinfo-box');
productPageOtherInfoBox.innerHTML = `
  <div class="product-tabs">
    <div class="tab-buttons">
      <button class="tab-btn active" data-tab="reviews">Reviews</button>
      <button class="tab-btn" data-tab="shipping">Shipping Info</button>
      <button class="tab-btn" data-tab="care">Care Instructions</button>
    </div>
    <div class="tab-content">
      <div id="reviews" class="tab-pane active">
        <div class="reviews-section">
          <h3>Customer Reviews</h3>
          <div id="reviewsList">
             <div class="product-rating">
                <span id="productRating">★★★★☆</span>
                <span id="reviewCount">(0 reviews)</span>
             </div>
          </div>
        </div>
      </div>
      <div id="shipping" class="tab-pane">
        <h3>Shipping Information</h3>
        <p>Free shipping on orders over $100. Standard delivery 3–5 business days.</p>
      </div>
      <div id="care" class="tab-pane">
        <h3>Care Instructions</h3>
        <p>Machine wash cold, tumble dry low. Do not bleach.</p>
      </div>
    </div>
  </div>
  <div class="productpage-otherinfo-infobox">
    <ul>
      <li>Free shipping on all orders over $50</li>
      <li>30-day return policy for members</li>
      <li>Eco-friendly packaging</li>
      <li>Secure payment options</li>
    </ul>
  </div>
`;

/**
 * Calculate the average rating from an array of reviews.
 * @param {Array<{rating: number}>} reviews - List of review objects.
 * @returns {number} The average rating with one decimal.
 */
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((totalRating / reviews.length).toFixed(1));
}

/**
 * Create HTML for a star rating.
 * @param {number} rating - Rating from 0–5.
 * @param {boolean} [showDecimal=false] - Whether to show numeric rating.
 * @returns {string} HTML string representing star icons.
 */
function createStarRating(rating, showDecimal = false) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starHTML = '';
    for (let i = 0; i < fullStars; i++) starHTML += '<i class="fas fa-star"></i>';
    if (hasHalfStar) starHTML += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) starHTML += '<i class="far fa-star"></i>';

    if (showDecimal) starHTML += ` <span class="rating-number">(${rating})</span>`;
    return starHTML;
}

/**
 * Render the reviews inside the Reviews tab.
 * @param {Array<Object>} reviews - List of review objects from API.
 */
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const productRating = document.getElementById('productRating');
    const reviewCount = document.getElementById('reviewCount');
    if (!reviewsList) return;

    const avgRating = calculateAverageRating(reviews);
    if (productRating) productRating.innerHTML = createStarRating(avgRating, true);
    if (reviewCount) reviewCount.textContent = `(${reviews.length} review${reviews.length !== 1 ? 's' : ''})`;

    reviewsList.querySelectorAll('.review-item').forEach(r => r.remove());

    if (reviews.length === 0) {
        const noReviews = document.createElement('div');
        noReviews.className = 'no-reviews';
        noReviews.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
        reviewsList.appendChild(noReviews);
        return;
    }

    reviews.forEach(review => {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.innerHTML = `
            <div class="review-header">
                <div class="review-author">
                    <strong>${review.username}</strong>
                    <div class="review-rating">${createStarRating(review.rating)}</div>
                </div>
            </div>
            <div class="review-content">
                <p>${review.description}</p>
            </div>
        `;
        reviewsList.appendChild(item);
    });
}

/**
 * Attach "Add to Cart" functionality to the button.
 * @param {Object} productData - The product object used for cart storage.
 */
function setupAddToCartButton(productData) {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (!addToCartBtn) {
        console.error('Add to cart button not found!');
        return;
    }

    addToCartBtn.addEventListener('click', e => {
        e.preventDefault();
        console.log('Add to cart clicked for product:', productData.id);
        addToCart(productData);
    });
}

/**
 * Enable tab-switching functionality for the product info section.
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayProductDetails();
    initializeTabs();

    const loginTrigger = document.querySelector('#loginModalTrigger');
    if (loginTrigger) {
        loginTrigger.addEventListener('click', e => {
            e.preventDefault();
            console.log('Login trigger clicked!');
            showLoginModal();

            const menu = document.getElementById('hamburgerMenu');
            const overlay = document.getElementById('hamburgerOverlay');
            if (menu) menu.classList.remove('show-hamburger-menu');
            if (overlay) overlay.classList.remove('show');
        });
    } else {
        console.error('Login trigger not found!');
    }
});
