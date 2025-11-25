export function renderBreadcrumb() {
    const container = document.getElementById("breadcrumb");
    if (!container) return;

    const url = new URL(window.location.href);
    const path = url.pathname;
    const params = url.searchParams;
    let crumbs = [];

    // Always start with home
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

    // New membership page
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

     if (path.includes("wcpreowned.html")) {
        crumbs.push({
            label: "Why choose pre-owned?",
            href: "#"
        });
    }

     if (path.includes("privacypolicy.html")) {
        crumbs.push({
            label: "Privacy Policy",
            href: "#"
        });
    }

     if (path.includes("tos.html")) {
        crumbs.push({
            label: "Terms of Service",
            href: "#"
        });
    }

     if (path.includes("shippingpolicy.html")) {
        crumbs.push({
            label: "Shipping Policy",
            href: "#"
        });
    }

     if (path.includes("faq.html")) {
        crumbs.push({
            label: "FAQ",
            href: "#"
        });
    }

    container.innerHTML = crumbs
        .map((c, i) => {
            if (i === crumbs.length - 1) {
                return `<span>${c.label}</span>`;
            }
            return `<a href="${c.href}">${c.label}</a><span>›</span>`;
        })
        .join("");
}

// Capitalize helper
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
