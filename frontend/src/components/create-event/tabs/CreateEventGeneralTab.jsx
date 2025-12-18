import IconCalendar from "../../../assets/icons/icon-calendar-create.svg?react";
import IconTime from "../../../assets/icons/icon-time-create.svg?react";
import { useRef } from "react";

import "../../../styles/create-event/create-event-general.css";

export default function CreateEventGeneralTab({ values, onChange }) {
  const setField = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  const dateRef = useRef(null);
  const timeRef = useRef(null);

  const openPicker = (ref) => {
    const el = ref?.current;
    if (!el) return;
    
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch {}
    }
    el.focus();
  };
  return (
    <form className="ce-general-form">
      {/* Название */}
      <div className="ce-field">
        <label className="ce-label" htmlFor="ce-title">
          Название
        </label>
        <input
          id="ce-title"
          type="text"
          className="ce-input"
          placeholder="Введите название"
          value={values.name}
          onChange={setField("name")}
        />
      </div>

      {/* Адрес */}
      <div className="ce-field">
        <label className="ce-label" htmlFor="ce-address">
          Адрес
        </label>
        <input
          id="ce-address"
          type="text"
          className="ce-input"
          placeholder="Введите адрес"
          value={values.address}
          onChange={setField("address")}
        />
      </div>

      {/* Дата и время */}
      <div className="ce-row">
        {/* Дата */}
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-date">
            Дата
          </label>

          <div className="ce-input-wrapper">
            <input
              id="ce-date"
              type="date"
              className="ce-input ce-input--with-icon"
              placeholder="Дата"
              value={values.date}
              onChange={setField("date")}
              ref={dateRef}
            />
            <button type="button" className="ce-icon-button" onClick={() => openPicker(dateRef)} aria-label="Выбрать дату">
              <IconCalendar className="ce-input-icon" />
            </button>
          </div>
        </div>

        {/* Время */}
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-time">
            Время
          </label>

          <div className="ce-input-wrapper">
            <input
              id="ce-time"
              type="time"
              className="ce-input ce-input--with-icon"
              placeholder="Время"
              value={values.time}
              onChange={setField("time")}
              ref={timeRef}
            />
            <button type="button" className="ce-icon-button" onClick={() => openPicker(timeRef)} aria-label="Выбрать время">
              <IconTime className="ce-input-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Описание */}
      <div className="ce-field">
        <label className="ce-label" htmlFor="ce-description">
          Описание
        </label>
        <textarea
          id="ce-description"
          className="ce-textarea"
          placeholder="Описание"
          rows={3}
          value={values.description}
          onChange={setField("description")}
        />
      </div>
    </form>
  );
}