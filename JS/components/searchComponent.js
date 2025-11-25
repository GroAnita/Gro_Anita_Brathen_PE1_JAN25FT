// JS/components/searchComponent.js

export function initSearchComponent(allProducts) {
    if (document.querySelector('[data-component="header-search"]')) {
        console.warn("SearchComponent: already initialized, skipping.");
        return;
    }
    
    let container = document.querySelector(".header-topbar .header-content__nav__right");

    if (!container) {
        container = document.getElementById("globalSearchMount");
       
        return;
    }

    container.insertAdjacentHTML(
        "afterbegin",
        `
        <div class="search-wrapper-area" data-component="header-search">
            <div class="search-wrapper">
                
                <!-- Desktop search -->
                <div class="desktop-search-bar">
                    <input 
                        type="text" 
                        id="searchInputDesktop" 
                        placeholder="Search products..." 
                        aria-label="Search products">
                    <i class="fas fa-search desktop-search-icon"></i>
                    <div id="searchResultsDesktop" class="search-results"></div>
                </div>

                <!-- Mobile search icon -->
                <i 
                    id="mobileSearchIcon" 
                    class="fas fa-search mobile-search-icon" 
                    aria-label="Open search" 
                    role="button"
                    tabindex="0">
                </i>

                <!-- Mobile search dropdown -->
                <div id="mobileSearchBar" class="mobile-search-bar">
                    <input 
                        type="text" 
                        id="searchInputMobile" 
                        placeholder="Search products..." 
                        aria-label="Search products">
                    <i class="fas fa-search search-icon"></i>
                    <div id="searchResultsMobile" class="search-results"></div>
                </div>
            </div>
        </div>
        `
    );

    // Helper: correct URL no matter what page we’re on
    function productURL(id) {
        const inPages = window.location.pathname.includes("/pages/");
        return inPages ? `productpage.html?id=${id}` : `pages/productpage.html?id=${id}`;
    }

    function attachSearch(inputId, resultsId) {
        const inputEl = document.getElementById(inputId);
        const resultsEl = document.getElementById(resultsId);

        if (!inputEl || !resultsEl) return;

        inputEl.addEventListener("input", () => {
            const query = inputEl.value.toLowerCase().trim();

            if (!query) {
                resultsEl.style.display = "none";
                resultsEl.innerHTML = "";
                return;
            }

            const matches = allProducts.filter(p =>
                p.title.toLowerCase().includes(query)
            );

            if (matches.length === 0) {
                resultsEl.style.display = "none";
                resultsEl.innerHTML = "";
                return;
            }

            resultsEl.innerHTML = matches
                .map(
                    p => `
                    <div class="search-result-item" data-id="${p.id}">
                        <img src="${p.image.url}" alt="${p.title}">
                        <div class="search-result-text">
                            <span class="search-result-title">${p.title}</span>
                        </div>
                    </div>
                `
                )
                .join("");

            resultsEl.style.display = "block";
        });

        // Single delegated click handler per results box
        resultsEl.addEventListener("click", (event) => {
            const item = event.target.closest(".search-result-item");
            if (!item) return;
            const id = item.dataset.id;
            window.location.href = productURL(id);
        });
    }

    // Attach desktop + mobile search
    attachSearch("searchInputDesktop", "searchResultsDesktop");
    attachSearch("searchInputMobile", "searchResultsMobile");

    // Mobile toggle
    const mobileIcon = document.getElementById("mobileSearchIcon");
    const mobileBar = document.getElementById("mobileSearchBar");

    if (mobileIcon && mobileBar) {
        const toggle = () => {
            mobileBar.classList.toggle("is-open");
        };

        mobileIcon.addEventListener("click", toggle);
        mobileIcon.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }
        });

        // Optional: close when clicking outside
        document.addEventListener("click", (e) => {
            if (!mobileBar.contains(e.target) && e.target !== mobileIcon) {
                mobileBar.classList.remove("is-open");
            }
        });
    }
}
