import { BunIntentServer } from './bun-intent-server';
import { InMemoryIntentStorage } from './in-memory-intent-storage';
import { IntentService } from './intent-service';
import { DEFAULT_INTENT_PORT } from '@stringsync/intent/src/sdk';
import { BunCommand } from '@stringsync/core/src/command/bun-command';

export async function coverage(args: string[]) {
  const intentStorage = new InMemoryIntentStorage();
  const intentService = new IntentService(intentStorage);
  const intentServer = new BunIntentServer(intentService);

  const command = new BunCommand({
    cmd: args,
    env: {
      ...process.env,
      INTENT_ROLE: 'coverage',
    },
  });

  try {
    await intentServer.start(DEFAULT_INTENT_PORT);
    await command.run();
    console.log(await intentService.getAllIntentEvents());
  } finally {
    await intentServer.stop();
  }

  process.exit();
}
