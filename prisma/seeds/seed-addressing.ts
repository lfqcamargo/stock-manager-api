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
    // Locations
    // ────────────────────────────────────────────
    const [loc1, loc2] = await Promise.all([
      prisma.location.create({
        data: {
          code: "LOC-A",
          name: "Galpão A",
          description: "Galpão principal",
          companyId,
        },
      }),
      prisma.location.create({
        data: {
          code: "LOC-B",
          name: "Galpão B",
          description: "Galpão secundário",
          companyId,
        },
      }),
    ]);

    console.log(`  ✅ Localizações criadas: ${loc1.name}, ${loc2.name}`);

    // ────────────────────────────────────────────
    // SubLocations  (vinculadas ao loc1 e loc2)
    // ────────────────────────────────────────────
    const [sub1, sub2] = await Promise.all([
      prisma.subLocation.create({
        data: {
          code: "SUB-A1",
          name: "Setor A1",
          description: "Setor 1 do Galpão A",
          companyId,
          locationId: loc1.id,
        },
      }),
      prisma.subLocation.create({
        data: {
          code: "SUB-B1",
          name: "Setor B1",
          description: "Setor 1 do Galpão B",
          companyId,
          locationId: loc2.id,
        },
      }),
    ]);

    console.log(`  ✅ Sub-localizações criadas: ${sub1.name}, ${sub2.name}`);

    // ────────────────────────────────────────────
    // Rows
    // ────────────────────────────────────────────
    const [row1, row2] = await Promise.all([
      prisma.row.create({
        data: {
          code: "ROW-01",
          name: "Fileira 01",
          description: "Primeira fileira",
          companyId,
        },
      }),
      prisma.row.create({
        data: {
          code: "ROW-02",
          name: "Fileira 02",
          description: "Segunda fileira",
          companyId,
        },
      }),
    ]);

    console.log(`  ✅ Fileiras criadas: ${row1.name}, ${row2.name}`);

    // ────────────────────────────────────────────
    // Shelfs
    // ────────────────────────────────────────────
    const [shelf1, shelf2] = await Promise.all([
      prisma.shelf.create({
        data: {
          code: "SHF-01",
          name: "Prateleira 01",
          description: "Primeira prateleira",
          companyId,
        },
      }),
      prisma.shelf.create({
        data: {
          code: "SHF-02",
          name: "Prateleira 02",
          description: "Segunda prateleira",
          companyId,
        },
      }),
    ]);

    console.log(`  ✅ Prateleiras criadas: ${shelf1.name}, ${shelf2.name}`);

    // ────────────────────────────────────────────
    // Positions
    // ────────────────────────────────────────────
    const [pos1, pos2, pos3] = await Promise.all([
      prisma.position.create({
        data: {
          code: "POS-01",
          name: "Posição 01",
          description: "Primeira posição",
          companyId,
        },
      }),
      prisma.position.create({
        data: {
          code: "POS-02",
          name: "Posição 02",
          description: "Segunda posição",
          companyId,
        },
      }),
      prisma.position.create({
        data: {
          code: "POS-03",
          name: "Posição 03",
          description: "Terceira posição",
          companyId,
        },
      }),
    ]);

    console.log(
      `  ✅ Posições criadas: ${pos1.name}, ${pos2.name}, ${pos3.name}`
    );

    // ────────────────────────────────────────────
    // Addressings
    // Combinações: 2 loc × 2 sub × 2 row × 2 shelf × 3 pos = 48 endereços
    // Vinculamos material quando disponível, caso contrário materialId = null
    // ────────────────────────────────────────────
    const materials = await prisma.material.findMany({
      where: { companyId },
      select: { id: true },
      take: 48,
    });

    const locations = [loc1, loc2];
    const subLocations = [sub1, sub2];
    const rows = [row1, row2];
    const shelfs = [shelf1, shelf2];
    const positions = [pos1, pos2, pos3];

    let materialIndex = 0;
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

    for (const loc of locations) {
      for (const sub of subLocations) {
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
            }
          }
        }
      }
    }

    await prisma.addressing.createMany({ data: addressingsToCreate });

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
