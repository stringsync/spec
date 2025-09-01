export enum RequirementLevel {
  Must = 'must',
  MustNot = 'mustNot',
  Should = 'should',
  ShouldNot = 'shouldNot',
  May = 'may',
}

export type IntentEvent = SpecEvent | ImplEvent | TodoEvent;

export type SpecEvent = {
  type: 'spec';
  specId: string;
  callsite: string;
};

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
