import { useState } from "react";
import Modal from "../ui/Modal";

import "../../styles/create-event/create-event-modal.css";

import CloseIcon from "../../assets/icons/icon-close.svg?react";

import CreateEventGeneralTab from "./tabs/CreateEventGeneralTab";
import CreateEventMapTab from "./tabs/CreateEventMapTab";
import CreateEventTimelineTab from "./tabs/CreateEventTimelineTab";
import CreateEventParticipantsTab from "./tabs/CreateEventParticipantsTab";

export default function CreateEventModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("general");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return <CreateEventGeneralTab />;
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

        {/* Вкладки */}
        <div className="create-event-tabs">
        <button
          type="button"
          className={
            "create-event-tab" +
            (activeTab === "general" ? " create-event-tab--active" : "")
          }
          onClick={() => setActiveTab("general")}
        >
          <span className="tab-text">Общая информация</span>
          <span className="tab-line"></span>
        </button>

        <button
          type="button"
          className={
            "create-event-tab" +
            (activeTab === "map" ? " create-event-tab--active" : "")
          }
          onClick={() => setActiveTab("map")}
        >
          <span className="tab-text">Карта мероприятия</span>
          <span className="tab-line"></span>
        </button>

        <button
          type="button"
          className={
            "create-event-tab" +
            (activeTab === "timeline" ? " create-event-tab--active" : "")
          }
          onClick={() => setActiveTab("timeline")}
        >
          <span className="tab-text">Таймлайн</span>
          <span className="tab-line"></span>
        </button>

        <button
          type="button"
          className={
            "create-event-tab" +
            (activeTab === "participants" ? " create-event-tab--active" : "")
          }
          onClick={() => setActiveTab("participants")}
        >
          <span className="tab-text">Участники</span>
          <span className="tab-line"></span>
        </button>
      </div>


        {/* Контент вкладки */}
        <div className="create-event-body">
          {renderActiveTab()}
        </div>

        {/* Футер */}
        <div className="create-event-footer">
          <button type="button" className="btn btn-primary create-event-next-btn">
            Далее
          </button>
        </div>

      </div>
    </Modal>
  );
}