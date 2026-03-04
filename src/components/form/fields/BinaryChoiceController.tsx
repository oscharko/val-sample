import {
  useController,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { BinaryChoiceRadio } from '../../ui/BinaryChoiceRadio';
import type { YesNo } from '../../../schema';

interface BinaryChoiceControllerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<UseControllerProps<TFieldValues, TName>, 'rules' | 'disabled'> {
  name: TName;
  label: string;
  optional?: boolean;
}

export function BinaryChoiceController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  rules,
  disabled,
  optional = false,
}: BinaryChoiceControllerProps<TFieldValues, TName>) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    name,
    rules,
    disabled,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return (
    <BinaryChoiceRadio
      label={label}
      value={field.value as YesNo | undefined}
      onChange={(nextValue) => field.onChange(nextValue)}
      onBlur={field.onBlur}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message || ''}
      optional={optional}
    />
  );
}
