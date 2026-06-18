/// <reference types="node" />
import "dotenv/config";

import { seedUsers } from "./seeds/seed-users";
import { seedCompanies } from "./seeds/seed-companies";
import { PrismaClient } from "@generated/prisma/client";
import { createPrismaPgAdapter } from "../src/infra/database/prisma/create-prisma-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = createPrismaPgAdapter(connectionString);

const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  try {
    console.log("🗑️  Limpando dados existentes...");

    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    console.log("✅ Dados limpos com sucesso!\n");

    const companies = await seedCompanies(prisma);
    console.log("✅ Empresas criadas com sucesso!\n");

    await seedUsers(prisma, companies);
    console.log("✅ Usuários criados com sucesso!\n");
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
