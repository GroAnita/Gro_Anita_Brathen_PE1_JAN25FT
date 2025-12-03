

import { initSearchComponent } from './components/searchComponent.js';
import { backToTop, showToastMsg, initializeNewsletterForm } from './utils.js';
import { updateLoginState } from './components/loginusermodal.js';
import { renderBreadcrumb } from "./components/breadcrumbs.js";


let globalProductsCache = [];
let searchInitialized = false;

/**
 * Fetch products ONE TIME and cache them
 */
async function loadProductsOnce() {
    if (globalProductsCache.length > 0) {
        return globalProductsCache; // already loaded
    }

    try {
        const response = await fetch("https://v2.api.noroff.dev/online-shop");
        const data = await response.json();
        globalProductsCache = data.data;
    } catch (error) {
        console.error("Global.js: Failed loading products", error);
    }

    return globalProductsCache;
}

/**
 * Initialize the global search bar
 */
async function initGlobalSearch() {
    if (searchInitialized) return;

    const products = await loadProductsOnce();
    if (!products || products.length === 0) return;

    initSearchComponent(products);
    searchInitialized = true;
}

/**
 * Restore login state across pages
 */
function initLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedName = localStorage.getItem('userName') || "";

    updateLoginState(isLoggedIn, savedName);
}

/**
 * Initialize common UI components across all pages
 */
function initUI() {
    backToTop();
    initializeNewsletterForm();
}

/**
 * GLOBAL ENTRY POINT
 */
document.addEventListener("DOMContentLoaded", async () => {
    await initGlobalSearch();
    initLoginState();
    initUI();
    renderBreadcrumb();
});

export function favoriteHeart(productId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const html = `<i class="fa-${favorites.includes(productId) ? 'solid' : 'regular'} fa-heart product-favorite-icon" data-product-id="${productId}"></i>`;
    return html;
}

export function toggleFavorite(productId, heartIcon) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        heartIcon.classList.remove('fa-solid');
        heartIcon.classList.add('fa-regular');
    } else {
        favorites.push(productId);
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa-solid');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}