// Import login functions to auto-login after registration
import { updateLoginState } from './components/loginusermodal.js';
import { initSearchComponent } from './components/searchComponent.js';

let allProducts = [];

async function fetchAllProducts() {
    try {
        const response = await fetch("https://v2.api.noroff.dev/online-shop");
        const data = await response.json();
        allProducts = data.data;
    } catch (error) {
        console.error("Search component: failed to fetch products", error);
    }
}

/**
 * Initializes event listeners and handles registration logic.
 * Sets up password visibility toggle and form submission.
 */
document.addEventListener('DOMContentLoaded', async () => {

    await fetchAllProducts();
    if (allProducts.length > 0) {
        initSearchComponent(allProducts);
    }
    
    /** @type {HTMLButtonElement|null} */
    const passwordToggle = document.getElementById('passwordToggle');
    /** @type {HTMLInputElement|null} */
    const passwordInput = document.getElementById('password');

    if (passwordToggle && passwordInput) {
        /**
         * Toggles password visibility on the registration form.
         * Switches between password and text input types.
         */
        passwordToggle.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordToggle.className = 'fa-solid fa-eye password-toggle';
            } else {
                passwordInput.type = 'password';
                passwordToggle.className = 'fa-solid fa-eye-slash password-toggle';
            }
        });
    }

    /** @type {HTMLFormElement|null} */
    const registrationForm = document.getElementById('membershipForm');

    if (registrationForm) {
        /**
         * Handles registration form submission.
         * Validates input, sends registration API request,
         * automatically logs user in after successful registration.
         *
         * @param {SubmitEvent} e - The form submission event.
         */
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(registrationForm);
            const firstname = formData.get('firstname').trim();
            const lastname = formData.get('lastname').trim();

            /**
             * Cleaned and formatted name for API.
             * @type {string}
             */
            const name = `${firstname} ${lastname}`
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '');

            const email = formData.get('email').trim().toLowerCase();
            const password = formData.get('password');

            // Basic validation
            if (!firstname || !lastname || !email || !password) {
                alert('Please fill in all required fields.');
                return;
            }

            if (name.length < 2 || name.length > 50) {
                alert('Name must be between 2 and 50 characters.');
                return;
            }

            console.log('Sending registration data:', {
                name: name,
                email: email,
                passwordLength: password.length
            });

            try {
                /**
                 * Sends registration request to API.
                 * @type {Response}
                 */
                const registerResponse = await fetch('https://v2.api.noroff.dev/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const registerData = await registerResponse.json();

                if (registerResponse.ok && registerData.data) {
                    console.log('Registration successful:', registerData.data);
                    alert('Registration successful! You will now be logged in.');

                    try {
                        /**
                         * Logs the user in after successful registration.
                         * @type {Response}
                         */
                        const loginResponse = await fetch('https://v2.api.noroff.dev/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });

                        const loginData = await loginResponse.json();

                        if (loginResponse.ok && loginData.data) {
                            const { accessToken, name: userName, email: userEmail } = loginData.data;
                            const displayName = userName || name || userEmail.split('@')[0];

                            // Save login state
                            localStorage.setItem('isLoggedIn', 'true');
                            localStorage.setItem('userName', displayName);
                            localStorage.setItem('authToken', accessToken);
                            localStorage.setItem('userEmail', userEmail);

                            /**
                             * Saves profile info locally for autofill.
                             * @type {Object}
                             */
                            const userProfile = {
                                firstname: firstname,
                                lastname: lastname,
                                email: email,
                                phone: formData.get('phone'),
                                address: formData.get('address'),
                                city: formData.get('city'),
                                zip: formData.get('zip')
                            };

                            localStorage.setItem('userProfile', JSON.stringify(userProfile));

                            updateLoginState(true, displayName);
                            window.location.href = '../index.html';
                        } else {
                            alert('Registration successful! Please log in manually.');
                            window.location.href = '../index.html';
                        }
                    } catch (loginError) {
                        console.error('Auto-login failed:', loginError);
                        alert('Registration successful! Please log in manually.');
                        window.location.href = '../index.html';
                    }
                } else {
                    console.error('Registration failed:', registerData);

                    if (registerData.errors?.length > 0) {
                        const errorMessages = registerData.errors.map(error => {
                            if (typeof error === 'string') return error;
                            if (error.message) return `${error.path ? error.path.join('.') + ': ' : ''}${error.message}`;
                            return JSON.stringify(error);
                        }).join('\n');

                        alert(`Registration failed:\n${errorMessages}`);
                    } else {
                        alert(`Registration failed: ${registerData.status || 'Unknown error'}`);
                    }
                }
            } catch (error) {
                console.error('Registration network error:', error);
                alert('Registration failed. Please check your connection and try again.');
            }
        });
    }
});
