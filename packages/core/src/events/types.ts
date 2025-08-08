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
