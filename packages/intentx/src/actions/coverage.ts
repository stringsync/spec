import { DEFAULT_INTENT_PORT } from '@stringsync/intent';
import type { IntentServer } from '../intent-server/types';
import type { Command } from '@stringsync/core';

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
