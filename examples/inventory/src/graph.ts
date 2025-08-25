import { parentSpec, readerSpec, writerSpec } from './graph.spec';

export type CardInput = { name: string; set?: string; quantity: number };
export type Card = { id: string; name: string; set?: string; quantity: number };

class WriterNode {
  private cards = new Map<string, Card>();

  @writerSpec.impl('writeCard')
  write(input: CardInput): Card {
    const id = `${input.name}:${input.set ?? ''}`;
    const existing = this.cards.get(id);
    if (existing) {
      const updated = { ...existing, quantity: existing.quantity + input.quantity };
      this.cards.set(id, updated);
      return updated;
    }
    const created: Card = { id, name: input.name, set: input.set, quantity: input.quantity };
    this.cards.set(id, created);
    return created;
  }

  snapshot(): Card[] {
    return Array.from(this.cards.values());
  }
}

class ReaderNode {
  constructor(private readonly getCards: () => Card[]) {}

  @readerSpec.impl('queryCards')
  query(filter?: { name?: string; set?: string }): Card[] {
    const all = this.getCards();
    if (!filter) return all;
    return all.filter((c) =>
      (filter.name ? c.name.toLowerCase().includes(filter.name.toLowerCase()) : true) &&
      (filter.set ? (c.set ?? '').toLowerCase().includes(filter.set.toLowerCase()) : true),
    );
  }
}

// Parent node: the only public facade, children never see each other
export class InventoryGraph {
  private writer = new WriterNode();
  private reader = new ReaderNode(() => this.writer.snapshot());

  @parentSpec.impl('addCardFlow')
  addCard(input: CardInput): Card {
    const card = this.writer.write(input);
    // Optionally validate via reader
    this.reader.query({ name: card.name, set: card.set });
    return card;
  }

  @parentSpec.impl('listCardsFlow')
  listCards(filter?: { name?: string; set?: string }): Card[] {
    return this.reader.query(filter);
  }
}


