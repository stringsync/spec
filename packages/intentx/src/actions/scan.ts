import type { IntentService } from '../intent-service';
import { Scanner } from '@stringsync/intent';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function scan(_input: { intentService: IntentService; path: string }) {
  const scanner = new Scanner();
  const events = await scanner.scan();

  // Output the results in the same format as before for compatibility
  for (const event of events) {
    console.log(`${event.callsite}  type=${event.type}\n  ${event.type}Event\n`);
  }

  if (events.length === 0) {
    console.log('No Spec#impl, Spec#todo, or Sdk#spec calls found.');
  }
}
