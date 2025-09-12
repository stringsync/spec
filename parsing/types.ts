/**
 * Represents a tag in a file.
 *
 * For example, in the comment // spec(calculator.add): Hello, world!
 *  - name:  "spec"
 *  - id:   "calculator.add"
 *  - body: "Hello, world!"
 */
export interface Tag {
  name: string;
  id: string;
  body: string;
  location: string;
  startIndex: number;
  endIndex: number;
}

export interface Comment {
  text: string;
  startIndex: number;
  endIndex: number;
}
