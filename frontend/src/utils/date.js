// Утилиты форматирования дат и времени для RU-локали

function normalizeInput(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value) {
    // Handle database/sql nullable wrappers from backend JSON
    if ("Time" in value) {
      // sql.NullTime → { Time: string, Valid: bool }
      if (value.Valid === false) return null;
      return value.Time || null;
    }
    if ("String" in value) {
      // sql.NullString → { String: string, Valid: bool }
      if (value.Valid === false) return null;
      return value.String || null;
    }
  }
  return String(value);
}

export function parseDbDate(value) {
  let s = normalizeInput(value);
  if (!s) return null;

  // Normalize common DB formats to ISO-8601
  // Examples to handle:
  // - "2025-12-01T10:00:00Z"
  // - "2025-12-01T10:00:00"
  // - "2025-12-01 10:00:00+00"
  // - "2025-12-01 10:00:00+00:00"
  // - "2025-12-01 10:00"
  let normalized = s.trim();
  // Replace space between date and time with 'T'
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?(.*)$/.test(normalized)) {
    normalized = normalized.replace(" ", "T");
  }
  // If timezone like +00 or +00:00 without seconds, it's fine; Date can parse.
  // If missing seconds, add :00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    normalized += ":00";
  }
  // If no timezone designator present, append 'Z' to treat as UTC (prevents invalid parse on some engines)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
    normalized += "Z";
  }

  const d = new Date(normalized);
  if (!Number.isNaN(d.getTime())) return d;

  // Fallback: try Date.parse directly
  const ts = Date.parse(normalized);
  if (!Number.isNaN(ts)) return new Date(ts);

  return null;
}

export function formatTimeRU(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateLongRU(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShortRU(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function sameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildEventDateTexts(startsRaw, endsRaw) {
  const starts = parseDbDate(startsRaw);
  const ends = parseDbDate(endsRaw);

  let dateText = "";
  let timeText = "";

  if (starts && ends) {
    if (sameDay(starts, ends)) {
      dateText = formatDateLongRU(starts);
      timeText = `${formatTimeRU(starts)} — ${formatTimeRU(ends)}`;
    } else {
      dateText = `${formatDateLongRU(starts)} — ${formatDateLongRU(ends)}`;
      timeText = `${formatTimeRU(starts)} — ${formatTimeRU(ends)}`;
    }
  } else if (starts) {
    dateText = formatDateLongRU(starts);
    timeText = formatTimeRU(starts);
  } else if (ends) {
    dateText = formatDateLongRU(ends);
    timeText = formatTimeRU(ends);
  }

  return { dateText, timeText };
}
