import { updateLoginState } from './components/loginusermodal.js';


// PASSWORD VISIBILITY TOGGLE

function setupPasswordToggle() {
    const toggle = document.getElementById('passwordToggle');
    const input = document.getElementById('password');

    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        toggle.className = isHidden
            ? 'fa-solid fa-eye password-toggle'
            : 'fa-solid fa-eye-slash password-toggle';
    });
}

// HANDLE REGISTRATION

function showRegistrationError(message) {
    const box = document.getElementById("registrationError");
    if (!box) return;
    box.textContent = message;
    box.style.display = "block";
}


async function handleRegistration() {
    const registrationForm = document.getElementById('membershipForm');
    if (!registrationForm) return;

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const termsCheckbox = document.getElementById('checkbox');
    if (!termsCheckbox || !termsCheckbox.checked) {
        alert("You must agree to the Terms and Privacy Policy before signing up.");
        return; // STOP registration
    }

        const formData = new FormData(registrationForm);
        const firstname = formData.get('firstname').trim();
        const lastname = formData.get('lastname').trim();
        const email = formData.get('email').trim().toLowerCase();
        const password = formData.get('password');

        showRegistrationError(""); // Clear previous errors
        document.getElementById("registrationError").style.display = "none";

        if (!firstname || !lastname || !email || !password) {
            showRegistrationError("Please fill in all required fields.");
            return;
        }

        const cleanedName = `${firstname} ${lastname}`
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");

        if (cleanedName.length < 2 || cleanedName.length > 50) {
            showRegistrationError("Name must be between 2 and 50 characters.");
            return;
        }

        // REGISTER USER
 
        try {
            const registerResponse = await fetch(
                "https://v2.api.noroff.dev/auth/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: cleanedName, email, password })
                }
            );

            const registerData = await registerResponse.json();

                   if (registerData?.errors?.length > 0) {
                const apiMessage = registerData.errors[0].message;

                if (apiMessage.includes("Email already registered")) {
                    showRegistrationError(
                        "This email is already registered. Please log in instead."
                    );
                    return;
                }

                // General errors
                showRegistrationError(apiMessage || "Registration failed.");
                return;
            }

            if (!(registerResponse.ok && registerData.data)) {
                console.error("Registration error:", registerData);
                showRegistrationError("Registration failed. Please try again.");
                return;
            }

            alert("Registration successful! Logging you in...");
           
            // AUTO-LOGIN
       
            const loginResponse = await fetch(
                "https://v2.api.noroff.dev/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );

            const loginData = await loginResponse.json();

            if (!(loginResponse.ok && loginData.data)) {
                console.error("Auto-login failed:", loginData);
                alert("Registration successful! Please log in manually.");
                window.location.href = "../index.html";
                return;
            }

            const {
                accessToken,
                name: userName,
                email: userEmail
            } = loginData.data;

            const displayName =
                userName || cleanedName || userEmail.split("@")[0];

            // Save login state
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", displayName);
            localStorage.setItem("authToken", accessToken);
            localStorage.setItem("userEmail", userEmail);

            // Save profile for checkout autofill
            const userProfile = {
                firstname,
                lastname,
                email,
                phone: formData.get("phone"),
                address: formData.get("address"),
                city: formData.get("city"),
                zip: formData.get("zip"),
            };

            localStorage.setItem(
                "userProfile",
                JSON.stringify(userProfile)
            );

            updateLoginState(true, displayName);

            window.location.href = "../index.html";

        } catch (error) {
            console.error("Network error during registration:", error);
            showRegistrationError("Something went wrong. Please try again.");
        }
    });
}

// INIT PAGE

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggle();
    handleRegistration();
});

