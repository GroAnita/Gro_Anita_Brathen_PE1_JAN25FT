
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
            ${product.discountedPrice && product.discountedPrice < product.price ? 
                `<p class="price strikethrough">$${product.price}</p>
                <p class="discounted-price">$${product.discountedPrice}</p>` :
                `<p class="price">$${product.price}</p>`
            }
        </div>
    `;
        
        sliderTrack.appendChild(slide);
        
        
        // Make the image clickable to go to product page
        const productImage = slide.querySelector('img');
        productImage.addEventListener('click', () => {
            // sending the product ID to the product page
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });
        //wanted to put an on sale banner here aswell
               if (product.discountedPrice && product.discountedPrice < product.price) {
            const saleBanner = document.createElement('div');
            saleBanner.className = 'sale-banner';
            saleBanner.textContent = 'ON SALE';
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

    // Detect if device supports touch
    const isMobileSize = window.innerWidth <= 1024;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        // Hide arrows, enable touch/drag
        document.querySelector('.slider-controls').style.display = 'none';
        addTouchControls();
    } else {
        // Keep arrows for desktop
        initializeSlider(); // Your current arrow-based navigation
    }
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
    });

    prevButton?.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
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

document.addEventListener('DOMContentLoaded', () => {
    createSliderWithAPIProducts();
});

