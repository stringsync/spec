import { DEFAULT_INTENT_PORT } from '@stringsync/intent/src/sdk';
import type { IntentServer } from './intent-server';
import type { Command } from '@stringsync/core/src/command/types';

export async function coverage({
  intentServer,
  command,
}: {
  intentServer: IntentServer;
  command: Command;
}) {
  try {
    await intentServer.start(DEFAULT_INTENT_PORT);
    await command.run();
  } finally {
    await intentServer.stop();
  }
}
