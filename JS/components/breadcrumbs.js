/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - The text shown in the breadcrumb.
 * @property {string} href - The link target for the breadcrumb segment.
 */

/**
 * Renders a dynamic breadcrumb navigation trail based on:
 * - Page path (e.g., "aboutus.html", "tos.html", etc.)
 * - URL query parameters (category, id)
 * - Custom pages (checkout, membership, admin)
 *
 * Automatically inserts the HTML into the #breadcrumb container.
 *
 * Behavior:
 * - Always includes a "Home" link
 * - Adds category if ?category= is present
 * - Adds product breadcrumb if ?id= is present
 * - Adds specific labels depending on which HTML page is loaded
 *
 * @returns {void}
 */
export function renderBreadcrumb() {
    const container = document.getElementById("breadcrumb");
    if (!container) return;

    const url = new URL(window.location.href);
    const path = url.pathname;
    const params = url.searchParams;

    /** @type {BreadcrumbItem[]} */
    let crumbs = [];

    // Always start with Home
    crumbs.push({ label: "Home", href: "../index.html" });

    // Category via query (?category=fashion)
    const category = params.get("category");
    if (category) {
        crumbs.push({
            label: capitalize(category),
            href: `../index.html?category=${category}`
        });
    }

    // Product page via ?id=
    const productId = params.get("id");
    if (productId) {
        crumbs.push({
            label: "Product",
            href: "#"
        });
    }

    // Membership page
    if (path.includes("newmemlogin.html")) {
        crumbs.push({
            label: "Become a Member",
            href: "#"
        });
    }

    // Checkout page
    if (path.includes("checkout")) {
        crumbs.push({
            label: "Checkout",
            href: "#"
        });
    }

    // Static pages
    if (path.includes("wcpreowned.html")) {
        crumbs.push({ label: "Why choose pre-owned?", href: "#" });
    }

    if (path.includes("privacypolicy.html")) {
        crumbs.push({ label: "Privacy Policy", href: "#" });
    }

    if (path.includes("tos.html")) {
        crumbs.push({ label: "Terms of Service", href: "#" });
    }

    if (path.includes("shippingpolicy.html")) {
        crumbs.push({ label: "Shipping Policy", href: "#" });
    }

    if (path.includes("faq.html")) {
        crumbs.push({ label: "FAQ", href: "#" });
    }

    if (path.includes("contactus.html")) {
        crumbs.push({ label: "Contact Us", href: "#" });
    }

    if (path.includes("aboutus.html")) {
        crumbs.push({ label: "About Us", href: "#" });
    }

    if (path.includes("admindashboard.html")) {
        crumbs.push({ label: "Admin Dashboard", href: "#" });
    }

    // Render breadcrumb trail
    container.innerHTML = crumbs
        .map((c, i) => {
            // Last item = current page (no href)
            if (i === crumbs.length - 1) {
                return `<span>${c.label}</span>`;
            }
            return `<a href="${c.href}">${c.label}</a><span>›</span>`;
        })
        .join("");
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} Capitalized string.
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
