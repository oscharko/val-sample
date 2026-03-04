/**
 * useSectionVisibility — UI State Hook for Collapsible Form Sections
 */

import { useReducer, useCallback, useEffect, useMemo, useRef } from 'react';

export type SectionVisibilityMap = Record<string, boolean>;

type SectionAction =
  | { type: 'TOGGLE'; sectionId: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'SET'; sectionId: string; expanded: boolean }
  | { type: 'REPLACE_ALL'; sections: SectionVisibilityMap };

const areSectionMapsEqual = (
  left: SectionVisibilityMap,
  right: SectionVisibilityMap,
): boolean => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
};

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
    case 'TOGGLE': {
      if (!(action.sectionId in state)) {
        return state;
      }

      return { ...state, [action.sectionId]: !state[action.sectionId] };
    }

    case 'EXPAND_ALL': {
      if (Object.values(state).every(Boolean)) {
        return state;
      }

      const expanded: SectionVisibilityMap = {};
      for (const key of Object.keys(state)) {
        expanded[key] = true;
      }
      return expanded;
    }

    case 'COLLAPSE_ALL': {
      if (Object.values(state).every((value) => !value)) {
        return state;
      }

      const collapsed: SectionVisibilityMap = {};
      for (const key of Object.keys(state)) {
        collapsed[key] = false;
      }
      return collapsed;
    }

    case 'SET': {
      if (!(action.sectionId in state) || state[action.sectionId] === action.expanded) {
        return state;
      }

      return { ...state, [action.sectionId]: action.expanded };
    }

    case 'REPLACE_ALL':
      return areSectionMapsEqual(state, action.sections) ? state : action.sections;

    default:
      return state;
  }
}

export function useSectionVisibility(
  sectionIds: readonly string[],
  initiallyExpanded = true,
) {
  const previousIdsRef = useRef(sectionIds);
  const stableSectionIds = useMemo(() => {
    const prev = previousIdsRef.current;
    if (
      prev.length === sectionIds.length &&
      prev.every((id, index) => id === sectionIds[index])
    ) {
      return prev;
    }

    previousIdsRef.current = sectionIds;
    return sectionIds;
  }, [sectionIds]);

  const [sections, dispatch] = useReducer(
    sectionReducer,
    undefined,
    () => buildInitialSectionMap(stableSectionIds, initiallyExpanded),
  );

  useEffect(() => {
    dispatch({
      type: 'REPLACE_ALL',
      sections: buildInitialSectionMap(stableSectionIds, initiallyExpanded),
    });
  }, [initiallyExpanded, stableSectionIds]);

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
