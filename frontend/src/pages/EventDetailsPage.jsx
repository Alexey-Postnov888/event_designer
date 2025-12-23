import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "../styles/event-details/event-details-page.css";

import { getEventById, deleteEvent } from "../api/events";
import Sidebar from "../components/event-details/Sidebar";
import OverviewTab from "../components/event-details/tabs/OverviewTab";
import MapTab from "../components/event-details/tabs/MapTab";
import TimelineTab from "../components/event-details/tabs/TimelineTab";
import ParticipantsTab from "../components/event-details/tabs/ParticipantsTab";

export default function EventDetailsPage({ onUpdateStatus, onDeleteEvent, events }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("hidden");
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getEventById(id);
        if (cancelled) return;
        // Приведение полей
        const uiEvent = {
          id: data.id,
          title: data.name,
          description: data.description,
          address: data.address,
          starts_at: data.starts_at,
          ends_at: data.ends_at,
          creator_email: data.creator_email,
          status: "published",
        };
        setEvent(uiEvent);
        setStatus(uiEvent.status);
      } catch (e) {
        if (cancelled) return;
        setError("Мероприятие не найдено или нет доступа");
      }
    })();
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
      await deleteEvent(id);
      if (typeof onDeleteEvent === "function") {
        try {
          onDeleteEvent(id);
        } catch {}
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
        />

        {activeTab === "overview" && <OverviewTab event={event} />}
        {activeTab === "map" && <MapTab event={event} />}
        {activeTab === "timeline" && <TimelineTab event={event} />}
        {activeTab === "participants" && <ParticipantsTab event={event} />}
      </div>
    </div>
  );
}