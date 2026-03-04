import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenComponent(): never {
  throw new Error('boom');
}

describe('AppErrorBoundary', () => {
  it('renders fallback UI when a descendant throws', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Unerwarteter Fehler')).toBeInTheDocument();
    expect(
      screen.getByText('Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Neu laden' })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
