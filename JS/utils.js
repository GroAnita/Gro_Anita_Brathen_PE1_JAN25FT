/**
 * Returns formatted HTML for a product price.
 * Includes a discounted and original price if a discount exists.
 *
 * @param {Object} product - The product object.
 * @param {number} product.price - The original price.
 * @param {number} [product.discountedPrice] - The discounted price (if any).
 * @returns {string} HTML string representing the price block.
 */
function formatProductPrice(product) {
    if (product.discountedPrice && product.discountedPrice < product.price) {
        return `
            <div class="price-container">
            <p class="price strikethrough" aria-label="Original price">$${product.price.toFixed(2)}</p>
            <p class="discounted-price" aria-label="Discounted price">$${product.discountedPrice.toFixed(2)}</p>
            </div>
        `;
    } else {
        return `<p class="price" aria-label="Price">$${product.price.toFixed(2)}</p>`;
    }
}

export { formatProductPrice };

/**
 * Checks whether a product has a valid discount.
 *
 * @param {Object} product - The product object.
 * @param {number} product.price - Original price.
 * @param {number} [product.discountedPrice] - Discounted price.
 * @returns {boolean} True if the product is discounted.
 */
function hasDiscount(product) {
    return product.discountedPrice && product.discountedPrice < product.price;
}

export { hasDiscount }; 

/**
 * Creates and returns a DOM element representing a sales banner.
 * Aria-hidden set to true for accessibility so that they dont hear on sale for every product
 * @returns {HTMLDivElement} A "SALE" banner element.
 */
function createSalesBanner() {
    const saleBanner = document.createElement('div');
    saleBanner.className = 'sale-banner';
    saleBanner.setAttribute('aria-hidden', 'true');
    saleBanner.textContent = 'ON SALE';
    return saleBanner;
}

export { createSalesBanner };

/**
 * Adds a magnifying zoom effect to a product image.
 *
 * @param {string} imageSelector - CSS selector for the product image.
 * @param {number} [zoomLevel=2] - How much the image should scale.
 * @returns {Object} Controls for zoom behavior.
 * @returns {Function} return.zoom - Programmatically toggle zoom.
 * @returns {Function} return.destroy - Remove zoom behavior & icon.
 */
function magnifyProductImage(imageSelector, zoomLevel = 2) {
    const productImage = document.querySelector(imageSelector);
    if (!productImage) return;
    
    let isZoomed = false;
    
    // Magnify icon
    const magnifyIcon = document.createElement('i');
    magnifyIcon.className = 'fas fa-magnifying-glass magnify-icon';
    magnifyIcon.title = 'Click to zoom';
    
    // Add icon to image container
    const imageContainer = productImage.parentElement;
    productImage.style.position = 'relative';
    productImage.appendChild(magnifyIcon);
    
    // Enable zooming
    productImage.style.transition = 'transform 0.3s ease';
    productImage.style.transformOrigin = 'center';
    
    /**
     * Zooms in/out on click.
     */
    function toggleZoom() {
        if (!isZoomed) {
            productImage.style.transform = `scale(${zoomLevel})`;
            magnifyIcon.style.opacity = '0.7';
            magnifyIcon.title = 'Click to zoom out';
            isZoomed = true;
            document.addEventListener('click', handleClickOutside);
        } else {
            productImage.style.transform = 'scale(1)';
            magnifyIcon.style.opacity = '1';
            magnifyIcon.title = 'Click to zoom';
            isZoomed = false;
            document.removeEventListener('click', handleClickOutside);
        }
    }
    
    /**
     * Closes zoom when clicking outside the image.
     *
     * @param {MouseEvent} event 
     */
    function handleClickOutside(event) {
        if (!productImage.contains(event.target) && isZoomed) {
            toggleZoom();
        }
    }
    
    // Add click to icon
    magnifyIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleZoom();
    });
    
    return {
        zoom: () => toggleZoom(),
        destroy: () => {
            magnifyIcon.remove();
            document.removeEventListener('click', handleClickOutside);
        }
    };
}

export { magnifyProductImage };

