/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Footer } from "../components/Footer";
import { ModuleNavLinks } from "./appNavConfig";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm md:min-h-0 md:py-2",
    isActive
      ? "bg-slate-100 font-medium text-slate-900"
      : "text-slate-700 hover:bg-slate-50 active:bg-slate-100",
  ].join(" ");

export function AppShell({ onLogout }: { onLogout: () => void }) {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex w-full max-w-[min(100%,90rem)] items-center justify-between gap-3 px-3 py-3 sm:px-5 md:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 md:hidden"
              aria-expanded={navOpen}
              aria-controls="mobile-app-nav"
              aria-label={navOpen ? "Cerrar menú" : "Abrir menú de módulos"}
              onClick={() => setNavOpen((o) => !o)}
            >
              {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-950 text-white">
                <ShieldCheck className="size-5" aria-hidden={true} />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-xs text-slate-500 sm:text-sm">
                  Contadores Unidos MX
                </div>
                <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                  Estudio Contable Eficiente
                </div>
              </div>
            </Link>
          </div>
          <button
            type="button"
            className="min-h-[44px] shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-900 md:h-9 md:min-h-0 md:px-3"
            onClick={onLogout}
          >
            Salir
          </button>
        </div>
      </header>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          aria-label="Cerrar menú"
          onClick={closeNav}
        />
      ) : null}

      <aside
        id="mobile-app-nav"
        inert={!navOpen ? true : undefined}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,18rem)] max-w-[100vw] flex-col border-r bg-white shadow-xl transition-transform duration-200 ease-out md:hidden",
          navOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
        ].join(" ")}
        aria-hidden={!navOpen}
      >
        <div className="flex items-center justify-between border-b px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Módulos
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-50"
            aria-label="Cerrar"
            onClick={closeNav}
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="grid flex-1 gap-1 overflow-y-auto overscroll-contain p-3 pb-8">
          <ModuleNavLinks onNavigate={closeNav} className={navLinkClass} />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid w-full max-w-[min(100%,90rem)] flex-1 gap-4 px-3 py-4 sm:px-5 sm:py-6 md:grid-cols-[220px_minmax(0,1fr)] md:py-6 xl:gap-6">
          <aside className="hidden rounded-2xl border bg-white p-3 shadow-sm md:block">
            <div className="px-3 py-2 text-xs font-medium text-slate-500">Módulos</div>
            <nav className="grid gap-1">
              <ModuleNavLinks className={navLinkClass} />
            </nav>
          </aside>

          <main className="min-w-0 max-w-full">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
