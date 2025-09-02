/* eslint-disable @typescript-eslint/no-unused-vars */
import { readers, assert, type Readable } from '@stringsync/core';

const TS_DECORATOR_ADAPTER = (...args: unknown[]) => {};

export type IntentMap = {
  [intentId: string]: Readable;
};

export class Spec<T extends IntentMap> {
  constructor(
    private id: string,
    private intents: T,
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
    return TS_DECORATOR_ADAPTER;
  }

  todo(intentId: keyof T) {
    return TS_DECORATOR_ADAPTER;
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
}
