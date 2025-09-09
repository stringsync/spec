import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '~/package.json';
import { CallToolResultBuilder } from '~/util/mcp/call-tool-result-builder';
import { z } from 'zod';
import { check } from '~/actions/check';
import { PublicError } from '~/util/errors';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DEFAULT_IGNORE_PATTERNS, scan, type ScanResult } from '~/actions/scan';
import { StderrLogger } from '~/util/logs/stderr-logger';
import { GetPromptResultBuilder } from '~/util/mcp/get-prompt-result-builder';

const log = new StderrLogger();

export async function mcp() {
  const server = new McpServer({ name, version });

  // Tools
  server.tool(
    'spec.check',
    'validate a @stringsync/spec spec file',
    { path: z.string().describe('the absolute path to the spec file to validate') },
    checkTool,
  );

  server.tool(
    'spec.scan',
    'scan for @stringsync/spec specs and tags',
    {
      patterns: z.array(z.string()).describe('absolute glob patterns to scan'),
      ignore: z.array(z.string()).optional().describe('glob patterns to ignore'),
    },
    scanTool,
  );

  // Prompts
  server.prompt(
    'spec.describe',
    'instruct the assistant to describe the project using @stringsync/spec',
    {},
    describePrompt,
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.error('@stringsync/spec MCP server running on stdio');
}

async function checkTool({ path }: { path: string }) {
  const builder = new CallToolResultBuilder();

  if (!path) {
    builder.error(new PublicError('Path is required'));
    return builder.build();
  }

  if (!path.startsWith('/')) {
    builder.error(new PublicError('Path must be absolute'));
    return builder.build();
  }

  const result = await check({ path });
  switch (result.type) {
    case 'success':
      builder.text(`valid @stringsync/spec: ${path}`);
      break;
    case 'error':
      builder.text(`invalid @stringsync/spec: ${path}`);
      builder.error(new PublicError(result.errors.join('\n')));
      break;
  }

  return builder.build();
}

async function scanTool({ patterns, ignore }: { patterns: string[]; ignore?: string[] }) {
  const builder = new CallToolResultBuilder();

  if (patterns.length === 0) {
    builder.error(new PublicError('At least one pattern is required'));
    return builder.build();
  }

  if (patterns.some((p) => !p.startsWith('/'))) {
    builder.error(new PublicError('All patterns must be absolute'));
    return builder.build();
  }

  function toList(results: ScanResult[]): string {
    return results.map(toListItem).join('\n');
  }

  function toListItem(result: ScanResult): string {
    switch (result.type) {
      case 'spec':
        return `- spec: ${result.name} | path: ${result.path}`;
      case 'tag':
        return `- tag: ${result.id} | body: ${result.body} | location: ${result.location}`;
    }
  }

  try {
    const results = await scan({
      patterns,
      ignore: [...DEFAULT_IGNORE_PATTERNS, ...(ignore ?? [])],
    });
    builder.text(
      toList([
        ...results.filter((r) => r.type === 'spec'),
        ...results.filter((r) => r.type === 'tag'),
      ]),
    );
  } catch (e) {
    builder.error(PublicError.wrap(e));
  }

  return builder.build();
}

async function describePrompt() {
  const builder = new GetPromptResultBuilder();

  builder.user.text(
    'My project uses @stringsync/spec to facilitate spec-driven development. ' +
      'Review how the library is intended to be used by reading: ' +
      'https://raw.githubusercontent.com/stringsync/spec/refs/heads/master/AGENTS.md. ' +
      'Next, use the spec.scan tool to discover the specs and tags within the project. ' +
      'Read any files you deem necessary to understanding the project. ' +
      'Finally, provide a description of the project based on the specs and tags.',
  );

  return builder.build();
}
