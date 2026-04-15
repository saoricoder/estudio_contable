export type ImssResult = {
  sbcDaily: number;
  sbcPeriod: number;
  employeeContrib: {
    emDinero: number;
    emGmp: number;
    emExcedente: number;
    invalidezVida: number;
    cesantiaVejez: number;
    total: number;
  };
  employerContrib: {
    // En MVP devolvemos total estimado (no se usa para neto del trabajador)
    total: number;
  };
};

// IMSS (cuota obrera) - cálculo formal base:
// - Prestaciones en dinero (EM): 0.25% sobre SBC
// - Gastos médicos pensionados (EM): 0.375% sobre SBC
// - Excedente de 3 UMA (EM): 0.40% sobre (SBC - 3 UMA) cuando SBC > 3 UMA
// - Invalidez y Vida: 0.625% sobre SBC
// - Cesantía y Vejez: 1.125% sobre SBC
// Topes: SBC máximo 25 UMA (LSS).
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

export class ImssService {
  calculateEmployeeContrib(params: {
    sbcDaily: number;
    daysInPeriod: number;
    umaDaily: number;
  }): ImssResult {
    const { sbcDaily, daysInPeriod, umaDaily } = params;

    const sbcDailyCapped = Math.min(sbcDaily, 25 * umaDaily);
    const basePeriod = sbcDailyCapped * daysInPeriod;

    const tEmDinero = 0.0025;
    const tEmGmp = 0.00375;
    const tEmExcedente = 0.004;
    const tIV = 0.00625;
    const tCV = 0.01125;

    const excedenteDaily = Math.max(0, sbcDailyCapped - 3 * umaDaily);
    const excedentePeriod = excedenteDaily * daysInPeriod;

    const emDinero = round2(basePeriod * tEmDinero);
    const emGmp = round2(basePeriod * tEmGmp);
    const emExcedente = round2(excedentePeriod * tEmExcedente);
    const invalidezVida = round2(basePeriod * tIV);
    const cesantiaVejez = round2(basePeriod * tCV);
    const total = round2(emDinero + emGmp + emExcedente + invalidezVida + cesantiaVejez);

    return {
      sbcDaily: round2(sbcDailyCapped),
      sbcPeriod: round2(basePeriod),
      employeeContrib: {
        emDinero,
        emGmp,
        emExcedente,
        invalidezVida,
        cesantiaVejez,
        total,
      },
      employerContrib: {
        total: 0,
      },
    };
  }
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

