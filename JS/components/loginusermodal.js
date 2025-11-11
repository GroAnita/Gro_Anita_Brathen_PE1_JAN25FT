import memberLoginModal from "../utils.js";

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

function createLoginModal() {
    // Checking if modal already should exist
    if (document.getElementById('loginModal')) return;
    
    // Create and append the modal<
    document.body.insertAdjacentHTML('beforeend', loginModalTemplate);
    
    // Adding event listeners
    setupLoginModalEventListeners();
}

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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = modal.querySelector('#email').value;
            const password = modal.querySelector('#password').value;
            
            // Add your login logic here
            console.log('Login attempt:', { email, password });
            
            // Close modal after login attempt
            modal.style.display = 'none';
        });
    }
}

function showLoginModal() {
    createLoginModal(); // Creates if doesn't exist
    document.getElementById('loginModal').style.display = 'block';
}


const loginIcon = document.querySelector('.fas.fa-user');
if (loginIcon) {
    loginIcon.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });
}

export { showLoginModal, loginIcon };

