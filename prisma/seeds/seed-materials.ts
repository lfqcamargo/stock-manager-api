import { PrismaClient } from "@generated/prisma/client";
import { MATERIALS_BY_GROUP } from "./data";

export async function seedMaterials(prisma: PrismaClient) {
  console.log("🔧 Criando materiais...");

  const allGroups = await prisma.group.findMany({
    select: { id: true, name: true, companyId: true },
  });

  const groupsByCompany: Record<string, typeof allGroups> = {};
  for (const group of allGroups) {
    if (!groupsByCompany[group.companyId]) {
      groupsByCompany[group.companyId] = [];
    }
    groupsByCompany[group.companyId].push(group);
  }

  let totalCreated = 0;
  const companyCounters: Record<string, number> = {};

  for (const [companyId, groups] of Object.entries(groupsByCompany)) {
    if (!companyCounters[companyId]) {
      const lastMaterial = await prisma.material.findFirst({
        where: { companyId },
        orderBy: { code: "desc" },
        select: { code: true },
      });

      companyCounters[companyId] = lastMaterial ? parseInt(lastMaterial.code) + 1 : 1;
    }

    for (const group of groups) {
      const materialTemplates = MATERIALS_BY_GROUP[group.name] || [];

      if (materialTemplates.length === 0) {
        console.log(`⚠️ Nenhum template encontrado para grupo: ${group.name}`);
        continue;
      }

      const materialsToCreate = materialTemplates.map((template) => {
        const materialCode = companyCounters[companyId].toString();
        companyCounters[companyId]++;

        return {
          ...template,
          code: materialCode,
          active: true,
          companyId,
          groupId: group.id,
        };
      });

      await prisma.material.createMany({
        data: materialsToCreate,
        skipDuplicates: true,
      });

      totalCreated += materialsToCreate.length;
      console.log(
        `✅ ${materialsToCreate.length} materiais criados para grupo: ${group.name} (empresa: ${companyId})`
      );
    }
  }

  console.log(`\n✅ Total de materiais criados: ${totalCreated}`);
  return totalCreated;
}
