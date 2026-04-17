-- AlterTable
ALTER TABLE "BankReconciliationMatch" ADD COLUMN "markedRecurringInvoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BankReconciliationMatch_markedRecurringInvoiceId_key" ON "BankReconciliationMatch"("markedRecurringInvoiceId");

-- AddForeignKey
ALTER TABLE "BankReconciliationMatch" ADD CONSTRAINT "BankReconciliationMatch_markedRecurringInvoiceId_fkey" FOREIGN KEY ("markedRecurringInvoiceId") REFERENCES "RecurringInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
