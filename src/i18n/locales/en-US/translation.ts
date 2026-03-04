export const enUSTranslation = {
  app: {
    loading: 'Loading application...',
  },
  seo: {
    title: 'Add Requirement | Investment Financing',
    description:
      'Capture investment financing requirements with validated inputs and transparent calculations.',
  },
  languageSwitcher: {
    label: 'Language',
    ariaLabel: 'Select application language',
    options: {
      'de-DE': 'German (Germany)',
      'en-US': 'English (United States)',
    },
  },
  common: {
    optional: '(optional)',
    yes: 'Yes',
    no: 'No',
    currencyCode: 'EUR',
  },
  form: {
    pageTitle: 'Add Requirement',
    contextCard: {
      title: 'Requirement: Investment Financing',
      subtitle: '↳ For "Fleet"',
    },
    aria: {
      submitLabel: 'Create investment financing requirement',
    },
    buttons: {
      cancel: 'Cancel',
      submit: 'Create Requirement',
      reload: 'Reload',
    },
    sections: {
      assignment: 'Requirement Assignment',
      investmentObject: 'Investment Object',
      financingDemand: 'Financing Requirement Calculation',
      optional: {
        timing: 'Investment Timeline',
        modalities: 'Financing Terms',
        sustainability: 'Sustainability',
        insurance: 'Insurance and Hedging',
        tax: 'Tax and Balance-Sheet Optimization',
      },
    },
    fields: {
      person: 'Person',
      investmentObjectName: 'Specific name of the investment object',
      investmentObjectType: 'Investment object type',
      fleetPurchasePlanned: 'Is the acquisition planned as part of a fleet?',
      expansionInvestment: 'Is this an expansion investment?',
      purchasePriceCaptureMode: 'How should the purchase price be captured?',
      purchasePriceLabel: 'Purchase price amount ({{mode}})',
      vatRate: 'Applicable VAT rate for purchase',
      additionalCosts: 'Additional costs amount (gross) (optional)',
      financingDemandAmount: 'Financing requirement of the investment object',
      operatingResourcesRequired: 'Are additional operating resources required?',
      operatingResourcesAmount: 'Operating resources amount',
      separateOperatingResourcesHint:
        'A separate requirement will be created for operating resources.',
      acquisitionDate: 'Acquisition date (optional)',
      purchasePaymentDate: 'Purchase payment date (optional)',
      plannedUsefulLifeMonths: 'Planned useful life in months (optional)',
      targetDesiredRate: 'Target desired installment (optional)',
      plannedFinancingDurationMonths: 'Planned financing duration (optional)',
      flexibilityImportant: 'Is flexibility important?',
      desiredSpecialRepaymentPercent: 'Desired special repayment (optional)',
      revolvingCreditPlanned: 'Is additional revolving utilization planned?',
      additionalNeedAmount: 'Additional requirement (optional)',
      sustainabilityCriteriaFulfilled:
        'Could the investment object meet sustainability criteria?',
      investmentObjectInsuranceDesired:
        'Is insurance for the investment object desired?',
      residualDebtInsuranceDesired: 'Is residual debt insurance desired?',
      interestHedgingUseful: 'Is interest-rate hedging useful?',
      taxOptimizedBalanceNeutralDesired:
        'Should financing be tax-optimized or balance-sheet neutral?',
      internalNote: 'Internal note (optional)',
      remainingCharacters: 'Remaining characters: {{count}}',
    },
    options: {
      selectPlaceholder: 'Please select',
      person: {
        meyerTechnologies: 'Meyer Technologies GmbH',
        schmidtMaschinenbau: 'Schmidt Maschinenbau AG',
        weberImmobilien: 'Weber Immobilien GmbH',
      },
      investmentObjectType: {
        kfz: 'Vehicle',
        maschine: 'Machine',
        it: 'IT / Software',
        immobilie: 'Real estate',
        sonstiges: 'Other',
      },
      purchasePriceCaptureMode: {
        netto: 'Net',
        brutto: 'Gross',
      },
      vatInfo: {
        net: 'VAT is not part of the financing requirement.',
        gross: 'VAT is included in the financing requirement.',
      },
      operatingResourcesInfo: {
        net:
          'The operating resources amount was calculated automatically from the purchase price VAT.',
        gross:
          'For gross purchase prices, operating resources are initially prefilled with {{amount}}.',
      },
    },
  },
  submission: {
    successDefault: 'Requirement created successfully.',
  },
  snackbar: {
    errorDefault: 'An error occurred.',
  },
  errorBoundary: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
  },
  validation: {
    personRequired: 'Please select a person.',
    investmentObjectNameRequired:
      'Please enter the specific name of the investment object.',
    invalidNumber: 'Please enter a valid amount.',
    nonNegativeAmount: 'The amount cannot be negative.',
    invalidAcquisitionDate: 'Please enter a valid acquisition date.',
    invalidPurchasePaymentDate: 'Please enter a valid purchase payment date.',
    purchasePaymentDateBeforeAcquisitionDate:
      'The purchase payment date cannot be before the acquisition date.',
    operatingResourcesAmountRequired:
      'Please enter the operating resources amount when required.',
    internalNoteTooLong:
      'The internal note can contain at most {{maxLength}} characters.',
  },
  api: {
    errors: {
      invalidServerResponse:
        'The server response format is invalid. Please verify the backend contract.',
      validation: 'Validation error from server. Please review your input.',
      server: 'Server error ({{status}}). Please try again later.',
      aborted: 'Request was canceled.',
      timeout: 'Request timed out after {{timeoutMs}} ms. Please try again.',
      network:
        'Network error. Please check your internet connection and try again.',
    },
  },
} as const;
