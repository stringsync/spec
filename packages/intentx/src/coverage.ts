import { BunIntentServer } from './bun-intent-server';
import { InMemoryIntentStorage } from './in-memory-intent-storage';
import { IntentService } from './intent-service';
import { DEFAULT_INTENT_PORT } from '@stringsync/intent/src/sdk';

export async function coverage() {
  const intentStorage = new InMemoryIntentStorage();
  const intentService = new IntentService(intentStorage);
  const intentServer = new BunIntentServer(intentService);

  return intentServer.start(DEFAULT_INTENT_PORT);
}
