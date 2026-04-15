import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { FinancialHealthService } from "../../domain/reports/financialHealth.service";
import { buildFinancialHealthPdf } from "../../domain/reports/pdf/financialHealthPdf";

export const reportsRouter = Router();
const financialHealthService = new FinancialHealthService();

reportsRouter.use(authJwt);

reportsRouter.get("/reports/financial-health.pdf", async (req, res, next) => {
  try {
    const month = typeof req.query.month === "string" ? req.query.month : undefined;
    if (!month) {
      return res.status(400).json({ error: { message: "Missing query param: month (YYYY-MM)" } });
    }

    const summary = await financialHealthService.details({ month });
    const doc = buildFinancialHealthPdf({
      clientName: "Contadores Unidos MX",
      summary,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="salud-financiera-${month}.pdf"`,
    );

    doc.pipe(res);
    doc.end();
  } catch (e) {
    next(e);
  }
});

