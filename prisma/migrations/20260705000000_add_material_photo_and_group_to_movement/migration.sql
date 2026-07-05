-- AddColumn: material_photo_url (nullable, sem default necessário)
ALTER TABLE "movements" ADD COLUMN "material_photo_url" TEXT;

-- AddColumn: material_group_id (texto, default vazio para registros históricos existentes)
ALTER TABLE "movements" ADD COLUMN "material_group_id" TEXT NOT NULL DEFAULT '';

-- AddColumn: material_group_name (texto, default vazio para registros históricos existentes)
ALTER TABLE "movements" ADD COLUMN "material_group_name" TEXT NOT NULL DEFAULT '';

-- Remover os defaults após aplicar (novos registros sempre virão preenchidos pelo use-case)
ALTER TABLE "movements" ALTER COLUMN "material_group_id" DROP DEFAULT;
ALTER TABLE "movements" ALTER COLUMN "material_group_name" DROP DEFAULT;
