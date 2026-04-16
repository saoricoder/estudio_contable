-- AlterTable (IF NOT EXISTS tolera bases ya sincronizadas con db push)
ALTER TABLE "BankMovement" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- CreateEnum
CREATE TYPE "DeclarationType" AS ENUM ('PROVISIONAL', 'ANNUAL', 'PAYROLL', 'VAT');

-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'PAID', 'OVERDUE');

-- CreateTable
CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "DeclarationType" NOT NULL DEFAULT 'PROVISIONAL',
    "status" "DeclarationStatus" NOT NULL DEFAULT 'PENDING',
    "period" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "filedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Declaration_clientId_idx" ON "Declaration"("clientId");

-- CreateIndex
CREATE INDEX "Declaration_status_dueDate_idx" ON "Declaration"("status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Declaration_clientId_type_period_key" ON "Declaration"("clientId", "type", "period");

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
