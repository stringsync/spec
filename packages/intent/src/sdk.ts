import { HttpTransport } from './transport/http-transport';
import { NoopTransport } from './transport/noop-transport';
import { Spec, type IntentMap } from './spec';
import { SettlingTransport } from './transport/settling-transport';
import type { Transport } from './transport/types';

export const DEFAULT_INTENT_PORT = 4321;

export type SdkOptions = {
  transport: Transport;
};

export class Sdk {
  private transport: SettlingTransport;

  constructor(options: SdkOptions) {
    this.transport = new SettlingTransport(options.transport);
  }

  static standard(env: Dict<string> = process.env): Sdk {
    const intentRole = env.INTENT_ROLE;
    const intentPort = env.INTENT_PORT ?? DEFAULT_INTENT_PORT.toString();

    if (intentRole === 'coverage') {
      const port = parseInt(intentPort);
      if (isNaN(port)) {
        throw new Error('Invalid INTENT_PORT');
      }
      return Sdk.port(port);
    } else {
      return Sdk.noop();
    }
  }

  static noop(): Sdk {
    return new Sdk({ transport: new NoopTransport() });
  }

  static port(port: number): Sdk {
    return new Sdk({ transport: HttpTransport.localhost(port) });
  }

  spec<T extends IntentMap>(specId: string, intents: T) {
    return new Spec(specId, intents, this.transport);
  }

  async settle() {
    await this.transport.settle();
  }
}
