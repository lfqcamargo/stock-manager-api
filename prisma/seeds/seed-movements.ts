import { MovementDirection, PrismaClient } from "@generated/prisma/client";

/**
 * Gera movimentações realistas com histórico de 6 meses.
 *
 * Estratégia:
 * - Distribui entradas e saídas ao longo dos últimos 6 meses (jan-jun 2026).
 * - Cada endereçamento com material recebe entre 4 e 12 movimentações.
 * - Saídas nunca ultrapassam o saldo acumulado.
 * - Quantidades variam por tipo de material (unitário vs. peso/volume).
 * - Algumas movimentações têm observações realistas de contexto.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gera uma data aleatória entre dois instantes, com hora comercial (7h-18h).
 */
function randomDateBetween(start: Date, end: Date): Date {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const d = new Date(startMs + Math.random() * (endMs - startMs));
  d.setHours(randomInt(7, 17), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

// Janela dos últimos 6 meses (janeiro – junho 2026)
const SEED_START = new Date("2026-01-02T07:00:00");
const SEED_END   = new Date("2026-06-28T18:00:00");

// Observações realistas por direção
const IN_OBSERVATIONS = [
  "Recebimento de pedido de compra",
  "Devolução de material pelo setor de produção",
  "Recebimento via transferência entre filiais",
  "Ajuste de inventário após contagem física",
  "Entrada de produção interna",
  "NF de entrada conferida e aprovada",
  "Material recebido conforme laudo de inspeção",
  "Reposição automática por nível mínimo atingido",
  "Entrada emergencial para atender OS urgente",
  "Material recebido sem avaria – liberado pelo almoxarifado",
  "Recebimento parcial do pedido PO-2026",
  "Complemento de lote anterior",
  "Retorno de material emprestado ao setor de manutenção",
  "Entrada por devolução de fornecedor — qualidade OK",
  "Nota fiscal de entrada processada pelo financeiro",
  null,
];

const OUT_OBSERVATIONS = [
  "Retirada para ordem de serviço",
  "Baixa de consumo interno — produção",
  "Envio para manutenção corretiva",
  "Transferência saída para outro almoxarifado",
  "Venda para cliente — NF emitida",
  "Devolução ao fornecedor — material fora de especificação",
  "Consumo em serviço de campo",
  "Retirada autorizada pelo supervisor de produção",
  "Ajuste de inventário negativo após divergência",
  "Atendimento de requisição de material RM-2026",
  "Descarte controlado — material com prazo vencido",
  "Saída para manutenção preventiva mensal",
  "Fornecimento para projeto de instalação",
  "Retirada pela equipe de obras externas",
  "Baixa por quebra/dano durante movimentação",
  null,
];

// ---------------------------------------------------------------------------
// Lógica de quantidades — evita números absurdos para materiais por m², m³ etc.
// ---------------------------------------------------------------------------
type QuantityRange = { min: number; max: number; step: number };

const QTY_RANGES: Record<string, QuantityRange> = {
  default:  { min: 2,    max: 50,   step: 1    },
  weight:   { min: 1,    max: 100,  step: 0.5  },   // KG, TON, G
  volume:   { min: 1,    max: 50,   step: 0.5  },   // L, ML, LT, GAL, JAR, M3
  length:   { min: 2,    max: 100,  step: 1    },   // M, CM, MM
  area:     { min: 1,    max: 30,   step: 0.5  },   // M2
  pack:     { min: 1,    max: 20,   step: 1    },   // CX, PC, PCT, RL, SC, FD, BDJ, KIT
};

function getRange(unit: string): QuantityRange {
  const u = unit.toUpperCase();
  if (["KG", "G", "MG", "TON"].includes(u)) return QTY_RANGES.weight;
  if (["L", "ML", "LT", "GAL", "JAR", "M3"].includes(u)) return QTY_RANGES.volume;
  if (["M", "CM", "MM"].includes(u)) return QTY_RANGES.length;
  if (["M2"].includes(u)) return QTY_RANGES.area;
  if (["CX", "PC", "PCT", "RL", "SC", "FD", "BDJ", "KIT", "TBL"].includes(u)) return QTY_RANGES.pack;
  return QTY_RANGES.default; // UN, PAR
}

function qty(range: QuantityRange): number {
  const steps = Math.floor((range.max - range.min) / range.step);
  return parseFloat((range.min + randomInt(0, steps) * range.step).toFixed(2));
}

// ---------------------------------------------------------------------------
// Seed principal
// ---------------------------------------------------------------------------
export async function seedMovements(prisma: PrismaClient) {
  console.log("🚚 Criando movimentações realistas (6 meses de histórico)...");

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  for (const company of companies) {
    console.log(`\n🏢 Movimentações para empresa: ${company.name}`);

    const [users, addressings, movementTypes] = await Promise.all([
      prisma.user.findMany({
        where: { companyId: company.id },
        select: { id: true, name: true },
      }),
      prisma.addressing.findMany({
        where: {
          companyId: company.id,
          materialId: { not: null },
          active: true,
        },
        select: {
          id: true,
          amount: true,
          materialId: true,
          location:    { select: { id: true, code: true, name: true } },
          subLocation: { select: { id: true, code: true, name: true } },
          row:         { select: { id: true, code: true, name: true } },
          shelf:       { select: { id: true, code: true, name: true } },
          position:    { select: { id: true, code: true, name: true } },
          material:    { select: { id: true, code: true, name: true, description: true, unit: true } },
        },
      }),
      prisma.movementType.findMany({
        where: { companyId: company.id },
        select: { id: true, direction: true, name: true },
      }),
    ]);

    if (!users.length || !addressings.length || !movementTypes.length) {
      console.log(`  ⚠️  Dados insuficientes para ${company.name}, pulando...`);
      continue;
    }

    const inTypes  = movementTypes.filter(mt => mt.direction === MovementDirection.IN);
    const outTypes = movementTypes.filter(mt => mt.direction === MovementDirection.OUT);

    if (!inTypes.length || !outTypes.length) {
      console.log(`  ⚠️  Tipos de movimentação incompletos para ${company.name}, pulando...`);
      continue;
    }

    // Saldo em memória para não negativar
    const balances = new Map<string, number>(addressings.map(a => [a.id, a.amount]));

    // Prepara movimentos em memória para depois criar em lote
    const movementsToCreate: {
      companyId:            string;
      addressingId:         string;
      movementTypeId:       string;
      userId:               string;
      quantity:             number;
      date:                 Date;
      observation:          string | null;
      movementTypeName:     string;
      movementTypeDirection: MovementDirection;
      userName:             string;
      locationId:           string;
      locationCode:         string;
      locationName:         string;
      subLocationId:        string;
      subLocationCode:      string;
      subLocationName:      string;
      rowId:                string;
      rowCode:              string;
      rowName:              string;
      shelfId:              string;
      shelfCode:            string;
      shelfName:            string;
      positionId:           string;
      positionCode:         string;
      positionName:         string;
      materialId:           string;
      materialCode:         string;
      materialName:         string;
      materialDescription:  string;
      materialUnit:         string;
    }[] = [];

    // Mapa de saldo final para atualizar os addressings
    const finalBalances = new Map<string, number>(balances);

    for (const addressing of addressings) {
      // Ignora endereçamentos sem material (tipagem garante, mas por segurança)
      if (!addressing.material) continue;

      const unit  = String(addressing.material.unit);
      const range = getRange(unit);
      const nMovs = randomInt(4, 12); // 4–12 movimentações por endereçamento
      const nIn   = Math.ceil(nMovs * 0.6);  // ~60% entradas
      const nOut  = nMovs - nIn;             // ~40% saídas

      let currentBalance = finalBalances.get(addressing.id) ?? 0;

      const baseFields = {
        companyId:          company.id,
        addressingId:       addressing.id,
        locationId:         addressing.location.id,
        locationCode:       addressing.location.code,
        locationName:       addressing.location.name,
        subLocationId:      addressing.subLocation.id,
        subLocationCode:    addressing.subLocation.code,
        subLocationName:    addressing.subLocation.name,
        rowId:              addressing.row.id,
        rowCode:            addressing.row.code,
        rowName:            addressing.row.name,
        shelfId:            addressing.shelf.id,
        shelfCode:          addressing.shelf.code,
        shelfName:          addressing.shelf.name,
        positionId:         addressing.position.id,
        positionCode:       addressing.position.code,
        positionName:       addressing.position.name,
        materialId:         addressing.material.id,
        materialCode:       addressing.material.code,
        materialName:       addressing.material.name,
        materialDescription: addressing.material.description ?? '',
        materialUnit:       unit,
      };

      // ── Gera entradas distribuídas ao longo do período ──────────────────
      for (let i = 0; i < nIn; i++) {
        const inQty  = qty(range);
        const inType = randomFrom(inTypes);
        const user   = randomFrom(users);

        movementsToCreate.push({
          ...baseFields,
          movementTypeId:        inType.id,
          movementTypeName:      inType.name,
          movementTypeDirection: MovementDirection.IN,
          userId:                user.id,
          userName:              user.name,
          quantity:              inQty,
          date:                  randomDateBetween(SEED_START, SEED_END),
          observation:           randomFrom(IN_OBSERVATIONS),
        });

        currentBalance += inQty;
      }

      // ── Gera saídas somente quando há saldo suficiente ──────────────────
      let outAttempts = 0;
      let outCreated  = 0;
      while (outCreated < nOut && outAttempts < nOut * 3) {
        outAttempts++;
        const outQty = qty(range);

        if (currentBalance < outQty) continue;

        const outType = randomFrom(outTypes);
        const user    = randomFrom(users);

        movementsToCreate.push({
          ...baseFields,
          movementTypeId:        outType.id,
          movementTypeName:      outType.name,
          movementTypeDirection: MovementDirection.OUT,
          userId:                user.id,
          userName:              user.name,
          quantity:              outQty,
          date:                  randomDateBetween(SEED_START, SEED_END),
          observation:           randomFrom(OUT_OBSERVATIONS),
        });

        currentBalance = parseFloat((currentBalance - outQty).toFixed(2));
        outCreated++;
      }

      finalBalances.set(addressing.id, currentBalance);
    }

    // ── Cria movimentos em lotes de 200 para não sobrecarregar ───────────
    const BATCH = 200;
    let totalCreated = 0;
    for (let i = 0; i < movementsToCreate.length; i += BATCH) {
      await prisma.movement.createMany({
        data: movementsToCreate.slice(i, i + BATCH),
      });
      totalCreated += Math.min(BATCH, movementsToCreate.length - i);
    }

    // ── Atualiza saldos finais nos addressings em lotes ──────────────────
    const UPDATE_BATCH = 50;
    const addrEntries  = [...finalBalances.entries()];
    for (let i = 0; i < addrEntries.length; i += UPDATE_BATCH) {
      const batch = addrEntries.slice(i, i + UPDATE_BATCH);
      await Promise.all(
        batch.map(([addressingId, amount]) =>
          prisma.addressing.update({
            where: { id: addressingId },
            data:  { amount },
          })
        )
      );
    }

    // ── Validação de saldo negativo ──────────────────────────────────────
    const negatives = addrEntries.filter(([, amount]) => amount < 0);
    if (negatives.length > 0) {
      throw new Error(
        `❌ ${negatives.length} saldo(s) negativo(s) detectados na empresa ${company.name}`
      );
    }

    const inCount  = movementsToCreate.filter(
      m => m.movementTypeDirection === MovementDirection.IN
    ).length;
    const outCount = totalCreated - inCount;

    console.log(
      `  ✅ ${totalCreated} movimentações criadas ` +
      `(${inCount} entradas / ${outCount} saídas) ` +
      `para ${addressings.length} endereçamentos`
    );
    console.log(`  ✅ Todos os saldos positivos confirmados`);
  }

  console.log("\n✅ Movimentações finalizadas com sucesso!");
}
