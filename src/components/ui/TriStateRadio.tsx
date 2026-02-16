/**
 * TriStateRadio — Reusable radio group for Yes/No/Unclear options.
 */

import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

interface TriStateRadioProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  includeUnklar?: boolean;
}

export function TriStateRadio({
  label,
  value,
  onChange,
  error,
  helperText,
  includeUnklar = true,
}: TriStateRadioProps) {
  return (
    <FormControl error={error} fullWidth>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 0,
        }}
      >
        <FormLabel
          sx={{
            flex: 1,
            color: 'text.primary',
            '&.Mui-focused': { color: 'text.primary' },
          }}
        >
          {label}
        </FormLabel>
        <RadioGroup
          row
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ flexShrink: 0 }}
        >
          {includeUnklar && (
            <FormControlLabel
              value="unklar"
              control={<Radio size="small" />}
              label="Noch unklar"
            />
          )}
          <FormControlLabel
            value="ja"
            control={<Radio size="small" />}
            label="Ja"
          />
          <FormControlLabel
            value="nein"
            control={<Radio size="small" />}
            label="Nein"
          />
        </RadioGroup>
      </Box>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
