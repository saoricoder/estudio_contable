-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "BankEntryType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "BankEntrySource" AS ENUM ('BOOK', 'BANK');

-- CreateTable
CREATE TABLE "RecurringInvoice" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextRunDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankMovement" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "BankEntryType" NOT NULL,
    "source" "BankEntrySource" NOT NULL DEFAULT 'BOOK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatementLine" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "BankEntryType" NOT NULL,
    "source" "BankEntrySource" NOT NULL DEFAULT 'BANK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankStatementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliationMatch" (
    "id" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "statementLineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankReconciliationMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringInvoice_clientId_idx" ON "RecurringInvoice"("clientId");

-- CreateIndex
CREATE INDEX "RecurringInvoice_active_nextRunDate_idx" ON "RecurringInvoice"("active", "nextRunDate");

-- CreateIndex
CREATE INDEX "BankMovement_date_idx" ON "BankMovement"("date");

-- CreateIndex
CREATE INDEX "BankStatementLine_date_idx" ON "BankStatementLine"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BankReconciliationMatch_movementId_key" ON "BankReconciliationMatch"("movementId");

-- CreateIndex
CREATE UNIQUE INDEX "BankReconciliationMatch_statementLineId_key" ON "BankReconciliationMatch"("statementLineId");

-- AddForeignKey
ALTER TABLE "RecurringInvoice" ADD CONSTRAINT "RecurringInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationMatch" ADD CONSTRAINT "BankReconciliationMatch_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "BankMovement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationMatch" ADD CONSTRAINT "BankReconciliationMatch_statementLineId_fkey" FOREIGN KEY ("statementLineId") REFERENCES "BankStatementLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
