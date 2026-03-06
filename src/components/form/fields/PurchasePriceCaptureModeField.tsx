import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useId } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { PURCHASE_PRICE_CAPTURE_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import {
  PURCHASE_PRICE_CAPTURE_MODE_LABELS,
} from '../../../domain/purchasePriceCaptureModeContent';

export function PurchasePriceCaptureModeField() {
  const { control } = useFormContext<InvestmentFinancingFormData>();
  const purchasePriceCaptureModeLabelId = useId();
  const { field } = useController<InvestmentFinancingFormData, 'purchasePriceCaptureMode'>({
    name: 'purchasePriceCaptureMode',
    control,
  });

  return (
    <FormControl component="fieldset" fullWidth>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          py: 1,
        }}
      >
        <FormLabel
          component="legend"
          id={purchasePriceCaptureModeLabelId}
          sx={{
            color: 'text.primary',
            '&.Mui-focused': { color: 'text.primary' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <span>Wie soll der Kaufpreis erfasst werden?</span>
          <InfoOutlinedIcon fontSize="small" color="disabled" />
        </FormLabel>

        <RadioGroup
          row
          aria-labelledby={purchasePriceCaptureModeLabelId}
          value={field.value}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue === 'netto' || nextValue === 'brutto') {
              field.onChange(nextValue);
            }
          }}
          sx={{ flexShrink: 0 }}
        >
          {PURCHASE_PRICE_CAPTURE_OPTIONS.map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio size="small" />}
              label={PURCHASE_PRICE_CAPTURE_MODE_LABELS[option]}
            />
          ))}
        </RadioGroup>
      </Box>
    </FormControl>
  );
}
