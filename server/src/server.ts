/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

