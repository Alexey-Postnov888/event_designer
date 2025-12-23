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

const isDev = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.MODE === "development";
const DEFAULT_BASE = isDev ? "/api" : "";
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env)
  ? (import.meta.env.VITE_API_BASE ?? DEFAULT_BASE)
  : DEFAULT_BASE;

export async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const h = { ...headers };
  if (!isFormData) {
    h["Content-Type"] = h["Content-Type"] ?? "application/json";
  }
  if (token) h["Authorization"] = `Bearer ${token}`;

  const url = API_BASE ? `${API_BASE}${path}` : path;

  const res = await fetch(url, {
    method,
    headers: h,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
    }
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}
