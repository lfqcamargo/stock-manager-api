import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Builds a Prisma Postgres adapter that respects the `schema` query parameter on
 * `DATABASE_URL`. The driver adapter does not infer schema from the URL alone.
 */
export function createPrismaPgAdapter(connectionString: string): PrismaPg {
  const url = new URL(connectionString);
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  return new PrismaPg(url.toString(), { schema });
}
