/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-[min(100%,90rem)] px-3 py-5 text-xs text-slate-600 sm:px-5">
        © 2026 Estudio Contable Eficiente. Desarrollado por{" "}
        <a
          className="font-medium text-slate-900 underline underline-offset-4 hover:text-ink-950"
          href="https://instagram.com/saoricoder"
          target="_blank"
          rel="noreferrer"
        >
          saoricoder
        </a>
        .
      </div>
    </footer>
  );
}

