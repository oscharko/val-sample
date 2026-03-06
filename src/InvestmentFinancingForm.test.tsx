import {
  getByRole,
  getQueriesForElement,
  queries,
  type BoundFunctions,
} from '@testing-library/dom';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvestmentFinancingForm from './InvestmentFinancingForm';
import { submitInvestmentFinancing } from './api';

vi.mock('./api', () => ({
  submitInvestmentFinancing: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        id: '1',
        message: 'ok',
      },
    }),
  ),
  CLIENT_ABORTED_ERROR_CODE: 'CLIENT_ABORTED',
}));

type ScopedQueries = BoundFunctions<typeof queries>;

const getVisibleInputByLabel = (
  scoped: ScopedQueries,
  label: RegExp,
): HTMLInputElement => {
  const textbox = scoped
    .queryAllByRole('textbox', { name: label })
    .find((element): element is HTMLInputElement => element instanceof HTMLInputElement);

  if (textbox) {
    return textbox;
  }

  const labeledInputs = scoped
    .getAllByLabelText(label)
    .filter((element): element is HTMLInputElement => {
      return element instanceof HTMLInputElement && element.type !== 'hidden';
    });

  const firstInput = labeledInputs[0];
  if (!firstInput) {
    throw new Error(`No visible input found for label: ${label.source}`);
  }

  return firstInput;
};

const getSelectTriggerByLabel = (
  scoped: ScopedQueries,
  label: RegExp,
): HTMLElement => {
  const combobox = scoped.queryAllByRole('combobox', { name: label })[0];
  if (combobox) {
    return combobox;
  }

  const labeledControls = scoped.getAllByLabelText(label);
  const visibleControl = labeledControls.find((element) => {
    return !(element instanceof HTMLInputElement) || element.type !== 'hidden';
  });

  if (!visibleControl) {
    throw new Error(`No select trigger found for label: ${label.source}`);
  }

  return visibleControl;
};

const getFirstButtonByName = (
  scoped: ScopedQueries,
  name: RegExp,
): HTMLButtonElement => {
  const button = scoped.getAllByRole('button', { name })[0];
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`No button found for name: ${name.source}`);
  }

  return button;
};

const selectMuiOption = async ({
  scoped,
  user,
  selectLabel,
  optionLabel,
}: {
  scoped: ScopedQueries;
  user: ReturnType<typeof userEvent.setup>;
  selectLabel: RegExp;
  optionLabel: string;
}) => {
  await user.click(getSelectTriggerByLabel(scoped, selectLabel));
  const listbox = await screen.findByRole('listbox');
  await user.click(getByRole(listbox, 'option', { name: optionLabel }));
};

const chooseRadioOption = async ({
  scoped,
  user,
  groupLabel,
  optionLabel,
}: {
  scoped: ScopedQueries;
  user: ReturnType<typeof userEvent.setup>;
  groupLabel: RegExp;
  optionLabel: RegExp;
}) => {
  const group = scoped.getAllByRole('radiogroup', { name: groupLabel })[0];
  if (!group) {
    throw new Error(`No radio group found for label: ${groupLabel.source}`);
  }

  await user.click(getByRole(group, 'radio', { name: optionLabel }));
};

const fillRequiredFormFields = async ({
  scoped,
  user,
}: {
  scoped: ScopedQueries;
  user: ReturnType<typeof userEvent.setup>;
}): Promise<void> => {
  await selectMuiOption({
    scoped,
    user,
    selectLabel: /^person/i,
    optionLabel: 'Meyer Technologies GmbH',
  });

  await user.type(
    getVisibleInputByLabel(scoped, /konkrete bezeichnung des investitionsobjekts/i),
    'Volkswagen ID.3',
  );

  await selectMuiOption({
    scoped,
    user,
    selectLabel: /art des investitionsobjekts/i,
    optionLabel: 'KFZ',
  });

  const purchasePriceInput = getVisibleInputByLabel(scoped, /höhe des kaufpreises \(netto\)/i);
  await user.click(purchasePriceInput);
  await user.type(purchasePriceInput, '{selectall}{backspace}45000');
};

const fillRequiredFormFieldsWithoutPerson = async ({
  scoped,
  user,
}: {
  scoped: ScopedQueries;
  user: ReturnType<typeof userEvent.setup>;
}): Promise<void> => {
  await user.type(
    getVisibleInputByLabel(scoped, /konkrete bezeichnung des investitionsobjekts/i),
    'Volkswagen ID.3',
  );

  await selectMuiOption({
    scoped,
    user,
    selectLabel: /art des investitionsobjekts/i,
    optionLabel: 'KFZ',
  });

  const purchasePriceInput = getVisibleInputByLabel(scoped, /höhe des kaufpreises \(netto\)/i);
  await user.click(purchasePriceInput);
  await user.type(purchasePriceInput, '{selectall}{backspace}45000');
};

