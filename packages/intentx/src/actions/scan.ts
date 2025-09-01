import type { IntentService } from '../intent-service';
import { Scanner, TsConfigCollector } from '@stringsync/intent';

export async function scan(input: { intentService: IntentService; patterns: string[] }) {
  const collector = new TsConfigCollector(['**/*.ts']);
  const configs = collector.collectTsConfigs();

  const scanner = new Scanner(configs, input.patterns);
  const events = await scanner.scan();

  // Output the results in the same format as before for compatibility
  for (const event of events) {
    console.log(`${event.callsite}  type=${event.type}\n  ${event.type}Event\n`);
  }

  if (events.length === 0) {
    console.log('No Spec#impl, Spec#todo, or Sdk#spec calls found.');
  }
}
