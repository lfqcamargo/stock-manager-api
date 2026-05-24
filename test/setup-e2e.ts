import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@generated/prisma/client';
import { config } from 'dotenv';
import { afterAll, beforeAll, beforeEach } from 'vitest';

import { DomainEvents } from '@/core/events/domain-events';
import { createPrismaPgAdapter } from '@/infra/database/prisma/create-prisma-pg';
import { envSchema } from '@/infra/env/env';

config({ path: '.env', override: true });

const env = envSchema.parse(process.env);

let prisma: PrismaClient;

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable');
  }

  const url = new URL(env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);
  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId);
  process.env.DATABASE_URL = databaseURL;

  const adapter = createPrismaPgAdapter(databaseURL);

  prisma = new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  });

  await prisma.$connect();

  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`);

  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: databaseURL,
    },
  });

  console.log(`📦 Test Database: ${databaseURL}`);
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});

beforeEach(async () => {
  DomainEvents.shouldRun = false;

  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$executeRawUnsafe(`CREATE SCHEMA "${schemaId}"`);

  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
});

export { prisma };
