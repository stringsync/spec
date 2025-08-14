import type { IntentEvent, Transport } from './types';
import { CallsiteLocator } from './callsite-locator';
import { readers } from '@stringsync/core/src/reader/readers';
import type { Readable } from '@stringsync/core/src/reader/types';
import { assert } from '@stringsync/core/src/assert/assert';

const TS_DECORATOR_ADAPTER = () => {};

export type IntentMap = {
  [intentId: string]: Readable;
};

export class Spec<T extends IntentMap> {
  private callsiteLocator = new CallsiteLocator();

  constructor(
    private id: string,
    private intents: T,
    private transport: Transport,
  ) {
    assert.validId(this.id);

    for (const intentId of Object.keys(intents)) {
      assert.validId(intentId);
    }
  }

  getSpecId(): string {
    return this.id;
  }

  getIntentIds() {
    return Object.keys(this.intents) as (keyof T)[];
  }

  impl(intentId: keyof T) {
    this.emit('impl', String(intentId));
    return TS_DECORATOR_ADAPTER;
  }

  todo(intentId: keyof T) {
    this.emit('todo', String(intentId));
    return TS_DECORATOR_ADAPTER;
  }

  ref(intentId: keyof T) {
    return new Ref(String(intentId), this.transport);
  }

  read(intentId: keyof T) {
    return readers.read(this.intents[intentId]);
  }

  async toMarkdown(): Promise<string> {
    const header = `# ${this.id}`;

    const sections = await Promise.all([
      ...this.getIntentIds().map(async (intentId) => {
        const intent = this.intents[intentId];

        let content: string;
        if (typeof intent === 'string') {
          content = intent;
        } else if (readers.isReader(intent)) {
          content = await intent.read();
        } else if (typeof intent === 'undefined') {
          content = '[ERROR: Intent does not exist]';
        } else {
          content = '[ERROR: Intent is not readable]';
        }

        return `## ${String(intentId)}\n\n${content}`;
      }),
    ]);

    return [header, ...sections].join('\n\n');
  }

  private emit(type: IntentEvent['type'], intentId: string) {
    const event: IntentEvent = {
      type,
      specId: this.id,
      intentId: intentId,
      callsite: this.callsiteLocator.locate(),
    };

    this.transport.send(event).catch((error) => {
      console.error(`Failed to send event for intent ${intentId}:`, error);
    });
  }
}

class Ref {
  private callsiteLocator = new CallsiteLocator();

  constructor(
    private intentId: string,
    private transport: Transport,
  ) {}

  todo() {
    this.emit('todo');
    return TS_DECORATOR_ADAPTER;
  }

  impl() {
    this.emit('impl');
    return TS_DECORATOR_ADAPTER;
  }

  private emit(type: IntentEvent['type']) {
    const event: IntentEvent = {
      type,
      specId: this.intentId,
      intentId: this.intentId,
      callsite: this.callsiteLocator.locate(),
    };

    this.transport.send(event).catch((error) => {
      console.error(`Failed to send event for ref ${this.intentId}:`, error);
    });
  }
}
