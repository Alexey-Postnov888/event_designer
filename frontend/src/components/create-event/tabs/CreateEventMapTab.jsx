import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import "../../../styles/create-event/create-event-map.css";

export default function CreateEventMapTab() {
  const [imageUrl, setImageUrl] = useState(null);
  const [points, setPoints] = useState([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);

  const [activePointId, setActivePointId] = useState(null);
  const [draftText, setDraftText] = useState("");
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
    setDraftText("");
    setPopupPosition(null);
  };

  const handleStartAddPoint = () => {
    if (!imageUrl) return;
    setIsAddingPoint(true);
    setActivePointId(null);
    setDraftText("");
    setPopupPosition(null);
  };

  const handleMapClick = (event) => {
    if (!isAddingPoint || !imageUrl) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPoint = {
      id: Date.now(),
      x,
      y,
      text: "",
    };

    setPoints((prev) => [...prev, newPoint]);
    setIsAddingPoint(false);
    setActivePointId(newPoint.id);
    setDraftText("");

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
    setDraftText(point.text);

    const rect = event.currentTarget.getBoundingClientRect();

    setPopupPosition({
      left: rect.left + rect.width + 16,
      top: rect.top,
    });
  };

  const handleDraftChange = (event) => {
    setDraftText(event.target.value);
  };

  const handleClosePopup = () => {
    if (activePointId) {
      const point = points.find((p) => p.id === activePointId);

      // Удаление пустой точки
      if (point && point.text.trim() === "") {
        setPoints((prev) => prev.filter((p) => p.id !== activePointId));
      }
    }
    setActivePointId(null);
    setDraftText("");
    setPopupPosition(null);
  };

  const handleSavePoint = () => {
    if (!activePointId) return;

    setPoints((prev) =>
      prev.map((p) =>
        p.id === activePointId ? { ...p, text: draftText.trim() } : p
      )
    );

    setActivePointId(null);
    setDraftText("");
    setPopupPosition(null);
  };

  const handleDeletePoint = () => {
    if (!activePointId) return;

    setPoints((prev) => prev.filter((p) => p.id !== activePointId));

    setActivePointId(null);
    setDraftText("");
    setPopupPosition(null);
  };

  const activePoint = points.find((p) => p.id === activePointId) || null;
  const isExistingPoint =
    activePoint && activePoint.text.trim().length > 0;

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
                  <span className="ce-map-point-popup-title">
                    Описание точки
                  </span>
                </div>

                <textarea
                  className="ce-map-point-popup-textarea"
                  value={draftText}
                  onChange={handleDraftChange}
                  placeholder="Введите описание точки"
                  rows={5}
                ></textarea>

                <div className="ce-map-point-popup-actions">

                  {isExistingPoint ? (
                    <button
                      className="btn ce-map-point-popup-delete"
                      type="button"
                      onClick={handleDeletePoint}
                    >
                      Удалить
                    </button>
                  ) : (
                    <button
                      className="btn ce-map-point-popup-cancel"
                      type="button"
                      onClick={handleClosePopup}
                    >
                      Отмена
                    </button>
                  )}

                  <button
                    className="btn ce-map-point-popup-submit"
                    type="button"
                    onClick={handleSavePoint}
                    disabled={draftText.trim().length === 0}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="ce-tab ce-map-tab">
      <div className="ce-map-toolbar">
        <button
          className="btn ce-map-upload-btn btn-primary"
          type="button"
          onClick={handleUploadClick}
        >
          Загрузить карту
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          className="btn ce-map-add-point-btn"
          type="button"
          onClick={handleStartAddPoint}
          disabled={!imageUrl}
        >
          Добавить точку
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
            />

            {points.map((point) => {
              const isActive = point.id === activePointId;

              return (
                <button
                  key={point.id}
                  className={
                    "ce-map-point" +
                    (isActive ? " ce-map-point--active" : "")
                  }
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  onClick={(e) => handlePointClick(point.id, e)}
                >
                  <span className="ce-map-point-dot" />
                </button>
              );
            })}
          </>
        )}
      </div>

      {popupPortal}
    </div>
  );
}