import * as fs from 'fs';

export class Markdown {
  constructor(private content: string) {}

  static async load(path: string): Promise<Markdown> {
    const content = await fs.promises.readFile(path, 'utf8');
    return new Markdown(content);
  }

  getContent(): string {
    return this.content;
  }

  getHeader() {
    const match = this.content.match(/^# (.+)$/m);
    return match ? match[1] : '';
  }

  getSubheaders(): string[] {
    const matches = this.content.matchAll(/^## (.+)$/gm);
    return Array.from(matches, (m) => m[1]);
  }

  getSubheaderContent(subheader: string): string {
    const subheading = `## ${subheader}`;
    const startIndex = this.content.indexOf(subheading);
    if (startIndex === -1) {
      throw new Error(`Subheading "${subheading}" not found`);
    }

    let endIndex = this.content.indexOf('## ', startIndex + subheading.length);
    if (endIndex === -1) {
      endIndex = this.content.length;
    }

    return this.content.substring(startIndex + subheading.length, endIndex).trim();
  }
}