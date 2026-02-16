import { Collapse, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { TriStateRadio } from '../ui/TriStateRadio';
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
              <TextField
                label="Nettokaufpreis"
                type="number"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? 0 : parseFloat(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">€</InputAdornment>
                    ),
                  },
                  htmlInput: { step: '0.01', min: '0' },
                }}
              />
            )}
          />

          <Controller
            name="additionalCosts"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Nebenkosten"
                type="number"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? 0 : parseFloat(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">€</InputAdornment>
                    ),
                  },
                  htmlInput: { step: '0.01', min: '0' },
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
