export class StringBuilder {
  private lines = new Array<string>();
  private depth = 0;

  add(line: string) {
    this.append(line);
  }

  spaced(...parts: string[]) {
    this.append(parts.join(' '));
  }

  newline() {
    this.lines.push('');
  }

  indent(depth = 1) {
    this.depth += depth;
  }

  outdent(depth = 1) {
    this.depth = Math.max(0, this.depth - depth);
  }

  toString(): string {
    return this.lines.join('\n');
  }

  private append(string: string) {
    this.lines.push('  '.repeat(this.depth) + string);
  }
}
