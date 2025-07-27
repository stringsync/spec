import { describe, it, expect } from 'bun:test';
import { MarkdownSelector } from './markdown-selector';

describe('MarkdownSelector', () => {
  const markdownContent = `
# Title

## Introduction
This is the introduction section.

## Usage
This is the usage section.

## Conclusion
This is the conclusion section.
`;

  it('should select the content under a given subheading', async () => {
    const selector = new MarkdownSelector.Builder().subheading('Introduction').build();

    const result = await selector.select(markdownContent);
    expect(result).toBe('This is the introduction section.');
  });

  it('should select the content under a subheading even if it is at the end', async () => {
    const selector = new MarkdownSelector.Builder().subheading('Conclusion').build();

    const result = await selector.select(markdownContent);
    expect(result).toBe('This is the conclusion section.');
  });

  it('should throw an error if the subheading does not exist', async () => {
    const selector = new MarkdownSelector.Builder().subheading('Nonexistent').build();

    expect(selector.select(markdownContent)).rejects.toThrow(
      'Subheading "## Nonexistent" not found',
    );
  });

  it('should throw an error if no selectors are provided', () => {
    expect(() => new MarkdownSelector.Builder().build()).toThrow(
      'At least one selector must be provided',
    );
  });

  it('should allow chaining multiple selectors', async () => {
    // For demonstration, chain the same selector twice (should still work)
    const selector = new MarkdownSelector.Builder()
      .subheading('Usage')
      .subheading('Usage') // This will try to find 'Usage' inside the result of the first 'Usage'
      .build();

    // Since the second 'Usage' doesn't exist in the result, it should throw
    expect(selector.select(markdownContent)).rejects.toThrow('Subheading "## Usage" not found');
  });
});
