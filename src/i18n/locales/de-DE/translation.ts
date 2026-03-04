export const deDETranslation = {
  app: {
    loading: 'Anwendung wird geladen...',
  },
  seo: {
    title: 'Bedarf hinzufügen | Investitionsfinanzierung',
    description:
      'Erfassen Sie Investitionsfinanzierungsbedarfe mit validierten Eingaben und transparenter Berechnung.',
  },
  languageSwitcher: {
    label: 'Sprache',
    ariaLabel: 'Anwendungssprache auswählen',
    options: {
      'de-DE': 'Deutsch',
      'en-US': 'Englisch (USA)',
    },
  },
  common: {
    optional: '(optional)',
    yes: 'Ja',
    no: 'Nein',
    currencyCode: 'EUR',
  },
  form: {
    pageTitle: 'Bedarf hinzufügen',
    contextCard: {
      title: 'Bedarf: Investitionsfinanzierung',
      subtitle: '↳ Für "Fuhrpark"',
    },
    aria: {
      submitLabel: 'Investitionsfinanzierung Bedarf anlegen',
    },
    buttons: {
      cancel: 'Abbrechen',
      submit: 'Bedarf anlegen',
      reload: 'Neu laden',
    },
    sections: {
      assignment: 'Zuordnung des Bedarfs',
      investmentObject: 'Investitionsobjekt',
      financingDemand: 'Ermittlung des Finanzierungsbedarfs',
      optional: {
        timing: 'Zeitliche Planung der Investition',
        modalities: 'Finanzierungsmodalitäten',
        sustainability: 'Nachhaltigkeit',
        insurance: 'Versicherung und Absicherung',
        tax: 'Steuer- und Bilanzoptimierung',
      },
    },
    fields: {
      person: 'Person',
      investmentObjectName: 'Konkrete Bezeichnung des Investitionsobjekts',
      investmentObjectType: 'Art des Investitionsobjekts',
      fleetPurchasePlanned:
        'Ist die Anschaffung im Rahmen eines Fuhrparks angedacht?',
      expansionInvestment: 'Handelt es sich um eine Erweiterungsinvestition?',
      purchasePriceCaptureMode: 'Wie soll der Kaufpreis erfasst werden?',
      purchasePriceLabel: 'Höhe des Kaufpreises ({{mode}})',
      vatRate: 'Anfallender MwSt.-Satz bei Kauf',
      additionalCosts: 'Höhe der Nebenkosten (Brutto) (optional)',
      financingDemandAmount: 'Finanzierungsbedarf des Investitionsobjekts',
      operatingResourcesRequired: 'Sind zusätzliche Betriebsmittel erforderlich?',
      operatingResourcesAmount: 'Höhe der Betriebsmittel',
      separateOperatingResourcesHint:
        'Für die Betriebsmittel wird ein separater Bedarf angelegt.',
      acquisitionDate: 'Datum der Anschaffung (optional)',
      purchasePaymentDate: 'Datum der Kaufpreiszahlung (optional)',
      plannedUsefulLifeMonths: 'Geplante Nutzungsdauer in Monaten (optional)',
      targetDesiredRate: 'Angestrebte Wunschrate (optional)',
      plannedFinancingDurationMonths: 'Geplante Finanzierungsdauer (optional)',
      flexibilityImportant: 'Ist Flexibilität wichtig?',
      desiredSpecialRepaymentPercent: 'Gewünschte Sondertilgung (optional)',
      revolvingCreditPlanned:
        'Ist eine zusätzliche revolvierende Inanspruchnahme geplant?',
      additionalNeedAmount: 'Zusätzlicher Bedarf (optional)',
      sustainabilityCriteriaFulfilled:
        'Könnte das Investitionsobjekt Nachhaltigkeitskriterien erfüllen?',
      investmentObjectInsuranceDesired:
        'Ist eine Versicherung des Investitionsobjekts gewünscht?',
      residualDebtInsuranceDesired: 'Ist eine Restkreditversicherung gewünscht?',
      interestHedgingUseful: 'Ist eine Zinssicherung sinnvoll?',
      taxOptimizedBalanceNeutralDesired:
        'Soll steueroptimiert bzw. bilanziell neutral finanziert werden?',
      internalNote: 'Interner Vermerk (optional)',
      remainingCharacters: 'Verbleibende Zeichen: {{count}}',
    },
    options: {
      selectPlaceholder: 'Bitte auswählen',
      person: {
        meyerTechnologies: 'Meyer Technologies GmbH',
        schmidtMaschinenbau: 'Schmidt Maschinenbau AG',
        weberImmobilien: 'Weber Immobilien GmbH',
      },
      investmentObjectType: {
        kfz: 'KFZ',
        maschine: 'Maschine',
        it: 'IT / Software',
        immobilie: 'Immobilie',
        sonstiges: 'Sonstiges',
      },
      purchasePriceCaptureMode: {
        netto: 'Netto',
        brutto: 'Brutto',
      },
      vatInfo: {
        net: 'Die MwSt. ist nicht Teil des Finanzierungsbedarfs.',
        gross: 'Die MwSt. ist im Finanzierungsbedarf enthalten.',
      },
      operatingResourcesInfo: {
        net:
          'Die Höhe der Betriebsmittel wurde automatisch aus der MwSt. des Kaufpreises ermittelt.',
        gross:
          'Für Bruttokaufpreise werden Betriebsmittel initial mit {{amount}} vorbelegt.',
      },
    },
  },
  submission: {
    successDefault: 'Bedarf erfolgreich angelegt.',
  },
  snackbar: {
    errorDefault: 'Ein Fehler ist aufgetreten.',
  },
  errorBoundary: {
    title: 'Unerwarteter Fehler',
    message: 'Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.',
  },
  validation: {
    personRequired: 'Bitte wählen Sie eine Person aus.',
    investmentObjectNameRequired:
      'Bitte geben Sie die konkrete Bezeichnung des Investitionsobjekts ein.',
    invalidNumber: 'Bitte geben Sie einen gültigen Betrag ein.',
    nonNegativeAmount: 'Der Betrag darf nicht negativ sein.',
    invalidAcquisitionDate: 'Bitte geben Sie ein gültiges Datum der Anschaffung ein.',
    invalidPurchasePaymentDate:
      'Bitte geben Sie ein gültiges Datum der Kaufpreiszahlung ein.',
    purchasePaymentDateBeforeAcquisitionDate:
      'Das Datum der Kaufpreiszahlung darf nicht vor dem Datum der Anschaffung liegen.',
    operatingResourcesAmountRequired:
      'Bitte geben Sie die Höhe der Betriebsmittel ein, wenn diese erforderlich sind.',
    internalNoteTooLong:
      'Der interne Vermerk darf maximal {{maxLength}} Zeichen enthalten.',
  },
  api: {
    errors: {
      invalidServerResponse:
        'Antwortformat des Servers ist ungültig. Bitte Backend-Vertrag prüfen.',
      validation:
        'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.',
      server: 'Serverfehler ({{status}}). Bitte versuchen Sie es später erneut.',
      aborted: 'Anfrage wurde abgebrochen.',
      timeout:
        'Zeitüberschreitung nach {{timeoutMs}} ms. Bitte versuchen Sie es erneut.',
      network:
        'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
    },
  },
} as const;
