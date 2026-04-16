/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  FileText,
  Landmark,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "../components/Footer";

const nav = [
  { to: "/clients", label: "Clientes", Icon: Building2 },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/payroll", label: "Nómina", Icon: Landmark },
  { to: "/invoices", label: "Facturación", Icon: Receipt },
  { to: "/banking", label: "Conciliación", Icon: BookOpenCheck },
  { to: "/declarations", label: "Declaraciones", Icon: FileText },
  { to: "/alerts", label: "Alertas", Icon: Bell },
];

export function AppShell({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ink-950 text-white">
              <ShieldCheck className="size-5" aria-hidden={true} />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-slate-500">Contadores Unidos MX</div>
              <div className="text-base font-semibold text-slate-900">
                Estudio Contable Eficiente
              </div>
            </div>
          </Link>
          <button
            className="h-9 rounded-xl border px-3 text-sm font-medium text-slate-900"
            onClick={onLogout}
          >
            Salir
          </button>
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border bg-white p-3 shadow-sm">
            <div className="px-3 py-2 text-xs font-medium text-slate-500">
              Módulos
            </div>
            <nav className="grid gap-1">
              {nav.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      isActive
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")
                  }
                >
                  <Icon className="size-4" aria-hidden={true} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

