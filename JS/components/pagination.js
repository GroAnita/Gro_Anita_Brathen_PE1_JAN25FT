const paginationContainer = document.getElementById('paginationContainer');
let currentPage = 1;
const productsPerPage = 12;

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
        });

        paginationContainer.appendChild(pageButton);
    }
}

export function getPaginatedProducts(products) {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
}

export function resetPagination() {
    currentPage = 1;
}   