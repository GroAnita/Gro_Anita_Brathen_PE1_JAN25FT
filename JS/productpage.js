import { formatProductPrice, hasDiscount, createSalesBanner, magnifyProductImage, shareButtonSetup } from './utils.js';

let currentProductId = null;
const urlParams = new URLSearchParams(window.location.search);
currentProductId = urlParams.get('id');

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
    
    // Debug: Log the product structure to see what we're working with
    console.log('Product data:', product);
    
    // Extract the actual product data from the API response
    const productData = product.data;
    
    // Reviews are included in the product data
    console.log('Product data with reviews:', productData);
    console.log('Reviews found:', productData.reviews || []);
    
    const productPageBox = document.querySelector('.productpage-box');
    if (productPageBox) {
        // Safely access image URL with fallback - now using productData
        const imageUrl = productData.image && productData.image.url ? productData.image.url : '/images/placeholder-product.jpg';
        const productTitle = productData.title || 'Product Title';
        const productDesc = productData.description || 'No description available';
        
        // Use imported function for price formatting
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
            const salesBanner = createSalesBanner(); // This returns a DOM element
            imageContainer.appendChild(salesBanner);    
        }
    }
    
    // Select existing elements and update them safely
    const titleEl = document.querySelector('.product-title');
    const priceEl = document.querySelector('.product-price');
    const descEl = document.querySelector('.product-description');
    const imageEl = document.querySelector('.product-image');
    
    if (titleEl) titleEl.textContent = productData.title;
    if (priceEl) priceEl.textContent = `$${productData.price.toFixed(2)}`;
    if (descEl) descEl.textContent = productData.description;
    if (imageEl && productData.image && productData.image.url) {
        imageEl.src = productData.image.url;
        imageEl.alt = productData.title;
    }

    // For testing - create fake reviews if none exist
    let reviewsToDisplay = productData.reviews || [];
    
    // Display reviews from product data
    displayReviews(reviewsToDisplay);
    
    // Setup share icon inside image container (next to magnify icon)
    shareButtonSetup('.image-wrapper', window.location.href, productData.title);
};


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
                <p>Free shipping on orders over $100. Standard delivery 3-5 business days.</p>
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

// Function to calculate average rating from reviews
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) {
        return 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
}

// Function to create star display
function createStarRating(rating, showDecimal = false) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starHTML += '<i class="far fa-star"></i>';
    }
    
    if (showDecimal) {
        starHTML += ` <span class="rating-number">(${rating})</span>`;
    }
    
    return starHTML;
}

// Function to display reviews in the reviews tab
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const productRating = document.getElementById('productRating');
    const reviewCount = document.getElementById('reviewCount');
    
    if (!reviewsList) return;
    
    // Calculate and display average rating
    const averageRating = calculateAverageRating(reviews);
    
    if (productRating) {
        productRating.innerHTML = createStarRating(averageRating, true);
    }
    
    if (reviewCount) {
        reviewCount.textContent = `(${reviews.length} review${reviews.length !== 1 ? 's' : ''})`;
    }
    
    // Clear existing reviews (keep the rating section)
    const existingReviews = reviewsList.querySelectorAll('.review-item');
    existingReviews.forEach(review => review.remove());
    
    // Display individual reviews
    if (reviews.length === 0) {
        const noReviewsMessage = document.createElement('div');
        noReviewsMessage.className = 'no-reviews';
        noReviewsMessage.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
        reviewsList.appendChild(noReviewsMessage);
        return;
    }
    
    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        reviewItem.innerHTML = `
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
        
        reviewsList.appendChild(reviewItem);
    });
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayProductDetails();
    initializeTabs();
});