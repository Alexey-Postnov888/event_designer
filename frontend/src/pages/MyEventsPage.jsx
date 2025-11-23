import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EventCard from "../components/ui/EventCard";
import CreateEventModal from "../components/create-event/CreateEventModal";

export default function MyEventsPage({ events }) {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
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
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            title={event.title}
            status={event.status}
            onClick={
              index === 0
                ? () => navigate(`/events/${event.id}`)
                : undefined
            }
          />
        ))}
      </div>
          
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
      />

    </div>
  );
}