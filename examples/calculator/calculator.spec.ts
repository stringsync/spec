import { sdk } from './intent.config';
import { it } from '../intent';

export const spec = sdk.spec('calculator', {
  add: it.must('add two numbers correctly'),
});
