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
import { Prompt } from '~/prompts/prompt';
import { Markdown } from '~/util/markdown';

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
      id: z.string().describe('the fully qualified spec id (e.g. "foo.bar")'),
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
  id,
  patterns,
  ignore,
}: {
  id: string;
  patterns: string[];
  ignore?: string[];
}) {
  const builder = new CallToolResultBuilder();

  if (!id) {
    builder.error(new PublicError('ID is required'));
    return builder.build();
  }

  if (patterns.length === 0) {
    builder.error(new PublicError('At least one pattern is required'));
    return builder.build();
  }

  if (patterns.some((p) => !p.startsWith('/'))) {
    builder.error(new PublicError('All patterns must be absolute'));
    return builder.build();
  }

  try {
    const results = await scan({
      selectors: [id],
      patterns,
      ignore: [...DEFAULT_IGNORE_PATTERNS, ...(ignore ?? [])],
    });
    const specs = results.filter((r) => r.type === 'spec');
    if (specs.length !== 1) {
      throw new PublicError(`Expected 1 spec to be found, but found ${specs.length}`);
    }
    const spec = specs[0];
    const markdown = await Markdown.load(spec.path);
    const content = markdown.getSubheaderContent(id);
    const tags = results
      .filter((r) => r.type === 'tag')
      .map((t) => `- ${t.location} ${t.body}`.trim())
      .join('\n');
    builder.text(`## ${id}\n\n${content}\n\n${tags}`);
  } catch (e) {
    builder.error(PublicError.wrap(e));
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
