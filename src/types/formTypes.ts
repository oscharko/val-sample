/**
 * formTypes.ts — Shared types for the Investment Financing Form.
 */

// type import removed

/**
 * State type for React 19's useActionState.
 * Replaces the previous useTransition + manual state pattern.
 */
export type SubmissionActionState = {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
};
