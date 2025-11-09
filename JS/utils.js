function formatProductPrice(product) {
    if (product.discountedPrice && product.discountedPrice < product.price) {
        return `
            <div class="price-container">
            <p class="price strikethrough">$${product.price.toFixed(2)}</p>
            <p class="discounted-price">$${product.discountedPrice.toFixed(2)}</p>
            </div>
        `;
    } else {
        return `<p class="price">$${product.price.toFixed(2)}</p>`;
    }
}

export { formatProductPrice };

function hasDiscount(product) {
    return product.discountedPrice && product.discountedPrice < product.price;
}

export { hasDiscount }; 

function createSalesBanner() {
    const saleBanner = document.createElement('div');
    saleBanner.className = 'sale-banner';
    saleBanner.textContent = 'ON SALE';
    return saleBanner;
}

export { createSalesBanner };

function magnifyProductImage(imageSelector, zoomLevel = 2) {
    const productImage = document.querySelector(imageSelector);
    if (!productImage) return;
    
    let isZoomed = false;
    
    // Create magnify icon
    const magnifyIcon = document.createElement('i');
    magnifyIcon.className = 'fas fa-magnifying-glass magnify-icon';
    magnifyIcon.title = 'Click to zoom';
    
    // Add icon to image container
    const imageContainer = productImage.parentElement;
    productImage.style.position = 'relative'; // Ensure positioning context
    productImage.appendChild(magnifyIcon);
    
    // Set up image styles for zooming
    productImage.style.transition = 'transform 0.3s ease';
    productImage.style.transformOrigin = 'center';
    
    // Toggle zoom function
    function toggleZoom() {
        if (!isZoomed) {
            // Zoom in
            productImage.style.transform = `scale(${zoomLevel})`;
            magnifyIcon.style.opacity = '0.7'; // Visual feedback when zoomed
            magnifyIcon.title = 'Click to zoom out';
            isZoomed = true;
            // Add click-outside listener when zoomed in
            document.addEventListener('click', handleClickOutside);
        } else {
            // Zoom out
            productImage.style.transform = 'scale(1)';
            magnifyIcon.style.opacity = '1'; // Back to normal opacity
            magnifyIcon.title = 'Click to zoom';
            isZoomed = false;
            // Remove click-outside listener when zoomed out
            document.removeEventListener('click', handleClickOutside);
        }
    }
    
    // Handle clicks outside the image
    function handleClickOutside(event) {
        // Check if click is outside the image container
        if (!productImage.contains(event.target) && isZoomed) {
            toggleZoom(); // Zoom out
        }
    }
    
    // Add click event to icon
    magnifyIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering click-outside
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


function shareButtonSetup(imageContainerSelector, urlToShare, productTitle = 'Check out this product') {
    const imageContainer = document.querySelector(imageContainerSelector);
    if (!imageContainer) {
        console.error('Image container not found with selector:', imageContainerSelector);
        return;
    }
   
    const shareIcon = document.createElement('i');
    shareIcon.className = 'fa-solid fa-share share-icon';
    shareIcon.title = 'Click to share';


    // Add hover effect
    shareIcon.addEventListener('mouseenter', () => {
        shareIcon.style.background = 'rgba(0, 0, 0, 0.9)';
    });
    
    shareIcon.addEventListener('mouseleave', () => {
        shareIcon.style.background = 'rgba(0, 0, 0, 0.7)';
    });

    // Add icon to image container
    imageContainer.appendChild(shareIcon);
    
    shareIcon.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent triggering other click events
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: productTitle,
                    text: `Check out this amazing product: ${productTitle}`,
                    url: urlToShare
                });
                console.log('Product shared successfully');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing the product:', error);
                    // Fallback to clipboard
                    fallbackShare(urlToShare);
                }
            }
        } else {
            // Fallback for browsers that do not support the Web Share API
            fallbackShare(urlToShare);
        }
    });
    
    function fallbackShare(url) {
        if (navigator.clipboard && window.isSecureContext) {
            // Use clipboard API if available
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                // Final fallback
                prompt('Copy this link to share:', url);
            });
        } else {
            // Final fallback
            prompt('Copy this link to share:', url);
        }
    }
    
    return {
        shareIcon: shareIcon,
        destroy: () => shareIcon.remove()
    };
}

export { shareButtonSetup };

// Member Login Modal Module

const memberLoginModal = (() => {
    // Get modal element
    const modal = document.getElementById('loginModal');
    
    // Check if modal exists before proceeding
    if (!modal) {
        return {
            open: () => console.warn('Login modal not available'),
            close: () => console.warn('Login modal not available')
        };
    }
    
    const closeBtn = modal.querySelector('.close-btn');

    // Function to open the modal
    function openModal() {
        modal.style.display = 'block';
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
    }

    // Event listener for close button (only if it exists)
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Event listener for clicks outside the modal content
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

// Example usage: memberLoginModal.open(); to open the modal
// memberLoginModal.close(); to close the modal

export default memberLoginModal;