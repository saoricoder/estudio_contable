# Guion técnico (detrás de escenas) — Estudio Contable Eficiente

**Audiencia:** Evaluadores de ingeniería en TI · **Contexto:** **abril de 2026** · **Autora:** [saori coder](https://instagram.com/saoricoder) — [@saoricoder](https://instagram.com/saoricoder)

**Objetivo:** Demostrar decisiones de arquitectura, implementación y herramientas usadas en el monorepo **estudio-contable-eficiente** (cliente **Contadores Unidos MX**).

---

## Introducción (apertura sugerida)

*«Soy **saori coder**. Este proyecto, en **2026**, es un monorepo full-stack: **React 19** con **Vite 8** en el cliente, **Node.js** con **Express 5** en el servidor, persistencia en **PostgreSQL** vía **Prisma 7**. Les explico el stack, los retos de dominio y cómo aceleré el ciclo con **Cursor** y modelos como **Claude 3.5**.»*

---

## 1. Stack y arquitectura

**Monorepo:** `npm` workspaces (`client`, `server`) con scripts raíz para `dev`, `build` y migraciones Prisma.

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS**, **React Router 7** | SPA, rutas, UI responsive |
| Visualización | **Recharts** | Gráficos de Analytics (barras + torta) |
| Backend | **Express 5**, **TypeScript** | API REST bajo `/api` |
| Datos | **Prisma 7** + **@prisma/adapter-pg** | ORM y migraciones; cliente tipado |
| Base de datos | **PostgreSQL** | Relaciones, índices y unicidades para integridad |

**Por qué Prisma con PostgreSQL**

- **Esquema declarativo** (`schema.prisma`): el modelo de negocio (clientes, movimientos bancarios, matches, declaraciones, historial de nómina) queda versionado y migrado.
- **Integridad referencial** en la base: claves foráneas con `onDelete` coherentes (por ejemplo **Cascade** en movimientos vinculados a `User`).
- **Unicidades** críticas: por ejemplo `BankReconciliationMatch` fuerza **un movimiento de libro y una línea de banco** como máximo una vez en un match (`movementId` y `statementLineId` únicos), evitando dobles conciliaciones a nivel de datos.

**Proxy de desarrollo:** Vite reenvía `/api` al servidor local (puerto típico **4000**), evitando CORS en desarrollo.

---

## 2. Desafíos técnicos

### 2.1 Nómina quincenal (IMSS / subsidio, 2026)

- La lógica vive en el **dominio del servidor** (no en el cliente como fuente de verdad): periodo **quincenal** (p. ej. 15 días), factor de integración, tope de **SBC** respecto a **UMA** diaria, cuotas **IMSS** y **subsidio al empleo** según reglas de referencia del MVP para **2026**.
- El **historial** (`PayrollHistory`) persiste por usuario, con `fiscalYear` y `employeeName` para auditoría básica.
- **Limitación honesta:** los cálculos son **orientativos**; el código separa constantes y disclaimers para no confundir con tablas oficiales finales.

### 2.2 Conciliación bancaria e integridad referencial

- **Importación CSV:** `papaparse` en el servidor, cabeceras **normalizadas a minúsculas**, columnas **flexibles** (`fecha`/`date`, `descripcion`, `monto`, `tipo`, etc.) y normalización de **CREDIT/DEBIT** y fechas.
- **Match 1:1:** modelo `BankReconciliationMatch` enlaza **exactamente un** `BankMovement` (libro) y **una** `BankStatementLine` (banco), con opción de `markedRecurringInvoiceId` para **reversión** al desconciliar.
- **Sugerencias:** en el cliente, candidatos por **ventana de fechas** y **monto** (lista de movimientos sin conciliar); el match final sigue siendo **acción explícita** del usuario.

---

## 3. Uso de IA (Cursor + Claude 3.5)

- **Exploración y refactors:** pedir a **Cursor** mapas del repo, localizar rutas (`/api/...`) y componentes React antes de tocar código.
- **Generación de tipos y contratos:** partir de interfaces TypeScript o respuestas de API para **prototipar** hooks y páginas; revisar siempre contra **Zod** y Prisma en el servidor.
- **UI rápida:** iteraciones en **Tailwind** (cards, tablas, grids `sm:` / `md:` / `lg:`) con feedback de **Claude 3.5** en el chat para variantes de layout sin abandonar el design system.
- **Regla de oro:** la IA acelera **borrador y tests de idea**; la **fuente de verdad** sigue siendo el código revisado, linters y el comportamiento en runtime.

---

## 4. Aportación extra (profundidad)

### 4.1 PDF de salud financiera (PDFKit)

- **Librería:** **`pdfkit`** (`pdfkit` + `@types/pdfkit`) en Node.
- **Flujo:** ruta HTTP `GET /api/reports/financial-health.pdf` con parámetro de mes (`YYYY-MM`); el servicio agrega **ingresos/gastos** desde movimientos **conciliados**, tendencia a **3 meses**, **top categorías** y **top movimientos**; el builder `buildFinancialHealthPdf` instancia `PDFDocument({ size: "A4", margin: 48 })`, escribe **títulos**, **cajas de métricas** y **tablas** con fuentes y colores consistentes.
- **Entrega:** stream al cliente (`Content-Type: application/pdf`) para abrir en nueva pestaña desde **Alertas** o **Analytics**.

### 4.2 CSV UTF-8 con BOM para Excel

- **Problema:** Excel en Windows suele interpretar CSV sin BOM como **ANSI**, rompiendo acentos.
- **Solución en el cliente:** constante **`UTF8_BOM`** (`\uFEFF`) concatenada al cuerpo del CSV antes de crear el `Blob` (`text/csv;charset=utf-8`).
- **Función central:** `downloadUtf8Csv` en `client/src/lib/export-csv.ts`; **escape** de comillas y comas en celdas (`escapeCsvCell`).
- **Uso:** exportación de **clientes** y **facturas recurrentes** (mensajes de toast alineados a “listo para Excel”).

---

## 5. Responsive y PWA

### 5.1 Responsive (Tailwind + breakpoints)

- **Estrategia:** utilidades **mobile-first** (`flex-col` → `sm:flex-row`, grids `lg:grid-cols-2`), **áreas táctiles** (`min-h-[44px]` en controles críticos), `overflow` y `min-w-0` en tablas para evitar scroll horizontal accidental.
- **Gráficos:** altura controlada en **Analytics** según viewport (tablet vs desktop) para no cortar leyendas.

### 5.2 PWA (`vite-plugin-pwa`)

- **Plugin:** `vite-plugin-pwa` con `registerType: "autoUpdate"`, **manifest** `lang: es-MX`, `display: "standalone"`, iconos **192** y **512**, **Workbox** con `globPatterns` para assets estáticos y **`navigateFallback`** a `index.html` **excluyendo** `/api/` (las llamadas API no se cachean como SPA).
- **Producción:** HTTPS obligatorio para instalación; en **dev** el plugin PWA puede ir deshabilitado (`devOptions.enabled: false`) para no interferir con el proxy.

---

## Cierre (sugerido)

*«En resumen: monorepo **React 19 + Express + Prisma/Postgres**, dominio con **nómina 2026** y **conciliación 1:1** con integridad en base, **PDFKit** para reportes ejecutivos y **CSV con BOM** para Excel. **Responsive** con Tailwind y **PWA** con Workbox. Proyecto **2026** por **saori coder** — [instagram.com/saoricoder](https://instagram.com/saoricoder).»*

---

## Consejos de grabación (voz técnica)

| Objetivo | Consejo |
|----------|---------|
| **Diagrama mental** | Si comparte pantalla con **VS Code**, abra **por carpetas** `client/src` y `server/src` y **despliegue** con calma; evite saltar entre 5 archivos por segundo. |
| **Schema Prisma | Haga **zoom** en `BankReconciliationMatch` y `@@unique` de declaraciones; pause **2 s** en cada bloque. |
| **PDF / CSV** | Muestre **una** función (`buildFinancialHealthPdf` o `downloadUtf8Csv`) **scroll** vertical lento; resalte **PDFDocument** y **\uFEFF**. |
| **PWA** | En `vite.config.ts`, **colapse** otros plugins y centre la vista en el bloque **VitePWA** y **workbox**. |
| **Terminal** | Si ejecuta `npm run dev`, deje **visible** el split **server + client** un instante antes de pasar al navegador. |

---

*Documento de apoyo para presentaciones técnicas; detalle exacto de líneas puede variar con commits posteriores.*
