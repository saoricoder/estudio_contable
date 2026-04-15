export type ImssResult = {
  sbcDaily: number;
  sbcPeriod: number;
  employeeContrib: {
    enfermedadMaternidad: number;
    invalidezVida: number;
    cesantiaVejez: number;
    total: number;
  };
  employerContrib: {
    // En MVP devolvemos total estimado (no se usa para neto del trabajador)
    total: number;
  };
};

// Nota: IMSS real requiere tablas y topes por UMA, RT, guarderías, Infonavit, etc.
// MVP: aproximación enfocada a "descuento trabajador" con tasas comunes.
export class ImssService {
  calculateEmployeeContrib(params: {
    sbcDaily: number;
    daysInPeriod: number;
    umaDaily: number;
  }): ImssResult {
    const { sbcDaily, daysInPeriod } = params;

    // Tasas aproximadas (trabajador) usadas comúnmente como baseline:
    // - Enfermedad y maternidad (prestaciones en dinero): 0.25%
    // - Invalidez y vida: 0.625%
    // - Cesantía y vejez: 1.125%
    // (No incluye excedente 3 UMA ni otras partidas; se agregará cuando modulemos nómina completa)
    const tEM = 0.0025;
    const tIV = 0.00625;
    const tCV = 0.01125;

    const basePeriod = sbcDaily * daysInPeriod;
    const enfermedadMaternidad = round2(basePeriod * tEM);
    const invalidezVida = round2(basePeriod * tIV);
    const cesantiaVejez = round2(basePeriod * tCV);
    const total = round2(enfermedadMaternidad + invalidezVida + cesantiaVejez);

    return {
      sbcDaily: round2(sbcDaily),
      sbcPeriod: round2(basePeriod),
      employeeContrib: {
        enfermedadMaternidad,
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