describe('InvestmentFinancingForm V2', () => {
  const mockedSubmitInvestmentFinancing = vi.mocked(submitInvestmentFinancing);

  beforeEach(() => {
    mockedSubmitInvestmentFinancing.mockResolvedValue({
      success: true,
      data: {
        id: '1',
        message: 'ok',
      },
    });
  });

  it('requires selecting a person before submit', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    await fillRequiredFormFieldsWithoutPerson({ scoped, user });

    await user.click(getFirstButtonByName(scoped, /bedarf anlegen/i));

    expect(await scoped.findByText(/bitte wählen sie eine person aus/i)).toBeInTheDocument();
    expect(mockedSubmitInvestmentFinancing).not.toHaveBeenCalled();
  });

  it('renders german validation messages on submit', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    await user.click(getFirstButtonByName(scoped, /bedarf anlegen/i));

    expect(
      await scoped.findByText(
        /bitte geben sie die konkrete bezeichnung des investitionsobjekts ein/i,
      ),
    ).toBeInTheDocument();
    expect(
      await scoped.findByText(/bitte wählen sie die art des investitionsobjekts aus/i),
    ).toBeInTheDocument();
  });

  it('shows fleet question only when investment object type is KFZ', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    expect(scoped.queryByText(/im rahmen eines fuhrparks angedacht/i)).not.toBeInTheDocument();

    await selectMuiOption({
      scoped,
      user,
      selectLabel: /art des investitionsobjekts/i,
      optionLabel: 'KFZ',
    });

    expect(await scoped.findByText(/im rahmen eines fuhrparks angedacht/i)).toBeInTheDocument();

    await selectMuiOption({
      scoped,
      user,
      selectLabel: /art des investitionsobjekts/i,
      optionLabel: 'Maschine',
    });

    await waitFor(() => {
      expect(scoped.queryByText(/im rahmen eines fuhrparks angedacht/i)).not.toBeInTheDocument();
    });
  });

  it('prefills operating resources with VAT share in netto mode and with 0 in brutto mode', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    const purchasePriceInput = getVisibleInputByLabel(scoped, /höhe des kaufpreises \(netto\)/i);
    await user.click(purchasePriceInput);
    await user.type(purchasePriceInput, '{selectall}{backspace}45000');

    await chooseRadioOption({
      scoped,
      user,
      groupLabel: /sind zusätzliche betriebsmittel erforderlich/i,
      optionLabel: /^ja$/i,
    });

    const operatingResourcesInput = getVisibleInputByLabel(scoped, /höhe der betriebsmittel/i);

    await waitFor(() => {
      expect(operatingResourcesInput).toHaveValue('8.550,00');
    });

    await chooseRadioOption({
      scoped,
      user,
      groupLabel: /wie soll der kaufpreis erfasst werden/i,
      optionLabel: /brutto/i,
    });

    await waitFor(() => {
      expect(operatingResourcesInput).toHaveValue('0,00');
    });
  });

  it('lazy-mounts optional accordion content only after expansion', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    expect(scoped.queryByLabelText(/datum der anschaffung/i)).not.toBeInTheDocument();

    await user.click(getFirstButtonByName(scoped, /zeitliche planung der investition/i));

    expect(await scoped.findByLabelText(/datum der anschaffung/i)).toBeInTheDocument();
  });

  it('supports keyboard interaction for accordion expansion and radio-group changes', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    const timingAccordionTrigger = getFirstButtonByName(
      scoped,
      /zeitliche planung der investition/i,
    );
    timingAccordionTrigger.focus();
    await user.keyboard('{Enter}');

    expect(await scoped.findByLabelText(/datum der anschaffung/i)).toBeInTheDocument();

    const nettoRadio = scoped.getByRole('radio', { name: /netto/i });
    const bruttoRadio = scoped.getByRole('radio', { name: /brutto/i });

    nettoRadio.focus();
    await user.keyboard('{ArrowRight}');

    expect(bruttoRadio).toBeChecked();
  });

  it('resets user input and clears submission feedback when cancel is clicked', async () => {
    mockedSubmitInvestmentFinancing.mockResolvedValueOnce({
      success: false,
      error: {
        status: 500,
        message: 'Server error',
      },
    });

    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    await fillRequiredFormFields({ scoped, user });
    await user.click(getFirstButtonByName(scoped, /bedarf anlegen/i));

    expect(await scoped.findByText('Server error')).toBeInTheDocument();

    const objectNameInput = getVisibleInputByLabel(scoped, /konkrete bezeichnung des investitionsobjekts/i);
    expect(objectNameInput).toHaveValue('Volkswagen ID.3');

    await user.click(getFirstButtonByName(scoped, /abbrechen/i));

    await waitFor(() => {
      expect(objectNameInput).toHaveValue('');
      expect(scoped.queryByText('Server error')).not.toBeInTheDocument();
    });
  });

  it('resets editable fields after a successful submission', async () => {
    const user = userEvent.setup();
    const view = render(<InvestmentFinancingForm />);
    const scoped = getQueriesForElement(view.container);

    await fillRequiredFormFields({ scoped, user });
    await user.click(getFirstButtonByName(scoped, /bedarf anlegen/i));

    expect(await scoped.findByText('ok')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getVisibleInputByLabel(scoped, /konkrete bezeichnung des investitionsobjekts/i),
      ).toHaveValue('');
      expect(getVisibleInputByLabel(scoped, /höhe des kaufpreises \(netto\)/i)).toHaveValue('');
    });
  });

  it('applies only known server field errors and ignores unknown field keys', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockedSubmitInvestmentFinancing.mockResolvedValueOnce({
      success: false,
      error: {
        status: 422,
        message: 'Validation failed',
        fieldErrors: {
          purchasePrice: 'Ungültiger Betrag',
          unknownField: 'Should be ignored',
        },
      },
    });

    try {
      const user = userEvent.setup();
      const view = render(<InvestmentFinancingForm />);
      const scoped = getQueriesForElement(view.container);

      await fillRequiredFormFields({ scoped, user });
      await user.click(getFirstButtonByName(scoped, /bedarf anlegen/i));

      expect(await scoped.findByText('Ungültiger Betrag')).toBeInTheDocument();
      expect(scoped.queryByText('Should be ignored')).not.toBeInTheDocument();

      const useActionStateWarningFound = consoleErrorSpy.mock.calls.some((call) => {
        return call.some(
          (argument) =>
            typeof argument === 'string' &&
            argument.includes('An async function with useActionState'),
        );
      });

      expect(useActionStateWarningFound).toBe(false);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
