import { apiFetch, setToken } from "./client";

export async function login(email, password) {
  const resp = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (resp?.token) setToken(resp.token);
  return resp;
}

export async function requestCode(event_id, email) {
  return apiFetch("/auth/request-code", {
    method: "POST",
    body: { event_id, email },
  });
}

export async function verifyCode(event_id, email, code) {
  const resp = await apiFetch("/auth/verify-code", {
    method: "POST",
    body: { event_id, email, code },
  });
  if (resp?.token) setToken(resp.token);
  return resp;
}
