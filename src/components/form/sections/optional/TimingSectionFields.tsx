import { Stack } from '@mui/material';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { CurrencyController } from '../../fields/CurrencyController';
import { TextFieldController } from '../../fields/TextFieldController';

export default function TimingSectionFields() {
  return (
    <Stack spacing={2}>
      <TextFieldController<InvestmentFinancingFormData, 'acquisitionDate'>
        name="acquisitionDate"
        label="Datum der Anschaffung (optional)"
        type="date"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextFieldController<InvestmentFinancingFormData, 'purchasePaymentDate'>
        name="purchasePaymentDate"
        label="Datum der Kaufpreiszahlung (optional)"
        type="date"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <CurrencyController<InvestmentFinancingFormData, 'plannedUsefulLifeMonths'>
        name="plannedUsefulLifeMonths"
        label="Geplante Nutzungsdauer in Monaten (optional)"
        decimalScale={0}
        endAdornmentText=""
      />
    </Stack>
  );
}
