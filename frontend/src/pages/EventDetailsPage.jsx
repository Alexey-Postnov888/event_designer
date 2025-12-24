import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "../styles/event-details/event-details-page.css";

import { getEventById, deleteEvent, getEventPoints } from "../api/events";
import Sidebar from "../components/event-details/Sidebar";
import OverviewTab from "../components/event-details/tabs/OverviewTab";
import MapTab from "../components/event-details/tabs/MapTab";
import TimelineTab from "../components/event-details/tabs/TimelineTab";
import ParticipantsTab from "../components/event-details/tabs/ParticipantsTab";
import CreateEventModal from "../components/create-event/CreateEventModal";
import { getEventMap, deleteEventMap } from "../api/maps";
import { removeAllowedEmail } from "../api/participants";
import { apiFetch } from "../api/client";

export default function EventDetailsPage({ onUpdateStatus, onDeleteEvent, events }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("hidden");
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getEventById(id);
        if (cancelled) return;
        const asText = (v) => {
          if (v == null) return "";
          const t = typeof v;
          if (t === "string" || t === "number" || t === "boolean") return String(v);
          if (t === "object") {
            const hasValid = Object.prototype.hasOwnProperty.call(v, "Valid") ? Boolean(v.Valid) : undefined;
            if (Object.prototype.hasOwnProperty.call(v, "String")) {
              return hasValid === false ? "" : (v.String || "");
            }
            if (Object.prototype.hasOwnProperty.call(v, "Time")) {
              return hasValid === false ? "" : (typeof v.Time === "string" ? v.Time : "");
            }
            return "";
          }
          return "";
        };
        const uiEvent = {
          id: data.id,
          title: asText(data.name),
          description: asText(data.description),
          address: asText(data.address),
          starts_at: asText(data.starts_at),
          ends_at: asText(data.ends_at),
          creator_email: asText(data.creator_email),
          status: "published",
        };
        setEvent(uiEvent);
        setStatus(uiEvent.status);
      } catch (e) {
        if (cancelled) return;
        setError("Мероприятие не найдено или нет доступа");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="event-details-page">
        <h1 className="event-details-title">{error}</h1>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <h1 className="event-details-title">Загрузка...</h1>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextStatus = status === "published" ? "hidden" : "published";
    setStatus(nextStatus);
    if (typeof onUpdateStatus === "function") {
      try {
        onUpdateStatus(id, nextStatus);
      } catch {}
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Удалить мероприятие? Действие необратимо.");
    if (!confirmed) return;
    try {
      try {
        const raw = localStorage.getItem(`allowed_emails:${id}`);
        if (raw) {
          const emails = JSON.parse(raw);
          if (Array.isArray(emails)) {
            for (const email of emails) {
              try {
                await removeAllowedEmail(id, email);
              } catch {}
            }
          }
        }
      } catch {}

      try {
        const pts = await getEventPoints(id);
        if (Array.isArray(pts)) {
          for (const p of pts) {
            if (!p?.id) continue;
            try {
              await apiFetch(`/admin/events/${id}/points/${p.id}`, { method: "DELETE" });
            } catch {}
          }
        }
      } catch {}

      try {
        await deleteEventMap(id);
      } catch {}

      try {
        await deleteEvent(id);
      } catch (err1) {
        const msg = String(err1?.message || "");
        const fkBlock = msg.includes("event_allowed_emails_event_id_fkey");
        if (fkBlock) {
          try {
            const allEmails = new Set();
            try {
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith("allowed_emails:")) {
                  const v = localStorage.getItem(k);
                  try {
                    const arr = JSON.parse(v);
                    if (Array.isArray(arr)) arr.forEach((e) => allEmails.add(String(e).toLowerCase()));
                  } catch {}
                }
              }
            } catch {}
            try {
              if (event?.creator_email) allEmails.add(String(event.creator_email).toLowerCase());
            } catch {}
            for (const email of allEmails) {
              try { await removeAllowedEmail(id, email); } catch {}
            }
          } catch {}
          await deleteEvent(id);
        } else {
          throw err1;
        }
      }

      try {
        localStorage.removeItem(`allowed_emails:${id}`);
        localStorage.removeItem(`event_cover:${id}`);
      } catch {}

      if (typeof onDeleteEvent === "function") {
        try { onDeleteEvent(id); } catch {}
      }
      navigate("/events", { replace: true });
    } catch (e) {
      alert(e?.message || "Не удалось удалить мероприятие");
    }
  };

  return (
    <div className="event-details-page">
      <h1 className="event-details-title">{event.title}</h1>

      <div className="event-details-layout">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          status={status}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onEdit={async () => {
            try {
              const evt = event;
              const asText = (v) => {
                if (v == null) return "";
                const t = typeof v;
                if (t === "string" || t === "number" || t === "boolean") return String(v);
                if (t === "object") {
                  const hasValid = Object.prototype.hasOwnProperty.call(v, "Valid") ? Boolean(v.Valid) : undefined;
                  if (Object.prototype.hasOwnProperty.call(v, "String")) {
                    return hasValid === false ? "" : (v.String || "");
                  }
                  if (Object.prototype.hasOwnProperty.call(v, "Time")) {
                    return hasValid === false ? "" : (typeof v.Time === "string" ? v.Time : "");
                  }
                  return "";
                }
                return "";
              };
              const parseDT = (v) => {
                const s = asText(v).trim();
                if (!s) return null;
                const d = new Date(s);
                return isNaN(d.getTime()) ? null : d;
              };
              const toHHMM = (d) => d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "";
              const toDateStr = (d) => d ? d.toISOString().slice(0,10) : "";

              const starts = parseDT(evt.starts_at);
              const ends = parseDT(evt.ends_at);

              const general = {
                name: evt.title,
                address: asText(evt.address) || "",
                description: asText(evt.description) || "",
                date: toDateStr(starts),
                timeFrom: toHHMM(starts),
                timeTo: toHHMM(ends),
              };

              let mapPreviewUrl = null;
              try {
                const m = await getEventMap(id);
                mapPreviewUrl = m?.map_url || null;
              } catch {}

              let mapPoints = [];
              let timelineItems = [];
              try {
                const pts = await getEventPoints(id);
                if (Array.isArray(pts)) {
                  for (const p of pts) {
                    const hasTimeline = Boolean(asText(p.timeline_description).trim() || asText(p.start_at).trim() || asText(p.end_at).trim());
                    if (hasTimeline) {
                      const start = parseDT(p.start_at);
                      const end = parseDT(p.end_at);
                      const hhmm = (d) => d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "";
                      timelineItems.push({
                        id: p.id,
                        timeFrom: hhmm(start),
                        timeTo: hhmm(end),
                        description: asText(p.timeline_description) || asText(p.title) || "",
                        isEditing: false,
                        __serverPoint: p,
                      });
                    } else {
                      mapPoints.push({ x: p.x, y: p.y, title: asText(p.title), id: p.id, __serverPoint: p });
                    }
                  }
                }
              } catch {}

              let participants = [];
              try {
                const raw = localStorage.getItem(`allowed_emails:${id}`);
                if (raw) participants = JSON.parse(raw).map((email) => ({ id: email, email, isEditing: false }));
              } catch {}

              setEditInitial({
                initialActiveTabId: activeTab,
                general,
                mapPreviewUrl,
                mapPoints,
                timelineItems,
                participants,
              });
              setIsEditOpen(true);
            } catch (e) {
              alert(e?.message || "Не удалось открыть редактор");
            }
          }}
        />

        {activeTab === "overview" && <OverviewTab event={event} />}
        {activeTab === "map" && <MapTab event={event} refreshKey={refreshKey} />}
        {activeTab === "timeline" && <TimelineTab event={event} />}
        {activeTab === "participants" && <ParticipantsTab event={event} />}
      </div>

      {isEditOpen && (
        <CreateEventModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onCreated={async () => {
            setIsEditOpen(false);
            try {
              const data = await getEventById(id);
              const asText = (v) => {
                if (v == null) return "";
                const t = typeof v;
                if (t === "string" || t === "number" || t === "boolean") return String(v);
                if (t === "object") {
                  const hasValid = Object.prototype.hasOwnProperty.call(v, "Valid") ? Boolean(v.Valid) : undefined;
                  if (Object.prototype.hasOwnProperty.call(v, "String")) {
                    return hasValid === false ? "" : (v.String || "");
                  }
                  if (Object.prototype.hasOwnProperty.call(v, "Time")) {
                    return hasValid === false ? "" : (typeof v.Time === "string" ? v.Time : "");
                  }
                  return "";
                }
                return "";
              };
              const uiEvent = {
                id: data.id,
                title: asText(data.name),
                description: asText(data.description),
                address: asText(data.address),
                starts_at: asText(data.starts_at),
                ends_at: asText(data.ends_at),
                creator_email: asText(data.creator_email),
                status: "published",
              };
              setEvent(uiEvent);
              setRefreshKey((v) => v + 1);
            } catch {}
          }}
          mode="edit"
          eventId={id}
          initialActiveTabId={editInitial?.initialActiveTabId}
          initialGeneral={editInitial?.general}
          initialMapPreviewUrl={editInitial?.mapPreviewUrl}
          initialMapPoints={editInitial?.mapPoints}
          initialTimelineItems={editInitial?.timelineItems}
          initialParticipants={editInitial?.participants}
        />
      )}
    </div>
  );
}