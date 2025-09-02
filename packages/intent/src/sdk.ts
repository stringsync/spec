import { Spec, type IntentMap } from './spec';

export class Sdk {
  static standard(): Sdk {
    return new Sdk();
  }

  spec<T extends IntentMap>(specId: string, intents: T) {
    return new Spec(specId, intents);
  }
}
