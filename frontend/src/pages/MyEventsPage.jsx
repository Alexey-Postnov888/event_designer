import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EventCard from "../components/ui/EventCard";
import CreateEventModal from "../components/create-event/CreateEventModal";

export default function MyEventsPage({ events = [], loading, error }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const handleCreated = (eventId) => {
    if (eventId) {
      navigate(`/events/${eventId}`);
      return;
    }
 
    window.location.reload();
  };

  // Открыть модалку создания, если пришли с Header с флагом openCreate
  useEffect(() => {
    if (location?.state && location.state.openCreate) {
      setIsCreateOpen(true);
      // очищаем флаг в истории, чтобы не повторялся при навигации назад/вперёд
      navigate("/events", { replace: true, state: {} });
    }
  }, [location?.state, navigate]);

  // Фильтрация по названию по параметру ?q= в URL
  const query = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      return (params.get("q") || "").toLowerCase();
    } catch {
      return "";
    }
  }, [location.search]);

  const filteredEvents = useMemo(() => {
    if (!query) return Array.isArray(events) ? events : [];
    const list = Array.isArray(events) ? events : [];
    return list.filter((ev) => {
      const name = (ev?.name || ev?.title || "").toString().toLowerCase();
      return name.includes(query);
    });
  }, [events, query]);

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Мои мероприятия</h1>

        <button
          className="btn btn-primary events-create-button"
          type="button"
          onClick={handleOpenCreate}
        >
          Создать новое мероприятие
        </button>
      </div>

      {error ? (
        <div style={{ color: "#b00020", marginTop: 12 }}>{error}</div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 12 }}>Загрузка…</div>
      ) : null}

      {(!loading && Array.isArray(filteredEvents) && filteredEvents.length === 0) ? (
        <div style={{ marginTop: 12, color: "var(--txt)" }}>Ничего не найдено</div>
      ) : null}

      <div className="events-grid">
        {Array.isArray(filteredEvents) && filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            title={event.name || event.title}
            status={event.status || "published"}
            onClick={() => navigate(`/events/${event.id}`)}
          />
        ))}
      </div>
          
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onCreated={handleCreated}
      />

    </div>
  );
}