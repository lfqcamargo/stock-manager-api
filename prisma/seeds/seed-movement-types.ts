import { MovementDirection, PrismaClient } from "@generated/prisma/client";

interface MovementTypeTemplate {
  name: string;
  direction: MovementDirection;
}

const MOVEMENT_TYPE_TEMPLATES: MovementTypeTemplate[] = [
  // Entradas
  { name: "Compra", direction: MovementDirection.IN },
  { name: "Devolução de Cliente", direction: MovementDirection.IN },
  { name: "Transferência Entrada", direction: MovementDirection.IN },
  { name: "Ajuste de Inventário Positivo", direction: MovementDirection.IN },
  { name: "Produção", direction: MovementDirection.IN },

  // Saídas
  { name: "Venda", direction: MovementDirection.OUT },
  { name: "Devolução a Fornecedor", direction: MovementDirection.OUT },
  { name: "Transferência Saída", direction: MovementDirection.OUT },
  { name: "Ajuste de Inventário Negativo", direction: MovementDirection.OUT },
  { name: "Consumo Interno", direction: MovementDirection.OUT },
];

export async function seedMovementTypes(prisma: PrismaClient) {
  console.log("🔄 Criando tipos de movimentação...");

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  for (const company of companies) {
    console.log(`\n🏢 Tipos para empresa: ${company.name}`);

    const created = await Promise.all(
      MOVEMENT_TYPE_TEMPLATES.map((template) =>
        prisma.movementType.upsert({
          where: {
            companyId_name: {
              companyId: company.id,
              name: template.name,
            },
          },
          update: {},
          create: {
            name: template.name,
            direction: template.direction,
            companyId: company.id,
          },
        })
      )
    );

    const inCount = created.filter(
      (mt) => mt.direction === MovementDirection.IN
    ).length;
    const outCount = created.filter(
      (mt) => mt.direction === MovementDirection.OUT
    ).length;

    console.log(
      `  ✅ ${created.length} tipos criados (${inCount} entradas, ${outCount} saídas)`
    );
  }

  console.log("\n✅ Tipos de movimentação finalizados com sucesso!");
}
