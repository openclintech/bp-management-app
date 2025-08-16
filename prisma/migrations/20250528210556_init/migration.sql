-- CreateTable
CREATE TABLE "Vital" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "value" REAL,
    "systolic" REAL,
    "diastolic" REAL,
    "timestamp" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MedicationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "MedicationEvent_timestamp_idx" ON "MedicationEvent"("timestamp");
