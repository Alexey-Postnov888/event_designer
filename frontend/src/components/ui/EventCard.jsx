import StatusPublishedIcon from "../../assets/icons/status-published.svg?react";
import StatusHiddenIcon from "../../assets/icons/status-hidden.svg?react";
import BlankImage from "../../assets/placeholders/blank_image.svg?react";

const STATUS_MAP = {
  published: {
    label: "Опубликовано",
    Icon: StatusPublishedIcon,
  },
  hidden: {
    label: "Скрыто",
    Icon: StatusHiddenIcon,
  },
};

export default function EventCard({
  title,
  status = "published",
  imageUrl = null,
  onClick,
}) {
  const statusData = STATUS_MAP[status] ?? STATUS_MAP.published;
  const { label, Icon } = statusData;

  return (
    <article className="event-card" onClick={onClick}>
      {/* Статус */}
      <div className="event-card__status">
        <div className="event-status">
          <Icon className="event-status__icon" />
          <span className="event-status__text">{label}</span>
        </div>
      </div>

      {/* Заголовок */}
      <h3 className="event-title">{title}</h3>

      {/* Изображение / заглушка */}
      <div className="event-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="event-image" />
        ) : (
          <BlankImage className="event-image" />
        )}
      </div>
    </article>
  );
}