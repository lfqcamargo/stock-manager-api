import z from 'zod';

/**
 * Transforma query string "true"/"false" em boolean corretamente.
 * z.coerce.boolean() usa Boolean("false") que retorna true para qualquer string não-vazia.
 */
export const zodBooleanQuery = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  })
  .optional();
