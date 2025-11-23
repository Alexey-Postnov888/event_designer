import LogoIcon from "../../assets/icons/logo-tbank.svg?react";
import SearchIcon from "../../assets/icons/icon-search.svg?react";
import UserIcon from "../../assets/icons/icon-user.svg?react";

export function Header({ isAuthenticated = false, onLogout }) {
  return (
    <header className="app-header">
      <div className="container app-header__inner">

        {/* Логотип */}
        <div className="header-logo">
          <LogoIcon className="header-logo__svg" />
        </div>

        {/* Навигация */}
        <nav className="app-header__nav">
          <span className={`app-header__nav-item ${!isAuthenticated ? "disabled" : ""}`}>
            Мои мероприятия
          </span>
          <span className={`app-header__nav-item ${!isAuthenticated ? "disabled" : ""}`}>
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
              disabled={!isAuthenticated}
            />
            <SearchIcon className="header-search__icon" />
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