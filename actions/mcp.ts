import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '../package.json';
import { CallToolResultBuilder } from '~/mcp/call-tool-result-builder';
import { z } from 'zod';
import { check } from '~/actions/check';
import { PublicError } from '~/util/errors';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DEFAULT_IGNORE_PATTERNS, DEFAULT_PATTERNS, scan, type ScanResult } from '~/actions/scan';

export async function mcp() {
  const server = new McpServer({
    name,
    version,
  });

  server.tool(
    'spec.check',
    'validate a spec file',
    {
      path: z.string().describe('the path to the spec file to validate'),
    },
    async ({ path }) => {
      const builder = new CallToolResultBuilder();

      try {
        await check({ path });
        builder.text(`The spec is valid: ${path}`);
      } catch (e) {
        builder.text(`The spec is invalid: ${path}`);
        builder.error(PublicError.wrap(e));
      }

      return builder.build();
    },
  );

  server.tool(
    'spec.scan',
    'scan for specs and tags',
    {
      patterns: z
        .array(z.string())
        .optional()
        .default(DEFAULT_PATTERNS)
        .describe('glob patterns to scan'),
      ignore: z
        .array(z.string())
        .optional()
        .default(DEFAULT_IGNORE_PATTERNS)
        .describe('glob patterns to ignore'),
    },
    async ({ patterns, ignore }) => {
      const builder = new CallToolResultBuilder();

      try {
        const results = await scan({ patterns, ignore: [...DEFAULT_IGNORE_PATTERNS, ...ignore] });
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
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('@stringsync/spec MCP server running on stdio');
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
