import { HttpTransport } from './http-transport';
import { NoopTransport } from './noop-transport';
import { Spec, type IntentMap } from './spec';
import type { Transport } from './types';

export const DEFAULT_INTENT_PORT = 4321;

export type SdkOptions = {
  transport: Transport;
};

export class Sdk {
  constructor(private options: SdkOptions) {}

  static standard(env: Dict<string> = process.env): Sdk {
    const nodeEnv = env.NODE_ENV;
    const intentPort = env.INTENT_PORT ?? DEFAULT_INTENT_PORT.toString();

    if (nodeEnv === 'production') {
      return Sdk.noop();
    } else {
      let port = parseInt(intentPort);
      if (isNaN(port)) {
        port = DEFAULT_INTENT_PORT;
      }
      return Sdk.port(port);
    }
  }

  static noop(): Sdk {
    return new Sdk({ transport: new NoopTransport() });
  }

  static port(port: number): Sdk {
    return new Sdk({ transport: HttpTransport.localhost(port) });
  }

  spec<T extends IntentMap>(specId: string, intents: T) {
    return new Spec(specId, intents, this.options.transport);
  }
}
