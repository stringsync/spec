export type StackProbeOptions = {
  depth: number;
};

const DEFAULT_OPTIONS: StackProbeOptions = {
  depth: 0,
};

export class StackProbe {
  private options: StackProbeOptions;

  constructor(options?: Partial<StackProbeOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  getCallsite() {
    const err = new Error();
    const stack = err.stack?.split('\n')[2 + this.options.depth]?.trim();
    const match = stack?.match(/\/(?:[^:\n]+\.ts):\d+:\d+/);
    return match ? match[0] : 'unknown';
  }
}
