import { Header } from "./Header";
import { Footer } from "./Footer";
import "../../styles/layout.css";

export function AppLayout({ isAuthenticated, onLogout, children }) {
  return (
    <div className="app-shell">
      <Header isAuthenticated={isAuthenticated} onLogout={onLogout} />

      <main className="app-main">
        <div className="container">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}