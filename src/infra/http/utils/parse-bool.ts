/**
 * Converts a string value from a CSV field into a boolean.
 * Accepted truthy values (case-insensitive): 'true', '1', 'yes', 'sim', 'ativo', 'active'.
 * Returns `defaultValue` when the string is empty or undefined.
 */
export function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value?.trim()) return defaultValue;
  return ['true', '1', 'yes', 'sim', 'ativo', 'active'].includes(
    value.trim().toLowerCase(),
  );
}
