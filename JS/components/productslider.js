/**
 * @fileoverview Product Slider component:
 *  - Fetches random products from API
 *  - Builds slider UI (desktop + mobile)
 *  - Supports swipe on touch devices
 *  - Supports navigation dots + arrows
 *  - Provides global Add-to-Cart handler that survives cloning
 */
import { formatProductPrice, hasDiscount, createSalesBanner } from '../utils.js';
import { addToCart } from './cart.js';

/**
 * Global event listener for Add-to-Cart buttons.
 * Works even if slider elements are replaced, cloned or rebuilt.
 *
 * @event document#click
 * @param {MouseEvent} e
 */
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const slide = btn.closest(".slide");
    if (!slide || !slide._product) return;

    addToCart(slide._product);
});

/**
 * Fetches a random subset of products from the API.
 *
 * @async
 * @function getRandomProductsForSlider
 * @param {number} count - Number of products to return.
 * @returns {Promise<Array<Object>>} A list of product objects.
 */
async function getRandomProductsForSlider(count = 3) {
    try {
        const response = await fetch('https://v2.api.noroff.dev/online-shop');
        const data = await response.json();
        const shuffled = data.data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    } catch (error) {
        console.error('Error fetching slider products:', error);
        return [];
    }
}

/**
 * Creates the product slider by fetching products, building slides,
 * attaching product data to slide nodes, and initializing controls.
 *
 * @async
 * @function createSliderWithAPIProducts
 * @returns {Promise<void>}
 */
