import { useState } from "react";
import { createEvent } from "../../api/events";
import { getToken } from "../../api/client";
import Modal from "../ui/Modal";

import "../../styles/create-event/create-event-modal.css";

import CloseIcon from "../../assets/icons/icon-close.svg?react";

import CreateEventGeneralTab from "./tabs/CreateEventGeneralTab";
import CreateEventMapTab from "./tabs/CreateEventMapTab";
import CreateEventTimelineTab from "./tabs/CreateEventTimelineTab";
import CreateEventParticipantsTab from "./tabs/CreateEventParticipantsTab";

// Вкладки
const TABS = [
  { id: "general", label: "Общая информация" },
  { id: "map", label: "Карта мероприятия" },
  { id: "timeline", label: "Таймлайн" },
  { id: "participants", label: "Участники" },
];

export default function CreateEventModal({ isOpen, onClose, onCreated }) {

  const [activeIndex, setActiveIndex] = useState(0);
  const [maxVisitedIndex, setMaxVisitedIndex] = useState(0);

  const activeTabId = TABS[activeIndex].id;

  // Общая информация
  const [general, setGeneral] = useState({
    name: "",
    address: "",
    date: "",
    time: "",
    description: "",
  });

  const renderActiveTab = () => {
    switch (activeTabId) {
      case "general":
        return (
          <CreateEventGeneralTab
            values={general}
            onChange={setGeneral}
          />
        );
      case "map":
        return <CreateEventMapTab />;
      case "timeline":
        return <CreateEventTimelineTab />;
      case "participants":
        return <CreateEventParticipantsTab />;
      default:
        return null;
    }
  };

  // Переключение вкладки
  const handleTabClick = (index) => {
    const isClickable = index <= maxVisitedIndex;

    if (!isClickable) return;

    setActiveIndex(index);
  };

  // Кнопка "Далее"
  const handleNext = async () => {
    if (activeIndex < TABS.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      setMaxVisitedIndex((prev) => Math.max(prev, nextIndex));
    } else {
      // Сохранение минимальных данных события
      try {
        const token = getToken();
        if (!token) {
          alert("Не авторизовано: войдите как админ, чтобы создавать мероприятия");
          return;
        }
        // Минимальная проверка
        if (!general.name || !general.address || !general.date || !general.time) {
          alert("Заполните название, адрес, дату и время");
          return;
        }

        const startISO = new Date(`${general.date}T${general.time}:00Z`).toISOString();
        const endISO = new Date(new Date(startISO).getTime() + 2 * 60 * 60 * 1000).toISOString();

        const payload = {
          name: general.name,
          address: general.address,
          description: general.description || undefined,
          starts_at: startISO,
          ends_at: endISO,
        };

        const resp = await createEvent(payload);
        const createdId = resp?.id || resp?.ID || resp?.event_id;

        onClose && onClose();
        onCreated && onCreated(createdId);
      } catch (e) {
        const msg = String(e?.message || "Не удалось создать мероприятие");
        if (msg.includes("Unauthorized") || msg.includes("Missing Authorization") || msg.includes("Admin access")) {
          alert("Нет доступа: требуется админ-авторизация. Перелогиньтесь и попробуйте снова.");
        } else {
          alert(msg);
        }
      }
    }
  };

  const isLastStep = activeIndex === TABS.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="create-event-modal">
        {/* Заголовок */}
        <div className="create-event-header">
          <h2 className="create-event-title">Новое мероприятие</h2>

          <button
            type="button"
            className="create-event-close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CloseIcon width={14} height={14} />
          </button>
        </div>

        {/* Меню вкладок */}
        <div className="create-event-tabs">
          {TABS.map((tab, index) => {
            const isActive = index === activeIndex;
            const isClickable = index <= maxVisitedIndex || isLastStep; 
            // После последнего шага меню кликабельно полностью

            const className =
              "create-event-tab" +
              (isActive ? " create-event-tab--active" : "") +
              (!isClickable ? " create-event-tab--disabled" : "");

            return (
              <button
                key={tab.id}
                type="button"
                className={className}
                onClick={() => handleTabClick(index)}
              >
                <span className="tab-text">{tab.label}</span>
                <span className="tab-line"></span>
              </button>
            );
          })}
        </div>

        {/* Контент вкладки */}
        <div className="create-event-body-wrapper">
          <div className="create-event-body">
            {renderActiveTab()}
          </div>
        </div>


        {/* Футер */}
        <div className="create-event-footer">
          <button
            type="button"
            className="btn btn-primary create-event-next-btn"
            onClick={handleNext}
          >
            {isLastStep ? "Сохранить" : "Далее"}
          </button>
        </div>
      </div>
    </Modal>
  );
}