import { MovementDirection, PrismaClient } from "@generated/prisma/client";

/**
 * Cria movimentações de seed respeitando a regra:
 * - Sempre começa com entradas (IN) para garantir saldo positivo antes de qualquer saída.
 * - Saídas (OUT) nunca excedem o saldo atual do endereçamento.
 * - O campo `amount` do addressing é atualizado a cada movimentação.
 */
export async function seedMovements(prisma: PrismaClient) {
  console.log("🚚 Criando movimentações...");

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  for (const company of companies) {
    console.log(`\n🏢 Movimentações para empresa: ${company.name}`);

    // Busca usuários, addressings com material e tipos de movimentação da empresa
    const [users, addressings, movementTypes] = await Promise.all([
      prisma.user.findMany({
        where: { companyId: company.id },
        select: { id: true },
      }),
      prisma.addressing.findMany({
        where: {
          companyId: company.id,
          materialId: { not: null },
          active: true,
        },
        select: { id: true, amount: true, materialId: true },
        take: 300,
      }),
      prisma.movementType.findMany({
        where: { companyId: company.id },
        select: { id: true, direction: true, name: true },
      }),
    ]);

    if (users.length === 0) {
      console.log(`  ⚠️  Nenhum usuário encontrado para ${company.name}, pulando...`);
      continue;
    }

    if (addressings.length === 0) {
      console.log(`  ⚠️  Nenhum endereçamento com material para ${company.name}, pulando...`);
      continue;
    }

    const inTypes = movementTypes.filter((mt) => mt.direction === MovementDirection.IN);
    const outTypes = movementTypes.filter((mt) => mt.direction === MovementDirection.OUT);

    if (inTypes.length === 0 || outTypes.length === 0) {
      console.log(`  ⚠️  Tipos de movimentação incompletos para ${company.name}, pulando...`);
      continue;
    }

    // Controla o saldo em memória para não negativar o addressing
    const balances = new Map<string, number>(
      addressings.map((a) => [a.id, a.amount])
    );

    let createdCount = 0;
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    /** Retorna uma Date dentro do mês atual, nunca excedendo o último dia. */
    const dateInMonth = (offsetDays: number): Date => {
      const d = new Date(baseDate);
      d.setDate(1 + (offsetDays % lastDayOfMonth));
      return d;
    };

    for (const addressing of addressings) {
      const userId = users[createdCount % users.length].id;

      // ── 3 entradas distribuídas ao longo do tempo ───────────────────────
      const inQuantities = [50, 30, 20];
      for (let i = 0; i < inQuantities.length; i++) {
        const qty = inQuantities[i];
        const inType = inTypes[i % inTypes.length];
        const movDate = dateInMonth(createdCount * 3 + i);

        await prisma.movement.create({
          data: {
            companyId: company.id,
            addressingId: addressing.id,
            movementTypeId: inType.id,
            userId,
            quantity: qty,
            date: movDate,
            observation: `Seed: ${inType.name}`,
          },
        });

        balances.set(addressing.id, (balances.get(addressing.id) ?? 0) + qty);
      }

      // ── 2 saídas — nunca negativam o saldo ──────────────────────────────
      const outQuantities = [15, 10];
      for (let i = 0; i < outQuantities.length; i++) {
        const qty = outQuantities[i];
        const currentBalance = balances.get(addressing.id) ?? 0;

        if (currentBalance < qty) {
          // Saldo insuficiente: pula essa saída para não negativar
          continue;
        }

        const outType = outTypes[i % outTypes.length];
        const movDate = dateInMonth(createdCount * 3 + inQuantities.length + i);

        await prisma.movement.create({
          data: {
            companyId: company.id,
            addressingId: addressing.id,
            movementTypeId: outType.id,
            userId,
            quantity: qty,
            date: movDate,
            observation: `Seed: ${outType.name}`,
          },
        });

        balances.set(addressing.id, currentBalance - qty);
      }

      // ── Atualiza o amount final do addressing ───────────────────────────
      await prisma.addressing.update({
        where: { id: addressing.id },
        data: { amount: balances.get(addressing.id) ?? 0 },
      });

      createdCount++;
    }

    // Resumo de saldos finais
    const totalMovements = addressings.length * 5; // 3 IN + 2 OUT (aprox.)
    console.log(
      `  ✅ ~${totalMovements} movimentações criadas para ${addressings.length} endereçamentos`
    );

    const finalAddressings = await prisma.addressing.findMany({
      where: {
        companyId: company.id,
        materialId: { not: null },
        active: true,
      },
      select: { amount: true },
      take: 20,
    });

    const hasNegative = finalAddressings.some((a) => a.amount < 0);
    if (hasNegative) {
      throw new Error(`❌ Saldo negativo detectado na empresa ${company.name}`);
    }

    console.log(`  ✅ Todos os saldos positivos confirmados`);
  }

  console.log("\n✅ Movimentações finalizadas com sucesso!");
}
