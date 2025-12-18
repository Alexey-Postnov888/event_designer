import IconTime from "../../../assets/icons/icon-time.svg?react";
import IconCalendar from "../../../assets/icons/icon-calendar.svg?react";
import IconLocation from "../../../assets/icons/icon-location.svg?react";
import IconDownload from "../../../assets/icons/icon-download.svg?react";

import "../../../styles/event-details/event-details-overview.css";

function normalize(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  // Обработка SQL null-полей
  if (typeof value === "object") {
    if ("String" in value) return value.String || "";
  }
  return String(value);
}

export default function OverviewTab({ event }) {
  const startsRaw = event?.starts_at;
  const startsStr = normalize(startsRaw);
  const endsStr = normalize(event?.ends_at);

  const parseDate = (str) => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const starts = parseDate(startsStr);
  const ends = parseDate(endsStr);
  const timeStr = starts ? starts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const dateStr = starts ? starts.toLocaleDateString() : "";
  const endTimeStr = ends ? ends.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const locationStr = normalize(event?.address || event?.location);
  const descriptionStr = normalize(event?.description).trim();
  return (
    <section className="event-details-content">
      <div className="event-details-content-card">
        <div className="event-details-body">
          <div className="event-details-chips">
            <div className="event-details-chips-left">
              <div className="event-chip">
                <IconTime className="event-chip__icon" />
                <span style={{ color: timeStr ? undefined : "var(--txt)" }}>
                  {timeStr || "Время не указано"}
                </span>
              </div>
              <div className="event-chip">
                <IconCalendar className="event-chip__icon" />
                <span style={{ color: dateStr ? undefined : "var(--txt)" }}>
                  {dateStr || "Дата не указана"}
                </span>
              </div>
            </div>

            <div className="event-details-chips-right">
              <div className="event-chip">
                <IconLocation className="event-chip__icon" />
                <span style={{ color: locationStr ? undefined : "var(--txt)" }}>
                  {locationStr || "Адрес не указан"}
                </span>
              </div>
            </div>
          </div>

          <div className="event-details-divider" />

          {descriptionStr ? (
            <p className="event-details-description">{descriptionStr}</p>
          ) : (
            <p className="event-details-description" style={{ color: "var(--txt)" }}>
              Описание пока отсутствует
            </p>
          )}
        </div>

        <button className="btn event-details-download-btn">
          <IconDownload className="event-details-download-icon" />
          Скачать мероприятие для офлайн-просмотра
        </button>
      </div>
    </section>
  );
}