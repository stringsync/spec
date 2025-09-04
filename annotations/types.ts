/**
 * Represents an annotation in a file.
 *
 * For example, in the comment `// spec(calculator.add): Hello, world!`:
 *  - tag:  "spec"
 *  - id:   "calculator.add"
 *  - body: "Hello, world!"
 */
export interface Annotation {
  tag: string;
  id: string;
  body: string;
  location: string;
}

export interface Comment {
  text: string;
  startIndex: number;
  endIndex: number;
}
