import type { ScanResult } from '~/actions/scan';

enum Format {
  Cli = 'cli',
  Mcp = 'mcp',
}

export class ScanResultTemplate {
  private constructor(
    private result: ScanResult,
    private format: Format,
  ) {}

  static cli(result: ScanResult) {
    return new ScanResultTemplate(result, Format.Cli);
  }

  static mcp(result: ScanResult) {
    return new ScanResultTemplate(result, Format.Mcp);
  }

  render() {
    switch (this.format) {
      case Format.Cli:
        return this.renderCli();
      case Format.Mcp:
        return this.renderMcp();
    }
  }

  private renderCli(): string {
    return '';
  }

  private renderMcp(): string {
    return '';
  }
}
