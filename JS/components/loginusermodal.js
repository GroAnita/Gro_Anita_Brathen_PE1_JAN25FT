import memberLoginModal from "../utils.js";

/**
 * HTML template for the login modal.
 * Injected into the DOM when the modal is created.
 * @type {string}
 */
const loginModalTemplate = `
    <div class="login-modal" id="loginModal" style="display: none;">
        <div class="modal-content">
            <span class="close-btn" id="closeLoginModal">&times;</span>
            <i class="fa-regular fa-user"></i>
            <form id="loginForm">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit" class="main-btn">Login</button>
            </form>
            <p><a href="#" id="forgotPasswordLink">Forgot Password?</a></p>
            <p><a href="../pages/newmemlogin.html" id="registerLink">Want to become a member?</a></p>
        </div>
    </div>
`;

/**
 * Creates the login modal and appends it to the DOM if it does not already exist.
 */
function createLoginModal() {
    // Checking if modal already should exist
    if (document.getElementById('loginModal')) return;
    
    // Create and append the modal<
    document.body.insertAdjacentHTML('beforeend', loginModalTemplate);
    
    // Adding event listeners
    setupLoginModalEventListeners();
}

/**
 * Assigns event listeners to login modal elements:
 * - Close button
 * - Outside click closing
 * - Form submission (login API)
 */
function setupLoginModalEventListeners() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    const loginForm = modal.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = modal.querySelector('#email').value;
            const password = modal.querySelector('#password').value;
            
            // Real API login call
            try {
                const loginData = await fetch('https://v2.api.noroff.dev/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const response = await loginData.json();

                if (loginData.ok && response.data) {
                    // Extract user info and token from API response
                    const { accessToken, name, email: userEmail } = response.data;
                    const userName = name || userEmail.split('@')[0];
                    
                    // Save login state and token to localStorage
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', userName);
                    localStorage.setItem('authToken', accessToken);
                    localStorage.setItem('userEmail', userEmail);
                    
                    // Update UI to show logged in state
                    updateLoginState(true, userName);
                    
                    console.log('Login successful:', { userName, email: userEmail });
                } else {
                    // Handle login error
                    const errorMessage = response.errors?.[0]?.message || 'Login failed. Please check your credentials.';
                    alert(errorMessage);
                    return;
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
                return;
            }
            
            // Close modal after successful login
            modal.style.display = 'none';
        });
    }
}

/**
 * Opens the login modal. Creates the modal if it does not exist.
 */
function showLoginModal() {
    createLoginModal(); // Creates if doesn't exist
    document.getElementById('loginModal').style.display = 'block';
}

/**
 * Updates the UI depending on login status.
 *
 * @param {boolean} isLoggedIn - Whether the user is logged in.
 * @param {string} [userName=''] - The user’s name to display in the UI.
 */
function updateLoginState(isLoggedIn, userName = '') {
    const headerUserIcon = document.querySelector('.header-content__nav__right .fas.fa-user');
    const loginTriggers = document.querySelectorAll('#loginModalTrigger');
    
    if (isLoggedIn) {
        // Update header icon - change to green and different icon
        if (headerUserIcon) {
            headerUserIcon.className = 'fas fa-user-check';
            headerUserIcon.style.color = '#04C721'; 
            headerUserIcon.style.cursor = 'pointer';
            
            // Adds click handler for logout
            headerUserIcon.replaceWith(headerUserIcon.cloneNode(true)); // Remove the old listeners
            const newIcon = document.querySelector('.header-content__nav__right .fas.fa-user-check');
            if (newIcon) {
                newIcon.addEventListener('click', showLogoutOptions);
            }
        }
        
        // Update hamburger menu text
        loginTriggers.forEach(trigger => {
            trigger.innerHTML = `<i class="fa-solid fa-user-check" style="color: #04C721;"></i> Welcome, ${userName}!`;
            trigger.removeEventListener('click', showLoginModal);
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                showLogoutOptions();
            });
        });
    } else {
        // Reset to logged out state
        if (headerUserIcon) {
            headerUserIcon.className = 'fas fa-user';
            headerUserIcon.style.color = '';
            headerUserIcon.style.cursor = '';
            
            // Add click handler for login
            headerUserIcon.replaceWith(headerUserIcon.cloneNode(true));
            const newIcon = document.querySelector('.header-content__nav__right .fas.fa-user');
            if (newIcon) {
                newIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    showLoginModal();
                });
            }
        }
        
        // Reset hamburger menu text
        loginTriggers.forEach(trigger => {
            trigger.innerHTML = `<i class="fa-regular fa-user"></i> Member Login`;
            trigger.removeEventListener('click', showLogoutOptions);
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginModal();
            });
        });
    }
}

/**
 * Opens a confirmation dialog asking the user if they want to log out.
 * Calls `logout()` if confirmed.
 */
function showLogoutOptions() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        logout();
    }
}

/**
 * Logs out the user by removing saved session data and updating the UI.
 */
function logout() {
    // Clear all login data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfile'); 
    
    // Update UI to be the logged out state
    updateLoginState(false);
    
    console.log('User logged out');
}

/**
 * Checks localStorage to determine if the user is logged in and restores UI state if so.
 */
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || '';
    
    if (isLoggedIn && userName) {
        updateLoginState(true, userName);
    }
}


// Initialize login state on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    
    // Sets up initial login handlers if not logged in
    const loginIcon = document.querySelector('.fas.fa-user');
    if (loginIcon && localStorage.getItem('isLoggedIn') !== 'true') {
        loginIcon.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    // Sets up hamburger menu login triggers
    const loginTriggers = document.querySelectorAll('#loginModalTrigger, #loginModalTriggerHeader');
    loginTriggers.forEach(trigger => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginModal();
            });
        }
    });
});

export { showLoginModal, updateLoginState, logout, checkLoginState };

