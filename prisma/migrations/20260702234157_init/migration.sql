-- CreateEnum
CREATE TYPE "UnitMeasure" AS ENUM ('UN', 'KG', 'G', 'MG', 'TON', 'L', 'ML', 'M', 'CM', 'MM', 'M2', 'M3', 'CX', 'PC', 'PCT', 'FD', 'BDJ', 'RL', 'SC', 'LT', 'GAL', 'JAR', 'TBL', 'KIT');

-- CreateEnum
CREATE TYPE "MovementDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'pending',
    "observation" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_companies" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_cnpj" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "temp_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_password_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "temp_password_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "company_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL,
    "photo_url" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "unit" "UnitMeasure" NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_locations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,

    CONSTRAINT "sub_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rows" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelfs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "shelfs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addressings" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "sub_location_id" TEXT NOT NULL,
    "row_id" TEXT NOT NULL,
    "shelf_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "material_id" TEXT,

    CONSTRAINT "addressings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "MovementDirection" NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "movement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "observation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,
    "addressing_id" TEXT NOT NULL,
    "movement_type_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "movement_type_name" TEXT NOT NULL,
    "movement_type_direction" "MovementDirection" NOT NULL,
    "user_name" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "location_code" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "sub_location_id" TEXT NOT NULL,
    "sub_location_code" TEXT NOT NULL,
    "sub_location_name" TEXT NOT NULL,
    "row_id" TEXT NOT NULL,
    "row_code" TEXT NOT NULL,
    "row_name" TEXT NOT NULL,
    "shelf_id" TEXT NOT NULL,
    "shelf_code" TEXT NOT NULL,
    "shelf_name" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "position_code" TEXT NOT NULL,
    "position_name" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "material_description" TEXT NOT NULL,
    "material_unit" TEXT NOT NULL,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_companies_company_cnpj_key" ON "temp_companies"("company_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "temp_companies_user_email_key" ON "temp_companies"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "temp_companies_token_key" ON "temp_companies"("token");

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_email_key" ON "temp_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_token_key" ON "temp_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "temp_password_tokens_token_key" ON "temp_password_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materials_company_id_code_key" ON "materials"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "locations_company_id_code_key" ON "locations"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "sub_locations_company_id_code_key" ON "sub_locations"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "rows_company_id_code_key" ON "rows"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "shelfs_company_id_code_key" ON "shelfs"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "positions_company_id_code_key" ON "positions"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "movement_types_company_id_name_key" ON "movement_types"("company_id", "name");

-- AddForeignKey
ALTER TABLE "temp_password_tokens" ADD CONSTRAINT "temp_password_tokens_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_password_tokens" ADD CONSTRAINT "temp_password_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_locations" ADD CONSTRAINT "sub_locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_locations" ADD CONSTRAINT "sub_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rows" ADD CONSTRAINT "rows_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelfs" ADD CONSTRAINT "shelfs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_sub_location_id_fkey" FOREIGN KEY ("sub_location_id") REFERENCES "sub_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "rows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_shelf_id_fkey" FOREIGN KEY ("shelf_id") REFERENCES "shelfs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addressings" ADD CONSTRAINT "addressings_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_types" ADD CONSTRAINT "movement_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
