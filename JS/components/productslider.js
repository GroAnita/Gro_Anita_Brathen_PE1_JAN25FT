
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
    
    

    initializeSlider();
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

document.addEventListener('DOMContentLoaded', () => {
    createSliderWithAPIProducts();
});

