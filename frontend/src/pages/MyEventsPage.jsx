// src/pages/MyEventsPage.jsx
import { useNavigate } from "react-router-dom";
import EventCard from "../components/ui/EventCard";
import { mockEvents } from "../mock/events";

export default function MyEventsPage() {
  const navigate = useNavigate();

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Мои мероприятия</h1>

        <button className="btn btn-primary events-create-button">
          Создать новое мероприятие
        </button>
      </div>

      {/* Сетка */}
      <div className="events-grid">
        {mockEvents.map((event, index) => (
          <EventCard
            key={event.id}
            title={event.title}
            status={event.status}
            // только первая карточка сделана
            onClick={
              index === 0
                ? () => navigate(`/events/${event.id}`)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
