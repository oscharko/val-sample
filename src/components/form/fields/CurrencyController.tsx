import InputAdornment from '@mui/material/InputAdornment';
import {
  useController,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { NumericFormatInput } from '../../ui/NumericFormatInput';

interface CurrencyControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<UseControllerProps<TFieldValues, TName>, 'rules' | 'disabled'> {
  name: TName;
  label: string;
  decimalScale?: number;
  allowNegative?: boolean;
  endAdornmentText?: string;
}

export function CurrencyController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  rules,
  disabled,
  decimalScale = 2,
  allowNegative = false,
  endAdornmentText = 'EUR',
}: CurrencyControllerProps<TFieldValues, TName>) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    name,
    rules,
    disabled,
  });

  return (
    <NumericFormatInput
      label={label}
      value={field.value as number | undefined}
      onChange={field.onChange}
      onBlur={field.onBlur}
      onFocus={(event) => event.target.select()}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
      decimalScale={decimalScale}
      allowNegative={allowNegative}
      slotProps={{
        input: {
          endAdornment: endAdornmentText ? (
            <InputAdornment position="end">{endAdornmentText}</InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
