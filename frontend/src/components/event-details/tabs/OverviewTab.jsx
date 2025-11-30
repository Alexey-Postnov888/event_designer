import IconTime from "../../../assets/icons/icon-time.svg?react";
import IconCalendar from "../../../assets/icons/icon-calendar.svg?react";
import IconLocation from "../../../assets/icons/icon-location.svg?react";
import IconDownload from "../../../assets/icons/icon-download.svg?react";

import "../../../styles/event-details/event-details-overview.css";

export default function OverviewTab({ event }) {
  return (
    <section className="event-details-content">
      <div className="event-details-content-card">
        <div className="event-details-body">
          <div className="event-details-chips">
            <div className="event-details-chips-left">
              <div className="event-chip">
                <IconTime className="event-chip__icon" />
                <span>{event.time}</span>
              </div>
              <div className="event-chip">
                <IconCalendar className="event-chip__icon" />
                <span>{event.date}</span>
              </div>
            </div>

            <div className="event-details-chips-right">
              <div className="event-chip">
                <IconLocation className="event-chip__icon" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <div className="event-details-divider" />

          <p className="event-details-description">
            {event.description?.trim()}
          </p>
        </div>

        <button className="btn event-details-download-btn">
          <IconDownload className="event-details-download-icon" />
          Скачать мероприятие для офлайн-просмотра
        </button>
      </div>
    </section>
  );
}