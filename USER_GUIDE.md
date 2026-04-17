# Guía de usuario — Estudio Contable Eficiente

**Para el equipo de Contadores Unidos MX** · Ejercicio fiscal de referencia: **2026**

---

## 1. Introducción

**Estudio Contable Eficiente** es una aplicación web pensada para centralizar el trabajo diario del despacho: **clientes**, **nómina**, **facturación recurrente**, **conciliación bancaria**, **declaraciones**, **alertas de vencimiento**, **analytics** y **reportes en PDF**, con una interfaz adaptable a computadora, tableta y celular, e instalación opcional como **PWA** (aplicación).

En **2026**, el sistema incorpora reglas de referencia para **nómina quincenal** (IMSS y subsidio), métricas por año fiscal y reportes de **salud financiera** basados en movimientos bancarios **conciliados**.

> **Nota**  
> Los cálculos y reportes tienen carácter de **herramienta de apoyo**; valide siempre criterios legales y parámetros oficiales vigentes (UMA, tablas, calendarios fiscales) antes de presentar obligaciones ante autoridades.

---

## 2. Acceso al sistema

### Inicio de sesión

1. Abra la URL del sistema (por ejemplo, la proporcionada por su administrador).
2. Ingrese **correo** y **contraseña** (mínimo 8 caracteres si registra una cuenta nueva).
3. Pulse **Login** o **Register** según corresponda.

Tras un login correcto, el sistema guarda un **token de sesión (JWT)** en el navegador para no pedir usuario en cada clic.

| Acción | Dónde |
|--------|--------|
| Cerrar sesión | Botón **Salir** en la parte superior derecha |
| Volver a entrar | Pantalla de login |

### Mantener la sesión segura

| Recomendación | Motivo |
|---------------|--------|
| No compartir su usuario y contraseña | Cada cuenta actúa sobre los mismos datos del estudio en el MVP |
| Cerrar sesión (**Salir**) al usar una PC compartida | Evita que otra persona acceda con su sesión abierta |
| Usar solo equipos y redes de confianza | Igual que con cualquier herramienta con datos sensibles |

> **Tip**  
> Si olvida cerrar sesión, puede borrar datos del sitio desde la configuración del navegador; la próxima visita volverá a pedir login.

---

## 3. Módulo de Clientes

Ruta en el menú: **Clientes**.

### Registrar un cliente

1. Complete **Nombre**, **RFC**, **Régimen** (por ejemplo `601`, `612`, etc.), y opcionalmente **Email** y **Teléfono**.
2. Pulse **Crear**.

**Validación de RFC (en pantalla):**

- **Persona moral:** 12 caracteres alfanuméricos.
- **Persona física:** 13 caracteres alfanuméricos.
- El sistema normaliza a mayúsculas.

Si el RFC no cumple el formato, verá un mensaje de error y no se guardará hasta corregirlo.

> **Tip**  
> Mantenga un solo registro por RFC para evitar duplicados en facturación y declaraciones.

### Exportación inteligente a CSV (Excel)

1. Pulse **Cargar** para traer el listado actualizado.
2. Pulse **Exportar CSV** (botón destacado con icono de descarga).

Se descarga un archivo con nombre tipo `clientes-AAAA-MM-DD.csv`, codificado en **UTF-8 con BOM** para que **Excel en Windows** abra correctamente acentos y caracteres especiales.

| Columnas típicas del CSV | Uso |
|--------------------------|-----|
| `id`, `nombre`, `rfc`, `regimen`, `email`, `telefono` | Cruces en Excel, respaldos, auditorías |

> **Nota**  
> La exportación usa los datos **ya cargados** en pantalla; si necesita el listado completo, asegúrese de haber pulsado **Cargar** antes.

---

## 4. Módulo de Nómina

Ruta: **Nómina**.

### Cálculo quincenal (IMSS / Subsidio)

1. Indique **Sueldo mensual bruto**, **ISR mensual (estimado)** si aplica, y **Fecha y hora de pago** (selector de fecha/hora).
2. Opcionalmente indique el **nombre del colaborador** (necesario para **guardar** después).
3. Pulse **Calcular**.

El sistema aplica reglas de referencia **2026** (IMSS cuota obrera, tope de SBC, subsidio conforme al periodo) y muestra resultados como bruto de periodo, IMSS, subsidio y **neto estimado**, junto con textos aclaratorios (*disclaimers*).

> **Nota**  
> El cálculo en pantalla es **orientativo**; revise tablas y parámetros oficiales vigentes (UMA, límites, subsidio al empleo) para cada caso real.

### Guardar y consultar historial

1. Tras un cálculo exitoso, complete el **nombre del colaborador** y pulse **Guardar nómina** (ejercicio fiscal 2026).
2. En la tabla **Historial de nóminas guardadas** verá las filas registradas para su usuario.

Para refrescar la tabla, vuelva a entrar al módulo o recargue la página si hace falta.

---

## 5. Conciliación bancaria (flujo crítico)

Ruta: **Conciliación**.

Aquí se alinean **movimientos del libro** con **líneas del estado de cuenta** del banco. Un **match 1:1** une una línea de cada lado.

### Importar estado de cuenta (CSV)

