import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./styles/login.css";
import "./styles/events.css";
import "./styles/event-details.css";

import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import MyEventsPage from "./pages/MyEventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AppLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
      <Routes>
        {/* страница логина */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/events" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* список мероприятий */}
        <Route
          path="/events"
          element={
            isAuthenticated ? (
              <MyEventsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* внутренняя страница мероприятия */}
        <Route
          path="/events/:id"
          element={
            isAuthenticated ? (
              <EventDetailsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* всё остальное → на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;