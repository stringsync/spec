import type { ImplEvent, IntentEvent, TodoEvent } from '@stringsync/intent';
import type { IntentStorage } from './intent-storage/types';

export class IntentService {
  constructor(private intentStorage: IntentStorage) {}

  parseIntentEvents(data: unknown): IntentEvent[] {
    if (!data) {
      throw new Error(`want object, got ${data}`);
    }

    if (typeof data !== 'object') {
      throw new Error(`want object, got: ${data}`);
    }

    const json = JSON.stringify(data, null, 2);

    if (!('events' in data)) {
      throw new Error(`want property 'events', got: ${json}`);
    }

    if (!Array.isArray(data.events)) {
      throw new Error(`want array for property 'events' got: ${json}`);
    }

    if (data.events.length < 1) {
      throw new Error(`want at least 1 event for property 'events', got: ${json}`);
    }

    if (!isIntentEvents(data.events)) {
      throw new Error(`want array of intent events, got: ${json}`);
    }

    return data.events;
  }

  async addIntentEvents(intentEvents: IntentEvent[]) {
    await this.intentStorage.addIntentEvents(intentEvents);
  }

  async getAllIntentEvents(): Promise<IntentEvent[]> {
    return this.intentStorage.getAllIntentEvents();
  }
}

function isIntentEvents(value: unknown): value is IntentEvent[] {
  return Array.isArray(value) && value.every(isIntentEvent);
}

function isIntentEvent(value: unknown): value is IntentEvent {
  return isImplEvent(value) || isTodoEvent(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isImplEvent(value: unknown): value is ImplEvent {
  return (
    isRecord(value) &&
    value.type === 'impl' &&
    typeof value.specId === 'string' &&
    typeof value.intentId === 'string' &&
    typeof value.callsite === 'string'
  );
}

function isTodoEvent(value: unknown): value is TodoEvent {
  return (
    isRecord(value) &&
    value.type === 'todo' &&
    typeof value.specId === 'string' &&
    typeof value.intentId === 'string' &&
    typeof value.callsite === 'string'
  );
}
