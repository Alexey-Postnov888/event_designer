import { useParams } from "react-router-dom";
import { useState } from "react";

import "../styles/event-details/event-details-page.css";

import { mockEvents } from "../mock/events";
import Sidebar from "../components/event-details/Sidebar";
import OverviewTab from "../components/event-details/tabs/OverviewTab";
import MapTab from "../components/event-details/tabs/MapTab";
import TimelineTab from "../components/event-details/tabs/TimelineTab";
import ParticipantsTab from "../components/event-details/tabs/ParticipantsTab";

export default function EventDetailsPage() {
  const { id } = useParams();
  const event = mockEvents.find((item) => item.id.toString() === id);

  const [activeTab, setActiveTab] = useState("overview");

  const [status, setStatus] = useState(event?.status ?? "hidden");

  if (!event) {
    return (
      <div className="event-details-page">
        <h1 className="event-details-title">Мероприятие не найдено</h1>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextStatus = status === "published" ? "hidden" : "published";
    setStatus(nextStatus);

    if (event.id === 1) {
      const first = mockEvents.find((e) => e.id === 1);
      if (first) {
        first.status = nextStatus;
      }
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
        />

        {activeTab === "overview" && <OverviewTab event={event} />}
        {activeTab === "map" && <MapTab event={event} />}
        {activeTab === "timeline" && <TimelineTab event={event} />}
        {activeTab === "participants" && <ParticipantsTab event={event} />}
      </div>
    </div>
  );
}