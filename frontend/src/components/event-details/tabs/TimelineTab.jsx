import "../../../styles/event-details/event-details-timeline.css";
import { useEffect, useState } from "react";
import { getEventPoints } from "../../../api/events";
import { parseDbDate, formatTimeRU } from "../../../utils/date";

function normalize(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "String" in value) return value.String || "";
  return String(value);
}

export default function TimelineTab({ event }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getEventPoints(event.id);
        if (cancelled) return;
        // Фильтр таймлайна
        const timeline = (Array.isArray(data) ? data : [])
          .map((p) => {
            const startDate = parseDbDate(p.start_at);
            const endDate = parseDbDate(p.end_at);
            return {
              startDate,
              endDate,
              text: normalize(p.timeline_description),
            };
          })
          .filter((p) => p.startDate && p.text);

        // Сортировка по времени
        timeline.sort((a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0));
        setItems(timeline);
      } catch (e) {
        if (cancelled) return;
        setError("Не удалось загрузить таймлайн");
      }
    })();
    return () => { cancelled = true; };
  }, [event.id]);

  if (error) {
    return (
      <section className="event-details-content">
        <div className="event-details-content-card event-timeline-card">
          <p className="event-timeline-text">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-details-content">
      <div className={`event-details-content-card event-timeline-card${items.length === 0 ? " event-timeline-card--empty" : ""}`}>
        {items.length === 0 ? (
          <p className="event-timeline-text">Таймплан пока пуст</p>
        ) : (
          <ul className="event-timeline-list">
            {items.map((item, index) => {
              const { startDate, endDate, text } = item;
              const timeStr = startDate ? (
                endDate ? `${formatTimeRU(startDate)} — ${formatTimeRU(endDate)}` : formatTimeRU(startDate)
              ) : "";
              return (
                <li className="event-timeline-item" key={index}>
                  <div className="event-timeline-time" style={{ color: timeStr ? undefined : "var(--txt)" }}>
                    {timeStr || "Время не указано"}
                  </div>

                <div className="event-timeline-dot-wrapper">
                  <span className="event-timeline-dot" />
                </div>

                <p className="event-timeline-text">{text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}