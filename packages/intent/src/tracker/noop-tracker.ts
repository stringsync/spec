import type { CallType, Tracker } from './types';

export class NoopTracker implements Tracker {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  track(type: CallType, id: string, callsite: string): void {
    // noop
  }
}
