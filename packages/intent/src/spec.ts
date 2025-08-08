import type { Transport } from './transport/types';
import type { Readable } from './types';
import { StackProbe } from './stack-probe';
import type { IntentEvent } from '@stringsync/core/src/events/types';

export type IntentMap = {
  [intentId: string]: Readable;
};

export class Spec<T extends IntentMap> {
  private stackProbe = new StackProbe();

  constructor(
    private id: string,
    private intents: T,
    private transport: Transport,
  ) {}

  impl(intentId: keyof T) {
    this.emit('impl', String(intentId));
    return () => {};
  }

  todo(intentId: keyof T) {
    this.emit('todo', String(intentId));
    return () => {};
  }

  ref(intentId: keyof T) {
    return new Ref(String(intentId), this.transport);
  }

  read(intentId: keyof T): Readable {
    return this.intents[intentId] as Readable;
  }

  private emit(type: IntentEvent['type'], intentId: string) {
    const event: IntentEvent = {
      type,
      specId: this.id,
      intentId: intentId,
      callsite: this.stackProbe.getCallsite(),
    };

    this.transport.send(event).catch((error) => {
      console.error(`Failed to send event for intent ${intentId}:`, error);
    });
  }
}

class Ref {
  private stackProbe = new StackProbe();

  constructor(
    private intentId: string,
    private transport: Transport,
  ) {}

  todo() {
    this.emit('todo');
    return () => {};
  }

  impl() {
    this.emit('impl');
    return () => {};
  }

  private emit(type: IntentEvent['type']) {
    const event: IntentEvent = {
      type,
      specId: this.intentId,
      intentId: this.intentId,
      callsite: this.stackProbe.getCallsite(),
    };

    this.transport.send(event).catch((error) => {
      console.error(`Failed to send event for ref ${this.intentId}:`, error);
    });
  }
}
