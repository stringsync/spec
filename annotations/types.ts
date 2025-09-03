export interface Reader {
  next(): Promise<Line | null>;
}

export interface Line {
  text: string;
  range: Range;
}

export interface AnnotationLocator {
  locate(reader: Reader): Promise<Annotation[]>;
}

export interface Annotation {
  style: CommentStyle;
  anchor: AnnotationAnchor;
  body: AnnotationBody;
}

/**
 * Represents the anchor point of an annotation.
 *
 * For example, in the comment `// spec(calculator.add): Hello, world!`:
 *  - the anchor is "spec(calculator.add)".
 *  - the tag is "spec".
 *  - the identifier is "calculator.add".
 */
export interface AnnotationAnchor {
  range: Range;
  tag: string;
  args: string[];
}

/**
 * Represents the body of an annotation.
 *
 * For example, in the comment `// spec(calculator.add): Hello, world!`, the body text is
 * "Hello, world!".
 */
export interface AnnotationBody {
  range: Range;
  text: string;
}

export interface Position {
  /** The 0-based absolute offset in a text file. */
  offset: number;

  /** The 1-based line number in a text file. */
  line: number;

  /** The 1-based column number in a text file. */
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export enum CommentStyle {
  Unknown = 'unknown',
  SlashSlash = 'slash-slash', // //
  SlashBlock = 'slash-block', // /* ... */
  Hash = 'hash', // #
  Semi = 'semi', // ;
  DashDash = 'dash-dash', // --
  ParenAster = 'paren-aster', // (* ... *)
  XmlDoc = 'xml-doc', // <!-- ... -->
  PythonTriple = 'python-triple', // '''...''' or """..."""
  Heredoc = 'heredoc', // e.g., <<EOF ... EOF
}
