import LogoIcon from "../../assets/icons/logo-tbank.svg?react";
import SearchIcon from "../../assets/icons/icon-search.svg?react";
import UserIcon from "../../assets/icons/icon-user.svg?react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function Header({ isAuthenticated = false, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  // Синхронизируем поле поиска с параметром ?q= на странице /events
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      const q = params.get("q") || "";
      // Обновляем только на роуте /events, иначе не трогаем текущее значение
      if (location.pathname.startsWith("/events")) {
        setQuery(q);
      }
    } catch {}
  }, [location.pathname, location.search]);

  const goMyEvents = () => {
    if (!isAuthenticated) return;
    navigate("/events");
  };

  const openCreateEvent = () => {
    if (!isAuthenticated) return;
    navigate("/events", { state: { openCreate: true } });
  };

  const runSearch = () => {
    if (!isAuthenticated) return;
    const q = (query || "").trim();
    if (q) navigate(`/events?q=${encodeURIComponent(q)}`);
    else navigate("/events");
  };

  return (
    <header className="app-header">
      <div className="container app-header__inner">

        {/* Логотип */}
        <div className="header-logo">
          <LogoIcon className="header-logo__svg" />
        </div>

        {/* Навигация */}
        <nav className="app-header__nav">
          <span
            className={`app-header__nav-item ${!isAuthenticated ? "disabled" : ""}`}
            role="button"
            tabIndex={0}
            onClick={goMyEvents}
            onKeyDown={(e) => { if (e.key === "Enter") goMyEvents(); }}
            style={{ cursor: isAuthenticated ? "pointer" : "default" }}
          >
            Мои мероприятия
          </span>
          <span
            className={`app-header__nav-item ${!isAuthenticated ? "disabled" : ""}`}
            role="button"
            tabIndex={0}
            onClick={openCreateEvent}
            onKeyDown={(e) => { if (e.key === "Enter") openCreateEvent(); }}
            style={{ cursor: isAuthenticated ? "pointer" : "default" }}
          >
            Создать мероприятие
          </span>
        </nav>

        {/* Поиск */}
        <div className={`app-header__search ${!isAuthenticated ? "disabled" : ""}`}>
          <div className="header-search">
            <input
              className="header-search__input"
              type="text"
              placeholder="Поиск"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              disabled={!isAuthenticated}
            />
            <SearchIcon
              className="header-search__icon"
              onClick={runSearch}
              style={{ cursor: isAuthenticated ? "pointer" : "default" }}
            />
          </div>
        </div>

        {/* Авторизация */}
        <div className={`app-header__auth ${!isAuthenticated ? "disabled" : ""}`}>
          {isAuthenticated ? (
            <span
              className="app-header__auth-text"
              onClick={onLogout}
              style={{ cursor: "pointer" }}
            >
              Выйти
            </span>
          ) : (
            <span className="app-header__auth-text">Войти</span>
          )}

          <UserIcon className="app-header__avatar-icon" />
        </div>

      </div>
    </header>
  );
}