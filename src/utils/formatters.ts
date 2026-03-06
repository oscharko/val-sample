const DEFAULT_LOCALE = 'de-DE';

interface NumberSeparatorSet {
  groupSeparator: string;
  decimalSeparator: string;
}

let cachedSeparators: NumberSeparatorSet | null = null;

export const getNumberSeparators = (): NumberSeparatorSet => {
  if (cachedSeparators) {
    return cachedSeparators;
  }

  const parts = new Intl.NumberFormat(DEFAULT_LOCALE).formatToParts(12345.6);

  const groupSeparator =
    parts.find((part) => part.type === 'group')?.value ?? '.';
  const decimalSeparator =
    parts.find((part) => part.type === 'decimal')?.value ?? ',';

  cachedSeparators = {
    groupSeparator,
    decimalSeparator,
  };

  return cachedSeparators;
};

export const formatCurrency = ({
  value,
  currency = 'EUR',
}: {
  value: number;
  currency?: string;
}): string => {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = ({
  value,
  minimumFractionDigits,
  maximumFractionDigits,
}: {
  value: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    ...(minimumFractionDigits !== undefined && { minimumFractionDigits }),
    ...(maximumFractionDigits !== undefined && { maximumFractionDigits }),
  }).format(value);
};

export const formatPercent = ({
  value,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: {
  value: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};
