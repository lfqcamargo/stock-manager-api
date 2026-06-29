import { PrismaClient } from "@generated/prisma/client";

export async function seedAddressing(prisma: PrismaClient) {
  console.log("📦 Criando localizações, endereçamentos...");

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  for (const company of companies) {
    const companyId = company.id;
    console.log(`\n🏢 Processando empresa: ${company.name}`);

    // ────────────────────────────────────────────
    // Locations — 5 galpões/áreas por empresa
    // ────────────────────────────────────────────
    const locationData = [
      { code: "LOC-A", name: "Galpão A", description: "Galpão principal de armazenagem" },
      { code: "LOC-B", name: "Galpão B", description: "Galpão secundário" },
      { code: "LOC-C", name: "Galpão C", description: "Galpão de matéria-prima" },
      { code: "LOC-D", name: "Almoxarifado", description: "Almoxarifado geral" },
      { code: "LOC-E", name: "Área Expedição", description: "Área de expedição e recebimento" },
    ];

    const locations = await Promise.all(
      locationData.map((d) =>
        prisma.location.create({ data: { ...d, companyId } })
      )
    );
    console.log(`  ✅ ${locations.length} localizações criadas`);

    // ────────────────────────────────────────────
    // SubLocations — 3 setores por location (15 total)
    // ────────────────────────────────────────────
    const subLocationData = locations.flatMap((loc, li) => [
      {
        code: `SUB-${loc.code.replace("LOC-", "")}-1`,
        name: `Setor 1 - ${loc.name}`,
        description: `Primeiro setor de ${loc.name}`,
        companyId,
        locationId: loc.id,
      },
      {
        code: `SUB-${loc.code.replace("LOC-", "")}-2`,
        name: `Setor 2 - ${loc.name}`,
        description: `Segundo setor de ${loc.name}`,
        companyId,
        locationId: loc.id,
      },
      {
        code: `SUB-${loc.code.replace("LOC-", "")}-3`,
        name: `Setor 3 - ${loc.name}`,
        description: `Terceiro setor de ${loc.name}`,
        companyId,
        locationId: loc.id,
      },
    ]);

    const subLocations = await Promise.all(
      subLocationData.map((d) => prisma.subLocation.create({ data: d }))
    );
    console.log(`  ✅ ${subLocations.length} sub-localizações criadas`);

    // ────────────────────────────────────────────
    // Rows — 10 fileiras por empresa
    // ────────────────────────────────────────────
    const rowData = Array.from({ length: 10 }, (_, i) => ({
      code: `ROW-${String(i + 1).padStart(2, "0")}`,
      name: `Fileira ${String(i + 1).padStart(2, "0")}`,
      description: `Fileira número ${i + 1}`,
      companyId,
    }));

    const rows = await Promise.all(
      rowData.map((d) => prisma.row.create({ data: d }))
    );
    console.log(`  ✅ ${rows.length} fileiras criadas`);

    // ────────────────────────────────────────────
    // Shelfs — 8 prateleiras por empresa
    // ────────────────────────────────────────────
    const shelfData = Array.from({ length: 8 }, (_, i) => ({
      code: `SHF-${String(i + 1).padStart(2, "0")}`,
      name: `Prateleira ${String(i + 1).padStart(2, "0")}`,
      description: `Prateleira número ${i + 1}`,
      companyId,
    }));

    const shelfs = await Promise.all(
      shelfData.map((d) => prisma.shelf.create({ data: d }))
    );
    console.log(`  ✅ ${shelfs.length} prateleiras criadas`);

    // ────────────────────────────────────────────
    // Positions — 5 posições por empresa
    // ────────────────────────────────────────────
    const positionData = Array.from({ length: 5 }, (_, i) => ({
      code: `POS-${String(i + 1).padStart(2, "0")}`,
      name: `Posição ${String(i + 1).padStart(2, "0")}`,
      description: `Posição número ${i + 1}`,
      companyId,
    }));

    const positions = await Promise.all(
      positionData.map((d) => prisma.position.create({ data: d }))
    );
    console.log(`  ✅ ${positions.length} posições criadas`);

    // ────────────────────────────────────────────
    // Addressings
    // Distribui materiais por endereços combinando
    // cada (loc, sub, row, shelf, pos) até esgotar os materiais.
    // Total máximo de combinações: 5 loc × 3 sub × 10 row × 8 shelf × 5 pos = 6000
    // Na prática usamos as primeiras N combinações para cobrir os materiais.
    // ────────────────────────────────────────────
    const materials = await prisma.material.findMany({
      where: { companyId },
      select: { id: true },
    });

    const addressingsToCreate: {
      companyId: string;
      locationId: string;
      subLocationId: string;
      rowId: string;
      shelfId: string;
      positionId: string;
      materialId: string | null;
      amount: number;
      active: boolean;
    }[] = [];

    let materialIndex = 0;

    // Gera combinações priorizando variar todos os eixos
    outer: for (const loc of locations) {
      for (const sub of subLocations.filter((s) => s.locationId === loc.id)) {
        for (const row of rows) {
          for (const shelf of shelfs) {
            for (const pos of positions) {
              const material =
                materialIndex < materials.length
                  ? materials[materialIndex++]
                  : null;

              addressingsToCreate.push({
                companyId,
                locationId: loc.id,
                subLocationId: sub.id,
                rowId: row.id,
                shelfId: shelf.id,
                positionId: pos.id,
                materialId: material?.id ?? null,
                amount: 0,
                active: true,
              });

              // Para quando já temos endereços suficientes (max 600 por empresa)
              if (addressingsToCreate.length >= 600) break outer;
            }
          }
        }
      }
    }

    // Cria em lotes de 100 para não sobrecarregar
    const BATCH = 100;
    for (let i = 0; i < addressingsToCreate.length; i += BATCH) {
      await prisma.addressing.createMany({
        data: addressingsToCreate.slice(i, i + BATCH),
      });
    }

    const withMaterial = addressingsToCreate.filter(
      (a) => a.materialId !== null
    ).length;
    const withoutMaterial = addressingsToCreate.length - withMaterial;

    console.log(
      `  ✅ ${addressingsToCreate.length} endereçamentos criados ` +
        `(${withMaterial} com material, ${withoutMaterial} sem material)`
    );
  }

  console.log("\n✅ Endereçamentos finalizados com sucesso!");
}
