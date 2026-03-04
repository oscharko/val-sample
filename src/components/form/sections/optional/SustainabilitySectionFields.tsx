import { Stack } from '@mui/material';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';

export default function SustainabilitySectionFields() {
  return (
    <Stack spacing={2}>
      <BinaryChoiceController<InvestmentFinancingFormData, 'sustainabilityCriteriaFulfilled'>
        name="sustainabilityCriteriaFulfilled"
        label="Könnte das Investitionsobjekt Nachhaltigkeitskriterien erfüllen?"
        optional
      />
    </Stack>
  );
}
