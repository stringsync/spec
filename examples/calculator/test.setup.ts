import { sdk } from './intent.config';
import { afterAll } from 'bun:test';

// This is needed to ensure that any in-flight transport is settled. Otherwise, you can get flaky
// results if the subprocess exits without the tranport finishing.
afterAll(async () => {
  await sdk.settle();
});
