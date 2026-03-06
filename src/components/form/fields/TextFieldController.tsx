import TextField, { type TextFieldProps } from '@mui/material/TextField';
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { useControlledField } from './useControlledField';

interface TextFieldControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<
      TextFieldProps,
      'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'inputRef'
    >,
    Pick<UseControllerProps<TFieldValues, TName>, 'rules' | 'disabled'> {
  name: TName;
  mapFieldValue?: (value: unknown) => TextFieldProps['value'];
}

const toTextFieldValue = (value: unknown): TextFieldProps['value'] => {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return '';
};

export function TextFieldController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  rules,
  disabled,
  helperText,
  error,
  mapFieldValue,
  ...textFieldProps
}: TextFieldControllerProps<TFieldValues, TName>) {
  const { field, fieldState } = useControlledField<TFieldValues, TName>({
    name,
    rules,
    disabled,
  });

  const value = mapFieldValue ? mapFieldValue(field.value) : toTextFieldValue(field.value);

  return (
    <TextField
      {...textFieldProps}
      name={field.name}
      value={value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={error ?? Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
    />
  );
}
