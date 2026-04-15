import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { setToken } from "./lib/api";
import { AppShell } from "./layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { ClientsPage } from "./pages/ClientsPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export default function Router() {
  const [jwt, setJwt] = useState<string | null>(() => localStorage.getItem("jwt"));

  useEffect(() => {
    setToken(jwt);
    if (jwt) localStorage.setItem("jwt", jwt);
    else localStorage.removeItem("jwt");
  }, [jwt]);

  if (!jwt) {
    return <LoginPage onAuthed={(t) => setJwt(t)} />;
  }

  return (
    <Routes>
      <Route element={<AppShell onLogout={() => setJwt(null)} />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route
          path="/payroll"
          element={<PlaceholderPage title="Nómina" note="UI completa pendiente; API lista." />}
        />
        <Route
          path="/invoices"
          element={<PlaceholderPage title="Facturación" note="UI completa pendiente; API lista." />}
        />
        <Route
          path="/banking"
          element={<PlaceholderPage title="Conciliación" note="UI completa pendiente; API lista." />}
        />
        <Route
          path="/declarations"
          element={<PlaceholderPage title="Declaraciones" note="UI completa pendiente; API lista." />}
        />
        <Route
          path="/alerts"
          element={<PlaceholderPage title="Alertas" note="UI completa pendiente; API lista." />}
        />
        <Route path="*" element={<Navigate to="/clients" replace />} />
      </Route>
    </Routes>
  );
}

