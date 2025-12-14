import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./styles/login.css";
import "./styles/events.css";

import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import MyEventsPage from "./pages/MyEventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";

import { listEvents } from "./api/events";
import { getToken, clearToken } from "./api/client";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const updateEventStatus = (id, newStatus) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, status: newStatus } : ev
      )
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setEvents([]);
      return;
    }
    setLoadingEvents(true);
    setEventsError("");
    listEvents()
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((e) => setEventsError(e.message || "Не удалось загрузить мероприятия"))
      .finally(() => setLoadingEvents(false));
  }, [isAuthenticated]);

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AppLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/events" replace />
              : <LoginPage onLogin={() => setIsAuthenticated(true)} />
          }
        />

        <Route
          path="/events"
          element={
            isAuthenticated
              ? <MyEventsPage events={events} loading={loadingEvents} error={eventsError} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/events/:id"
          element={
            isAuthenticated
              ? <EventDetailsPage events={events} onUpdateStatus={updateEventStatus} />
              : <Navigate to="/" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;