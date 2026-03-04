import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { NumericFormatInput } from '../../ui/NumericFormatInput';

const toOptionalNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined;
};

interface CurrencyControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<UseControllerProps<TFieldValues, TName>, 'rules' | 'disabled'> {
  name: TName;
  label: string;
  required?: boolean;
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
  required,
  decimalScale = 2,
  allowNegative = false,
  endAdornmentText,
}: CurrencyControllerProps<TFieldValues, TName>) {
  const { t } = useTranslation();
  const { control } = useFormContext<TFieldValues>();
  const resolvedEndAdornmentText = endAdornmentText ?? t('common.currencyCode');

  const { field, fieldState } = useController<TFieldValues, TName>({
    name,
    control,
    ...(rules !== undefined && { rules }),
    ...(disabled !== undefined && { disabled }),
  });

  return (
    <NumericFormatInput
      label={label}
      value={toOptionalNumber(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
      onFocus={(event) => event.target.select()}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
      {...(required !== undefined && { required })}
      decimalScale={decimalScale}
      allowNegative={allowNegative}
      slotProps={{
        input: {
          endAdornment: resolvedEndAdornmentText ? (
            <InputAdornment position="end">{resolvedEndAdornmentText}</InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
