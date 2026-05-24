import * as fs from 'fs';
import * as path from 'path';

export function loadTemplate(templateName: string): string {
  const compiledTemplatePath = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'public',
    'email-templates',
    `${templateName}.html`,
  );
  if (fs.existsSync(compiledTemplatePath)) {
    return fs.readFileSync(compiledTemplatePath, 'utf8');
  }

  const fallbackTemplatePath = path.resolve(
    process.cwd(),
    'src',
    'public',
    'email-templates',
    `${templateName}.html`,
  );

  if (fs.existsSync(fallbackTemplatePath)) {
    return fs.readFileSync(fallbackTemplatePath, 'utf8');
  }

  throw new Error(
    `Email template not found: ${compiledTemplatePath} or ${fallbackTemplatePath}`,
  );
}

export function formatDatePtBR(date: Date): string {
  const days = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${dayName}, ${day} de ${month} de ${year} às ${hours}:${minutes}`;
}

export function renderTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (html, [key, value]) => html.split(`{{${key}}}`).join(value),
    template,
  );
}
