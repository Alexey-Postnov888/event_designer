import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./styles/login.css";
import "./styles/events.css";

import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import MyEventsPage from "./pages/MyEventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";

import { mockEvents } from "./mock/events";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [events, setEvents] = useState(mockEvents);

  const updateEventStatus = (id, newStatus) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, status: newStatus } : ev
      )
    );
  };

  return (
    <AppLayout isAuthenticated={isAuthenticated} onLogout={() => setIsAuthenticated(false)}>
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
              ? <MyEventsPage events={events} />
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