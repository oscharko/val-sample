import { InvestmentFinancingFieldNameSchema, type InvestmentFinancingFieldName } from '../schema';

export function parseServerFieldErrors(
  rawFieldErrors: unknown,
): Partial<Record<InvestmentFinancingFieldName, string>> {
  if (!rawFieldErrors || typeof rawFieldErrors !== 'object' || Array.isArray(rawFieldErrors)) {
    return {};
  }

  const parsedEntries = Object.entries(rawFieldErrors).flatMap(([fieldName, message]) => {
    if (typeof message !== 'string') {
      return [];
    }

    const parsedFieldName = InvestmentFinancingFieldNameSchema.safeParse(fieldName);

    if (!parsedFieldName.success) {
      return [];
    }

    return [[parsedFieldName.data, message] as const];
  });

  return Object.fromEntries(parsedEntries);
}
