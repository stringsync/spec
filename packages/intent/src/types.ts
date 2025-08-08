export enum RequirementLevel {
  Must = 'must',
  MustNot = 'mustNot',
  Should = 'should',
  ShouldNot = 'shouldNot',
  May = 'may',
}

export interface Transport {
  send(event: IntentEvent): Promise<void>;
}

export type IntentEvent = ImplEvent | TodoEvent;

export type ImplEvent = {
  type: 'impl';
  specId: string;
  intentId: string;
  callsite: string;
};

export type TodoEvent = {
  type: 'todo';
  specId: string;
  intentId: string;
  callsite: string;
};
