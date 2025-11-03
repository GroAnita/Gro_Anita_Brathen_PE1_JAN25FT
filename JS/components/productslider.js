/*const slides = document.querySelectorAll('.slide');
const nextButton = document.querySelector('.slider-controls .next-btn');
const prevButton = document.querySelector('.slider-controls .prev-btn');
let currentSlide = 0;


function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
}
nextButton?.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
});
prevButton?.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
});
// Initialize the slider by showing the first slide
showSlide(currentSlide);*/

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
    const sliderContainer = document.querySelector('.slider-container');
    
    // Clear existing slides
    sliderContainer.innerHTML = '';
    
    products.forEach((product, index) => {
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';
        
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
        
        sliderContainer.appendChild(slide);
        
        // Make the image clickable to go to product page
        const productImage = slide.querySelector('img');
        productImage.addEventListener('click', () => {
            // sending the product ID to the product page
            window.location.href = `pages/productpage.html?id=${product.id}`;
        });
    });
    
    // Add slider controls
    sliderContainer.innerHTML += `
        <div class="slider-controls">
            <button class="prev-btn">❮</button>
            <button class="next-btn">❯</button>
        </div>
    `;
    
    // Reinitialize slider functionality
    initializeSlider();
}

async function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const nextButton = document.querySelector('.slider-controls .next-btn');
    const prevButton = document.querySelector('.slider-controls .prev-btn');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    nextButton?.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    });

    prevButton?.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createSliderWithAPIProducts();
});

