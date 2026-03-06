import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSectionVisibility } from './useSectionVisibility';

describe('useSectionVisibility', () => {
  it('initialisiert alle Sektionen als eingeklappt wenn initiallyExpanded false ist', () => {
    const { result } = renderHook(() =>
      useSectionVisibility(['timing', 'modalities'], false),
    );

    expect(result.current.isSectionExpanded('timing')).toBe(false);
    expect(result.current.isSectionExpanded('modalities')).toBe(false);
  });

  it('setzt Sektions-Sichtbarkeit deterministisch', () => {
    const { result } = renderHook(() =>
      useSectionVisibility(['timing', 'modalities'], false),
    );

    act(() => {
      result.current.setSection('timing', true);
    });

    expect(result.current.isSectionExpanded('timing')).toBe(true);
    expect(result.current.isSectionExpanded('modalities')).toBe(false);

    act(() => {
      result.current.setSection('timing', false);
    });

    expect(result.current.isSectionExpanded('timing')).toBe(false);
  });

  it('behält State stabil wenn Array-Identität sich ändert aber Inhalt gleich bleibt', () => {
    const { result, rerender } = renderHook(
      ({ ids }: { ids: readonly string[] }) => useSectionVisibility(ids, false),
      {
        initialProps: { ids: ['timing', 'modalities'] as const },
      },
    );

    act(() => {
      result.current.setSection('timing', true);
    });

    rerender({ ids: ['timing', 'modalities'] as const });

    expect(result.current.isSectionExpanded('timing')).toBe(true);
    expect(result.current.isSectionExpanded('modalities')).toBe(false);
  });
});
