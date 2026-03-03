import Chip from '@mui/material/Chip';
import { useFormContext } from 'react-hook-form';
import { useComputedFormValues } from '../../hooks/useComputedFormValues';
import type { InvestmentFinancingFormData } from '../../schema';

export function TotalCostChip() {
  const { control } = useFormContext<InvestmentFinancingFormData>();
  const { formattedTotalCost } = useComputedFormValues(control);

  return (
    <Chip
      label={`Gesamt: ${formattedTotalCost}`}
      size="small"
      color="primary"
      variant="outlined"
      sx={{ ml: 'auto' }}
    />
  );
}