/**
 * Adds a share button to an image container and supports Web Share API + fallbacks.
 *
 * @param {string} imageContainerSelector - CSS selector of the container.
 * @param {string} urlToShare - The URL to share or copy.
 * @param {string} [productTitle='Check out this product'] - The message included in share.
 * @returns {Object|undefined} Returns control object if setup succeeded.
 */
function shareButtonSetup(imageContainerSelector, urlToShare, productTitle = 'Check out this product') {
    const imageContainer = document.querySelector(imageContainerSelector);
    if (!imageContainer) {
        console.error('Image container not found with selector:', imageContainerSelector);
        return;
    }
   
    const shareIcon = document.createElement('i');
    shareIcon.className = 'fa-solid fa-share share-icon';
    shareIcon.title = 'Click to share';

    // Hover visuals
    shareIcon.addEventListener('mouseenter', () => {
        shareIcon.style.background = 'rgba(0, 0, 0, 0.9)';
    });
    shareIcon.addEventListener('mouseleave', () => {
        shareIcon.style.background = 'rgba(0, 0, 0, 0.7)';
    });

    imageContainer.appendChild(shareIcon);
    
    /**
     * Fallback if Web Share API is not available.
     *
     * @param {string} url - The URL to share or copy.
     */
    function fallbackShare(url) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                prompt('Copy this link to share:', url);
            });
        } else {
            prompt('Copy this link to share:', url);
        }
    }

    // Share click handler
    shareIcon.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: productTitle,
                    text: `Check out this amazing product: ${productTitle}`,
                    url: urlToShare
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing product:', error);
                    fallbackShare(urlToShare);
                }
            }
        } else {
            fallbackShare(urlToShare);
        }
    });
    
    return {
        shareIcon: shareIcon,
        destroy: () => shareIcon.remove()
    };
}

export { shareButtonSetup };

// ---------------------------
// Member Login Modal Module
// ---------------------------

/**
 * Module for controlling the member login modal.
 *
 * @namespace memberLoginModal
 * @property {Function} open - Opens the modal.
 * @property {Function} close - Closes the modal.
 */
const memberLoginModal = (() => {

    const modal = document.getElementById('loginModal');
    
    // Handle missing modal gracefully
    if (!modal) {
        return {
            open: () => console.warn('Login modal not available'),
            close: () => console.warn('Login modal not available')
        };
    }
    
    const closeBtn = modal.querySelector('.close-btn');

    /** Opens the login modal. */
    function openModal() {
        modal.style.display = 'block';
    }

    /** Closes the login modal. */
    function closeModal() {
        modal.style.display = 'none';
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    /**
     * Closes modal if clicking outside the modal content.
     *
     * @param {MouseEvent} event
     */
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    return {
        open: openModal,
        close: closeModal
    };
})();

export default memberLoginModal;


function backToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.title = 'Back to Top';
    backToTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(backToTopBtn);
}

export { backToTop };

export function showToastMsg(message) {

    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}




export function initializeNewsletterForm() {

    document.addEventListener("DOMContentLoaded", () => {
    const toast = document.getElementById("toast");
    if (toast) toast.classList.remove("show");
});

    const form = document.getElementById('newsletterForm');
    if (!form) return; 

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const emailInput = form.querySelector('input[name="email"]');
        const email = emailInput?.value.trim() || "";

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showToastMsg("Please enter a valid email!", "error");
            return;
        }

        showToastMsg("Thank you for subscribing to our Newsletter!", "success");
        emailInput.value = "";
    });
}


export function tagIdFromApi(apiTag) {
    return apiTag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}
export function tagNameFromId(tagId) {
    return tagId.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}   

/**
 * Get tags from a product.
 * Returns an empty array if no tags exist.
 * 
 * @param {Object} product - The product object from API.
 * @returns {Array<string>} - A clean array of tags.
 */
export function getProductTags(product) {
    if (!product || !Array.isArray(product.tags)) {
        return [];
    }

    return product.tags
        .filter(tag => typeof tag === "string" && tag.trim() !== "")
        .map(tag => tag.trim());
}









