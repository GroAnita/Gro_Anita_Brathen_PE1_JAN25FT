const hamburgerMenuIcon = document.getElementById('hamburgerMenuIcon');
const hamburgerMenuOverlay = document.getElementById('hamburgerMenu');
const closeHamburgerMenuBtn = document.getElementById('closeHamburgerMenu');

closeHamburgerMenuBtn.addEventListener('click', () => {
    hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
});

hamburgerMenuIcon.addEventListener('click', () => {
    hamburgerMenuOverlay.classList.add('show-hamburger-menu');
});


function closeHamburgerMenu() {
    hamburgerMenuOverlay.classList.remove('show-hamburger-menu');
}

function openHamburgerMenu() {
    hamburgerMenuOverlay.classList.add('show-hamburger-menu');
}

