import { formatProductPrice, hasDiscount, createSalesBanner } from '../utils.js';


async function getRandomProductsForSlider(count = 3) {
    try {
        const response = await fetch('https://v2.api.noroff.dev/online-shop');
        const data = await response.json();
        
        // Get random products
        const shuffled = data.data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count); // Return first 3 after shuffle
    } catch (error) {
        console.error('Error fetching slider products:', error);
        return [];
    }
}

async function createSliderWithAPIProducts() {
    const products = await getRandomProductsForSlider(3);
    const sliderTrack = document.querySelector('.slider-track'); 
    
    // Clears existing slides
    sliderTrack.innerHTML = '';
    
    products.forEach((product, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide'; 
        
    slide.innerHTML = `
        <div class="image-box">
        <img src="${product.image.url}" alt="${product.title}" class="slider-image">
        </div>
        <div class="slide-content">
            <h2>${product.title}</h2>
            <p>${product.description || 'Featured product'}</p>
            ${formatProductPrice(product)}
        </div>
    `;
        
        sliderTrack.appendChild(slide);
        
        
        // Make the image clickable to go to product page
        const productImage = slide.querySelector('img');
        productImage.addEventListener('click', () => {
            // sending the product ID to the product page
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });
            if (hasDiscount(product)) {
            const saleBanner = createSalesBanner();
            const imageBox = slide.querySelector('.image-box');
            imageBox.appendChild(saleBanner);
        }
    });
    
    const sliderContainer = document.querySelector('.slider-container');
    const existingControls = sliderContainer.querySelector('.slider-controls');
    if (!existingControls) {
        sliderContainer.innerHTML += `
            <div class="slider-controls">
                <button class="prev-btn">❮</button>
                <button class="next-btn">❯</button>
            </div>
        `;
    }

    // Create carousel dots
    const carouselDotsContainer = document.getElementById('carouselDots');
    carouselDotsContainer.innerHTML = '';
    products.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            const sliderTrack = document.querySelector('.slider-track');
            const targetTranslate = -(index * 33.3333);
            sliderTrack.style.transform = `translateX(${targetTranslate}%)`;
            
            document.querySelectorAll('.carousel-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
        carouselDotsContainer.appendChild(dot);
    });

    // Initialize slider controls based on screen size
    initializeSliderControls();
}

// Helper function to update active dot
function updateActiveDot(slideIndex) {
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
}

async function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const sliderTrack = document.querySelector('.slider-track');
    const nextButton = document.querySelector('.slider-controls .next-btn');
    const prevButton = document.querySelector('.slider-controls .prev-btn');
    let currentSlide = 0;

    function showSlide(index) {
        // Move the track to show the correct slide
        const translateX = -(index * 33.3333); // Each slide is 33.3333% wide
        sliderTrack.style.transform = `translateX(${translateX}%)`;
    }

    nextButton?.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        updateActiveDot(currentSlide);
    });

    prevButton?.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
        updateActiveDot(currentSlide);
    });
    
    // Initialize to show first slide
    showSlide(0);
}

