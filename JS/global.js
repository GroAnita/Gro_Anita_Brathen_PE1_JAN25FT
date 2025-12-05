import { initSearchComponent } from './components/searchComponent.js';
import { backToTop, showToastMsg, initializeNewsletterForm } from './utils.js';
import { updateLoginState } from './components/loginusermodal.js';
import { renderBreadcrumb } from "./components/breadcrumbs.js";
import { proceedToCheckout } from './components/cart.js';

let globalProductsCache = [];
let searchInitialized = false;

/**
 * Loads product data from the API only once and saves the result
 * to prevent unnecessary repeated network requests.
 *
 * @async
 * @function loadProductsOnce
 * @returns {Promise<Array>} Returns a Promise that resolves to an array of product objects.
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
 * Initializes the global search bar component.
 * Makes sure that search is only initialized once per page load.
 *
 * @async
 * @function initGlobalSearch
 * @returns {Promise<void>}
 */
async function initGlobalSearch() {
    if (searchInitialized) return;

    const products = await loadProductsOnce();
    if (!products || products.length === 0) return;

    initSearchComponent(products);
    searchInitialized = true;
}

/**
 * Checks if user is logged in and updates the interface accordingly.
 * Checks localStorage for:
 * - isLoggedIn
 * - userName
 *
 * @function initLoginState
 * @returns {void}
 */
function initLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedName = localStorage.getItem('userName') || "";

    updateLoginState(isLoggedIn, savedName);
}

/**
 * Sets up UI features that appear on every page:
 * - Back-to-top button
 * - Newsletter form logic
 *
 * @function initUI
 * @returns {void}
 */
function initUI() {
    backToTop();
    initializeNewsletterForm();
}

/**
 * Main page initializer — runs all shared features once the page loads:
 * - Search
 * - Login UI
 * - UI elements
 * - Breadcrumb navigation
 *
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    await initGlobalSearch();
    initLoginState();
    initUI();
    renderBreadcrumb();
});

/**
 * Generates the HTML for a heart icon representing favoriting status.
 *
 * @function favoriteHeart
 * @param {string} productId - The ID of the product.
 * @returns {string} HTML string for the correct heart icon (solid or regular).
 */
export function favoriteHeart(productId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const html = `<i class="fa-${favorites.includes(productId) ? 'solid' : 'regular'} fa-heart product-favorite-icon" data-product-id="${productId}"></i>`;
    return html;
}

/**
 * Toggles the favorite state of a given product.
 * Updates both the UI (heart icon style) and localStorage.
 *
 * @function toggleFavorite
 * @param {string} productId - The ID of the product being toggled.
 * @param {HTMLElement} heartIcon - The heart icon element to visually update.
 * @returns {void}
 */
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

/**
 * Displays the login-or-guest modal during checkout.
 * Allows the user to:
 * - Log in before checkout
 * - Continue as a guest
 *
 * @function showCheckoutLoginModal
 * @returns {void}
 */
export function showCheckoutLoginModal() {
    const modal = document.getElementById('checkoutLoginModal');
    modal.style.display = 'flex';
    
    document.getElementById('loginBeforeCheckout').onclick = () => {
        modal.style.display = 'none';
        // Trigger existing login modal
        document.getElementById('loginModalTrigger').click();
    };
    
    document.getElementById('continueAsGuest').onclick = () => {
        modal.style.display = 'none';
        proceedToCheckout(); // Only redirect logic
    };
}
