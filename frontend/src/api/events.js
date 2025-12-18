import { apiFetch } from "./client";

export function listEvents() {
  return apiFetch("/events");
}

export function getEventById(id) {
  return apiFetch(`/events/${id}`);
}

export function createEvent(payload) {
  return apiFetch("/admin/events", { method: "POST", body: payload });
}

export function updateEvent(payload) {
  return apiFetch("/admin/events", { method: "PATCH", body: payload });
}

export function deleteEvent(eventID) {
  return apiFetch(`/admin/events/${eventID}`, { method: "DELETE" });
}

export function getEventPoints(eventID) {
  return apiFetch(`/events/${eventID}/points`);
}
