import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '~/package.json';
import { CallToolResultBuilder } from '~/util/mcp/call-tool-result-builder';
import { z } from 'zod';
import { check } from '~/actions/check';
import { PublicError } from '~/util/errors';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DEFAULT_IGNORE_PATTERNS, scan, type SpecResult, type TagResult } from '~/actions/scan';
import { StderrLogger } from '~/util/logs/stderr-logger';
import { GetPromptResultBuilder } from '~/util/mcp/get-prompt-result-builder';
import { Prompt } from '~/prompts/prompt';
import { show } from '~/actions/show';

const log = new StderrLogger();

export async function mcp() {
  const server = new McpServer({ name, version });

  addTools(server);
  addPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info(`${name} ${version} MCP server running on stdio`);
}

function addTools(server: McpServer) {
  server.tool(
    'spec.show',
    'show details about a spec ID',
    {
      selectors: z
        .array(z.string())
        .describe('a list of fully qualified spec ids or spec name (e.g. "foo.bar" or "foo")'),
      includePatterns: z
        .array(z.string())
        .describe('absolute glob patterns to scan, prefer to use all files in the project root'),
      excludePatterns: z
        .array(z.string())
        .optional()
        .default([])
        .describe('absolute glob patterns to ignore, prefer to leave this blank'),
    },
    showTool,
  );

  server.tool(
    'spec.scan',
    'scan for @stringsync/spec specs and tags',
    {
      includePatterns: z
        .array(z.string())
        .describe('absolute glob patterns to scan, prefer to use all files in the project root'),
      excludePatterns: z
        .array(z.string())
        .optional()
        .default([])
        .describe('absolute glob patterns to ignore, prefer to leave this blank'),
    },
    scanTool,
  );
}

function addPrompts(server: McpServer) {
  for (const prompt of Prompt.all) {
    server.prompt(
      `spec.${prompt.name}`,
      prompt.description,
      prompt.schema.shape,
      async (args: any) => {
        const builder = new GetPromptResultBuilder();
        builder.user.text(prompt.render(args));
        return builder.build();
      },
    );
  }
}

async function showTool({
  selectors,
  includePatterns,
  excludePatterns,
}: {
  selectors: string[];
  includePatterns: string[];
  excludePatterns: string[];
}) {
  const builder = new CallToolResultBuilder();

  const { specs, tags } = await scan({
    patterns: includePatterns,
    ignore: [...DEFAULT_IGNORE_PATTERNS, ...excludePatterns],
  });
  const showResult = show({ selectors, specs, tags });

  switch (showResult.type) {
    case 'success':
      builder.text(showResult.content);
      break;
    case 'error':
      builder.error(new PublicError(showResult.errors.join('\n')));
      break;
  }

  return builder.build();
}

async function scanTool({
  includePatterns,
  excludePatterns,
}: {
  includePatterns: string[];
  excludePatterns: string[];
}) {
  const builder = new CallToolResultBuilder();

  if (includePatterns.length === 0) {
    builder.error(new PublicError('At least one pattern is required'));
    return builder.build();
  }

  if (includePatterns.some((p) => !p.startsWith('/'))) {
    builder.error(new PublicError('All patterns must be absolute'));
    return builder.build();
  }

  function toList(results: Array<SpecResult | TagResult>): string {
    return results.map(toListItem).join('\n');
  }

  function toListItem(result: SpecResult | TagResult): string {
    switch (result.type) {
      case 'spec':
        return `- spec: ${result.name} | path: ${result.path} | errors: ${result.errors.length ? result.errors.join(', ') : 'none'}`;
      case 'tag':
        return `- tag: ${result.id} | body: ${result.body} | location: ${result.location}`;
    }
  }

  try {
    const results = await scan({
      patterns: includePatterns,
      ignore: [...DEFAULT_IGNORE_PATTERNS, ...excludePatterns],
    });
    builder.text(toList([...results.specs, ...results.tags]));
  } catch (e) {
    builder.error(PublicError.wrap(e));
  }

  return builder.build();
}
