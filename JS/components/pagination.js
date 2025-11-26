
/**
 * The pagination container element in the DOM.
 * @type {HTMLElement|null}
 */
const paginationContainer = document.getElementById('paginationContainer');
/**
 * Tracks the current active page number.
 * @type {number}
 */
let currentPage = 1;
/**
 * Number of products shown per page.
 * @type {number}
 */
const productsPerPage = 12;

/**
 * Creates pagination buttons and attaches click behavior.
 *
 * @param {number} totalProducts - Total number of products available.
 * @param {function(number):void} onPageChange - Callback executed when a page button is clicked.  
 * Receives the new page number as an argument.
 */
export function setupPagination(totalProducts, onPageChange) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-button';
        pageButton.innerText = i;

        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;
            document.querySelectorAll('.pagination-button').forEach(btn => btn.classList.remove('active'));
            pageButton.classList.add('active');
            onPageChange(currentPage);

            const productContainer = document.querySelector('#products-container');
    if (productContainer) {
        productContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
        });

        paginationContainer.appendChild(pageButton);
    }
}

/**
 * Returns a slice of products for the currently active page.
 *
 * @param {Array<Object>} products - The complete list of product objects.
 * @returns {Array<Object>} A subset of products belonging to the current page.
 */
export function getPaginatedProducts(products) {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
}

/**s
 * Resets pagination to the first page.
 */
export function resetPagination() {
    currentPage = 1;
}   