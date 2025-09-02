import { expect, describe, test } from 'bun:test';
import { parentSpec } from './graph.spec';
import { InventoryGraph } from './graph';

describe('InventoryGraph', async () => {
  const addFlow = await parentSpec.read('addCardFlow');
  const listFlow = await parentSpec.read('listCardsFlow');

  test(addFlow, () => {
    const graph = new InventoryGraph();
    const card = graph.addCard({ name: 'Pikachu', set: 'Base', quantity: 1 });
    expect(card.id).toBe('Pikachu:Base');
    expect(card.quantity).toBe(1);
  });

  test(listFlow, () => {
    const graph = new InventoryGraph();
    graph.addCard({ name: 'Pikachu', set: 'Base', quantity: 1 });
    graph.addCard({ name: 'Charizard', set: 'Base', quantity: 1 });
    graph.addCard({ name: 'Pikachu', set: 'Jungle', quantity: 1 });

    expect(graph.listCards().length).toBe(3);
    expect(graph.listCards({ name: 'pika' }).length).toBe(2);
    expect(graph.listCards({ set: 'base' }).length).toBe(2);
  });
});
