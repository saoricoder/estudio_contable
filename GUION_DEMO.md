# Guion de demo funcional — Estudio Contable Eficiente

**Cliente objetivo:** Contadores Unidos MX · **Contexto temporal:** abril de **2026** · **Autora y voz sugerida:** [saori coder](https://instagram.com/saoricoder)

**Objetivo del video:** Mostrar valor ejecutivo: acceso seguro, cartera de clientes con RFC validado, conciliación bancaria con CSV y sugerencias automáticas, nómina con parámetros 2026, analytics y reporte PDF, cierre con la app instalada como PWA.

**Tono:** Profesional, ágil, orientado a resultados (sin jerga innecesaria).

---

## Introducción (fuera de la tabla)

Antes de la primera toma, grabe una breve intro en cámara o voz en off: *«Soy **saori coder**. En **abril de 2026** les muestro el flujo real de **Estudio Contable Eficiente**, pensado para **Contadores Unidos MX**: un solo panel para clientes, nómina, conciliación y reportes ejecutivos.»*

---

## Guión principal (columnas)

| Tiempo estimado | Pantalla a mostrar | Narración sugerida |
|-----------------|-------------------|------------------------|
| **0:15** | Login | *«Entramos a la aplicación. La pantalla de bienvenida identifica **Contadores Unidos MX** y el nombre del producto. Inicio sesión con el correo corporativo —por ejemplo **admin@contadoresmx.com**— y la contraseña.»* |
| **0:20** | Post-login (sidebar) | *«El sistema carga el **shell** con navegación clara: **Módulos** a la izquierda y **Salir** arriba a la derecha para cerrar la sesión cuando trabajemos en equipos compartidos.»* |
| **0:45** | **Clientes** (formulario + tabla) | *«En **Clientes** damos de alta la cartera: nombre, **RFC** con formato correcto —**12 caracteres** moral o **13** persona física—, régimen y datos opcionales. La validación evita errores antes de guardar.»* |
| **0:20** | Misma pantalla, botón **Exportar CSV** | *«Con **Cargar** refresco la lista y con **Exportar CSV** descargo el listado en formato listo para **Excel**, con codificación pensada para Windows.»* |
| **1:00** | **Conciliación bancaria** — Importar CSV | *«Aquí está el **momento mágico** de la demo: pego el **estado de cuenta en CSV** con columnas como `fecha`, `descripcion`, `referencia`, `monto` y `tipo` DEBIT o CREDIT. Importo y el sistema parsea las líneas del banco.»* |
| **0:45** | Tablas **Movimientos (Libro)** vs **Estado de cuenta** | *«En paralelo veo el **libro** y el **banco**. En cada línea del banco hay **Sugerir**: el sistema propone candidatos por fecha y monto para que no concilie a ciegas.»* |
| **0:30** | Selección **Sel** + **Conciliar** | *«Selecciono **una** línea del libro y **una** del estado de cuenta —match **1:1**— y pulso **Conciliar**. Los estados **Conciliado** confirman en verde que ambos lados cuadran.»* |
| **0:50** | **Nómina** | *«En **Nómina** calculo un periodo **quincenal** con reglas de referencia **2026**: sueldo mensual bruto, ISR estimado y fecha de pago. **Calcular** muestra IMSS, subsidio y neto; luego **Guardar nómina** deja trazabilidad en el **historial** del ejercicio fiscal 2026.»* |
| **0:20** | (Opcional) **Facturación** | *«Las **facturas recurrentes** vinculan cliente y montos; sirven de contexto cuando un abono conciliado puede marcar cobros como pagados.»* |
| **0:20** | **Declaraciones** (dashboard + tarjetas) | *«En **Declaraciones** veo el **dashboard** de estatus —por ejemplo **PENDING**, **IN_PROGRESS**, **PAID**— y registro obligaciones con periodo **YYYY-MM**, por ejemplo **2026-04**.»* |
| **0:20** | **Alertas** — semáforo + mes **2026-04** | *«**Alertas** concentra el **semáforo** de vencimientos. Elijo el horizonte y el mes **2026-04** para el PDF de salud financiera.»* |
| **1:00** | **Aportación extra — Analytics · 2026** | *«**Analytics** muestra **ingresos conciliados** frente a **actividad fiscal** por mes y la torta de facturas recurrentes. Destaco el mes actual —**abril 2026**— en el gráfico de barras.»* |
| **0:25** | **Clientes** → **Exportar CSV** (repetición breve) | *«Como **valor agregado**, vuelvo a **Clientes** y descargo el **CSV** para llevar la cartera a Excel o a un comité.»* |
| **0:35** | **Alertas** — **PDF salud financiera** | *«Genero el **PDF ejecutivo de salud financiera** para el mes seleccionado: ingresos, gastos, tendencia y movimientos destacados, basados en movimientos **conciliados**.»* |
| **0:40** | **PWA** — instalador del navegador + ventana standalone | *«Para cerrar: **instalo la PWA** desde Chrome o Edge —*Instalar aplicación*— y abro **Estudio Contable** como ventana propia en el escritorio, sin perder el branding **2026** del pie de página.»* |

---

## Cierre (fuera de la tabla)

*«Esto es **Estudio Contable Eficiente** para **Contadores Unidos MX** en **abril de 2026**. Desarrollo y producto: **saori coder** — [instagram.com/saoricoder](https://instagram.com/saoricoder). Gracias.»*

---

## Consejos de grabación

| Momento | Consejo |
|---------|---------|
| Login | Mueva el cursor **lento** hacia **Login**; deje **1 s** de pausa tras el clic antes de cortar. |
| Título del producto | Haga **zoom** 110–125 % sobre *Estudio Contable Eficiente* y *Contadores Unidos MX* en la cabecera. |
| RFC | Enfoque el placeholder **«12 o 13 caracter»** un instante antes de escribir un RFC de ejemplo válido. |
| CSV en Conciliación | **Seleccione** el texto del bloque CSV con **clic y arrastre** visible; luego **Importar** — evita saltos bruscos. |
| Sugerir | Pulse **Sugerir** en una fila; espere a que aparezca la lista antes de hablar del siguiente paso. |
| Gráfico Analytics | **Zoom** en el eje **04** (abril) y en la leyenda; **no** mueva el mouse durante 2 s en el pico. |
| PDF | Deje ver la **nueva pestaña** o el visor de PDF **2 s** antes de transición. |
| PWA | Muestre el menú del navegador **Instalar** y luego el **icono** en el escritorio o barra de tareas. |

> **Tip:** Grabe en **1080p** mínimo; audio con **límite de ruido**; si usa música, baje el volumen bajo la voz en off.

---

*Documento alineado a las capturas de referencia del MVP y al código del monorepo.*
