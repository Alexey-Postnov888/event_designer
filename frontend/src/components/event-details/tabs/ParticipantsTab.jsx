import "../../../styles/event-details/event-details-participants.css";

export default function ParticipantsTab() {
  const employees = [
    { email: "pochta@mail.ru", name: "Сидоров Александр" },
    { email: "pochta2@mail.ru", name: "Морозова Ксения" },
    { email: "pochta2@mail.ru", name: "Морозова Ксения" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
  ];

  const guests = [
    { email: "pochta@mail.ru", name: "Гость 1" },
    { email: "pochta2@mail.ru", name: "Морозова Ксения" },
    { email: "pochta2@mail.ru", name: "Гость 3" },
    { email: "pochta2@mail.ru", name: "Гость 4" },
    { email: "pochta2@mail.ru", name: "Гость 5" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
    { email: "pochta2@mail.ru", name: "Гость 6" },
  ];

  return (
    <section className="event-details-content">
      <div className="event-details-content-card participants-card">
        
        {/* Сотрудники */}
        <h2 className="participants-title">Сотрудники</h2>
        <div className="participants-divider" />

        <ul className="participants-list">
          {employees.map((item, idx) => (
            <li className="participants-item" key={idx}>
              <span className="participants-email">{item.email}</span>
              <span className="participants-name">{item.name}</span>
            </li>
          ))}
        </ul>

        {/* Гости */}
        <h2 className="participants-title participants-title--second">Гости</h2>
        <div className="participants-divider" />

        <ul className="participants-list">
          {guests.map((item, idx) => (
            <li className="participants-item" key={idx}>
              <span className="participants-email">{item.email}</span>
              <span className="participants-name">{item.name}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}