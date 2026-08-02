/**
 * js/auth.js
 *
 * Handles the Register and Login forms.
 * Depends on api.js being loaded first (for apiRequest, saveSession, etc.)
 */

/** Show a message inside a `.form-feedback` element. */
function showFeedback(el, message, type = "error") {
  el.textContent = message;
  el.classList.remove("error", "success");
  el.classList.add(type);
}

/** Clear a feedback element. */
function hideFeedback(el) {
  el.textContent = "";
  el.classList.remove("error", "success");
}

/** Toggle a submit button's loading state (spinner + disabled). */
function setButtonLoading(button, spinner, isLoading, loadingText, defaultText) {
  button.disabled = isLoading;
  spinner.style.display = isLoading ? "inline-block" : "none";
  button.querySelector(".btn-text").textContent = isLoading ? loadingText : defaultText;
}

/** If the user is already logged in, skip login/register and go to dashboard. */
function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = "dashboard.html";
  }
}

// ---------------- Register Form ----------------
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const feedback = document.getElementById("registerFeedback");
  const button = document.getElementById("registerButton");
  const spinner = document.getElementById("registerSpinner");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideFeedback(feedback);

    const full_name = document.getElementById("fullName").value.trim();
    const company_name = document.getElementById("companyName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirmPassword").value;

    if (password !== confirm_password) {
      showFeedback(feedback, "Passwords do not match.", "error");
      return;
    }
    if (password.length < 8) {
      showFeedback(feedback, "Password must be at least 8 characters long.", "error");
      return;
    }

    setButtonLoading(button, spinner, true, "Creating account...", "Create Account");

    try {
      const data = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify({ full_name, company_name, email, password, confirm_password }),
      });

      saveSession(data.access_token, data.user);
      showFeedback(feedback, "Account created successfully! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 900);
    } catch (error) {
      showFeedback(feedback, error.message, "error");
    } finally {
      setButtonLoading(button, spinner, false, "Creating account...", "Create Account");
    }
  });
}

// ---------------- Login Form ----------------
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const feedback = document.getElementById("loginFeedback");
  const button = document.getElementById("loginButton");
  const spinner = document.getElementById("loginSpinner");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideFeedback(feedback);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    setButtonLoading(button, spinner, true, "Signing in...", "Sign In");

    try {
      const data = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveSession(data.access_token, data.user);
      showFeedback(feedback, "Login successful! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      showFeedback(feedback, error.message, "error");
    } finally {
      setButtonLoading(button, spinner, false, "Signing in...", "Sign In");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  redirectIfLoggedIn();
  initRegisterForm();
  initLoginForm();
});
