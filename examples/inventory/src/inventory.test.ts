import { expect, describe, test } from 'bun:test';
import { spec } from './inventory.spec';
import { InventoryStore } from './inventory';

describe('Inventory', async () => {
  const addCard = await spec.read('addCard');
  const listCards = await spec.read('listCards');
  const updateCard = await spec.read('updateCard');
  const removeCard = await spec.read('removeCard');

  test(addCard, () => {
    const store = new InventoryStore();
    const card = store.addCard({ name: 'Pikachu', set: 'Base', quantity: 1 });
    expect(card.id).toBe('Pikachu:Base');
    expect(card.quantity).toBe(1);

    const again = store.addCard({ name: 'Pikachu', set: 'Base', quantity: 2 });
    expect(again.quantity).toBe(3);
  });

  test(listCards, () => {
    const store = new InventoryStore();
    store.addCard({ name: 'Pikachu', set: 'Base', quantity: 1 });
    store.addCard({ name: 'Charizard', set: 'Base', quantity: 1 });
    store.addCard({ name: 'Pikachu', set: 'Jungle', quantity: 1 });

    expect(store.listCards().length).toBe(3);
    expect(store.listCards({ name: 'pika' }).length).toBe(2);
    expect(store.listCards({ set: 'base' }).length).toBe(2);
    expect(store.listCards({ name: 'pika', set: 'base' }).length).toBe(1);
  });

  test(updateCard, () => {
    const store = new InventoryStore();
    const initial = store.addCard({ name: 'Pikachu', set: 'Base', quantity: 1 });
    const updated = store.updateCard(initial.id, { quantity: 5 });
    expect(updated?.quantity).toBe(5);
  });

  test(removeCard, () => {
    const store = new InventoryStore();
    const initial = store.addCard({ name: 'Pikachu', set: 'Base', quantity: 2 });
    const afterOne = store.removeCard(initial.id, 1);
    expect(afterOne?.quantity).toBe(1);
    const afterTwo = store.removeCard(initial.id, 1);
    expect(afterTwo?.quantity).toBe(0);
    expect(store.listCards().length).toBe(0);
  });
});
