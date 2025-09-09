import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '../package.json';
import { CallToolResultBuilder } from '~/mcp/call-tool-result-builder';
import { z } from 'zod';
import { check } from '~/actions/check';
import { PublicError } from '~/util/errors';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export async function mcp() {
  const server = new McpServer({
    name,
    version,
  });

  server.tool(
    'spec.check',
    'Validate a spec file',
    {
      path: z.string().describe('The path to the spec file to validate'),
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

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('@stringsync/spec MCP server running on stdio');
}
