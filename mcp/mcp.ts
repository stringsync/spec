import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '~/package.json';
import { CallToolResultBuilder } from '~/util/mcp/call-tool-result-builder';
import { z } from 'zod';
import { NotImplementedError, PublicError } from '~/util/errors';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StderrLogger } from '~/util/logs/stderr-logger';
import { GetPromptResultBuilder } from '~/util/mcp/get-prompt-result-builder';
import { Prompt } from '~/prompts/prompt';

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
    'show details about specs',
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
    'show a summary of modules, specs, and tags',
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

  builder.error(new NotImplementedError());

  return builder.build();
}

async function scanTool({
  selectors,
  includePatterns,
  excludePatterns,
}: {
  selectors: string[];
  includePatterns: string[];
  excludePatterns: string[];
}) {
  const builder = new CallToolResultBuilder();

  builder.error(new NotImplementedError());

  return builder.build();
}
