/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useState } from "react";
import { toast } from "sonner";
import { apiPost, setToken } from "../lib/api";
import { Footer } from "../components/Footer";

export function LoginPage({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [email, setEmail] = useState("admin@contadoresmx.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<{ token: string }>(`/api/auth/login`, {
        email,
        password,
      });
      setToken(res.token);
      onAuthed(res.token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<{ token: string }>(`/api/auth/register`, {
        email,
        password,
      });
      setToken(res.token);
      onAuthed(res.token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 mx-auto flex w-full max-w-md items-center px-4 py-8">
        <div className="w-full rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Contadores Unidos MX</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Estudio Contable Eficiente
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Inicia sesión para acceder al sistema.
          </p>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Email</span>
              <input
                className="field-touch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Password</span>
              <input
                className="field-touch"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </label>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="btn-touch-primary sm:flex-1"
                onClick={login}
                disabled={loading}
              >
                Login
              </button>
              <button
                type="button"
                className="btn-touch-outline sm:flex-1"
                onClick={register}
                disabled={loading}
              >
                Register
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
}

