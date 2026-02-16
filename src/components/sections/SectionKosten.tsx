import { Collapse, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { TriStateRadio } from '../ui/TriStateRadio';
import { NumericFormatInput } from '../ui/NumericFormatInput';
import { VAT_RATE_OPTIONS } from '../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../schema';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SectionKosten({ expanded, onToggle }: SectionProps) {
  const { control } = useFormContext<InvestmentFinancingFormData>();

  return (
    <>
      <SectionHeading expanded={expanded} onToggle={onToggle}>
        Kosten
      </SectionHeading>

      <Collapse in={expanded}>
        <Stack spacing={3}>
          <Controller
            name="netPurchasePrice"
            control={control}
            render={({ field, fieldState }) => (
              <NumericFormatInput
                label="Nettokaufpreis"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onFocus={(e) => e.target.select()}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">€</InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          <Controller
            name="additionalCosts"
            control={control}
            render={({ field, fieldState }) => (
              <NumericFormatInput
                label="Nebenkosten"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onFocus={(e) => e.target.select()}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">€</InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          <Controller
            name="vatDeductible"
            control={control}
            render={({ field, fieldState }) => (
              <TriStateRadio
                label="Ist der Kreditnehmer vorsteuerabzugsberechtigt?"
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                includeUnklar={false}
              />
            )}
          />

          <Controller
            name="vatRate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="MwST.-Satz"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {VAT_RATE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>
      </Collapse>
    </>
  );
}
