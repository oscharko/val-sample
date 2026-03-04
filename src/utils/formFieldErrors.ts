import type { FieldErrors, FieldValues } from 'react-hook-form';
import { InvestmentFinancingFieldNameSchema, type InvestmentFinancingFieldName } from '../schema';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const countErrorEntries = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
): number => {
  const walk = (node: unknown): number => {
    if (!isRecord(node)) {
      return 0;
    }

    if ('type' in node) {
      return 1;
    }

    return Object.values(node).reduce<number>((sum, value) => sum + walk(value), 0);
  };

  return walk(errors);
};

export function parseServerFieldErrors(
  rawFieldErrors: unknown,
): Partial<Record<InvestmentFinancingFieldName, string>> {
  if (!isRecord(rawFieldErrors) || Array.isArray(rawFieldErrors)) {
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
