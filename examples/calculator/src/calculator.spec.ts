import { it } from '@stringsync/intent/src';
import { sdk } from './intent.config';

export const spec = sdk.spec('calculator', {
  add: it.must('add two numbers correctly').example('calculator.add(2, 2); // 4'),
});
