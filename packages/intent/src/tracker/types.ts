export enum CallType {
  Impl = 'impl',
  Todo = 'todo',
}

export interface Tracker {
  track(type: CallType, id: string, callsite: string): void;
}
