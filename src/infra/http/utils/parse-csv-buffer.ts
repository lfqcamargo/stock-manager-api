/**
 * Parses a CSV buffer into an array of record objects.
 * The first row is treated as the header (column names).
 * Values are trimmed but NOT further processed — that's the use-case's job.
 */
export function parseCsvBuffer(buffer: Buffer): Record<string, string>[] {
  const text = buffer.toString('utf-8');

  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = (values[idx] ?? '').trim();
    });
    return record;
  });
}

/**
 * Splits a single CSV line respecting double-quoted fields.
 */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
