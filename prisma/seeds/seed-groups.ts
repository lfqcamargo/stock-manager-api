import { PrismaClient } from "@generated/prisma/client";
import { GROUP_TEMPLATES } from "./data";

export async function seedGroups(prisma: PrismaClient) {
  console.log("📦 Criando grupos de materiais...");

  const allCompanies = await prisma.company.findMany({
    select: { id: true },
  });

  let totalCreated = 0;

  for (const company of allCompanies) {
    const groupsToCreate = GROUP_TEMPLATES.map((template) => ({
      ...template,
      active: true,
      companyId: company.id,
    }));

    await prisma.group.createMany({
      data: groupsToCreate,
      skipDuplicates: true,
    });

    totalCreated += groupsToCreate.length;
    console.log(`✅ ${groupsToCreate.length} grupos criados para empresa: ${company.id}`);
  }

  console.log(`\n✅ Total de grupos criados: ${totalCreated}`);
  return totalCreated;
}
