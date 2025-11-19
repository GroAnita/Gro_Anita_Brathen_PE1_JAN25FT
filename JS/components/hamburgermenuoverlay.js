/**
 * @typedef {Object} HamburgerMenuElements
 * @property {HTMLElement|null} hamburgerMenuIcon - The button that opens the hamburger menu.
 * @property {HTMLElement|null} hamburgerMenuOverlay - The slide-in menu container.
 * @property {HTMLElement|null} hamburgerOverlay - The dark overlay behind the menu.
 * @property {HTMLElement|null} closeHamburgerMenuBtn - The X/close icon inside the menu.
 */

/**
 * Initializes the hamburger menu functionality.
 * Handles:
 * - Opening the menu when the hamburger icon is clicked
 * - Closing the menu when clicking the close button
 * - Closing the menu when clicking outside the menu
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenuIcon = document.getElementById('hamburgerMenuIcon');
    const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
    const hamburgerOverlay = document.getElementById('hamburgerOverlay');
    const closeHamburgerMenuBtn = document.getElementById('closeHamburgerMenu');

    /** Handles closing the hamburgermenu when Escape key is pressed */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburgerMenuOverlay?.classList.contains('show-hamburger-menu')) {
            hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
            hamburgerOverlay?.classList.remove('show');
        }
    });

    if (!hamburgerMenuIcon) {
        return;
    }
    
      /**
     * Opens the hamburger menu and dark overlay.
     * @param {MouseEvent} e 
     */
    hamburgerMenuIcon.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (hamburgerMenuOverlay) {
            hamburgerMenuOverlay.classList.add('show-hamburger-menu');
            hamburgerMenuOverlay.setAttribute('aria-hidden', 'false');
        }
        
        if (hamburgerOverlay) {
            hamburgerOverlay.classList.add('show');
        }
    });

     /**
     * Closes the hamburger menu when close button is clicked.
     * @param {MouseEvent} e 
     */
    if (closeHamburgerMenuBtn) {
        closeHamburgerMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (hamburgerMenuOverlay) {
                hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
                hamburgerMenuOverlay.setAttribute('aria-hidden', 'true');
            }
            
            if (hamburgerOverlay) {
                hamburgerOverlay.classList.remove('show');
            }

            if (hamburgerMenuIcon) {
                hamburgerMenuIcon.focus();
            }
        });
    }
    
    /**
     * Closes the menu when clicking outside of it.
     * @param {MouseEvent} event
     */
    document.addEventListener('click', (event) => {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const hamburgerIcon = document.getElementById('hamburgerMenuIcon');
        
        // Check if menu is open and click is outside menu and not on the icon
        if (hamburgerMenu && hamburgerMenu.classList.contains('show-hamburger-menu')) {
            if (!hamburgerMenu.contains(event.target) && !hamburgerIcon.contains(event.target)) {
                hamburgerMenu.classList.remove('show-hamburger-menu');
                if (hamburgerOverlay) {
                    hamburgerOverlay.classList.remove('show');
                }
            }
        }
    });
});

/**
 * Closes the hamburger menu when a navigation link is clicked.
 * Exception: `#loginModalTrigger` does not close the menu because it opens a modal.
 */
const menuLinks = document.querySelectorAll('.hamburger-menu__links a');
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Don't close menu for login modal trigger - let it handle itself
        if (link.id === 'loginModalTrigger') {
            return;
        }
        
        const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
        const hamburgerOverlay = document.getElementById('hamburgerOverlay');
        
        // Close the menu when any link is clicked (except login)
        hamburgerMenuOverlay?.classList.remove('show-hamburger-menu');
        hamburgerOverlay?.classList.remove('show');
    });
});

function trapFocus(container)   {
    const focusableSelectors = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';

    const focusable = Array.from(container.querySelectorAll(focusableSelectors));
    const firstFocusable = focusable[0];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    container.addEventListener('keydown',  (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }       
        }
    });
}