import { useEffect, useState } from "react";
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

export default function CreateEventModal({
  isOpen,
  onClose,
  onCreated,
  mode = "create",
  eventId,
  initialActiveTabId,
  initialGeneral,
  initialMapPreviewUrl,
  initialMapPoints,
  initialTimelineItems,
  initialParticipants,
}) {

  const [activeIndex, setActiveIndex] = useState(0);
  const [maxVisitedIndex, setMaxVisitedIndex] = useState(0);

  const initialTabIndex = initialActiveTabId
    ? Math.max(0, TABS.findIndex((t) => t.id === initialActiveTabId))
    : 0;
  const activeTabId = TABS[activeIndex].id;

  // Общая информация
  const [general, setGeneral] = useState(() => initialGeneral || {
    name: "",
    address: "",
    date: "",
    timeFrom: "",
    timeTo: "",
    description: "",
  });

  const [mapPreviewUrl, setMapPreviewUrl] = useState(initialMapPreviewUrl || null);
  const [mapFile, setMapFile] = useState(null);
  const [mapPoints, setMapPoints] = useState(() => Array.isArray(initialMapPoints) ? initialMapPoints : []);
  const [timelineItems, setTimelineItems] = useState(() => Array.isArray(initialTimelineItems) ? initialTimelineItems : []);
  const [participants, setParticipants] = useState(() => Array.isArray(initialParticipants) ? initialParticipants : []);
  // Обложка (картинка для карточки событий)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
  const [coverDataUrl, setCoverDataUrl] = useState(null);

  useEffect(() => {
    if (mode === "edit" && eventId) {
      try {
        const cached = localStorage.getItem(`event_cover:${eventId}`);
        if (cached) {
          setCoverPreviewUrl(cached);
          setCoverDataUrl(cached);
        }
      } catch {}
    }
  }, [mode, eventId]);

  useEffect(() => {
    try {
      if (typeof initialTabIndex === "number" && initialTabIndex >= 0) {
        setActiveIndex(initialTabIndex);
        setMaxVisitedIndex(TABS.length - 1);
      }
    } catch {}
  }, [initialTabIndex]);

  const renderActiveTab = () => {
    switch (activeTabId) {
      case "general":
        return (
          <CreateEventGeneralTab
            values={general}
            onChange={setGeneral}
            coverPreviewUrl={coverPreviewUrl}
            onCoverSelected={async (file) => {
              if (!file) return;
              try {
                const blobUrl = URL.createObjectURL(file);
                const img = new Image();
                const MAX_W = 800;
                const MAX_H = 600;
                img.onload = () => {
                  try {
                    const { width, height } = img;
                    let w = width;
                    let h = height;
                    const ratio = width / height;
                    if (w > MAX_W) {
                      w = MAX_W;
                      h = Math.round(w / ratio);
                    }
                    if (h > MAX_H) {
                      h = MAX_H;
                      w = Math.round(h * ratio);
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, w);
                    canvas.height = Math.max(1, h);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
                    setCoverPreviewUrl(dataUrl);
                    setCoverDataUrl(dataUrl);
                  } catch {}
                  URL.revokeObjectURL(blobUrl);
                };
                img.onerror = () => {
                  URL.revokeObjectURL(blobUrl);
                };
                img.src = blobUrl;
              } catch {}
            }}
          />
        );
      case "map":
        return (
          <CreateEventMapTab
            mapPreviewUrl={mapPreviewUrl}
            points={mapPoints}
            onMapSelected={(file, previewUrl) => {
              setMapFile(file);
              setMapPreviewUrl(previewUrl);
              
              setMapPoints([]);
            }}
            onPointsChange={setMapPoints}
          />
        );
      case "timeline":
        return (
          <CreateEventTimelineTab
            items={timelineItems}
            onChange={setTimelineItems}
            eventTimeFrom={general.timeFrom || undefined}
            eventTimeTo={general.timeTo || undefined}
          />
        );
      case "participants":
        return (
          <CreateEventParticipantsTab
            items={participants}
            onChange={setParticipants}
          />
        );
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
      // Сохранение данных события + привязка карты и точек
      try {
        const token = getToken();
        if (!token) {
          alert("Не авторизовано: войдите как админ, чтобы создавать мероприятия");
          return;
        }
        // Минимальная проверка
        if (!general.name || !general.address || !general.date || !general.timeFrom || !general.timeTo) {
          alert("Заполните название, адрес, дату и промежуток времени");
          return;
        }

        const startISO = new Date(`${general.date}T${general.timeFrom}:00`).toISOString();
        const endISO = new Date(`${general.date}T${general.timeTo}:00`).toISOString();

        if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
          alert("Время окончания должно быть позже времени начала");
          return;
        }

        const payload = {
          name: general.name,
          address: general.address,
          description: general.description || undefined,
          starts_at: startISO,
          ends_at: endISO,
        };

        let createdId = eventId;
        if (mode === "create") {
          const resp = await createEvent(payload);
          createdId = resp?.id || resp?.ID || resp?.event_id;
        } else {
          try {
            const { updateEvent } = await import("../../api/events");
            await updateEvent({
              event_id: createdId,
              name: general.name,
              address: general.address,
              description: general.description || undefined,
              starts_at: startISO,
              ends_at: endISO,
            });
          } catch (e) {
            console.warn("Не удалось обновить общую информацию:", e);
          }
        }

        try {
          if (mapFile && createdId) {
            const { uploadEventMap } = await import("../../api/maps");
            await uploadEventMap(createdId, mapFile);
          }
        } catch (e) {
          console.warn("Не удалось загрузить карту:", e);
        }

        try {
          if (createdId) {
            const { getPointsByEvent } = await import("../../api/points");
            const existing = await getPointsByEvent(createdId).catch(() => []);
            if (Array.isArray(existing)) {
              for (const p of existing) {
                try {
                  const { apiFetch } = await import("../../api/client");
                  await apiFetch(`/admin/events/${createdId}/points/${p.id}`, { method: "DELETE" });
                } catch (err) {
                  console.warn("Не удалось удалить точку:", p.id, err);
                }
              }
            }

            if (Array.isArray(mapPoints) && mapPoints.length) {
              const { createSimplePoint } = await import("../../api/points");
              for (const p of mapPoints) {
                const title = (p.title || "").trim();
                if (!title) continue;
                const x = Math.round(p.x ?? 0);
                const y = Math.round(p.y ?? 0);
                await createSimplePoint({ event_id: createdId, x, y, title });
              }
            }
          }
        } catch (e) {
          console.warn("Не удалось пересохранить простые точки:", e);
        }

        // Сохраняем таймлайн: создаем точки таймлайна
        try {
          if (Array.isArray(timelineItems) && timelineItems.length && createdId) {
            const { createTimelinePoint } = await import("../../api/points");
            for (const item of timelineItems) {
              const desc = (item.description || "").trim();
              const from = (item.timeFrom || "").trim();
              if (!desc || !from) continue;
              const to = (item.timeTo || "").trim();

              const eventStartHHMM = general.timeFrom;
              const eventEndHHMM = general.timeTo;
              const startHHMM = from < eventStartHHMM ? eventStartHHMM : from;
              let endHHMM = (to || from);
              if (endHHMM > eventEndHHMM) endHHMM = eventEndHHMM;
              if (endHHMM < startHHMM) endHHMM = startHHMM;

              const start_at = new Date(`${general.date}T${startHHMM}:00`).toISOString();
              const end_at = new Date(`${general.date}T${endHHMM}:00`).toISOString();

              const title = desc.length > 80 ? desc.slice(0, 80) : desc;

              await createTimelinePoint({
                event_id: createdId,
                x: 0,
                y: 0,
                title,
                start_at,
                end_at,
                timeline_description: desc,
              });
            }
          }
        } catch (e) {
          console.warn("Не удалось сохранить таймлайн:", e);
        }

        // Сохраняем участников
        try {
          if (Array.isArray(participants) && createdId) {
            const { addAllowedEmail, removeAllowedEmail } = await import("../../api/participants");

            const newEmails = [];
            for (const item of participants) {
              const email = (item?.email || "").trim().toLowerCase();
              if (!email) continue;
              newEmails.push(email);
            }

            if (mode === "edit") {
              try {
                const prevRaw = localStorage.getItem(`allowed_emails:${createdId}`);
                const prev = prevRaw ? JSON.parse(prevRaw) : [];
                const prevSet = new Set(Array.isArray(prev) ? prev.map((e) => String(e).toLowerCase()) : []);
                const newSet = new Set(newEmails);
                for (const oldEmail of prevSet) {
                  if (!newSet.has(oldEmail)) {
                    try { await removeAllowedEmail(createdId, oldEmail); } catch (err) {
                      console.warn("Не удалось удалить участника:", oldEmail, err);
                    }
                  }
                }
              } catch {}
            }

            for (const email of new Set(newEmails)) {
              try { await addAllowedEmail(createdId, email); } catch (err) {
                console.warn("Не удалось добавить участника:", email, err);
              }
            }

            try { localStorage.setItem(`allowed_emails:${createdId}`, JSON.stringify([...new Set(newEmails)].sort())); } catch {}
          }
        } catch (e) {
          console.warn("Не удалось сохранить участников:", e);
        }

        try {
          if (coverDataUrl && createdId) {
            localStorage.setItem(`event_cover:${createdId}`, coverDataUrl);
          }
        } catch (e) {
          console.warn("Не удалось сохранить обложку:", e);
        }

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
          <h2 className="create-event-title">{mode === "edit" ? "Редактирование мероприятия" : "Новое мероприятие"}</h2>

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
            {isLastStep ? (mode === "edit" ? "Сохранить изменения" : "Сохранить") : "Далее"}
          </button>
        </div>
      </div>
    </Modal>
  );
}