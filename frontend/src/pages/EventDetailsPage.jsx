import { useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/event-details.css";
import { mockEvents } from "../mock/events";
import StatusPublishedIcon from "../assets/icons/status-published.svg?react";
import IconTime from "../assets/icons/icon-time.svg?react";
import IconCalendar from "../assets/icons/icon-calendar.svg?react";
import IconLocation from "../assets/icons/icon-location.svg?react";
import IconDownload from "../assets/icons/icon-download.svg?react";

export default function EventDetailsPage() {
  const { id } = useParams();
  const event = mockEvents.find((item) => item.id.toString() === id);

  // Активный пункт меню
  const [activeTab, setActiveTab] = useState("overview");

  if (!event) {
    return (
      <div className="event-details-page">
        <h1 className="event-details-title">Мероприятие не найдено</h1>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      {/* Заголовок страницы */}
      <h1 className="event-details-title">{event.title}</h1>

      {/* ОБЁРТКА ДЛЯ ЛЕВОГО И ПРАВОГО БЛОКА */}
      <div className="event-details-layout">
        {/* Левая карточка-меню */}
        <aside className="event-details-sidebar">
          <div className="event-details-sidebar-card">
            {/* Статус */}
            <div className="event-details-status">
              <div className="event-status">
                <StatusPublishedIcon className="event-status__icon" />
                <span className="event-status__text">Опубликовано</span>
              </div>
            </div>

            {/* Меню */}
            <nav className="event-details-menu">
              <button
                type="button"
                className={"event-details-menu-item" + (activeTab === "overview"
                    ? " event-details-menu-item--active" : "")}
                onClick={() => setActiveTab("overview")}>
                Общая информация
              </button>

              <button
                type="button"
                className={"event-details-menu-item" + (activeTab === "map"
                    ? " event-details-menu-item--active" : "")}
                onClick={() => setActiveTab("map")}>
                Карта мероприятия
              </button>

              <button
                type="button"
                className={
                  "event-details-menu-item" + (activeTab === "timeline"
                    ? " event-details-menu-item--active" : "")}
                onClick={() => setActiveTab("timeline")}>
                Таймлайн
              </button>
              
              <button
                type="button"
                className={
                  "event-details-menu-item" + (activeTab === "participants"
                    ? " event-details-menu-item--active" : "")}
                onClick={() => setActiveTab("participants")}>
                Участники
              </button>
            </nav>

            {/* Кнопки снизу */}
            <div className="event-details-sidebar-footer">
              <div className="event-details-sidebar-actions">
                <button type="button" className="btn btn--edit">
                  Редактировать
                </button>

                <button type="button" className="btn btn--delete">
                  Удалить
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary event-details-publish-btn"
              >
                Опубликовать
              </button>
            </div>
          </div>
        </aside>

        {/* ПРАВАЯ КАРТОЧКА "Общая информация" */}
        {activeTab === "overview" && (
          <section className="event-details-content">
            <div className="event-details-content-card">
              {/* Тело карточки */}
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

              {/* Кнопка скачивания */}
              <button className="btn event-details-download-btn">
                <IconDownload className="event-details-download-icon" />
                Скачать мероприятие для офлайн-просмотра
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}