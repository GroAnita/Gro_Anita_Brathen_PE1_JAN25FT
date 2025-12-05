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
 * - For simple fields: mark as valid when not-empty.
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
            // Something is typed, but validator says invalid
            invalid.classList.add("visible");
            invalid.classList.remove("hidden");

            check.classList.add("hidden");
            check.classList.remove("visible");
        } else {
            // Empty - hide both
            check.classList.add("hidden");
            check.classList.remove("visible");
            invalid.classList.add("hidden");
            invalid.classList.remove("visible");
        }
    });
}

/**
 * Setup password requirements with real-time validation
 * @param {string} passwordInputId - ID of the password input field
 * @param {string} passwordRequirementsId - ID of the requirements container
 * @returns {void}
 */
export function setupPasswordRequirementsValidation(passwordInputId, passwordRequirementsId) {
    const passwordInput = document.getElementById(passwordInputId);
    const passwordRequirements = document.getElementById(passwordRequirementsId);

    if (!passwordInput || !passwordRequirements) return;

    // Show requirements when on focus
    passwordInput.addEventListener("focus", () => {
        passwordRequirements.style.display = "block";
    });

    // Hide requirements on blur
    passwordInput.addEventListener("blur", () => {
        passwordRequirements.style.display = "none";
    });

    // Rule elements
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

/**
 * Toggles visible/hidden classes for validation icons.
 *
 * @param {HTMLElement} validEl - The green checkmark element.
 * @param {HTMLElement} invalidEl - The red X icon element.
 * @param {boolean} isValid - Whether the input is valid.
 */
function toggleIcons(validEl, invalidEl, isValid) {
    if (isValid) {
        validEl.classList.add("visible");
        validEl.classList.remove("hidden");
        invalidEl.classList.add("hidden");
        invalidEl.classList.remove("visible");
    } else {
        invalidEl.classList.add("visible");
        invalidEl.classList.remove("hidden");
        validEl.classList.add("hidden");
        validEl.classList.remove("visible");
    }
}

/**
 * Validates and auto-formats credit card number into:
 * "0000 0000 0000 0000"
 */
function setupCardNumberValidation() {
    const input = document.getElementById("mestercard-number");
    const check = document.getElementById("mestercardNumberCheck");
    const invalid = document.getElementById("mestercardNumberInvalid");

    input.addEventListener("input", () => {
        // Remove non-digits
        let digits = input.value.replace(/\D/g, "");

        // Format into groups of 4
        digits = digits.replace(/(.{4})/g, "$1 ").trim();

        input.value = digits;

        const isValid = digits.replace(/\s/g, "").length === 16;
        toggleIcons(check, invalid, isValid);
    });
}

/**
 * Auto-formats expiry into MM/YY and validates it.
 */
function setupExpiryValidation() {
    const input = document.getElementById("mestercard-expiry");
    const check = document.getElementById("mestercardExpiryCheck");
    const invalid = document.getElementById("mestercardExpiryInvalid");

    if (!input) return;

    input.addEventListener("input", () => {
        let value = input.value.replace(/\D/g, "");

        if (value.length >= 3) {
            value = value.substring(0, 2) + "/" + value.substring(2, 4);
        }

        input.value = value;

        const basePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

        if (!basePattern.test(value)) {
            toggleIcons(check, invalid, false);
            return;
        }

        const [month, year] = value.split("/").map(num => parseInt(num));

        const isValidYear = year >= 26 && year <= 28;
        const isValidMonth = month >= 1 && month <= 12;
        toggleIcons(check, invalid, isValidYear && isValidMonth);
    });
}

/**
 * Validates 3-digit CVC.
 */
function setupCvcValidation() {
    const input = document.getElementById("mestercard-cvc");
    const check = document.getElementById("mestercardCvcCheck");
    const invalid = document.getElementById("mestercardCvcInvalid");

    input.addEventListener("input", () => {
        const value = input.value.replace(/\D/g, "");
        input.value = value; // enforce digits only

        const isValid = /^\d{3}$/.test(value);
        toggleIcons(check, invalid, isValid);
    });
}

/**
 * Validates cardholder name (must have at least 2 characters).
 */
function setupNameValidation() {
    const input = document.getElementById("mestercard-name");
    const check = document.getElementById("mestercardNameCheck");
    const invalid = document.getElementById("mestercardNameInvalid");

    input.addEventListener("input", () => {
        const isValid = input.value.trim().length >= 2;
        toggleIcons(check, invalid, isValid);
    });
}

/**
 * Auto-formats the Vusacard expiry date into MM/YY and validates:
 * - Correct format
 * - Month is 01–12
 * - Year is between 25 and 28 (2025–2028)
 */
export function setupVusacardExpiryValidation() {
    const input = document.getElementById("vusacard-expiry");
    const check = document.getElementById("vusacardExpiryCheck");
    const invalid = document.getElementById("vusacardExpiryInvalid");

    if (!input) return;

    input.addEventListener("input", () => {
        let value = input.value.replace(/\D/g, "");

        if (value.length >= 3) {
            value = value.substring(0, 2) + "/" + value.substring(2, 4);
        }

        input.value = value;

        // Base format check
        const basePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!basePattern.test(value)) {
            toggleIcons(check, invalid, false);
            return;
        }

        // Extract month and year
        const [monthStr, yearStr] = value.split("/");
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);

        // Extra safety (even though regex already checks month)
        const validMonth = month >= 1 && month <= 12;
        const validYear = year >= 25 && year <= 28; // 2025–2028

        toggleIcons(check, invalid, validMonth && validYear);
    });
}

