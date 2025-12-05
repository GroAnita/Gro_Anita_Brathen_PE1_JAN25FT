/* 
   SHARED FORM VALIDATION MODULE
   Reusable validation functions for forms across the site
*/

/* 
   VALIDATION HELPER FUNCTIONS
*/

/**
 * Removes spaces and hyphens from a phone number.
 * @param {string} phone - Raw phone input from the form.
 * @returns {string} Normalized phone number containing only digits.
 */
export function normalizePhone(phone) {
    if (!phone) return "";
    return phone.replace(/[\s-]/g, "");
}

/**
 * Validates the format of an email using regex and extra rules.
 * More strict than only html validation.
 * @param {string} email - The email value to validate.
 * @returns {boolean} True if email format is valid.
 */
export function isValidEmail(email) {
    if (!email) return false;

    const trimmed = email.trim().toLowerCase();

    // Basic pattern: x@x.xx
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!pattern.test(trimmed)) return false;

    // Prevent double dots
    if (trimmed.includes("..")) return false;

    // Local part cannot start or end with dot
    const [localPart] = trimmed.split("@");
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;

    return true;
}

/**
 * Validates a Norwegian phone number:
 * Must contain exactly 8 digits after removing spaces/hyphens.
 *
 * @param {string} phone - The phone number entered by the user.
 * @returns {boolean} True if phone number is a valid Norwegian number.
 */
export function isValidNorwegianPhone(phone) {
    const normalized = normalizePhone(phone);
    const pattern = /^[0-9]{8}$/;
    return pattern.test(normalized);
}

/**
 * Validates a postcode/zip:
 * For Norway: exactly 4 digits.
 *
 * @param {string} zip - The zip/postcode value.
 * @returns {boolean} True if zip is 4 digits.
 */
export function isValidPostcode(zip) {
    if (!zip) return false;
    return /^[0-9]{4}$/.test(zip.trim());
}

/**
 * Simple non-empty validator.
 *
 * @param {string} value - Field value.
 * @returns {boolean} True if value is not just whitespace.
 */
export function isNonEmpty(value) {
    return value.trim().length > 0;
}

/* 
   PASSWORD RULE FEEDBACK
*/

/**
 * Adds or removes .valid / .invalid classes from password rules.
 *
 * @param {HTMLElement} element - The <li> element representing a rule.
 * @param {boolean} isValid - Whether the rule is met.
 * @returns {void}
 */
export function toggleRule(element, isValid) {
    if (!element) return;
    element.classList.toggle("valid", isValid);
    element.classList.toggle("invalid", !isValid);
}

/* 
   INPUT ICON VALIDATION
*/

/**
 * Attaches live validation and checkmark or x icon updates to an input field.
 * - For simple fields: mark as valid when non-empty.
 * - For special fields: pass a custom validator function.
 *
 * @param {string} inputId - The ID of the <input> element.
 * @param {(value: string) => boolean} [validatorFn] - Optional custom validator.
 * @returns {void}
 */
export function attachInputIconValidation(inputId, validatorFn = isNonEmpty) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const container = input.closest(".input-with-icon");
    if (!container) return;

    const check = container.querySelector(".icon-valid");
    const invalid = container.querySelector(".icon-invalid");

    if (!check || !invalid) return;

    input.addEventListener("input", () => {
        const value = input.value;

        const isValid = validatorFn(value);

        if (isValid) {
            check.classList.add("visible");
            check.classList.remove("hidden");

            invalid.classList.add("hidden");
            invalid.classList.remove("visible");
        } else if (value.trim().length > 0) {
            // Something typed, but validator says invalid
            invalid.classList.add("visible");
            invalid.classList.remove("hidden");

            check.classList.add("hidden");
            check.classList.remove("visible");
        } else {
            // Empty → hide both
            check.classList.add("hidden");
            check.classList.remove("visible");
            invalid.classList.add("hidden");
            invalid.classList.remove("visible");
        }
    });
}

/**
 * Setup password requirements real-time validation
 * @param {string} passwordInputId - ID of the password input field
 * @param {string} passwordRequirementsId - ID of the requirements container
 * @returns {void}
 */
export function setupPasswordRequirementsValidation(passwordInputId, passwordRequirementsId) {
    const passwordInput = document.getElementById(passwordInputId);
    const passwordRequirements = document.getElementById(passwordRequirementsId);

    if (!passwordInput || !passwordRequirements) return;

    // Show requirements on focus
    passwordInput.addEventListener("focus", () => {
        passwordRequirements.style.display = "block";
    });

    // Hide requirements on blur
    passwordInput.addEventListener("blur", () => {
        passwordRequirements.style.display = "none";
    });

    // Get rule elements
    const ruleLength = document.getElementById("length");
    const ruleUpper = document.getElementById("uppercase");
    const ruleLower = document.getElementById("lowercase");
    const ruleNumber = document.getElementById("number");
    const ruleSpecial = document.getElementById("special");

    // Update rules as user types
    passwordInput.addEventListener("input", () => {
        const pwd = passwordInput.value;

        toggleRule(ruleLength, pwd.length >= 8);
        toggleRule(ruleUpper, /[A-Z]/.test(pwd));
        toggleRule(ruleLower, /[a-z]/.test(pwd));
        toggleRule(ruleNumber, /\d/.test(pwd));
        toggleRule(ruleSpecial, /[@$!%*?&]/.test(pwd));
    });
}