function addTouchControls() {
   const sliderTrack = document.querySelector('.slider-track');
   const slides = document.querySelectorAll('.slide');
   let isDragging = false;
   let startPosition = 0;
   let currentTranslate = 0;
   let currentSlide = 0;
   let startTime = 0;
   let prevTranslate = 0;

   sliderTrack.addEventListener('dragstart', (e) => e.preventDefault());

   sliderTrack.addEventListener('mousedown', dragStart);
   sliderTrack.addEventListener('mousemove', dragMove);
    sliderTrack.addEventListener('mouseup', dragEnd);
    sliderTrack.addEventListener('mouseleave', dragEnd);

    sliderTrack.addEventListener('touchstart', dragStart, { passive: false });
    sliderTrack.addEventListener('touchmove', dragMove, { passive: false });
    sliderTrack.addEventListener('touchend', dragEnd);

    function dragStart(event) {
        isDragging = true;
        startPosition = getPositionX(event);
        startTime = Date.now();
        sliderTrack.style.transition = 'none';
        sliderTrack.style.cursor = 'grabbing';
    }

    function dragMove(event) {
        if (!isDragging) return;
        event.preventDefault();

        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPosition;
        currentTranslate = prevTranslate + diff;

        sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd(event) {
        if (!isDragging) return;
        isDragging = false;

        const endTime = Date.now();
        const timeDiff = endTime - startTime;
        
        // For touch events, we can't get position on touchend, so use the last known position
        let endPosition;
        if (event.type === 'touchend') {
            // Use the current translate value to calculate distance
            endPosition = startPosition + (currentTranslate - prevTranslate);
        } else {
            endPosition = getPositionX(event);
        }
        
        const distance = endPosition - startPosition;
        const velocity = Math.abs(distance) / timeDiff;

        sliderTrack.style.transition = 'transform 0.3s ease';
        sliderTrack.style.cursor = 'grab';

        const threshold = 50; // Minimum distance to consider as a swipe
        const velocityThreshold = 0.3; // Minimum velocity to consider as a swipe

        if(Math.abs(distance) > threshold || velocity > velocityThreshold) {
            if (distance > 0) {
                currentSlide = Math.max(0, currentSlide - 1);
            } else {
                currentSlide = Math.min(slides.length - 1, currentSlide + 1);
            }
        }

        snapToSlide(currentSlide);
    }

    function snapToSlide(slideIndex) {
        currentSlide = slideIndex;
        const targetTranslate = -(currentSlide * 33.3333);
        sliderTrack.style.transform = `translateX(${targetTranslate}%)`;

        const slideWidth = sliderTrack.offsetWidth / slides.length;
        prevTranslate = -(currentSlide * slideWidth);
        
        // Update active dot
        updateActiveDot(currentSlide);
    }

    function getPositionX(event) {
        if (event.type.includes('mouse')) {
            return event.clientX;
        } else if (event.touches && event.touches.length > 0) {
            return event.touches[0].clientX;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            return event.changedTouches[0].clientX;
        }
        return 0; // fallback
    }

    snapToSlide(0); // Start at first slide

    sliderTrack.style.cursor = 'grab';
    sliderTrack.style.userSelect = 'none';
    sliderTrack.style.touchAction = 'pan-y';

}

// Function to initialize slider controls based on screen size
function initializeSliderControls() {
    const isMobileSize = window.innerWidth <= 1024;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Reset any existing event listeners and styles
    const sliderTrack = document.querySelector('.slider-track');
    const sliderControls = document.querySelector('.slider-controls');
    
    if (!sliderTrack) return; // Exit if slider doesn't exist yet
    
    // Remove all existing event listeners by cloning the element
    const newSliderTrack = sliderTrack.cloneNode(true);
    sliderTrack.parentNode.replaceChild(newSliderTrack, sliderTrack);
    
    // Reset styles
    if (sliderControls) {
        sliderControls.style.display = ''; // Reset to visible
    }
    
    // Apply the appropriate control logic
    if (isMobileSize && isTouchDevice) {
        // On mobile screens, enable touch and hide arrows
        if (sliderControls) sliderControls.style.display = 'none';
        addTouchControls();
    }
    else if (isMobileSize) {
        // On mobile size but no touch, hide arrows and use initializeSlider
        if (sliderControls) sliderControls.style.display = 'none';
        initializeSlider();
    }
    else {
        // Keep arrows for desktop
        initializeSlider();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createSliderWithAPIProducts();
});

// Add resize event listener to handle screen size changes
window.addEventListener('resize', () => {
    // Debounce the resize event to avoid too many calls
    clearTimeout(window.sliderResizeTimeout);
    window.sliderResizeTimeout = setTimeout(() => {
        initializeSliderControls();
    }, 250); // Wait 250ms after resize stops
});

