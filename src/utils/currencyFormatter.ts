/**
 * Formata um valor numérico para o formato de moeda brasileira (Real)
 * @param value - O valor numérico a ser formatado
 * @returns String formatada como moeda brasileira (ex: 26,90)
 */
export function formatCurrency(value: any): string {
  // Se o valor não é um número, retorna a string original
  if (value === null || value === undefined || isNaN(value)) {
    return value ?? "";
  }

  // Converte para número se for string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Formata usando Intl.NumberFormat com localidade pt-BR
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Lista de campos que devem ser considerados como campos monetários
 * Adicione aqui nomes de campos que representam valores em reais
 */
export const CURRENCY_FIELDS = [
  "unitValue",
  "price",
  "valor",
  "preco",
  "salario",
  "total",
  "subtotal",
  "amount",
  "valor_unitario",
  "valor_total",
];

/**
 * Verifica se um campo deve ser formatado como moeda
 * @param fieldName - Nome do campo a verificar
 * @returns true se o campo é um campo monetário
 */
export function isCurrencyField(fieldName: string): boolean {
  return CURRENCY_FIELDS.some(
    (field) => field.toLowerCase() === fieldName.toLowerCase()
  );
}

/**
 * Formata um valor se o campo for um campo monetário
 * @param fieldName - Nome do campo
 * @param value - Valor a ser formatado
 * @returns Valor formatado como moeda se for campo monetário, caso contrário retorna o valor original
 */
export function formatIfCurrency(fieldName: string, value: any): string {
  if (isCurrencyField(fieldName)) {
    return formatCurrency(value);
  }
  return value ?? "";
}
