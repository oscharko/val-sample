import TextField, { type TextFieldProps } from '@mui/material/TextField';
import {
  useController,
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
  const { field, fieldState } = useController<TFieldValues, TName>({
    name,
    rules,
    disabled,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const value = mapValue
    ? mapValue(field.value)
    : (field.value as TextFieldProps['value']);

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
