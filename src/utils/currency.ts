export const roundToCents = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const calculateVatAmount = ({
  purchasePrice,
  vatRate,
}: {
  purchasePrice: number;
  vatRate: number;
}): number => {
  return roundToCents(purchasePrice * (vatRate / 100));
};
