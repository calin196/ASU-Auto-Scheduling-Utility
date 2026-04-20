-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "category" TEXT,
    "exactIssue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quotedPrice" REAL,
    "isNegotiable" BOOLEAN,
    "clientCounterPrice" REAL,
    "unreadForClient" BOOLEAN NOT NULL DEFAULT false,
    "unreadForProvider" BOOLEAN NOT NULL DEFAULT true,
    "scheduleStatus" TEXT NOT NULL DEFAULT 'none',
    "appointmentDate" DATETIME,
    "appointmentMessage" TEXT,
    "lastDateProposedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServiceRequest" ("category", "clientCounterPrice", "clientId", "createdAt", "exactIssue", "id", "isNegotiable", "providerId", "quotedPrice", "serviceType", "status", "unreadForClient", "unreadForProvider") SELECT "category", "clientCounterPrice", "clientId", "createdAt", "exactIssue", "id", "isNegotiable", "providerId", "quotedPrice", "serviceType", "status", "unreadForClient", "unreadForProvider" FROM "ServiceRequest";
DROP TABLE "ServiceRequest";
ALTER TABLE "new_ServiceRequest" RENAME TO "ServiceRequest";
CREATE INDEX "ServiceRequest_clientId_idx" ON "ServiceRequest"("clientId");
CREATE INDEX "ServiceRequest_providerId_idx" ON "ServiceRequest"("providerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
