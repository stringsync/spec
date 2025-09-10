import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { InternalError } from '~/util/errors';

export class CallToolResultBuilder {
  private content = new Array<CallToolResult['content'][number]>();

  text(text: string): this {
    this.content.push({ type: 'text', text });
    return this;
  }

  error(error: InternalError): this {
    let text = '';
    if (error.isPublic) {
      text = error.message;
    } else {
      text =
        'Something went wrong, but the error details were omitted for security reasons. ' +
        'Check the error logs if you have access.';
    }
    this.content.push({ type: 'text', isError: true, text });
    return this;
  }

  build(): CallToolResult {
    return { content: [...this.content] };
  }
}
