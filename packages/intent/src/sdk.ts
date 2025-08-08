import { Spec, type IntentMap } from './spec';
import type { Transport } from './types';

export type SdkOptions = {
  transport: Transport;
};

export class Sdk {
  constructor(private options: SdkOptions) {}

  spec<T extends IntentMap>(specId: string, intents: T) {
    return new Spec(specId, intents, this.options.transport);
  }
}
