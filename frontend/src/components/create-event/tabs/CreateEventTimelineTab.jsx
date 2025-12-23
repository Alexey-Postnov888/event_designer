import { useEffect, useMemo, useRef, useState } from "react";

import "../../../styles/create-event/create-event-general.css";
import "../../../styles/create-event/create-event-timeline.css";

import PlusIcon from "../../../assets/icons/icon-plus2.svg?react";
import CrossIcon from "../../../assets/icons/icon-cross-small.svg?react";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function clampToDay(hhmm) {
  if (!hhmm) return "";
  const [hStr = "0", mStr = "0"] = hhmm.split(":");
  let h = Math.max(0, Math.min(23, parseInt(hStr, 10) || 0));
  let m = Math.max(0, Math.min(59, parseInt(mStr, 10) || 0));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function clampWithin(hhmm, minHHMM, maxHHMM) {
  const v = clampToDay(hhmm);
  const min = minHHMM ? clampToDay(minHHMM) : "00:00";
  const max = maxHHMM ? clampToDay(maxHHMM) : "23:59";
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function openPickerEl(el) {
  if (!el) return;
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
      return;
    } catch {}
  }
  el.focus();
}

function openPickerRef(ref) {
  const el = ref?.current;
  if (!el) return;
  openPickerEl(el);
}

export default function CreateEventTimelineTab({ items: itemsProp = [], onChange, eventTimeFrom, eventTimeTo }) {
  const [items, setItems] = useState(() => (
    Array.isArray(itemsProp) && itemsProp.length
      ? itemsProp
      : [{ id: uid(), timeFrom: "", timeTo: "", description: "", isEditing: true }]
  ));

  const activeEditId = useMemo(
    () => items.find((x) => x.isEditing)?.id ?? null,
    [items]
  );

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const descRef = useRef(null);

  const addItem = () => {
    setItems((prev) => [
      ...prev.map((x) => ({ ...x, isEditing: false })),
      { id: uid(), timeFrom: "", timeTo: "", description: "", isEditing: true },
    ]);
    setShouldOpenPicker(true);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      return next.length
        ? next
        : [{ id: uid(), timeFrom: "", timeTo: "", description: "", isEditing: true }];
    });
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const startEdit = (id) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, isEditing: true } : { ...x, isEditing: false }
      )
    );
  };

  const commitIfFilled = (id) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const hasAny =
          (x.description || "").trim() ||
          (x.timeFrom || "").trim() ||
          (x.timeTo || "").trim();
        return hasAny ? { ...x, isEditing: false } : x;
      })
    );
  };

  const [shouldOpenPicker, setShouldOpenPicker] = useState(false);

  useEffect(() => {
    try { onChange && onChange(items); } catch {}
  }, [items, onChange]);

  useEffect(() => {
    if (Array.isArray(itemsProp)) {
      const needUpdate = itemsProp.length !== items.length;
      if (needUpdate) setItems(itemsProp.length ? itemsProp : [{ id: uid(), timeFrom: "", timeTo: "", description: "", isEditing: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsProp?.length]);

  useEffect(() => {
    if (!shouldOpenPicker) return;
    const raf = requestAnimationFrame(() => {
      openPickerRef(fromRef);
      setShouldOpenPicker(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [shouldOpenPicker, activeEditId]);

  // Клампим существующие значения при смене границ события
  useEffect(() => {
    setItems((prev) => prev.map((x) => {
      const from = x.timeFrom ? clampWithin(x.timeFrom, eventTimeFrom, eventTimeTo) : x.timeFrom;
      let to = x.timeTo ? clampWithin(x.timeTo, from || eventTimeFrom, eventTimeTo) : x.timeTo;
      if (to && from && to < from) to = from;
      return { ...x, timeFrom: from, timeTo: to };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTimeFrom, eventTimeTo]);

  return (
    <div className="ce-tab ce-timeline-tab">
      <div className="ce-timeline-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="ce-timeline-row"
            onClick={() => !item.isEditing && startEdit(item.id)}
          >
            {/* ВРЕМЯ */}
            <div className="ce-tl-time-edit" onClick={(e) => e.stopPropagation()}>
              <input
                ref={item.id === activeEditId ? fromRef : null}
                type="time"
                className="ce-input ce-tl-time-input"
                value={item.timeFrom}
                onChange={(e) => {
                  const v = clampWithin(e.target.value, eventTimeFrom, eventTimeTo);
                  let nextTo = item.timeTo ? clampWithin(item.timeTo, v || eventTimeFrom, eventTimeTo) : item.timeTo;
                  if (nextTo && v && nextTo < v) nextTo = v;
                  updateItem(item.id, { timeFrom: v, timeTo: nextTo });
                }}
                onClick={(e) => openPickerEl(e.currentTarget)}
                onFocus={(e) => openPickerEl(e.currentTarget)}
                min={eventTimeFrom || undefined}
                max={eventTimeTo || undefined}
                onBlur={() => commitIfFilled(item.id)}
              />

              <span className="ce-tl-time-sep">—</span>

              <input
                ref={item.id === activeEditId ? toRef : null}
                type="time"
                className="ce-input ce-tl-time-input"
                value={item.timeTo}
                min={(item.timeFrom || eventTimeFrom || undefined)}
                max={eventTimeTo || undefined}
                onChange={(e) => {
                  const from = item.timeFrom || eventTimeFrom || "";
                  const nextTo = clampWithin(e.target.value, from, eventTimeTo);
                  updateItem(item.id, { timeTo: nextTo });
                }}
                onClick={(e) => openPickerEl(e.currentTarget)}
                onFocus={(e) => openPickerEl(e.currentTarget)}
                onBlur={() => commitIfFilled(item.id)}
              />
            </div>

            {/* ОПИСАНИЕ */}
            {item.isEditing ? (
              <input
                ref={item.id === activeEditId ? descRef : null}
                type="text"
                className="ce-input ce-tl-desc-input"
                placeholder="Описание"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                onBlur={() => commitIfFilled(item.id)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitIfFilled(item.id);
                  }
                }}
              />
            ) : (
              <button
                type="button"
                className="ce-input ce-tl-pill ce-tl-desc ce-tl-pill--placeholder"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(item.id);
                }}
              >
                <span className="ce-tl-desc-ellipsis">
                  {item.description?.trim() || "Описание"}
                </span>
              </button>
            )}

            {/* УДАЛИТЬ */}
            <button
              type="button"
              className="ce-timeline-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              aria-label="Удалить событие"
            >
              <CrossIcon width={19} height={24} className="ce-timeline-remove__icon" />
            </button>
          </div>
        ))}
      </div>

      {/* + ДОБАВИТЬ */}
      <button type="button" className="ce-timeline-add" onClick={addItem}>
        <PlusIcon width={16} height={23} />
        <span>Добавить событие</span>
      </button>
    </div>
  );
}
