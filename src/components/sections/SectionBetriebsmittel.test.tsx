import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { SectionBetriebsmittel } from './SectionBetriebsmittel';
import type { InvestmentFinancingFormData } from '../../schema';
import { defaultValues } from '../../config/formConfig';

function Wrapper({ children }: { children: ReactNode }) {
  const methods = useForm<InvestmentFinancingFormData>({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('SectionBetriebsmittel', () => {
  it('hides conditional fields when operatingResourcesNeeded is nein', async () => {
    const user = userEvent.setup();

    render(
      <SectionBetriebsmittel expanded={true} onToggle={() => undefined} />,
      { wrapper: Wrapper },
    );

    expect(screen.getByLabelText(/betrag des betriebsmittels/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^nein$/i }));

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/betrag des betriebsmittels/i),
      ).not.toBeInTheDocument();
    });
  });
});
