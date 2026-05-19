-- CreateEnum
CREATE TYPE "CameraType" AS ENUM ('COGNEX_INSIGHT', 'COGNEX_DATAMAN', 'MIRA_3D');

-- CreateEnum
CREATE TYPE "RobotControllerType" AS ENUM ('ABB', 'COMAU', 'FANUC', 'KUKA');

-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('PLANNING', 'PRODUCTION', 'MAINTENANCE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CameraStatus" AS ENUM ('PLANNING', 'CALIBRATING', 'JOB_CREATION', 'PRODUCTION', 'MAINTENANCE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('PLANT_REFERENT', 'IT_REFERENT', 'ROBOTICS_REFERENT', 'COMAU_REFERENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('INSTALLATION', 'CALIBRATION', 'JOB_UPDATE', 'LICENSE_RENEWAL', 'HARDWARE_SWAP', 'FIRMWARE_UPDATE', 'TROUBLESHOOTING', 'OTHER');

-- CreateEnum
CREATE TYPE "CalibrationMode" AS ENUM ('PRODUCTION_20', 'LAB_5', 'EXTENDED_30', 'CUSTOM');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "line" TEXT,
    "description" TEXT,
    "installDate" TIMESTAMP(3),
    "recoveryProcedure" TEXT,
    "notes" TEXT,
    "status" "StationStatus",
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CameraType" NOT NULL,
    "cameraModel" TEXT,
    "lensFocalMm" DOUBLE PRECISION,
    "firmware" TEXT,
    "ipAddress" TEXT,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "controllerType" "RobotControllerType",
    "plcNotes" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "status" "CameraStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cameraId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visionToolSlot" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBackup" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "masterImagePath" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobBackup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTestImage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "backupId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "capturedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobTestImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HalconLicenseRecord" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cameraId" UUID NOT NULL,
    "version" TEXT,
    "expiryDate" TIMESTAMP(3),
    "filePath" TEXT,
    "fileSize" BIGINT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HalconLicenseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RobotBackupRecord" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cameraId" UUID NOT NULL,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "robotController" "RobotControllerType",
    "controllerVersion" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RobotBackupRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cameraId" UUID NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "category" "MaintenanceCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calibration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cameraId" UUID NOT NULL,
    "mode" "CalibrationMode" NOT NULL,
    "totalPosesPlanned" INTEGER NOT NULL,
    "anchorPose" JSONB NOT NULL,
    "poses" JSONB NOT NULL,
    "plate" JSONB NOT NULL,
    "result" JSONB,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calibration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "category" "ContactCategory",
    "notes" TEXT,
    "customerId" UUID,
    "plantId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "entityPath" TEXT NOT NULL,
    "changeSummary" TEXT NOT NULL,
    "diffJson" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "uiLanguage" TEXT NOT NULL DEFAULT 'it',
    "projectsRootPath" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "preferredPoseFormat" JSONB NOT NULL,
    "encryptionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_slug_key" ON "Customer"("slug");

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBackup" ADD CONSTRAINT "JobBackup_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTestImage" ADD CONSTRAINT "JobTestImage_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "JobBackup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HalconLicenseRecord" ADD CONSTRAINT "HalconLicenseRecord_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RobotBackupRecord" ADD CONSTRAINT "RobotBackupRecord_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceEvent" ADD CONSTRAINT "MaintenanceEvent_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calibration" ADD CONSTRAINT "Calibration_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
