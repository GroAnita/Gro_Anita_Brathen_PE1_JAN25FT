import { updateLoginState } from './components/loginusermodal.js';
import { 
    normalizePhone,
    isValidEmail,
    isValidNorwegianPhone,
    isValidPostcode,
    isNonEmpty,
    attachInputIconValidation,
    setupPasswordRequirementsValidation
} from './components/formValidation.js';

/* PASSWORD VISIBILITY TOGGLE */

/**
 * Enables toggling the password visibility in <input type="password"> fields.
 * Changes between text/password and updates the eye icon.
 *
 * @returns {void}
 */
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

/* REGISTRATION HANDLER */

/**
 * Displays an error message in the registration error box.
 *
 * @param {string} message - Message to display.
 * @returns {void}
 */
function showRegistrationError(message) {
    const box = document.getElementById("registrationError");
    if (!box) return;
    box.textContent = message;
    box.style.display = "block";
}

/**
 * Handles the form submission for user registration:
 * - Validates all required fields
 * - Validates the email format
 * - Validates the phone number format
 * - Validates the zip/post code format
 * - Registers user with API
 * - Logs in automatically on success
 * - Saves the user profile to localStorage
 *
 * @returns {void}
 */
async function handleRegistration() {
    const registrationForm = document.getElementById('membershipForm');
    if (!registrationForm) return;

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Terms of service checkbox 
        const termsCheckbox = document.getElementById('checkbox');
        if (!termsCheckbox || !termsCheckbox.checked) {
            alert("You must agree to the Terms and Privacy Policy before signing up.");
            return;
        }

        const formData = new FormData(registrationForm);
        const dob = formData.get('dob')?.trim() || "";
        const firstname = formData.get('firstname').trim();
        const lastname = formData.get('lastname').trim();
        const address = formData.get('address')?.trim() || "";
        const zip = formData.get('zip')?.trim() || "";
        const city = formData.get('city')?.trim() || "";
        const username = formData.get('username')?.trim() || "";
        const email = formData.get('email').trim().toLowerCase();
        const password = formData.get('password');
        const phoneRaw = formData.get("phone")?.trim() || "";

        // Clear the old errors
        showRegistrationError("");
        const errorBox = document.getElementById("registrationError");
        if (errorBox) errorBox.style.display = "none";

        // Basic required fields
        if (!dob || !firstname || !lastname || !address || !zip || !city || !username || !email || !password || !phoneRaw) {
            showRegistrationError("Please fill in all required fields.");
            return;
        }

        // Name cleaning and combining name
        const cleanedName = `${firstname} ${lastname}`
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");

        if (cleanedName.length < 2 || cleanedName.length > 50) {
            showRegistrationError("Name must be between 2 and 50 characters.");
            return;
        }

        // EMAIL VALIDATION
        if (!isValidEmail(email)) {
            showRegistrationError("Please enter a valid email address (e.g. name@example.com).");
            return;
        }

        // PHONE VALIDATION
        if (!isValidNorwegianPhone(phoneRaw)) {
            showRegistrationError("Please enter a valid Norwegian phone number (8 digits).");
            return;
        }

        // POSTCODE VALIDATION
        if (!isValidPostcode(zip)) {
            showRegistrationError("Please enter a valid zip code (4 digits).");
            return;
        }

        // REGISTER USER with cleanedName due to API restrictions
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

            // API error handling
            if (registerData?.errors?.length > 0) {
                const apiMessage = registerData.errors[0].message;

                if (apiMessage.includes("Email already registered")) {
                    showRegistrationError(
                        "This email is already registered. Please log in instead."
                    );
                    return;
                }

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

            const { accessToken, name: userName, email: userEmail } = loginData.data;

            const displayName =
                userName || cleanedName || userEmail.split("@")[0];

            // Saves login state
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", displayName);
            localStorage.setItem("authToken", accessToken);
            localStorage.setItem("userEmail", userEmail);

            // Saves profile for checkout autofill
            const userProfile = {
                dob,
                firstname,
                lastname,
                username,
                email,
                phone: normalizePhone(phoneRaw) || phoneRaw,
                address,
                city,
                zip,
            };

            localStorage.setItem("userProfile", JSON.stringify(userProfile));

            updateLoginState(true, displayName);

            window.location.href = "../index.html";

        } catch (error) {
            console.error("Network error during registration:", error);
            showRegistrationError("Something went wrong. Please try again.");
        }
    });
}





/* 
   PAGE INITIALIZING
*/

/**
 * Initializes all interactive features on my membership page:
 * - Password toggle
 * - Registration handler
 * - Live validation + icons for all inputs
 * - Live password requirement feedback
 *
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggle();
    handleRegistration();

    /* INPUT ICONS */

    // Simple "has content" fields
    attachInputIconValidation("dob", isNonEmpty);
    attachInputIconValidation("firstname", isNonEmpty);
    attachInputIconValidation("lastname", isNonEmpty);
    attachInputIconValidation("address", isNonEmpty);
    attachInputIconValidation("city", isNonEmpty);
    attachInputIconValidation("username", isNonEmpty);

    // Specially validated fields
    attachInputIconValidation("email", isValidEmail);
    attachInputIconValidation("phone", isValidNorwegianPhone);
    attachInputIconValidation("zip", isValidPostcode);

    /* PASSWORD REQUIREMENTS */
    setupPasswordRequirementsValidation("password", "passwordRequirements");
});
