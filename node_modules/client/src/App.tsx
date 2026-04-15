import {
  Bell,
  BookOpenCheck,
  Building2,
  FileText,
  Landmark,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType } from "react";

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ink-950 text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-slate-500">Contadores Unidos MX</div>
              <div className="text-base font-semibold text-slate-900">
                Estudio Contable Eficiente
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            MVP en construcción · API: <code className="rounded bg-slate-100 px-2 py-1">/api/health</code>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Panel de módulos
          </h1>
          <p className="text-sm text-slate-600">
            Estructura base lista para iterar en Clientes, Nóminas, Facturación, Conciliación, Declaraciones y Alertas.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            title="Clientes"
            desc="CRUD con validación de RFC y régimen fiscal."
            Icon={Building2}
          />
          <ModuleCard
            title="Nóminas quincenales"
            desc="Cálculo IMSS + subsidio al empleo (service layer)."
            Icon={Landmark}
          />
          <ModuleCard
            title="Facturación"
            desc="Registro de facturas recurrentes."
            Icon={Receipt}
          />
          <ModuleCard
            title="Conciliación bancaria"
            desc="Match simple de movimientos vs estado de cuenta."
            Icon={BookOpenCheck}
          />
          <ModuleCard
            title="Declaraciones"
            desc="Dashboard de estatus de provisionales."
            Icon={FileText}
          />
          <ModuleCard
            title="Alertas"
            desc="Semáforo de vencimientos fiscales."
            Icon={Bell}
          />
        </div>
      </main>
    </div>
  );
}

function ModuleCard({
  title,
  desc,
  Icon,
}: {
  title: string;
  desc: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-900">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
