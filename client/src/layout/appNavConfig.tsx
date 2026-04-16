/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  FileText,
  Landmark,
  Receipt,
} from "lucide-react";

export type NavItem = { to: string; label: string; Icon: LucideIcon };

export const MODULE_NAV: NavItem[] = [
  { to: "/clients", label: "Clientes", Icon: Building2 },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/payroll", label: "Nómina", Icon: Landmark },
  { to: "/invoices", label: "Facturación", Icon: Receipt },
  { to: "/banking", label: "Conciliación", Icon: BookOpenCheck },
  { to: "/declarations", label: "Declaraciones", Icon: FileText },
  { to: "/alerts", label: "Alertas", Icon: Bell },
];

export function ModuleNavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className: ({ isActive }: { isActive: boolean }) => string;
}) {
  return (
    <>
      {MODULE_NAV.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={className}
        >
          <Icon className="size-5 shrink-0 md:size-4" aria-hidden={true} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
}