1. Prepare un archivo **CSV** con **primera fila de encabezados**.
2. Columnas reconocidas (nombres flexibles, en minúsculas tras importar):

   | Concepto | Nombres aceptados (ejemplos) |
   |----------|------------------------------|
   | Fecha | `fecha`, `date` |
   | Descripción | `descripcion`, `description`, `concepto` |
   | Referencia | `referencia`, `reference`, `ref` |
   | Monto | `monto`, `amount`, `importe` |
   | Tipo | `tipo`, `type` — valores como `CREDIT`/`DEBIT`, `abono`/`cargo`, o signo del monto |

3. Pegue el contenido en el cuadro de texto **Importar estado de cuenta (CSV)** y pulse **Importar**.

> **Tip**  
> Las fechas pueden ir en ISO o en formato **dd/mm/aaaa** según el parseo del sistema.

### Botón **Sugerir** (match automático candidato)

1. Seleccione una **línea del estado de cuenta** (radio **Sel** en la tabla o tarjeta en móvil).
2. Pulse **Sugerir** en esa línea.

El sistema propone movimientos del libro **sin conciliar** cercanos en **fecha** y **monto** (lista de sugerencias). Desde ahí puede conciliar si coincide.

> **Nota**  
> “Sugerir” **no** sustituye el criterio del contador: revise siempre descripción y contexto.

### Match manual 1:1

1. Seleccione **un movimiento** del libro (radio **Sel** en “Movimientos (Libro)”).
2. Seleccione **una línea** del estado de cuenta (radio **Sel** en “Estado de cuenta”).
3. Pulse **Conciliar**.

Si el movimiento del libro es un **abono (CREDIT)** que coincide con el **saldo pendiente** de una factura recurrente, el sistema puede **marcar la factura como pagada** automáticamente.

**Desmarcar:** use **Desmarcar** en el movimiento conciliado si necesita revertir el match (y, cuando aplique, el sistema restaura el estado de la factura vinculada).

---

## 6. Declaraciones y Alertas

### Declaraciones

Ruta: **Declaraciones**. Puede **crear**, **listar**, filtrar por cliente/estatus y usar el **dashboard** de resumen de estatus según lo implementado en su versión.

Mantenga **periodo** en formato **YYYY-MM** y **fecha de vencimiento** coherente con la obligación.

### Alertas — semáforo de vencimientos

Ruta: **Alertas**.

| Color | Significado (lógica del sistema) |
|-------|-----------------------------------|
| **Rojo** | Vencimiento ya pasado **o** estatus **OVERDUE** |
| **Amarillo** | Vence en **5 días o menos** (urgente) |
| **Verde** | Vencimiento más lejano que 5 días |

Ajuste **días hacia adelante** y pulse **Cargar** para acotar el horizonte de alertas.

> **Tip**  
> El listado combina declaraciones registradas y un **calendario MVP** (por ejemplo, recordatorios tipo día **17**); valide fechas reales según obligación y régimen de cada cliente.

---

## 7. Analytics y reportes (valor agregado)

### Analytics — gráficos

Ruta: **Analytics**.

- **Barras:** ingresos mensuales (créditos **conciliados**) frente a actividad de **declaraciones** por mes.
- **Torta:** facturas recurrentes **pagadas** vs **pendientes** (conteos).

Use estos gráficos para conversar con el cliente sobre tendencias y carga operativa; no sustituyen estados financieros oficiales.

### Reporte PDF — salud financiera

1. Vaya a **Alertas** (o use el acceso desde **Analytics** al reporte PDF).
2. Indique el mes en formato **YYYY-MM** (por defecto suele ser el mes calendario actual).
3. Pulse **PDF salud financiera** (icono de reporte).

El PDF incluye ingresos vs gastos del mes en movimientos **conciliados**, desglose por categoría, tendencia y movimientos destacados, según la versión desplegada.

> **Nota**  
> El PDF se genera en el **servidor** y se abre en una nueva pestaña; requiere sesión iniciada.

---

## 8. Instalación PWA (aplicación en escritorio o celular)

La PWA permite abrir **Estudio Contable** como una app, con icono propio, útil en tablet y móvil.

**Requisitos:** navegador actual, sitio servido por **HTTPS** (por ejemplo en producción).

### Google Chrome (Windows / Android)

1. Inicie sesión en el sistema.
2. Abra el menú del navegador (**⋮** o **···**).
3. Elija **Instalar aplicación** / **Instalar Estudio Contable** (el texto puede variar según versión).
4. Confirme la instalación.

### Microsoft Edge

1. Menú **⋯** → **Aplicaciones** → **Instalar este sitio como una aplicación** (o similar).

### Safari (iPhone / iPad)

1. Pulse el botón **Compartir** 📤.
2. **Agregar a inicio de pantalla**.
3. Ajuste el nombre si lo desea y confirme.

> **Tip**  
> En iOS, use **Agregar a inicio de pantalla** para obtener experiencia similar a una app; el icono y el nombre dependen de lo definido en el manifiesto del sitio.

---

## 9. Soporte y créditos

- Dudas funcionales o de despliegue: coordine con su **equipo técnico interno** o quien administre el hosting (por ejemplo, Vercel) y la base de datos.

**Desarrollo del software:** [saori coder](https://instagram.com/saoricoder) · © 2026 Estudio Contable Eficiente · **Contadores Unidos MX**

---

*Última actualización de la guía alineada al producto MVP; las pantallas pueden evolucionar ligeramente entre versiones.*
