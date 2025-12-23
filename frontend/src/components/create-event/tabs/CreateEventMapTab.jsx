import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import "../../../styles/create-event/create-event-map.css";

import IconDownload from "../../../assets/icons/icon-download2.svg?react";
import IconPlus from "../../../assets/icons/icon-plus.svg?react";
import IconPoint from "../../../assets/icons/icon-point.svg?react";



export default function CreateEventMapTab({ mapPreviewUrl, points: pointsProp = [], onMapSelected, onPointsChange }) {
  const [imageUrl, setImageUrl] = useState(mapPreviewUrl || null);
  const [points, setPoints] = useState(pointsProp || []);
  const [isAddingPoint, setIsAddingPoint] = useState(false);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [overlayBox, setOverlayBox] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const [activePointId, setActivePointId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);

  const fileInputRef = useRef(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPoints([]);
    setActivePointId(null);
    setDraftTitle("");
    setPopupPosition(null);

    // Сообщаем родителю о выбранной карте
    try {
      onMapSelected && onMapSelected(file, url);
    } catch {}
  };

  const handleStartAddPoint = () => {
    if (!imageUrl) return;
    setIsAddingPoint(true);
    setActivePointId(null);
    setDraftTitle("");
    setPopupPosition(null);
  };

  const handleMapClick = (event) => {
    if (!isAddingPoint || !imageUrl) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const imgRect = img.getBoundingClientRect();
    // Игнорируем клики вне самой картинки (по серым полям)
    if (
      event.clientX < imgRect.left ||
      event.clientX > imgRect.right ||
      event.clientY < imgRect.top ||
      event.clientY > imgRect.bottom
    ) {
      return;
    }

    const x = ((event.clientX - imgRect.left) / imgRect.width) * 100;
    const y = ((event.clientY - imgRect.top) / imgRect.height) * 100;

    const newPoint = {
      id: Date.now(),
      x,
      y,
      title: "",
    };

    setPoints((prev) => {
      const next = [...prev, newPoint];
      try { onPointsChange && onPointsChange(next); } catch {}
      return next;
    });
    setIsAddingPoint(false);
    setActivePointId(newPoint.id);
    setDraftTitle("");
    

    setPopupPosition({
      left: event.clientX + 16,
      top: event.clientY + 16,
    });
  };

  const handlePointClick = (pointId, event) => {
    event.stopPropagation();

    const point = points.find((p) => p.id === pointId);
    if (!point) return;

    setActivePointId(pointId);
    setIsAddingPoint(false);
    setDraftTitle(point.title || "");
    

    const rect = event.currentTarget.getBoundingClientRect();

    setPopupPosition({
      left: rect.left + rect.width + 16,
      top: rect.top,
    });
  };

  const handleTitleChange = (event) => {
    setDraftTitle(event.target.value);
  };

  

  

  const handleClosePopup = () => {
    if (activePointId) {
      const point = points.find((p) => p.id === activePointId);

      // Удаление пустой точки
      if (point && (point.title || "").trim() === "") {
        setPoints((prev) => prev.filter((p) => p.id !== activePointId));
      }
    }
    setActivePointId(null);
    setDraftTitle("");
    setPopupPosition(null);
  };

  const handleSavePoint = () => {
    if (!activePointId) return;

    setPoints((prev) => {
      const next = prev.map((p) =>
        p.id === activePointId
          ? {
              ...p,
              title: draftTitle.trim(),
            }
          : p
      );
      try { onPointsChange && onPointsChange(next); } catch {}
      return next;
    });

    setActivePointId(null);
    setDraftTitle("");
    setPopupPosition(null);
  };

  const handleDeletePoint = () => {
    if (!activePointId) return;

    setPoints((prev) => {
      const next = prev.filter((p) => p.id !== activePointId);
      try { onPointsChange && onPointsChange(next); } catch {}
      return next;
    });

    setActivePointId(null);
    setDraftTitle("");
    setPopupPosition(null);
  };

  const activePoint = points.find((p) => p.id === activePointId) || null;
  const isExistingPoint =
    activePoint && (activePoint.title || "").trim().length > 0;

  const popupPortal =
    activePoint && popupPosition
      ? ReactDOM.createPortal(
          <div
            className="ce-map-point-popup-overlay"
            onClick={handleClosePopup}
          >
            <div
              className="ce-map-point-popup-positioner"
              style={{ top: popupPosition.top, left: popupPosition.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ce-map-point-popup">

                <div className="ce-map-point-popup-header">
                  <span className="ce-map-point-popup-title">Заголовок точки</span>
                </div>
                <input
                  className="ce-map-point-title-input"
                  type="text"
                  value={draftTitle}
                  onChange={handleTitleChange}
                  placeholder="Введите заголовок точки"
                />

                

                <div className="ce-map-point-popup-actions">
                  <button
                    className="ce-map-point-popup-primary"
                    type="button"
                    onClick={isExistingPoint ? handleDeletePoint : handleSavePoint}
                    disabled={!isExistingPoint && draftTitle.trim().length === 0}
                  >
                    {isExistingPoint ? "Удалить" : "Добавить"}
                  </button>

                  <button
                    className="ce-map-point-popup-cancel"
                    type="button"
                    onClick={handleClosePopup}
                  >
                    Отменить
                  </button>
                </div>


              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // При изменении пропсов восстанавливаем локальное состояние (при переключении вкладок)
  // Это позволяет не терять карту/точки
  // И избегаем бесконечного цикла: обновляем только когда значения реально отличаются
  if (mapPreviewUrl && mapPreviewUrl !== imageUrl) {
    setImageUrl(mapPreviewUrl);
  }
  if (Array.isArray(pointsProp) && pointsProp !== points) {
    // Простая сверка по длине
    if (pointsProp.length !== points.length) setPoints(pointsProp);
  }

  // Обновляем позицию и размер оверлея под фактический прямоугольник изображения
  const updateOverlay = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const imgRect = img.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    setOverlayBox({
      left: imgRect.left - canvasRect.left,
      top: imgRect.top - canvasRect.top,
      width: imgRect.width,
      height: imgRect.height,
    });
  };

  useEffect(() => {
    updateOverlay();
    const onResize = () => updateOverlay();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  return (
    <div className="ce-tab ce-map-tab">
      <div className="ce-map-toolbar">
        <button
          type="button"
          className={
            "ce-map-toolbar-btn " +
            (imageUrl
              ? "ce-map-toolbar-btn--filled"
              : "ce-map-toolbar-btn--primary")
          }
          onClick={handleUploadClick}
        >
          <IconDownload className="ce-map-toolbar-btn__icon" />
          <span className="ce-map-toolbar-btn__text">
            {imageUrl ? "Поменять карту" : "Загрузить карту"}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          type="button"
          className={
            "ce-map-toolbar-btn ce-map-toolbar-btn--muted" +
            (isAddingPoint ? " ce-map-toolbar-btn--active" : "")
          }
                  onClick={handleStartAddPoint}
          disabled={!imageUrl}
        >
          <IconPlus className="ce-map-toolbar-btn__icon" />
          <span className="ce-map-toolbar-btn__text">
            Добавить точку
          </span>
        </button>

        {isAddingPoint && (
          <span className="ce-map-hint">
            Кликните по карте, чтобы добавить точку
          </span>
        )}
      </div>

      <div
        className={
          "ce-map-canvas" + (!imageUrl ? " ce-map-canvas--empty" : "")
        }
        ref={canvasRef}
        onClick={handleMapClick}
      >
        {!imageUrl && (
          <div className="ce-map-placeholder">
            Загрузите изображение карты, чтобы добавить точки
          </div>
        )}

        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="Карта мероприятия"
              className="ce-map-image"
              ref={imgRef}
              onLoad={updateOverlay}
            />
            {/* Оверлей ровно по области изображения */}
            <div
              style={{
                position: "absolute",
                left: overlayBox.left,
                top: overlayBox.top,
                width: overlayBox.width,
                height: overlayBox.height,
                pointerEvents: "none",
              }}
            >
              {points.map((point) => {
                const isActive = point.id === activePointId;
                return (
                  <button
                    key={point.id}
                    className={
                      "ce-map-point" + (isActive ? " ce-map-point--active" : "")
                    }
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      pointerEvents: "auto",
                    }}
                    onClick={(e) => handlePointClick(point.id, e)}
                  >
                    <IconPoint className="ce-map-point-icon" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {popupPortal}
    </div>
  );
}