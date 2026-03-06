import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useId } from 'react';
import type { YesNo } from '../../schema';

interface BinaryChoiceRadioProps {
  label: string;
  value: YesNo | undefined;
  onChange: (value: YesNo) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  optional?: boolean;
}

const BINARY_CHOICE_OPTIONS: ReadonlyArray<{ value: YesNo; label: string }> = [
  { value: 'ja', label: 'Ja' },
  { value: 'nein', label: 'Nein' },
];

export function BinaryChoiceRadio({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  optional = false,
}: BinaryChoiceRadioProps) {
  const fieldsetLabelId = useId();

  return (
    <FormControl component="fieldset" error={!!error} fullWidth>
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
          id={fieldsetLabelId}
          sx={{
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            '&.Mui-focused': { color: 'text.primary' },
          }}
        >
          <span>{label}</span>
          {optional && (
            <Typography component="span" variant="body2" color="text.secondary">
              (optional)
            </Typography>
          )}
        </FormLabel>

        <RadioGroup
          row
          aria-labelledby={fieldsetLabelId}
          value={value ?? ''}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue === 'ja' || nextValue === 'nein') {
              onChange(nextValue);
            }
          }}
          onBlur={onBlur}
          sx={{ flexShrink: 0 }}
        >
          {BINARY_CHOICE_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio size="small" />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </Box>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
