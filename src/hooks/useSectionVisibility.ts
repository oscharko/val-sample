/**
 * useSectionVisibility — UI State Hook for Collapsible Form Sections
 *
 * Implements the "local state with custom hook" pattern from Ch. 2:
 * > "If a state conceptually belongs to a single component and is
 * >  encapsulated by the component, it is a local state."
 *
 * Section visibility is purely UI-local — it doesn't need to be
 * global or shared between different form instances. Hence, this
 * uses `useReducer` (Ch. 1 pattern) instead of a module store.
 *
 * The reducer pattern is chosen over useState because the state
 * is an object with multiple pieces (Ch. 1):
 * > "A reducer is helpful for complex states."
 *
 * @example
 * ```tsx
 * const { sections, toggleSection, expandAll } = useSectionVisibility([
 *   'basisdaten', 'kosten', 'zeitpunkt', 'betriebsmittel', 'nachhaltigkeit'
 * ]);
 * ```
 */

import { useReducer, useCallback, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

/** Map of section IDs to their expanded/collapsed state. */
export type SectionVisibilityMap = Record<string, boolean>;

/** Actions for the section visibility reducer. */
type SectionAction =
  | { type: 'TOGGLE'; sectionId: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'SET'; sectionId: string; expanded: boolean };

/* ------------------------------------------------------------------ */
/*  Reducer (defined outside hook — Ch. 1 pattern)                    */
/* ------------------------------------------------------------------ */

/**
 * Pure reducer for section visibility state.
 *
 * Book reference: Ch. 1 — "The benefit of defining a reducer function
 * outside the hook is being able to separate code and testability."
 */
function sectionReducer(
  state: SectionVisibilityMap,
  action: SectionAction,
): SectionVisibilityMap {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.sectionId]: !state[action.sectionId] };

    case 'EXPAND_ALL': {
      const expanded: SectionVisibilityMap = {};
      for (const key of Object.keys(state)) {
        expanded[key] = true;
      }
      return expanded;
    }

    case 'COLLAPSE_ALL': {
      const collapsed: SectionVisibilityMap = {};
      for (const key of Object.keys(state)) {
        collapsed[key] = false;
      }
      return collapsed;
    }

    case 'SET':
      return { ...state, [action.sectionId]: action.expanded };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

/**
 * Custom hook for managing section expand/collapse state.
 *
 * @param sectionIds — Array of section identifiers.
 * @param initiallyExpanded — Whether sections start expanded (default: true).
 */
export function useSectionVisibility(
  sectionIds: readonly string[],
  initiallyExpanded = true,
) {
  // Lazy initialization (Ch. 1 pattern): build initial state map once
  const init = useCallback(
    () => {
      const map: SectionVisibilityMap = {};
      for (const id of sectionIds) {
        map[id] = initiallyExpanded;
      }
      return map;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // intentionally empty — sectionIds are stable configuration
  );

  const [sections, dispatch] = useReducer(sectionReducer, undefined, init);

  // Stable action functions (extracted logic — Ch. 1 pattern)
  const toggleSection = useCallback(
    (sectionId: string) => dispatch({ type: 'TOGGLE', sectionId }),
    [],
  );

  const expandAll = useCallback(() => dispatch({ type: 'EXPAND_ALL' }), []);

  const collapseAll = useCallback(
    () => dispatch({ type: 'COLLAPSE_ALL' }),
    [],
  );

  const setSection = useCallback(
    (sectionId: string, expanded: boolean) =>
      dispatch({ type: 'SET', sectionId, expanded }),
    [],
  );

  /** Check if a specific section is expanded. */
  const isSectionExpanded = useCallback(
    (sectionId: string) => sections[sectionId] ?? initiallyExpanded,
    [sections, initiallyExpanded],
  );

  /** Count of currently expanded sections. */
  const expandedCount = useMemo(
    () => Object.values(sections).filter(Boolean).length,
    [sections],
  );

  return {
    /** Full section visibility map. */
    sections,
    /** Toggle a single section's visibility. */
    toggleSection,
    /** Expand all sections. */
    expandAll,
    /** Collapse all sections. */
    collapseAll,
    /** Explicitly set a section's visibility. */
    setSection,
    /** Check if a specific section is expanded. */
    isSectionExpanded,
    /** Number of currently expanded sections. */
    expandedCount,
  } as const;
}
