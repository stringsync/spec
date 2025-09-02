export class Stopwatch {
  private constructor(private start: bigint) {}

  static start() {
    return new Stopwatch(process.hrtime.bigint());
  }

  ms() {
    const ns = process.hrtime.bigint() - this.start;
    const wholeMs = ns / 1_000_000n;
    const remainderNs = ns % 1_000_000n;
    return Number(wholeMs) + Number(remainderNs) / 1_000_000;
  }
}
