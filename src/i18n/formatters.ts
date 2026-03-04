import {
  resolveSupportedLocale,
  type SupportedLocale,
} from './locale';

interface NumberSeparatorSet {
  groupSeparator: string;
  decimalSeparator: string;
}

const numberSeparatorCache = new Map<SupportedLocale, NumberSeparatorSet>();

export const getNumberSeparators = ({
  locale,
}: {
  locale: string;
}): NumberSeparatorSet => {
  const normalizedLocale = resolveSupportedLocale(locale);
  const cached = numberSeparatorCache.get(normalizedLocale);

  if (cached) {
    return cached;
  }

  const parts = new Intl.NumberFormat(normalizedLocale).formatToParts(12345.6);

  const groupSeparator =
    parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimalSeparator =
    parts.find((part) => part.type === 'decimal')?.value ?? '.';

  const separators = {
    groupSeparator,
    decimalSeparator,
  };

  numberSeparatorCache.set(normalizedLocale, separators);

  return separators;
};

export const formatCurrency = ({
  locale,
  value,
  currency = 'EUR',
}: {
  locale: string;
  value: number;
  currency?: string;
}): string => {
  const normalizedLocale = resolveSupportedLocale(locale);

  return new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = ({
  locale,
  value,
  minimumFractionDigits,
  maximumFractionDigits,
}: {
  locale: string;
  value: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  const normalizedLocale = resolveSupportedLocale(locale);

  return new Intl.NumberFormat(normalizedLocale, {
    ...(minimumFractionDigits !== undefined && { minimumFractionDigits }),
    ...(maximumFractionDigits !== undefined && { maximumFractionDigits }),
  }).format(value);
};

export const formatPercent = ({
  locale,
  value,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: {
  locale: string;
  value: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  const normalizedLocale = resolveSupportedLocale(locale);

  return new Intl.NumberFormat(normalizedLocale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

export const formatDate = ({
  locale,
  value,
  options,
}: {
  locale: string;
  value: Date;
  options?: Intl.DateTimeFormatOptions;
}): string => {
  const normalizedLocale = resolveSupportedLocale(locale);

  return new Intl.DateTimeFormat(normalizedLocale, options).format(value);
};
