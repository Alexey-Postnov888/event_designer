import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EventCard from "../components/ui/EventCard";
import CreateEventModal from "../components/create-event/CreateEventModal";

export default function MyEventsPage({ events = [] }) {
  const navigate = useNavigate();
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

      <div className="events-grid">
        {Array.isArray(events) && events.map((event) => (
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