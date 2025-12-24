import { useEffect, useMemo, useRef, useState } from "react";
import PlusIcon from "../../../assets/icons/icon-plus2.svg?react";
import CrossIcon from "../../../assets/icons/icon-cross-small.svg?react";

import "../../../styles/create-event/create-event-general.css";
import "../../../styles/create-event/create-event-timeline.css";
import "../../../styles/create-event/create-event-participants.css";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isValidEmail(v) {
  const s = (v || "").trim();
  if (!s) return false;
  return /.+@.+\..+/.test(s);
}

export default function CreateEventParticipantsTab({ items: itemsProp = [], onChange }) {
  const [items, setItems] = useState(() => (
    Array.isArray(itemsProp) && itemsProp.length
      ? itemsProp
      : [{ id: uid(), email: "", isEditing: true }]
  ));

  const activeEditId = useMemo(
    () => items.find((x) => x.isEditing)?.id ?? null,
    [items]
  );

  const emailRef = useRef(null);

  const addItem = () => {
    setItems((prev) => [
      ...prev.map((x) => ({ ...x, isEditing: false })),
      { id: uid(), email: "", isEditing: true },
    ]);
    setShouldFocus(true);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      return next.length ? next : [{ id: uid(), email: "", isEditing: true }];
    });
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const startEdit = (id) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isEditing: true } : { ...x, isEditing: false })));
  };

  const commitIfFilled = (id) => {
    setItems((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      const hasAny = (x.email || "").trim();
      return hasAny ? { ...x, isEditing: false } : x;
    }));
  };

  const [shouldFocus, setShouldFocus] = useState(false);

  useEffect(() => {
    try { onChange && onChange(items); } catch {}
  }, [items, onChange]);

  useEffect(() => {
    if (Array.isArray(itemsProp)) {
      const needUpdate = itemsProp.length !== items.length;
      if (needUpdate) setItems(itemsProp.length ? itemsProp : [{ id: uid(), email: "", isEditing: true }]);
    }

  }, [itemsProp?.length]);

  useEffect(() => {
    if (!shouldFocus) return;
    const raf = requestAnimationFrame(() => {
      const el = emailRef?.current;
      if (el) {
        try { el.focus(); } catch {}
      }
      setShouldFocus(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [shouldFocus, activeEditId]);

  return (
    <div className="ce-tab ce-participants-tab">
      <div className="ce-timeline-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="ce-timeline-row"
            onClick={() => !item.isEditing && startEdit(item.id)}
          >
            {item.isEditing ? (
              <input
                ref={item.id === activeEditId ? emailRef : null}
                type="email"
                className="ce-input ce-tl-desc-input"
                placeholder="email@example.com"
                value={item.email}
                onChange={(e) => updateItem(item.id, { email: e.target.value })}
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
                title={item.email}
              >
                <span className="ce-tl-desc-ellipsis">
                  {item.email?.trim() || "email@example.com"}
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
              aria-label="Удалить"
            >
              <CrossIcon width={19} height={24} className="ce-timeline-remove__icon" />
            </button>
          </div>
        ))}
      </div>

      {/* + ДОБАВИТЬ */}
      <button type="button" className="ce-timeline-add" onClick={addItem}>
        <PlusIcon width={16} height={23} />
        <span>Добавить участника</span>
      </button>
    </div>
  );
}