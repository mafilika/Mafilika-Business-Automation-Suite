/**
 * js/dashboard.js
 *
 * Handles the dashboard page:
 * - Redirects to login if no token is stored
 * - Fetches /api/profile and fills in the profile panel + navbar
 * - Handles the logout button
 *
 * Phase 1 note: the stat cards (Total Customers, Emails Sent, etc.) are
 * placeholders with static "0" values. They will be wired to real data
 * once the Customers / Email Automation / Reports / Files modules exist.
 */

function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase());
  return initials.join("");
}

async function loadProfile() {
  const nameEl = document.getElementById("profileName");
  const companyEl = document.getElementById("profileCompany");
  const emailEl = document.getElementById("profileEmail");
  const roleEl = document.getElementById("profileRole");
  const avatarEl = document.getElementById("profileAvatar");
  const navUserEl = document.getElementById("navUserName");
  const welcomeEl = document.getElementById("welcomeName");

  try {
    const user = await apiRequest("/api/profile", { method: "GET" });

    if (nameEl) nameEl.textContent = user.full_name;
    if (companyEl) companyEl.textContent = user.company_name;
    if (emailEl) emailEl.textContent = user.email;
    if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (avatarEl) avatarEl.textContent = getInitials(user.full_name);
    if (navUserEl) navUserEl.textContent = user.full_name;
    if (welcomeEl) welcomeEl.textContent = user.full_name.split(" ")[0];

    // Keep local copy fresh
    saveSession(getToken(), user);
  } catch (error) {
    // Token likely invalid/expired - force re-login
    clearSession();
    window.location.href = "login.html";
  }
}

function initLogout() {
  const logoutBtn = document.getElementById("logoutButton");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/logout", { method: "POST" });
    } catch (error) {
      // Even if the API call fails, still clear the local session
      console.warn("Logout request failed, clearing session locally.", error);
    } finally {
      clearSession();
      window.location.href = "login.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  loadProfile();
  initLogout();
});
