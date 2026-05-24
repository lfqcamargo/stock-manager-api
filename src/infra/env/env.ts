import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number(),

  APP_URL: z.url().optional().default('http://localhost:5173'),
  API_URL: z.url().optional().default('http://localhost:3333'),

  DATABASE_URL: z.string(),

  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),

  JWT_ACCESS_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  MAIL_HOST: z.string().optional().default('smtp.ethereal.email'),
  MAIL_PORT: z.coerce.number().optional().default(587),
  MAIL_SECURE: z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional().default('noreply@stockmanager.app'),
});

export type Env = z.infer<typeof envSchema>;
