import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSectionVisibility } from './useSectionVisibility';

describe('useSectionVisibility', () => {
  it('initializes all sections as collapsed when initiallyExpanded is false', () => {
    const { result } = renderHook(() =>
      useSectionVisibility(['timing', 'modalities'], false),
    );

    expect(result.current.isSectionExpanded('timing')).toBe(false);
    expect(result.current.isSectionExpanded('modalities')).toBe(false);
    expect(result.current.expandedCount).toBe(0);
  });

  it('toggles and sets section visibility deterministically', () => {
    const { result } = renderHook(() =>
      useSectionVisibility(['timing', 'modalities'], false),
    );

    act(() => {
      result.current.toggleSection('timing');
    });

    expect(result.current.isSectionExpanded('timing')).toBe(true);
    expect(result.current.expandedCount).toBe(1);

    act(() => {
      result.current.setSection('timing', false);
      result.current.expandAll();
    });

    expect(result.current.isSectionExpanded('timing')).toBe(true);
    expect(result.current.isSectionExpanded('modalities')).toBe(true);
    expect(result.current.expandedCount).toBe(2);

    act(() => {
      result.current.collapseAll();
    });

    expect(result.current.expandedCount).toBe(0);
  });

  it('keeps state stable when section ids array identity changes but content is unchanged', () => {
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
