-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PropertyKind" AS ENUM ('BED_AND_BREAKFAST', 'AFFITTACAMERE');

-- CreateEnum
CREATE TYPE "StayStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CHECKED_IN', 'DEPARTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "GuestRole" AS ENUM ('SINGOLO', 'CAPOFAMIGLIA', 'CAPOGRUPPO', 'OSPITE_FAMIGLIA', 'OSPITE_GRUPPO');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "DocumentSide" AS ENUM ('FRONT', 'BACK', 'SINGLE');

-- CreateEnum
CREATE TYPE "CheckinLinkStatus" AS ENUM ('SENT', 'OPENED', 'SUBMITTED', 'CONFIRMED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SubmissionTarget" AS ENUM ('ALLOGGIATI', 'ROSS1000');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "PropertyKind" NOT NULL,
    "address" TEXT,
    "comuneCode" TEXT,
    "comuneName" TEXT,
    "province" TEXT,
    "cap" TEXT,
    "alloggiatiUsernameEnc" TEXT,
    "alloggiatiPasswordEnc" TEXT,
    "alloggiatiWsKeyEnc" TEXT,
    "ross1000UsernameEnc" TEXT,
    "ross1000PasswordEnc" TEXT,
    "ross1000StructureCode" TEXT,
    "ross1000Endpoint" TEXT,
    "docRetentionDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomType" TEXT,
    "beds" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'DIRETTO',
    "externalRef" TEXT,
    "status" "StayStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "alloggiatiStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "ross1000Status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "role" "GuestRole" NOT NULL DEFAULT 'SINGOLO',
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthComuneCode" TEXT,
    "birthComuneName" TEXT,
    "birthProvince" TEXT,
    "birthCountryCode" TEXT,
    "citizenshipCountryCode" TEXT,
    "residenceCountryCode" TEXT,
    "residenceComuneCode" TEXT,
    "residenceComuneName" TEXT,
    "residenceProvince" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "documentIssuePlaceCode" TEXT,
    "documentIssuePlaceName" TEXT,
    "documentIssueCountryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdDocumentImage" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "side" "DocumentSide" NOT NULL DEFAULT 'SINGLE',
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteAfter" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "IdDocumentImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckinLink" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "CheckinLinkStatus" NOT NULL DEFAULT 'SENT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CheckinLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "stayId" TEXT,
    "propertyId" TEXT NOT NULL,
    "target" "SubmissionTarget" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "requestPayload" TEXT,
    "responsePayload" TEXT,
    "receiptRef" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comune" (
    "istatCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "cadastralCode" TEXT,
    "region" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Comune_pkey" PRIMARY KEY ("istatCode")
);

-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso3" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "DocumentKind" (
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiresIssuePlace" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DocumentKind_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Room_propertyId_idx" ON "Room"("propertyId");

-- CreateIndex
CREATE INDEX "Stay_propertyId_arrivalDate_idx" ON "Stay"("propertyId", "arrivalDate");

-- CreateIndex
CREATE INDEX "Stay_status_idx" ON "Stay"("status");

-- CreateIndex
CREATE INDEX "Guest_stayId_idx" ON "Guest"("stayId");

-- CreateIndex
CREATE INDEX "IdDocumentImage_guestId_idx" ON "IdDocumentImage"("guestId");

-- CreateIndex
CREATE INDEX "IdDocumentImage_deleteAfter_deletedAt_idx" ON "IdDocumentImage"("deleteAfter", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CheckinLink_stayId_key" ON "CheckinLink"("stayId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckinLink_token_key" ON "CheckinLink"("token");

-- CreateIndex
CREATE INDEX "Submission_propertyId_target_createdAt_idx" ON "Submission"("propertyId", "target", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_stayId_idx" ON "Submission"("stayId");

-- CreateIndex
CREATE INDEX "Comune_name_idx" ON "Comune"("name");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stay" ADD CONSTRAINT "Stay_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stay" ADD CONSTRAINT "Stay_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdDocumentImage" ADD CONSTRAINT "IdDocumentImage_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinLink" ADD CONSTRAINT "CheckinLink_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
