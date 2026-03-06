import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

interface UseControlledFieldOptions<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  rules: UseControllerProps<TFieldValues, TName>['rules'] | undefined;
  disabled: UseControllerProps<TFieldValues, TName>['disabled'] | undefined;
}

export const useControlledField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  rules,
  disabled,
}: UseControlledFieldOptions<TFieldValues, TName>) => {
  const { control } = useFormContext<TFieldValues>();

  return useController<TFieldValues, TName>({
    name,
    control,
    ...(rules !== undefined ? { rules } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
  });
};
