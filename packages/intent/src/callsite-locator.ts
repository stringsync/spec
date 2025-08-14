export type CallsiteLocatorOptions = {
  depth: number;
};

const DEFAULT_OPTIONS: CallsiteLocatorOptions = {
  depth: 0,
};

export class CallsiteLocator {
  private options: CallsiteLocatorOptions;

  constructor(options?: Partial<CallsiteLocatorOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  locate() {
    const err = new Error();
    const stack = err.stack?.split('\n')[2 + this.options.depth]?.trim();
    const match = stack?.match(/\/(?:[^:\n]+\.ts):\d+:\d+/);
    return match ? match[0] : 'unknown';
  }
}
