import { apiFetch } from "./client";

export async function uploadEventMap(eventId, file) {
  const form = new FormData();
  form.append("event_id", eventId);
  form.append("map_file", file);
  return apiFetch("/admin/events/map", { method: "PUT", body: form });
}

export async function getEventMap(eventId) {
  return apiFetch(`/events/${eventId}/map`);
}

export async function deleteEventMap(eventId) {
  return apiFetch(`/admin/events/${eventId}/map`, { method: "DELETE" });
}
