/**
 * NumericFormatInput — Localized numeric input component.
 * Uses react-number-format for German decimal/thousands separators
 * and restricts decimals to 2 places.
 */

import { TextField, type TextFieldProps } from '@mui/material';
import {
  NumericFormat,
  type NumberFormatValues,
} from 'react-number-format';

interface NumericFormatInputProps
  extends Omit<TextFieldProps, 'onChange' | 'value' | 'type' | 'defaultValue'> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  decimalScale?: number;
  allowNegative?: boolean;
}

export function NumericFormatInput({
  value,
  onChange,
  decimalScale = 2,
  allowNegative = false,
  ...textFieldProps
}: NumericFormatInputProps) {
  const numericProps = {
    ...textFieldProps,
    customInput: TextField,
    value: value ?? '',
    onValueChange: (values: NumberFormatValues) => {
      onChange(values.floatValue);
    },
    thousandSeparator: '.',
    decimalSeparator: ',',
    decimalScale,
    fixedDecimalScale: true,
    allowNegative,
    autoComplete: 'off',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <NumericFormat<TextFieldProps> {...(numericProps as any)} />;
}
