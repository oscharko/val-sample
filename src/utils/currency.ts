/** Kaufmännische Rundung auf 2 Nachkommastellen (Cent-Genauigkeit). */
export const roundToCents = (value: number): number =>
  Math.round(value * 100) / 100;

/** MwSt.-Betrag = Kaufpreis × (Steuersatz / 100), Cent-gerundet. */
export const calculateVatAmount = ({
  purchasePrice,
  vatRate,
}: {
  purchasePrice: number;
  vatRate: number;
}): number => roundToCents(purchasePrice * (vatRate / 100));
