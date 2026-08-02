/**
 * js/api.js
 *
 * Central place for:
 * - The backend API base URL (change this one line when you deploy the backend)
 * - A small fetch wrapper (`apiRequest`) used by every other JS file
 * - Token storage helpers
 *
 * Every other frontend file (auth.js, dashboard.js) calls `apiRequest()`
 * instead of using fetch() directly, so there is only ONE place that
 * needs to change when the backend URL changes.
 */

const MAFILIKA_CONFIG = {
  // Local development (FastAPI default): http://127.0.0.1:8000
  // After deploying the backend to Render/Railway, replace this with
  // your live backend URL, e.g. "https://mafilika-api.onrender.com"
  API_BASE_URL: "http://127.0.0.1:8000",
};

const TOKEN_KEY = "mafilika_token";
const USER_KEY = "mafilika_user";

/** Save the JWT token and user object after login/register. */
function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Remove the JWT token and user object (used on logout). */
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Get the stored JWT token, or null if not logged in. */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Get the stored user object, or null if not available. */
function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Wrapper around fetch() that:
 * - Prefixes the API base URL
 * - Sets JSON headers automatically
 * - Attaches the Authorization header if a token exists
 * - Throws a readable Error with the backend's error message on failure
 *
 * @param {string} endpoint - e.g. "/api/login"
 * @param {object} options - fetch options (method, body, etc.)
 * @returns {Promise<any>} parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${MAFILIKA_CONFIG.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // Response had no JSON body (e.g. network error page) - leave data as null
  }

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}
