import IconCalendar from "../../../assets/icons/icon-calendar-create.svg?react";
import IconTime from "../../../assets/icons/icon-time-create.svg?react";
import { useRef } from "react";

import "../../../styles/create-event/create-event-general.css";

export default function CreateEventGeneralTab({ values, onChange }) {
  const setField = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  const dateRef = useRef(null);
  const timeFromRef = useRef(null);
  const timeToRef = useRef(null);

  const openPicker = (ref) => {
    const el = ref?.current;
    if (!el) return;
    
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch {}
    }
    el.focus();
  };

  const clampToDay = (hhmm) => {
    if (!hhmm) return "";
    const [hStr = "0", mStr = "0"] = hhmm.split(":");
    let h = Math.max(0, Math.min(23, parseInt(hStr, 10) || 0));
    let m = Math.max(0, Math.min(59, parseInt(mStr, 10) || 0));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const addHours = (hhmm, hoursToAdd = 2) => {
    if (!hhmm) return "";
    const [hStr = "0", mStr = "0"] = hhmm.split(":");
    let total = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0) + hoursToAdd * 60;
    // Клапаем в пределах суток; если уходит за 24:00 — ограничим 23:59
    total = Math.min(total, 23 * 60 + 59);
    total = Math.max(total, 0);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleTimeFromChange = (e) => {
    const newFrom = clampToDay(e.target.value);
    let next = { ...values, timeFrom: newFrom };

    // Если окончания нет — автозаполним +2 часа
    if (!values.timeTo) {
      next.timeTo = addHours(newFrom, 2);
    } else if (values.timeTo && values.timeTo < newFrom) {
      // Если уже выбранное окончание раньше начала — подтянем к началу
      next.timeTo = newFrom;
    }
    onChange(next);
  };

  const handleTimeToChange = (e) => {
    let newTo = clampToDay(e.target.value);
    const from = values.timeFrom || "";
    if (from && newTo < from) {
      newTo = from; // не позволяем окончанию быть раньше начала
    }
    onChange({ ...values, timeTo: newTo });
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

        {/* Время (промежуток) */}
        <div className="ce-field ce-field--half">
          <label className="ce-label" htmlFor="ce-time-from">
            Время
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="ce-input-wrapper" style={{ flex: 1 }}>
              <input
                id="ce-time-from"
                type="time"
                className="ce-input ce-input--with-icon"
                placeholder="Начало"
                value={values.timeFrom}
                onChange={handleTimeFromChange}
                ref={timeFromRef}
              />
              <button type="button" className="ce-icon-button" onClick={() => openPicker(timeFromRef)} aria-label="Выбрать время начала">
                <IconTime className="ce-input-icon" />
              </button>
            </div>
            <div className="ce-input-wrapper" style={{ flex: 1 }}>
              <input
                id="ce-time-to"
                type="time"
                className="ce-input ce-input--with-icon"
                placeholder="Окончание"
                value={values.timeTo}
                onChange={handleTimeToChange}
                min={values.timeFrom || undefined}
                ref={timeToRef}
              />
              <button type="button" className="ce-icon-button" onClick={() => openPicker(timeToRef)} aria-label="Выбрать время окончания">
                <IconTime className="ce-input-icon" />
              </button>
            </div>
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