/**
 * Sets up auto-formatting and validation for Vusacard card number (16 digits).
 * Formats into "0000 0000 0000 0000" and toggles ✔ / ✖ icons.
 *
 * @returns {void}
 */
export function setupVusacardNumberValidation() {
    const input = document.getElementById("vusacard-number");
    const check = document.getElementById("vusacardNumberCheck");
    const invalid = document.getElementById("vusacardNumberInvalid");

    if (!input || !check || !invalid) return;

    input.addEventListener("input", () => {
        // Remove all non-digit characters
        let digits = input.value.replace(/\D/g, "");

        // Group as 4-4-4-4
        digits = digits.replace(/(.{4})/g, "$1 ").trim();

        input.value = digits;

        // Valid if 16 digits (ignoring spaces)
        const isValid = digits.replace(/\s/g, "").length === 16;
        toggleIcons(check, invalid, isValid);
    });
}

/**
 * Sets up validation for Vusacard CVC.
 * Only allows exactly 3 digits and toggles ✔ / ✖ icons.
 *
 * @returns {void}
 */
export function setupVusacardCvcValidation() {
    const input = document.getElementById("vusacard-cvc");
    const check = document.getElementById("vusacardCvcCheck");
    const invalid = document.getElementById("vusacardCvcInvalid");

    if (!input || !check || !invalid) return;

    input.addEventListener("input", () => {
        // Only digits
        const value = input.value.replace(/\D/g, "");
        input.value = value;

        const isValid = /^\d{3}$/.test(value);
        toggleIcons(check, invalid, isValid);
    });
}

/**
 * Validates cardholder name (must have at least 2 characters).
 */
function setupNameValidationVusa() {
    const input = document.getElementById("vusacard-name");
    const check = document.getElementById("vusacardNameCheck");
    const invalid = document.getElementById("vusacardNameInvalid");

    input.addEventListener("input", () => {
        const isValid = input.value.trim().length >= 2;
        toggleIcons(check, invalid, isValid);
    });
}

/**
 * Initializes ALL credit card field validation.
 */
export function initPaymentValidation() {
    setupNameValidation();
    setupCardNumberValidation();
    setupExpiryValidation();
    setupCvcValidation();
    setupVusacardExpiryValidation();
    setupVusacardNumberValidation();
    setupVusacardCvcValidation();
    setupNameValidationVusa();
}
