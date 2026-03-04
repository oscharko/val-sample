import TextField, { type TextFieldProps } from '@mui/material/TextField';
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

interface TextFieldControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<
      TextFieldProps,
      'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'inputRef'
    >,
    Pick<UseControllerProps<TFieldValues, TName>, 'rules' | 'disabled'> {
  name: TName;
  mapValue?: (value: unknown) => TextFieldProps['value'];
}

const normalizeTextFieldValue = (value: unknown): TextFieldProps['value'] => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
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
  mapValue,
  ...textFieldProps
}: TextFieldControllerProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController<TFieldValues, TName>({
    name,
    control,
    ...(rules !== undefined && { rules }),
    ...(disabled !== undefined && { disabled }),
  });

  const value = mapValue ? mapValue(field.value) : normalizeTextFieldValue(field.value);

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
