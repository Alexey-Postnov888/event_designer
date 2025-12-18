const TOKEN_KEY = "eventdesigner_token";

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

const API_BASE = typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env.VITE_API_BASE || "") : "";

export async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();
  const h = { "Content-Type": "application/json", ...headers };
  if (token) h["Authorization"] = `Bearer ${token}`;

  const url = API_BASE ? `${API_BASE}${path}` : path;

  const res = await fetch(url, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}
