import { it } from '@stringsync/intent/src';
import { sdk } from './intent.config';

// Parent orchestrator spec: defines the only public intents
export const parentSpec = sdk.spec('inventory.graph', {
  addCardFlow: it.must('accept card input, route to writer, then confirm state'),
  listCardsFlow: it.must('route to reader and return filtered results'),
});

// Child specs: private to the graph, referenced via parent only
export const writerSpec = sdk.spec('inventory.graph.writer', {
  writeCard: it.must('persist or increment quantity for card id'),
});

export const readerSpec = sdk.spec('inventory.graph.reader', {
  queryCards: it.must('filter cards by name and set'),
});
