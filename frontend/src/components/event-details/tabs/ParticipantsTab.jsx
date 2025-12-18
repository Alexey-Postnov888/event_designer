import "../../../styles/event-details/event-details-participants.css";

export default function ParticipantsTab({ participants }) {
  const hasData = Array.isArray(participants) && participants.length > 0;
  return (
    <section className="event-details-content">
      <div className="event-details-content-card participants-card">
        {hasData ? (
          <>
            <h2 className="participants-title">Участники</h2>
            <div className="participants-divider" />
            <ul className="participants-list">
              {participants.map((item, idx) => (
                <li className="participants-item" key={idx}>
                  <span className="participants-email">{item.email}</span>
                  {item.name && <span className="participants-name">{item.name}</span>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted" style={{ color: "var(--txt)" }}>Список участников пока пуст</p>
        )}
      </div>
    </section>
  );
}