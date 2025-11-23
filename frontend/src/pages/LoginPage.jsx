export default function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        
        <h3 className="login-title">Вход в конструктор мероприятий</h3>
        
        <div className="login-fields">
          <input
            type="text"
            placeholder="Логин"
            className="login-input"
          />

          <input
            type="password"
            placeholder="Пароль"
            className="login-input"
          />
          
          <button className="btn btn-primary login-button" 
          type="button"onClick={onLogin} // Заглушка
          >Войти</button>
        </div>
      </div>
    </div>
  );
}