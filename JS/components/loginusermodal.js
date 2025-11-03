const loginModalTemplate = `
    <div class="login-modal" id="loginModal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Login</h2>
            <form>
                <input type="email" placeholder="Email" required>
                <input type="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
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
    const closeBtn = modal.querySelector('.close-btn');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showLoginModal() {
    createLoginModal(); // Creates if doesn't exist
    document.getElementById('loginModal').style.display = 'block';
}