import { Annotation } from '~/annotations/annotation';
import { Comment } from '~/annotations/comment';
import type { File } from '~/files/file';
import { Cursor } from '~/files/cursor';

export class Detector {
  constructor(private file: File) {}

  detect(tag: string): Annotation[] {
    const annotations = new Array<Annotation>();

    const cursor = new Cursor(this.file);

    while (cursor.hasNext()) {
      const comments = Comment.parse(cursor);
      for (const comment of comments) {
        if (comment.text.startsWith(`${tag}(`)) {
          const location = this.file.getLocation(comment.start);
          const annotation = Annotation.parse({ tag, comment, location });
          annotations.push(annotation);
        }
      }
    }

    return annotations;
  }
}
