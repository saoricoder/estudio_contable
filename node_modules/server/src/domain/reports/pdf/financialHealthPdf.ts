/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import PDFDocument from "pdfkit";
import type { FinancialHealthDetails } from "../financialHealth.service";

export function buildFinancialHealthPdf(params: {
  clientName: string;
  summary: FinancialHealthDetails;
}) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });

  doc.info.Title = `Reporte de Salud Financiera ${params.summary.month}`;

  doc.fontSize(18).fillColor("#0b1220").text("Reporte de Salud Financiera", {
    align: "left",
  });
  doc.moveDown(0.25);
  doc.fontSize(11).fillColor("#475569").text(`Cliente: ${params.clientName}`);
  doc.fontSize(11).fillColor("#475569").text(`Mes: ${params.summary.month}`);
  doc.moveDown(1);

  const income = money(params.summary.income);
  const expenses = money(params.summary.expenses);
  const net = money(params.summary.net);

  const boxTop = doc.y;
  const boxW = 160;
  const gap = 14;

  statBox(doc, 48, boxTop, boxW, "Ingresos", income, "#16a34a");
  statBox(doc, 48 + boxW + gap, boxTop, boxW, "Gastos", expenses, "#dc2626");
  statBox(doc, 48 + (boxW + gap) * 2, boxTop, boxW, "Neto", net, params.summary.net >= 0 ? "#16a34a" : "#dc2626");

  doc.moveDown(6);

  doc.fontSize(12).fillColor("#0b1220").text("Tendencia (3 meses)");
  doc.moveDown(0.5);
  trendHeader(doc);
  for (const t of params.summary.trend3m) {
    trendRow(doc, t.month, money(t.income), money(t.expenses), money(t.net), String(t.matchedCount));
  }
  doc.moveDown(1);

  doc.fontSize(12).fillColor("#0b1220").text("Desglose por categoría (Top 8)");
  doc.moveDown(0.5);
  tableHeader(doc);
  for (const row of params.summary.byCategory) {
    tableRow(doc, row.category, money(row.income), money(row.expenses), money(row.net));
  }
  doc.moveDown(1);

  doc.fontSize(12).fillColor("#0b1220").text("Top movimientos conciliados (Top 10)");
  doc.moveDown(0.5);
  topMovHeader(doc);
  for (const m of params.summary.topMovements) {
    topMovRow(doc, shortDate(m.date), m.category, clamp(m.description, 34), m.type, money(m.amountAbs));
  }
  doc.moveDown(1);

  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text(
      `Base de cálculo (MVP): ${params.summary.matchedCount} movimientos conciliados del mes (ingresos vs gastos).`,
    );
  doc.moveDown(0.5);
  doc
    .fontSize(9)
    .fillColor("#64748b")
    .text(
      "Nota: este reporte es preliminar y se refinará al integrar clasificación contable, CFDI y reglas fiscales.",
    );

  return doc;
}

function trendHeader(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc
    .fontSize(9)
    .fillColor("#475569")
    .text("Mes", 48, y, { width: 80 })
    .text("Ingresos", 140, y, { width: 100, align: "right" })
    .text("Gastos", 250, y, { width: 100, align: "right" })
    .text("Neto", 360, y, { width: 100, align: "right" })
    .text("#Conc.", 470, y, { width: 78, align: "right" });
  doc.moveDown(0.6);
  doc.moveTo(48, doc.y).lineTo(548, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.4);
}

function trendRow(
  doc: PDFKit.PDFDocument,
  month: string,
  income: string,
  expenses: string,
  net: string,
  matchedCount: string,
) {
  const y = doc.y;
  doc
    .fontSize(9)
    .fillColor("#0b1220")
    .text(month, 48, y, { width: 80 })
    .text(income, 140, y, { width: 100, align: "right" })
    .text(expenses, 250, y, { width: 100, align: "right" })
    .text(net, 360, y, { width: 100, align: "right" })
    .text(matchedCount, 470, y, { width: 78, align: "right" });
  doc.moveDown(0.45);
}

function tableHeader(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc
    .fontSize(9)
    .fillColor("#475569")
    .text("Categoría", 48, y, { width: 240 })
    .text("Ingresos", 300, y, { width: 90, align: "right" })
    .text("Gastos", 392, y, { width: 90, align: "right" })
    .text("Neto", 484, y, { width: 90, align: "right" });
  doc.moveDown(0.6);
  doc.moveTo(48, doc.y).lineTo(548, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.4);
}

function tableRow(
  doc: PDFKit.PDFDocument,
  category: string,
  income: string,
  expenses: string,
  net: string,
) {
  const y = doc.y;
  doc
    .fontSize(9)
    .fillColor("#0b1220")
    .text(category, 48, y, { width: 240 })
    .fillColor("#0b1220")
    .text(income, 300, y, { width: 90, align: "right" })
    .text(expenses, 392, y, { width: 90, align: "right" })
    .text(net, 484, y, { width: 90, align: "right" });
  doc.moveDown(0.45);
}

function topMovHeader(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc
    .fontSize(9)
    .fillColor("#475569")
    .text("Fecha", 48, y, { width: 70 })
    .text("Categoría", 122, y, { width: 110 })
    .text("Descripción", 236, y, { width: 200 })
    .text("Tipo", 440, y, { width: 50 })
    .text("Monto", 492, y, { width: 56, align: "right" });
  doc.moveDown(0.6);
  doc.moveTo(48, doc.y).lineTo(548, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.4);
}

function topMovRow(
  doc: PDFKit.PDFDocument,
  date: string,
  category: string,
  description: string,
  type: string,
  amount: string,
) {
  const y = doc.y;
  doc
    .fontSize(9)
    .fillColor("#0b1220")
    .text(date, 48, y, { width: 70 })
    .text(category, 122, y, { width: 110 })
    .text(description, 236, y, { width: 200 })
    .text(type, 440, y, { width: 50 })
    .text(amount, 492, y, { width: 56, align: "right" });
  doc.moveDown(0.45);
}

function statBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  accent: string,
) {
  const h = 70;
  doc.roundedRect(x, y, w, h, 10).fillAndStroke("#ffffff", "#e2e8f0");
  doc
    .save()
    .rect(x, y, 6, h)
    .fill(accent)
    .restore();

  doc.fontSize(10).fillColor("#64748b").text(label, x + 14, y + 14);
  doc.fontSize(16).fillColor("#0b1220").text(value, x + 14, y + 32);
}

function money(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}

function shortDate(iso: string) {
  // YYYY-MM-DD
  return iso.slice(0, 10);
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

