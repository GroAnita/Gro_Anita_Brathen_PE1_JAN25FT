// Import login functions to auto-login after registration
import { updateLoginState } from './components/loginusermodal.js';

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

    // Handle registration form submission
    const registrationForm = document.getElementById('membershipForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(registrationForm);
            const firstname = formData.get('firstname').trim();
            const lastname = formData.get('lastname').trim();
            
            // Clean and format the name for API (replace spaces with underscores)
            const name = `${firstname} ${lastname}`
                .replace(/\s+/g, '_')  // Replace spaces with underscores
                .replace(/[^a-zA-Z0-9_]/g, ''); // Remove any other invalid characters
            const email = formData.get('email').trim().toLowerCase();
            const password = formData.get('password');
            
            // Basic validation
            if (!firstname || !lastname || !email || !password) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Name validation - ensure it's reasonable length and format
            if (name.length < 2 || name.length > 50) {
                alert('Name must be between 2 and 50 characters.');
                return;
            }
            
            // Log what we're sending for debugging
            console.log('Sending registration data:', { 
                name: name, 
                email: email, 
                passwordLength: password.length 
            });
            
            try {
                // Call registration API
                const registerResponse = await fetch('https://v2.api.noroff.dev/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                });

                const registerData = await registerResponse.json();

                if (registerResponse.ok && registerData.data) {
                    console.log('Registration successful:', registerData.data);
                    
                    // Show success message
                    alert('Registration successful! You will now be logged in.');
                    
                    // Auto-login after successful registration
                    try {
                        const loginResponse = await fetch('https://v2.api.noroff.dev/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        });

                        const loginData = await loginResponse.json();

                        if (loginResponse.ok && loginData.data) {
                            // Save login state and token
                            const { accessToken, name: userName, email: userEmail } = loginData.data;
                            const displayName = userName || name || userEmail.split('@')[0];
                            
                            localStorage.setItem('isLoggedIn', 'true');
                            localStorage.setItem('userName', displayName);
                            localStorage.setItem('authToken', accessToken);
                            localStorage.setItem('userEmail', userEmail);
                            
                            // Save user profile data for checkout auto-fill
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
                            
                            // Update UI to show logged in state
                            updateLoginState(true, displayName);
                            
                            // Redirect to home page
                            window.location.href = '../index.html';
                        } else {
                            // Registration succeeded but auto-login failed
                            alert('Registration successful! Please log in manually.');
                            window.location.href = '../index.html';
                        }
                    } catch (loginError) {
                        console.error('Auto-login failed:', loginError);
                        alert('Registration successful! Please log in manually.');
                        window.location.href = '../index.html';
                    }
                } else {
                    // Handle registration errors - show detailed error info
                    console.error('Registration failed:', registerData);
                    console.error('Full error details:', JSON.stringify(registerData, null, 2));
                    
                    if (registerData.errors && registerData.errors.length > 0) {
                        // Log each error for debugging
                        registerData.errors.forEach((error, index) => {
                            console.error(`Error ${index + 1}:`, error);
                        });
                        
                        // Show all error messages
                        const errorMessages = registerData.errors.map(error => {
                            if (typeof error === 'string') {
                                return error;
                            } else if (error.message) {
                                return `${error.path ? error.path.join('.') + ': ' : ''}${error.message}`;
                            } else {
                                return JSON.stringify(error);
                            }
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