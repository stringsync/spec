import { Spec, type IntentMap } from './spec';
import { CompositeTransport } from './transport/composite-transport';
import type { Transport } from './transport/types';

export class IntentSdk {
  private transport: Transport;

  constructor(...transports: Transport[]) {
    this.transport = new CompositeTransport(transports);
  }

  spec<T extends IntentMap>(specId: string, intents: T) {
    return new Spec(specId, intents, this.transport);
  }
}
