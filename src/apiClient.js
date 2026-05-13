const API = "http://localhost:8080/api/v1";

function getToken()        { return localStorage.getItem("geo_token")         || ""; }
function getRefreshToken() { return localStorage.getItem("geo_refresh_token") || ""; }

function saveTokens(token, refreshToken) {
  localStorage.setItem("geo_token", token);
  localStorage.setItem("geo_refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("geo_token");
  localStorage.removeItem("geo_refresh_token");
  localStorage.removeItem("geo_username");
}

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  refreshQueue = [];
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  saveTokens(data.token, data.refreshToken);
  return data.token;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: "Bearer " + getToken(),
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });

  // Handle both 401 (unauthorized) and 403 (forbidden/expired token)
  if (res.status !== 401 && res.status !== 403) return res;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: (token) => resolve(fetch(`${API}${path}`, {
          ...options,
          headers: { ...headers, Authorization: "Bearer " + token },
        })),
        reject,
      });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await tryRefresh();
    processQueue(null, newToken);
    return fetch(`${API}${path}`, {
      ...options,
      headers: { ...headers, Authorization: "Bearer " + newToken },
    });
  } catch (err) {
    processQueue(err);
    clearTokens();
    window.location.href = "/login";
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export async function apiGet(path)         { return apiFetch(path); }
export async function apiPost(path, body)  { return apiFetch(path, { method: "POST",  body: JSON.stringify(body) }); }
export async function apiPatch(path, body) { return apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }); }
export async function apiDelete(path)      { return apiFetch(path, { method: "DELETE" }); }

export function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  clearTokens();
  window.location.href = "/login";
}

export { saveTokens };
