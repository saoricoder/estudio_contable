/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export const JWT_STORAGE_KEY = "jwt";

let token: string | null = null;

export function setToken(next: string | null) {
  token = next;
}

/** Token en memoria o, si aún no se sincronizó el efecto de React, el de localStorage (evita 401 en la primera carga). */
function bearerToken(): string | null {
  if (token) return token;
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(JWT_STORAGE_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

function headers() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = bearerToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export function authHeader(): Record<string, string> {
  const t = bearerToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Prefijo absoluto para fetch manual (DELETE/PATCH/PDF) coherente con VITE_API_BASE. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function errMessage(res: Response, json: unknown, path: string) {
  const msg =
    typeof json === "object" && json !== null && "error" in json
      ? (json as { error?: { message?: string } }).error?.message
      : undefined;
  if (msg) return msg;
  return `Request failed (${res.status}) ${path}`;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errMessage(res, json, path));
  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: headers(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errMessage(res, json, path));
  return json as T;
}

