import { it } from '@stringsync/intent/src';
import { sdk } from './intent.config';

export const spec = sdk.spec('inventory', {
  addCard: it.must('persist a new card with quantity'),
  listCards: it.must('list cards filtered by name and set'),
  updateCard: it.must('update card details and adjust quantity'),
  removeCard: it.must('remove a card or decrement quantity to zero'),
});