async function createSliderWithAPIProducts() {
    const products = await getRandomProductsForSlider(3);
    const sliderTrack = document.querySelector('.slider-track');

    sliderTrack.innerHTML = '';

    products.forEach(product => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide._product = product; // store product on element

        slide.innerHTML = `
            <div class="image-box">
                <img 
                    src="${product.image.url}" 
                    alt="${product.title}" 
                    class="slider-image"
                    data-product-id="${product.id}"
                >
            </div>
            <div class="slide-content">
                <h2>${product.title}</h2>
                <p>${product.description || 'Featured product'}</p>
                ${formatProductPrice(product)}
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;

        sliderTrack.appendChild(slide);

        if (hasDiscount(product)) {
            const saleBanner = createSalesBanner();
            slide.querySelector('.image-box').appendChild(saleBanner);
        }
    });

    createDots(products.length);
    setupImageClickHandlers();
    initializeSliderControls();

    setTimeout(() => setupImageClickHandlers(), 100);

    window.addEventListener('resize', debounce(() => {
        initializeSliderControls();
    }, 250));
}

/**
 * Creates clickable navigation dots for the slider.
 *
 * @function createDots
 * @param {number} count - Number of slides/dots.
 */
function createDots(count) {
    const container = document.getElementById('carouselDots');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');

        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
        dot.setAttribute("tabindex", i === 0 ? "0" : "-1");

        dot.addEventListener('click', () => {
            document.querySelector('.slider-track').style.transform = `translateX(-${i * 33.3333}%)`;

            document.querySelectorAll('.carousel-dot')
                .forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });

        container.appendChild(dot);
    }
}

/**
 * Enables left/right arrow button slider navigation for desktop.
 *
 * @function initializeSlider
 */
function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const track = document.querySelector('.slider-track');
    const next = document.querySelector('.next-btn');
    const prev = document.querySelector('.prev-btn');

    let current = 0;


    /**
     * Moves slider to given index.
     *
     * @param {number} i - Slide index to show.
     */
    function showSlide(i) {
        track.style.transform = `translateX(-${i * 33.3333}%)`;
        updateActiveDot(i);
    }

    next?.addEventListener('click', () => {
        current = (current + 1) % slides.length;
        showSlide(current);
    });

    prev?.addEventListener('click', () => {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    });

    showSlide(0);
}

/**
 * Adds swipe gesture support for mobile devices.
 *
 * @function addTouchControls
 */
function addTouchControls() {
    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');

    let isDragging = false;
    let startX = 0;
    let current = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let startTime = 0;

    track.addEventListener('touchstart', dragStart, { passive: false });
    track.addEventListener('touchmove', dragMove, { passive: false });
    track.addEventListener('touchend', dragEnd);

     /**
     * Handles start of swipe interaction.
     *
     * @param {TouchEvent} e
     */
    function dragStart(e) {
        if (e.target.closest('.add-to-cart-btn')) return;
        if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-product-id')) return;

        isDragging = true;
        startX = e.touches[0].clientX;
        startTime = Date.now();
        track.style.transition = 'none';
    }

        /**
     * Handles dragging movement.
     *
     * @param {TouchEvent} e
     */
    function dragMove(e) {
        if (!isDragging) return;

        e.preventDefault();

        const diff = e.touches[0].clientX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

        /**
     * Handles swipe end and determines slide direction.
     *
     * @param {TouchEvent} e
     */
    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentTranslate - prevTranslate;

        // If small movement → let click happen
        if (Math.abs(diff) < 5) return;

        // Swipe detection
        if (diff < 0) current = Math.min(slides.length - 1, current + 1);
        else current = Math.max(0, current - 1);

        snap();
    }
 
    /**
     * Snaps slider to current index.
     */
    function snap() {
        const percentage = -(current * 33.3333);
        track.style.transition = 'transform 0.3s ease';
        track.style.transform = `translateX(${percentage}%)`;

        const slideWidth = track.offsetWidth / slides.length;
        prevTranslate = -(current * slideWidth);

        updateActiveDot(current);
    }

    snap();
}

/**
 * Determines which slider control mode to apply (desktop, mobile swipe, etc)
 * Also restores `_product` after cloning elements.
 *
 * @function initializeSliderControls
 */
function initializeSliderControls() {
    const track = document.querySelector('.slider-track');
    const controls = document.querySelector('.slider-controls');

    if (!track) return;

   // Clone AND restore _product on each slide
const newTrack = track.cloneNode(true);
const oldSlides = track.querySelectorAll('.slide');
const newSlides = newTrack.querySelectorAll('.slide');

newSlides.forEach((slide, i) => {
    slide._product = oldSlides[i]._product;   // << restore product reference
});

// Replace old track
track.parentNode.replaceChild(newTrack, track);


    if (window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints)) {
        if (controls) controls.style.display = 'none';
        addTouchControls();
    } else if (window.innerWidth <= 1024) {
        if (controls) controls.style.display = 'none';
        initializeSlider();
    } else {
        if (controls) controls.style.display = '';
        initializeSlider();
    }
}

/**
 * Updates visual state of navigation dots.
 *
 * @function updateActiveDot
 * @param {number} index - Active slide index.
 */
function updateActiveDot(index) {
    document.querySelectorAll('.carousel-dot')
        .forEach((dot, i) => dot.classList.toggle('active', i === index));
}

/**
 * Makes slider images clickable navigation to product page.
 *
 * @function setupImageClickHandlers
 */
function setupImageClickHandlers() {
    document.querySelectorAll('.slider-image[data-product-id]').forEach(img => {
        const newImg = img.cloneNode(true);
        img.replaceWith(newImg);

        const id = newImg.getAttribute('data-product-id');

        newImg.style.cursor = 'pointer';
        newImg.onclick = () => {
            window.location.href = `pages/productpage.html?id=${id}`;
        };
    });
}
/**
 * Returns a function that delays execution until after `delay` ms
 * have passed without new calls.
 *
 * @function debounce
 * @param {Function} fn - Function to call.
 * @param {number} delay - Milliseconds to wait.
 * @returns {Function}
 */
function debounce(fn, delay) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
    };
}

/**
 * Initializes slider on DOMContentLoaded.
 *
 * @event document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', createSliderWithAPIProducts);

