import { z } from 'zod';

const VALIDATION_MESSAGES = {
  personRequired: 'Bitte wählen Sie eine Person aus.',
  financingObjectNameRequired: 'Name des Finanzierungsobjektes ist erforderlich.',
  invalidNumber: 'Bitte geben Sie einen gültigen Betrag ein.',
  nonNegativeNetPurchasePrice: 'Der Nettokaufpreis darf nicht negativ sein.',
  nonNegativeAdditionalCosts: 'Die Nebenkosten dürfen nicht negativ sein.',
  purchaseDateInvalid: 'Bitte geben Sie ein gültiges Datum der Anschaffung ein.',
  paymentDateInvalid: 'Bitte geben Sie ein gültiges Datum der Kaufpreiszahlung ein.',
  paymentDateBeforePurchaseDate:
    'Das Datum der Kaufpreiszahlung darf nicht vor dem Datum der Anschaffung liegen.',
  nonNegativeOperatingResources: 'Der Betrag darf nicht negativ sein.',
  operatingResourcesAmountRequired: 'Bitte geben Sie den Betrag des Betriebsmittels ein.',
  operatingResourcesTypeRequired: 'Bitte wählen Sie die Betriebsmittelart aus.',
} as const;

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

export const UsefulLife = z.enum([
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
]);
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
    person: z.string().min(1, VALIDATION_MESSAGES.personRequired),

    financingObjectName: z
      .string()
      .min(1, VALIDATION_MESSAGES.financingObjectNameRequired),
    financingObjectCategory: FinancingCategory,
    fleetPurchase: TriState,
    expansionInvestment: BinaryChoice,
    grossPrice: z.boolean(),

    netPurchasePrice: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeNetPurchasePrice)
      .optional(),
    additionalCosts: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAdditionalCosts)
      .optional(),

    vatDeductible: BinaryChoice,
    vatRate: VatRate,

    purchaseDate: z.iso.date(VALIDATION_MESSAGES.purchaseDateInvalid),
    paymentDate: z.iso.date(VALIDATION_MESSAGES.paymentDateInvalid),
    usefulLifeYears: UsefulLife.optional(),

    operatingResourcesNeeded: TriState,
    operatingResourcesAmount: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeOperatingResources)
      .optional(),
    operatingResourcesType: OperatingResourceType.optional(),

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
      message: VALIDATION_MESSAGES.operatingResourcesAmountRequired,
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
      message: VALIDATION_MESSAGES.operatingResourcesTypeRequired,
      path: ['operatingResourcesType'],
    },
  )
  .refine(
    (data) => data.paymentDate >= data.purchaseDate,
    {
      message: VALIDATION_MESSAGES.paymentDateBeforePurchaseDate,
      path: ['paymentDate'],
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
    netPurchasePrice: data.netPurchasePrice ?? 0,
    additionalCosts: data.additionalCosts ?? 0,
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
