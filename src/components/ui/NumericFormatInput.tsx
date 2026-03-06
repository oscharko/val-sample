/**
 * NumericFormatInput — Localized numeric input component.
 * Uses react-number-format with German locale separators.
 */

import { TextField, type TextFieldProps } from '@mui/material';
import {
  NumericFormat,
  type NumberFormatValues,
  type NumericFormatProps,
} from 'react-number-format';
import { getNumberSeparators } from '../../utils/formatters';

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
  const { groupSeparator, decimalSeparator } = getNumberSeparators();

  /**
   * react-number-format's NumericFormatProps is not designed for
   * exactOptionalPropertyTypes — the intersection of TextFieldProps
   * and NumericFormat's own props creates incompatible optional
   * property types. We build the props object with correct runtime
   * values and apply a narrow type assertion (not `any`).
   */
  const numericProps = {
    ...textFieldProps,
    customInput: TextField,
    value: value ?? '',
    onValueChange: (values: NumberFormatValues) => {
      onChange(values.floatValue);
    },
    thousandSeparator: groupSeparator,
    decimalSeparator,
    decimalScale,
    fixedDecimalScale: true,
    allowNegative,
    autoComplete: 'off',
  } satisfies Record<string, unknown>;

  return (
    <NumericFormat<TextFieldProps>
      {...(numericProps as NumericFormatProps<TextFieldProps>)}
    />
  );
}
