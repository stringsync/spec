import { Style } from '~/annotations/style';
import type { Annotation } from '~/annotations/types';
import type { File } from '~/files/file';

/**
 * Parse all annotations with the given tag from the file.
 */
export function parse(tag: string, file: File): Annotation[] {
  const styles = Style.for(file);
  if (styles.length === 0) {
    return [];
  }

  return [];
}
