import { useEffect, useState } from "react";
import "../../../styles/event-details/event-details-participants.css";

function storageKey(eventId) {
  return `allowed_emails:${eventId}`;
}

export default function ParticipantsTab({ event }) {
  const eventId = event?.id;
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    if (!eventId) return;
    try {
      const raw = localStorage.getItem(storageKey(eventId));
      if (raw) setEmails(JSON.parse(raw));
      else setEmails([]);
    } catch {
      setEmails([]);
    }
  }, [eventId]);

  const hasData = emails.length > 0;

  return (
    <section className="event-details-content">
      <div className="event-details-content-card participants-card">
        <h2 className="participants-title">Участники</h2>
        <div className="participants-divider" />
        {hasData ? (
          <ul className="participants-list">
            {emails.map((email) => (
              <li className="participants-item" key={email}>
                <span className="participants-email">{email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted" style={{ color: "var(--txt)", marginTop: 16 }}>
            Список участников пока пуст
          </p>
        )}
      </div>
    </section>
  );
}