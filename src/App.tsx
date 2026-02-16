/**
 * App — Root component with Micro State Management providers.
 *
 * Wraps the form with FormNavigationProvider (Ch. 5 Context + Subscription)
 * to demonstrate subtree-scoped state for multi-step navigation.
 */

import InvestmentFinancingForm from './InvestmentFinancingForm';
import { FormNavigationProvider } from './context/FormStoreContext';

export default function App() {
  return (
    <FormNavigationProvider>
      <InvestmentFinancingForm />
    </FormNavigationProvider>
  );
}
