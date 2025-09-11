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
      patterns: z.array(z.string()).describe('absolute glob patterns to scan'),
      ignore: z.array(z.string()).optional().describe('glob patterns to ignore'),
    },
    showTool,
  );

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
  patterns,
  ignore,
}: {
  selectors: string[];
  patterns: string[];
  ignore?: string[];
}) {
  const builder = new CallToolResultBuilder();

  const { specs, tags } = await scan({
    patterns,
    ignore: [...DEFAULT_IGNORE_PATTERNS, ...(ignore ?? [])],
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

  function toList(results: Array<SpecResult | TagResult>): string {
    return results.map(toListItem).join('\n');
  }

  function toListItem(result: SpecResult | TagResult): string {
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
    builder.text(toList([...results.specs, ...results.tags]));
  } catch (e) {
    builder.error(PublicError.wrap(e));
  }

  return builder.build();
}
