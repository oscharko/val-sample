/**
 * useSectionVisibility — UI State Hook for Collapsible Form Sections
 */

import { useReducer, useCallback, useMemo, useEffect } from 'react';

export type SectionVisibilityMap = Record<string, boolean>;

type SectionAction =
  | { type: 'TOGGLE'; sectionId: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'SET'; sectionId: string; expanded: boolean }
  | { type: 'REPLACE_ALL'; sections: SectionVisibilityMap };

function buildInitialSectionMap(
  sectionIds: readonly string[],
  initiallyExpanded: boolean,
): SectionVisibilityMap {
  const map: SectionVisibilityMap = {};

  for (const id of sectionIds) {
    map[id] = initiallyExpanded;
  }

  return map;
}

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

    case 'REPLACE_ALL':
      return action.sections;

    default:
      return state;
  }
}

export function useSectionVisibility(
  sectionIds: readonly string[],
  initiallyExpanded = true,
) {
  const [sections, dispatch] = useReducer(
    sectionReducer,
    undefined,
    () => buildInitialSectionMap(sectionIds, initiallyExpanded),
  );

  useEffect(() => {
    dispatch({
      type: 'REPLACE_ALL',
      sections: buildInitialSectionMap(sectionIds, initiallyExpanded),
    });
  }, [sectionIds, initiallyExpanded]);

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

  const isSectionExpanded = useCallback(
    (sectionId: string) => sections[sectionId] ?? initiallyExpanded,
    [sections, initiallyExpanded],
  );

  const expandedCount = useMemo(
    () => Object.values(sections).filter(Boolean).length,
    [sections],
  );

  return {
    sections,
    toggleSection,
    expandAll,
    collapseAll,
    setSection,
    isSectionExpanded,
    expandedCount,
  } as const;
}
