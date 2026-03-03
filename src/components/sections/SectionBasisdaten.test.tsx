import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { SectionBasisdaten } from './SectionBasisdaten';
import type { InvestmentFinancingFormData } from '../../schema';
import { defaultValues } from '../../config/formConfig';

function Wrapper({ children }: { children: ReactNode }) {
  const methods = useForm<InvestmentFinancingFormData>({
    defaultValues,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('SectionBasisdaten', () => {
  it('wires accessible heading and content ids', () => {
    render(
      <SectionBasisdaten expanded={true} onToggle={() => undefined} />,
      { wrapper: Wrapper },
    );

    const headingButton = screen.getByRole('button', {
      name: /legen sie die basisdaten fest/i,
    });

    expect(headingButton).toHaveAttribute('aria-controls', 'section-basisdaten-content');

    const content = document.getElementById('section-basisdaten-content');
    expect(content).not.toBeNull();
    expect(content).toHaveAttribute('aria-labelledby', 'section-basisdaten-heading');
  });
});
