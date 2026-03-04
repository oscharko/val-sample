import { describe, expect, it } from 'vitest';
import { createStore } from './createStore';

describe('createStore', () => {
  it('does not notify subscribers when updater returns the same snapshot', () => {
    const store = createStore({ count: 0 });

    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.setState((previous) => previous);

    expect(notifications).toBe(0);

    unsubscribe();
  });

  it('notifies subscribers when snapshot changes', () => {
    const store = createStore({ count: 0 });

    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.setState((previous) => ({ ...previous, count: previous.count + 1 }));

    expect(notifications).toBe(1);

    unsubscribe();
  });

  it('notifies a stable listener snapshot when listeners unsubscribe during notification', () => {
    const store = createStore({ count: 0 });

    let firstNotifications = 0;
    let secondNotifications = 0;

    const unsubscribeFirst = store.subscribe(() => {
      firstNotifications += 1;
      unsubscribeFirst();
    });

    store.subscribe(() => {
      secondNotifications += 1;
    });

    store.setState((previous) => ({ ...previous, count: previous.count + 1 }));

    expect(firstNotifications).toBe(1);
    expect(secondNotifications).toBe(1);
  });
});
