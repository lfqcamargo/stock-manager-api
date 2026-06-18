import { PrismaClient } from "@generated/prisma/client";

export async function seedCompanies(prisma: PrismaClient) {
  console.log("🏢 Criando empresas...");

  // ========================================
  // EMPRESA 1: Tech Solutions Brasil Ltda
  // ========================================
  const techSolutions = await prisma.company.create({
    data: {
      name: "Tech Solutions Brasil",
      cnpj: "12.345.678/0001-90",
      createdAt: new Date("2026-01-15"),
    },
  });

  console.log(`✅ Empresa criada: ${techSolutions.name}`);

  // ========================================
  // EMPRESA 2: Indústria Metalúrgica São Paulo S.A.
  // ========================================
  const metalurgica = await prisma.company.create({
    data: {
      name: "Metalúrgica São Paulo",
      cnpj: "23.456.789/0001-12",
      createdAt: new Date("2026-02-20"),
    },
  });

  console.log(`✅ Empresa criada: ${metalurgica.name}`);

  // ========================================
  // EMPRESA 3: Comercial Distribuidora Nordeste Ltda
  // ========================================
  const distribuidoraNordeste = await prisma.company.create({
    data: {
      name: "Distribuidora Nordeste",
      cnpj: "34.567.890/0001-45",
      createdAt: new Date("2026-03-10"),
    },
  });

  console.log(`✅ Empresa criada: ${distribuidoraNordeste.name}`);

  return {
    techSolutions,
    metalurgica,
    distribuidoraNordeste,
  };
}
