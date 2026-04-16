-- CreateEnum
CREATE TYPE "InvoicePaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- AlterTable RecurringInvoice: pending balance + status
ALTER TABLE "RecurringInvoice" ADD COLUMN "pendingBalance" DECIMAL(12,2);
UPDATE "RecurringInvoice" SET "pendingBalance" = "amount" WHERE "pendingBalance" IS NULL;
ALTER TABLE "RecurringInvoice" ALTER COLUMN "pendingBalance" SET NOT NULL;

ALTER TABLE "RecurringInvoice" ADD COLUMN "paymentStatus" "InvoicePaymentStatus" NOT NULL DEFAULT 'PENDING';

CREATE INDEX "RecurringInvoice_paymentStatus_idx" ON "RecurringInvoice"("paymentStatus");

-- CreateTable
CREATE TABLE "PayrollHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL DEFAULT 2026,
    "grossMonthly" DECIMAL(14,2) NOT NULL,
    "grossPeriod" DECIMAL(14,2) NOT NULL,
    "imssTotal" DECIMAL(14,2) NOT NULL,
    "subsidyApplied" DECIMAL(14,2) NOT NULL,
    "netEstimate" DECIMAL(14,2) NOT NULL,
    "payDate" TIMESTAMP(3),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PayrollHistory_userId_fiscalYear_idx" ON "PayrollHistory"("userId", "fiscalYear");

CREATE INDEX "PayrollHistory_calculatedAt_idx" ON "PayrollHistory"("calculatedAt");

-- AddForeignKey
ALTER TABLE "PayrollHistory" ADD CONSTRAINT "PayrollHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
