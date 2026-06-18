/// <reference types="node" />
import "dotenv/config";

import { seedUsers } from "./seeds/seed-users";
import { seedCompanies } from "./seeds/seed-companies";
import { PrismaClient } from "@generated/prisma/client";
import { createPrismaPgAdapter } from "../src/infra/database/prisma/create-prisma-pg";
import { seedGroups } from "./seeds/seed-groups";
import { seedMaterials } from "./seeds/seed-materials";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = createPrismaPgAdapter(connectionString);

const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  try {
    await prisma.$transaction(async (tx) => {
      console.log("🗑️  Limpando dados existentes...");

      await tx.user.deleteMany();
      await tx.material.deleteMany();
      await tx.group.deleteMany();
      await tx.company.deleteMany();

      console.log("✅ Dados limpos com sucesso!\n");

      await seedCompanies(tx as unknown as PrismaClient);
      console.log("✅ Empresas criadas com sucesso!\n");

      await seedUsers(tx as unknown as PrismaClient);
      console.log("✅ Usuários criados com sucesso!\n");

      await seedGroups(tx as unknown as PrismaClient);
      console.log("✅ Grupos criados com sucesso!\n");

      await seedMaterials(tx as unknown as PrismaClient);
      console.log("✅ Materiais criados com sucesso!\n");
    });
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
