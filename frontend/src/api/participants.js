import { apiFetch } from "./client";

export async function addAllowedEmail(event_id, email) {
  return apiFetch("/admin/events/allowed-emails", {
    method: "POST",
    body: { event_id, email },
  });
}

export async function removeAllowedEmail(event_id, email) {
  return apiFetch("/admin/events/allowed-emails", {
    method: "DELETE",
    body: { event_id, email },
  });
}
