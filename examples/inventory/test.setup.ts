import { sdk } from './intent.config';
import { afterAll } from 'bun:test';

afterAll(async () => {
  await sdk.settle();
});


