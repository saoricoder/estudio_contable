/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { setToken } from "./lib/api";
import { AppShell } from "./layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { ClientsPage } from "./pages/ClientsPage";
import { PayrollPage } from "./pages/PayrollPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { BankingPage } from "./pages/BankingPage";
import { DeclarationsPage } from "./pages/DeclarationsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

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
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/banking" element={<BankingPage />} />
        <Route path="/declarations" element={<DeclarationsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/clients" replace />} />
      </Route>
    </Routes>
  );
}

