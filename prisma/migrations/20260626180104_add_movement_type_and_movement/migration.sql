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

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movement_types_company_id_name_key" ON "movement_types"("company_id", "name");

-- AddForeignKey
ALTER TABLE "movement_types" ADD CONSTRAINT "movement_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
