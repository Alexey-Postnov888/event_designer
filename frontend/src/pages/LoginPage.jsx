import { useState } from "react";
import { login as loginApi } from "../api/auth";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await loginApi(email, password);
      onLogin && onLogin();
    } catch (e) {
      setError("Ошибка входа: " + (e.message || "неизвестная ошибка"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h3 className="login-title">Вход в конструктор мероприятий</h3>
        <div className="login-fields">
          <input
            type="text"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <div style={{ color: "red", marginTop: 8 }}>{error}</div> : null}
          <button
            className="btn btn-primary login-button"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Входим…" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}