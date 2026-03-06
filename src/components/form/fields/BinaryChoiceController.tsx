import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { BinaryChoiceRadio } from '../../ui/BinaryChoiceRadio';
import type { YesNo } from '../../../schema';
import { useControlledField } from './useControlledField';

const isYesNo = (value: unknown): value is YesNo => {
  return value === 'ja' || value === 'nein';
};

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
  const { field, fieldState } = useControlledField<TFieldValues, TName>({
    name,
    rules,
    disabled,
  });

  return (
    <BinaryChoiceRadio
      label={label}
      value={isYesNo(field.value) ? field.value : undefined}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message || ''}
      optional={optional}
    />
  );
}
