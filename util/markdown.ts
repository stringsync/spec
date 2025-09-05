import * as fs from 'fs';

export class Markdown {
  constructor(private content: string) {}

  static async load(path: string): Promise<Markdown> {
    const content = await fs.promises.readFile(path, 'utf8');
    return new Markdown(content);
  }

  getHeader() {
    const match = this.content.match(/^# (.+)$/m);
    return match ? match[1] : '';
  }

  getSubheaders(): string[] {
    const matches = this.content.matchAll(/^## (.+)$/gm);
    return Array.from(matches, (m) => m[1]);
  }
}
