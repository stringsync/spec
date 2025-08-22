import { spec } from './inventory.spec';

export type Card = {
  id: string;
  name: string;
  set?: string;
  quantity: number;
};

export class InventoryStore {
  private cards = new Map<string, Card>();

  @spec.impl('addCard')
  addCard(card: Omit<Card, 'id'>): Card {
    const id = `${card.name}:${card.set ?? ''}`;
    const existing = this.cards.get(id);
    if (existing) {
      const updated = { ...existing, quantity: existing.quantity + card.quantity };
      this.cards.set(id, updated);
      return updated;
    }
    const created: Card = { id, ...card } as Card;
    this.cards.set(id, created);
    return created;
  }

  @spec.impl('listCards')
  listCards(filter?: { name?: string; set?: string }): Card[] {
    const all = Array.from(this.cards.values());
    if (!filter) return all;
    return all.filter((c) =>
      (filter.name ? c.name.toLowerCase().includes(filter.name.toLowerCase()) : true) &&
      (filter.set ? (c.set ?? '').toLowerCase().includes(filter.set.toLowerCase()) : true),
    );
  }

  @spec.impl('updateCard')
  updateCard(id: string, updates: Partial<Omit<Card, 'id'>>): Card | undefined {
    const existing = this.cards.get(id);
    if (!existing) return undefined;
    const next = { ...existing, ...updates } as Card;
    this.cards.set(id, next);
    return next;
  }

  @spec.impl('removeCard')
  removeCard(id: string, quantity: number = 1): Card | undefined {
    const existing = this.cards.get(id);
    if (!existing) return undefined;
    const remaining = existing.quantity - quantity;
    if (remaining <= 0) {
      this.cards.delete(id);
      return { ...existing, quantity: 0 };
    }
    const next = { ...existing, quantity: remaining };
    this.cards.set(id, next);
    return next;
  }
}


