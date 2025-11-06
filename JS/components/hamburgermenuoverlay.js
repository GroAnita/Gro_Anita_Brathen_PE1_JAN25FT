document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenuIcon = document.getElementById('hamburgerMenuIcon');
    const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
    const hamburgerOverlay = document.getElementById('hamburgerOverlay');
    const closeHamburgerMenuBtn = document.getElementById('closeHamburgerMenu');
    
    if (!hamburgerMenuIcon) {
        return;
    }
    
    hamburgerMenuIcon.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (hamburgerMenuOverlay) {
            hamburgerMenuOverlay.classList.add('show-hamburger-menu');
        }
        
        if (hamburgerOverlay) {
            hamburgerOverlay.classList.add('show');
        }
    });

    // Add event listener to close button
    if (closeHamburgerMenuBtn) {
        closeHamburgerMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (hamburgerMenuOverlay) {
                hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
            }
            
            if (hamburgerOverlay) {
                hamburgerOverlay.classList.remove('show');
            }
        });
    }
    
    // Close hamburger menu when clicking outside
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

const menuLinks = document.querySelectorAll('.hamburger-menu__links a');
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
        const hamburgerOverlay = document.getElementById('hamburgerOverlay');
        
        // Close the menu when any link is clicked
        hamburgerMenuOverlay?.classList.remove('show-hamburger-menu');
        hamburgerOverlay?.classList.remove('show');
    });
});