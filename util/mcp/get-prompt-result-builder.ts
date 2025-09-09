import type { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';

export class GetPromptResultBuilder {
  private messages = new Array<GetPromptResult['messages'][number]>();

  constructor(private description: string) {}

  user() {
    return new GetPromptResultBuilder.MessageAppender(this, 'user');
  }

  assistant() {
    return new GetPromptResultBuilder.MessageAppender(this, 'assistant');
  }

  build(): GetPromptResult {
    return {
      description: this.description,
      messages: [...this.messages],
    };
  }

  private static MessageAppender = class {
    constructor(
      private getPromptResultBuilder: GetPromptResultBuilder,
      private role: GetPromptResult['messages'][number]['role'],
    ) {}

    text(text: string): GetPromptResultBuilder {
      this.getPromptResultBuilder.messages.push({
        role: this.role,
        content: {
          type: 'text',
          text,
        },
      });
      return this.getPromptResultBuilder;
    }

    resource(uri: string, text: string, mimeType: string): GetPromptResultBuilder {
      this.getPromptResultBuilder.messages.push({
        role: this.role,
        content: {
          type: 'resource',
          resource: {
            uri,
            text,
            mimeType,
          },
        },
      });
      return this.getPromptResultBuilder;
    }
  };
}
