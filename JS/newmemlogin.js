document.addEventListener('DOMContentLoaded', () => {
            const passwordToggle = document.getElementById('passwordToggle');
            const passwordInput = document.getElementById('password');
            
            if (passwordToggle && passwordInput) {
                passwordToggle.addEventListener('click', () => {
                    // Toggle password visibility
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        passwordToggle.className = 'fa-solid fa-eye password-toggle';
                    } else {
                        passwordInput.type = 'password';
                        passwordToggle.className = 'fa-solid fa-eye-slash password-toggle';
                    }
                });
            }
        });