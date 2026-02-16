import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Enum definitions                                                  */
/* ------------------------------------------------------------------ */

export const TriState = z.enum(['unklar', 'ja', 'nein']);
export type TriState = z.infer<typeof TriState>;

export const BinaryChoice = z.enum(['ja', 'nein']);
export type BinaryChoice = z.infer<typeof BinaryChoice>;

export const FinancingCategory = z.enum([
  'kfz',
  'maschine',
  'it',
  'immobilie',
  'sonstiges',
]);
export type FinancingCategory = z.infer<typeof FinancingCategory>;

export const VatRate = z.enum(['19', '7', '0']);
export type VatRate = z.infer<typeof VatRate>;

export const UsefulLife = z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']);
export type UsefulLife = z.infer<typeof UsefulLife>;

export const OperatingResourceType = z.enum([
  'umlaufvermoegen',
  'anlagevermoegen',
]);
export type OperatingResourceType = z.infer<typeof OperatingResourceType>;

/* ------------------------------------------------------------------ */
/*  Main form schema                                                  */
/* ------------------------------------------------------------------ */

export const InvestmentFinancingSchema = z
  .object({
    // ─── Person ───────────────────────────────────────────────
    person: z.string().min(1, 'Bitte wählen Sie eine Person aus.'),

    // ─── Finanzierungsobjekt ──────────────────────────────────
    financingObjectName: z
      .string()
      .min(1, 'Name des Finanzierungsobjektes ist erforderlich.'),
    financingObjectCategory: FinancingCategory,
    fleetPurchase: TriState,
    expansionInvestment: BinaryChoice,
    grossPrice: z.boolean(),

    // ─── Kosten ───────────────────────────────────────────────
    netPurchasePrice: z
      .number({ message: 'Bitte geben Sie einen gültigen Betrag ein.' })
      .min(0, 'Der Nettokaufpreis darf nicht negativ sein.'),
    additionalCosts: z
      .number({ message: 'Bitte geben Sie einen gültigen Betrag ein.' })
      .min(0, 'Die Nebenkosten dürfen nicht negativ sein.'),

    // ─── Vorsteuer ────────────────────────────────────────────
    vatDeductible: BinaryChoice,
    vatRate: VatRate,

    // ─── Zeitpunkt der Anschaffung ────────────────────────────
    purchaseDate: z
      .string()
      .min(1, 'Bitte geben Sie das Datum der Anschaffung ein.'),
    paymentDate: z
      .string()
      .min(1, 'Bitte geben Sie das Datum der Kaufpreiszahlung ein.'),
    usefulLifeYears: UsefulLife.optional(),

    // ─── Betriebsmittelbedarf ─────────────────────────────────
    operatingResourcesNeeded: TriState,
    operatingResourcesAmount: z
      .number({ message: 'Bitte geben Sie einen gültigen Betrag ein.' })
      .min(0, 'Der Betrag darf nicht negativ sein.')
      .optional(),
    operatingResourcesType: OperatingResourceType.optional(),

    // ─── Nachhaltigkeit ───────────────────────────────────────
    esgCompliant: TriState,
  })
  .refine(
    (data) => {
      if (data.operatingResourcesNeeded === 'ja') {
        return (
          data.operatingResourcesAmount !== undefined &&
          data.operatingResourcesAmount >= 0
        );
      }
      return true;
    },
    {
      message: 'Bitte geben Sie den Betrag des Betriebsmittels ein.',
      path: ['operatingResourcesAmount'],
    },
  )
  .refine(
    (data) => {
      if (data.operatingResourcesNeeded === 'ja') {
        return data.operatingResourcesType !== undefined;
      }
      return true;
    },
    {
      message: 'Bitte wählen Sie die Betriebsmittelart aus.',
      path: ['operatingResourcesType'],
    },
  );

export type InvestmentFinancingFormData = z.infer<typeof InvestmentFinancingSchema>;

/* ------------------------------------------------------------------ */
/*  Backend DTO (matches Spring Boot @RequestBody structure)           */
/* ------------------------------------------------------------------ */

export interface InvestmentFinancingDTO {
  person: string;
  financingObjectName: string;
  financingObjectCategory: string;
  fleetPurchase: string;
  expansionInvestment: string;
  grossPrice: boolean;
  netPurchasePrice: number;
  additionalCosts: number;
  vatDeductible: string;
  vatRate: string;
  purchaseDate: string;
  paymentDate: string;
  usefulLifeYears?: string;
  operatingResourcesNeeded: string;
  operatingResourcesAmount?: number;
  operatingResourcesType?: string;
  esgCompliant: string;
}

/**
 * Convert validated form data to the backend DTO shape.
 */
export function toDTO(data: InvestmentFinancingFormData): InvestmentFinancingDTO {
  return {
    person: data.person,
    financingObjectName: data.financingObjectName,
    financingObjectCategory: data.financingObjectCategory,
    fleetPurchase: data.fleetPurchase,
    expansionInvestment: data.expansionInvestment,
    grossPrice: data.grossPrice,
    netPurchasePrice: data.netPurchasePrice,
    additionalCosts: data.additionalCosts,
    vatDeductible: data.vatDeductible,
    vatRate: data.vatRate,
    purchaseDate: data.purchaseDate,
    paymentDate: data.paymentDate,
    usefulLifeYears: data.usefulLifeYears,
    operatingResourcesNeeded: data.operatingResourcesNeeded,
    operatingResourcesAmount: data.operatingResourcesAmount,
    operatingResourcesType: data.operatingResourcesType,
    esgCompliant: data.esgCompliant,
  };
}
