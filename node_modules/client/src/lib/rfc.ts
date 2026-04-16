/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

/** Persona Moral 12 / Persona Física 13 — alineado con backend */
export const RFC_REGEX =
  /^([A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}|[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3})$/;

export function isValidRfc(rfc: string): boolean {
  return RFC_REGEX.test(rfc.trim().toUpperCase());
}
