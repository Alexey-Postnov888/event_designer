import { useEffect, useRef, useState } from "react";
import "../../../styles/event-details/event-details-map.css";
import { getEventMap } from "../../../api/maps";
import { getPointsByEvent } from "../../../api/points";
import IconPoint from "../../../assets/icons/icon-point.svg?react";

export default function MapTab({ event, refreshKey = 0 }) {
  const [mapUrl, setMapUrl] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef(null);
  const [dims, setDims] = useState({ naturalWidth: 0, naturalHeight: 0, clientWidth: 0, clientHeight: 0 });
  const [activePoint, setActivePoint] = useState(null);
  const toText = (v) => {
    if (v == null) return "";
    const t = typeof v;
    if (t === "string" || t === "number" || t === "boolean") return String(v);
    if (t === "object") {
      const hasValid = Object.prototype.hasOwnProperty.call(v, "Valid") ? Boolean(v.Valid) : undefined;
      if (Object.prototype.hasOwnProperty.call(v, "String")) {
        return hasValid === false ? "" : (v.String || "");
      }
      if (Object.prototype.hasOwnProperty.call(v, "Time")) {
        return hasValid === false ? "" : (typeof v.Time === "string" ? v.Time : "");
      }
      return "";
    }
    return "";
  };

  const normalizeMapUrl = (url) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      
      if (u.pathname && u.pathname.startsWith("/static/")) {
        return u.pathname;
      }
      return url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [mapRes, pointsRes] = await Promise.all([
          getEventMap(event.id),
          getPointsByEvent(event.id),
        ]);
        if (cancelled) return;
        setMapUrl(normalizeMapUrl(mapRes?.map_url || null));
        const simpleOnly = Array.isArray(pointsRes)
          ? pointsRes.filter((p) => {
              const desc = toText(p.timeline_description).trim();
              const s = toText(p.start_at).trim();
              const e = toText(p.end_at).trim();
              return !(desc || s || e);
            })
          : [];
        setPoints(simpleOnly);
      } catch (e) {
        const msg = String(e?.message || "");
        if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
          setMapUrl(null);
          setPoints([]);
          setError("");
        } else {
          setError("Не удалось получить карту или точки");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [event.id, refreshKey]);

  const onImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setDims({
      naturalWidth: img.naturalWidth || 0,
      naturalHeight: img.naturalHeight || 0,
      clientWidth: img.clientWidth || 0,
      clientHeight: img.clientHeight || 0,
    });
  };

  useEffect(() => {
    const onResize = () => {
      const img = imgRef.current;
      if (!img) return;
      setDims((prev) => ({
        ...prev,
        clientWidth: img.clientWidth || 0,
        clientHeight: img.clientHeight || 0,
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scaleX = dims.naturalWidth ? (dims.clientWidth / dims.naturalWidth) : 1;
  const scaleY = dims.naturalHeight ? (dims.clientHeight / dims.naturalHeight) : 1;

  const handlePointClick = (p) => {
    setActivePoint(p);
  };

  const closePopup = () => {
    setActivePoint(null);
  };

  const renderPopup = () => {
    if (!activePoint) return null;
    const title = toText(activePoint.title) || "Точка";
 
    const leftPct = typeof activePoint.x === "number" ? activePoint.x : Number(activePoint.x) || 0;
    const topPct = typeof activePoint.y === "number" ? activePoint.y : Number(activePoint.y) || 0;
    return (
      <div
        className="ed-map-point-popup-positioner"
        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="ed-map-point-popup">
          <div className="ed-map-point-popup-header">
            <span className="ed-map-point-popup-title">{title}</span>
            <button type="button" className="ed-map-point-popup-close" onClick={closePopup} aria-label="Закрыть">×</button>
          </div>
      
        </div>
      </div>
    );
  };

  return (
    <section className="event-details-content">
      <div className="event-details-content-card">

        {loading && <div className="event-details-map-status">Загрузка...</div>}
        {error && !loading && <div className="event-details-map-error">{error}</div>}

        {!mapUrl && !loading && (
          <div className="event-details-map-placeholder">Карта пока не загружена</div>
        )}

        {mapUrl && (
          <div className="event-details-map-stage" onClick={closePopup}>
            <img ref={imgRef} src={mapUrl} alt="Карта мероприятия" onLoad={onImageLoad} />
            {points.map((p) => {
              const leftPct = typeof p.x === "number" ? p.x : Number(p.x) || 0;
              const topPct = typeof p.y === "number" ? p.y : Number(p.y) || 0;
              return (
                <button
                  key={String(p.id || `${p.x}-${p.y}`)}
                  className="ed-map-point"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  title={toText(p.title) || "Точка"}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePointClick(p); }}
                >
                  <IconPoint className="ed-map-point-icon" />
                </button>
              );
            })}
            {renderPopup()}
          </div>
        )}
      </div>
    </section>
  );
}