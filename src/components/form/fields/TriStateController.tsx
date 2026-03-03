import {
  useController,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { TriStateRadio } from '../../ui/TriStateRadio';

interface TriStateControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<UseControllerProps<TFieldValues, TName>, 'rules' | 'disabled'> {
  name: TName;
  label: string;
  includeUnklar?: boolean;
}

export function TriStateController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  rules,
  disabled,
  includeUnklar = true,
}: TriStateControllerProps<TFieldValues, TName>) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    name,
    rules,
    disabled,
  });

  return (
    <TriStateRadio
      label={label}
      value={String(field.value ?? '')}
      onChange={field.onChange}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
      includeUnklar={includeUnklar}
    />
  );
}
