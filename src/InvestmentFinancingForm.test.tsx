import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvestmentFinancingForm from './InvestmentFinancingForm';
import {
  failSubmission,
  formStatusStore,
  resetFormStatus,
} from './stores/formStatusStore';

vi.mock('./api', () => ({
  submitInvestmentFinancing: vi.fn(async () => ({
    success: true,
    data: {
      id: '1',
      message: 'ok',
    },
  })),
}));

describe('InvestmentFinancingForm V2', () => {
  beforeEach(() => {
    resetFormStatus();
  });

  it('clears stale global submission state on mount', () => {
    failSubmission('stale');

    render(<InvestmentFinancingForm />);

    expect(formStatusStore.getState().submissionState).toBe('idle');
    expect(formStatusStore.getState().lastError).toBeNull();
  });

  it('shows fleet question only when investment object type is KFZ', async () => {
    const user = userEvent.setup();
    const { container } = render(<InvestmentFinancingForm />);
    const scoped = within(container);

    const selectInvestmentObjectType = async (label: string): Promise<void> => {
      const trigger = scoped.getAllByLabelText(/art des investitionsobjekts/i)[0];
      await user.click(trigger);
      const listbox = await screen.findByRole('listbox');
      await user.click(within(listbox).getByRole('option', { name: label }));
    };

    expect(
      scoped.queryByText(/im rahmen eines fuhrparks angedacht/i),
    ).not.toBeInTheDocument();

    await selectInvestmentObjectType('KFZ');

    expect(
      await scoped.findByText(/im rahmen eines fuhrparks angedacht/i),
    ).toBeInTheDocument();

    await selectInvestmentObjectType('Maschine');

    await waitFor(() => {
      expect(
        scoped.queryByText(/im rahmen eines fuhrparks angedacht/i),
      ).not.toBeInTheDocument();
    });
  });

  it('prefills operating resources with VAT share in netto mode and with 0 in brutto mode', async () => {
    const user = userEvent.setup();

    const { container } = render(<InvestmentFinancingForm />);
    const scoped = within(container);

    const purchasePriceInput = scoped.getAllByLabelText(
      /höhe des kaufpreises \(netto\)/i,
    )[0];
    await user.click(purchasePriceInput);
    await user.type(purchasePriceInput, '{selectall}{backspace}45000');

    const yesRadios = scoped.getAllByRole('radio', { name: /^ja$/i });
    await user.click(yesRadios[1]);

    const operatingResourcesInput = await scoped.findByLabelText(
      /höhe der betriebsmittel/i,
    );

    await waitFor(() => {
      expect(operatingResourcesInput).toHaveValue('8.550,00');
    });

    await user.click(scoped.getByRole('radio', { name: /brutto/i }));

    await waitFor(() => {
      expect(operatingResourcesInput).toHaveValue('0,00');
    });
  });

  it('lazy-mounts optional accordion content only after expansion', async () => {
    const user = userEvent.setup();
    const { container } = render(<InvestmentFinancingForm />);
    const scoped = within(container);

    expect(scoped.queryByLabelText(/datum der anschaffung/i)).not.toBeInTheDocument();

    await user.click(
      scoped.getByRole('button', { name: /zeitliche planung der investition/i }),
    );

    expect(await scoped.findByLabelText(/datum der anschaffung/i)).toBeInTheDocument();
  });
});
