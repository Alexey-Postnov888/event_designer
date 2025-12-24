import StatusPublishedIcon from "../../assets/icons/status-published.svg?react";
import StatusHiddenIcon from "../../assets/icons/status-hidden.svg?react";
import "../../styles/event-details/event-details-sidebar.css";

export default function Sidebar({
  activeTab,
  onTabChange,
  status,
  onToggleStatus,
  onDelete,
  onEdit,
}) {
  const isPublished = status === "published";

  const StatusIcon = isPublished ? StatusPublishedIcon : StatusHiddenIcon;
  const statusText = isPublished ? "Опубликовано" : "Скрыто";

  const buttonText = isPublished ? "Скрыть" : "Опубликовать";

  const buttonClassName =
    "btn event-details-publish-btn " +
    (isPublished
      ? "event-details-publish-btn--secondary"
      : "btn-primary");

  return (
    <aside className="event-details-sidebar">
      <div className="event-details-sidebar-card">
        {/* Статус */}
        <div className="event-details-status">
          <div className="event-status">
            <StatusIcon className="event-status__icon" />
            <span className="event-status__text">{statusText}</span>
          </div>
        </div>

        {/* Меню */}
        <nav className="event-details-menu">
          <button
            type="button"
            className={
              "event-details-menu-item" +
              (activeTab === "overview"
                ? " event-details-menu-item--active"
                : "")
            }
            onClick={() => onTabChange("overview")}
          >
            Общая информация
          </button>

          <button
            type="button"
            className={
              "event-details-menu-item" +
              (activeTab === "map"
                ? " event-details-menu-item--active"
                : "")
            }
            onClick={() => onTabChange("map")}
          >
            Карта мероприятия
          </button>

          <button
            type="button"
            className={
              "event-details-menu-item" +
              (activeTab === "timeline"
                ? " event-details-menu-item--active"
                : "")
            }
            onClick={() => onTabChange("timeline")}
          >
            Таймлайн
          </button>

          <button
            type="button"
            className={
              "event-details-menu-item" +
              (activeTab === "participants"
                ? " event-details-menu-item--active"
                : "")
            }
            onClick={() => onTabChange("participants")}
          >
            Участники
          </button>
        </nav>

        {/* Кнопки */}
        <div className="event-details-sidebar-footer">
          <div className="event-details-sidebar-actions">
            <button type="button" className="btn btn--edit" onClick={onEdit}>
              Редактировать
            </button>

            <button type="button" className="btn btn--delete" onClick={onDelete}>
              Удалить
            </button>
          </div>

          <button
            type="button"
            className={buttonClassName}
            onClick={onToggleStatus}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </aside>
  );
}