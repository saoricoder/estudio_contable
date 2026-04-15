"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFinancialHealthPdf = buildFinancialHealthPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
function buildFinancialHealthPdf(params) {
    const doc = new pdfkit_1.default({ margin: 48, size: "A4" });
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
    doc
        .fontSize(10)
        .fillColor("#64748b")
        .text(`Base de cálculo (MVP): ${params.summary.matchedCount} movimientos conciliados del mes (ingresos vs gastos).`);
    doc.moveDown(0.5);
    doc
        .fontSize(9)
        .fillColor("#64748b")
        .text("Nota: este reporte es preliminar y se refinará al integrar clasificación contable, CFDI y reglas fiscales.");
    return doc;
}
function statBox(doc, x, y, w, label, value, accent) {
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
function money(n) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2,
    }).format(n);
}
