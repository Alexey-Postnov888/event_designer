import { apiFetch } from "./client";

export async function createSimplePoint({ event_id, x, y, title }) {
  const body = { event_id, x, y, title };
  return apiFetch("/admin/events/points/simple", { method: "POST", body });
}

export async function updateSimplePoint({ id, event_id, x, y, title }) {
  const body = { id, event_id, x, y, title };
  return apiFetch("/admin/events/points/simple", { method: "PATCH", body });
}

export async function createTimelinePoint({ event_id, x, y, title, start_at, end_at, timeline_description }) {
  const body = { event_id, x, y, title, start_at, end_at, timeline_description };
  return apiFetch("/admin/events/points/timeline", { method: "POST", body });
}

export async function updateTimelinePoint({ id, event_id, x, y, title, start_at, end_at, timeline_description }) {
  const body = { id, event_id, x, y, title, start_at, end_at, timeline_description };
  return apiFetch("/admin/events/points/timeline", { method: "PATCH", body });
}

export async function getPointsByEvent(eventId) {
  return apiFetch(`/events/${eventId}/points`);
}
