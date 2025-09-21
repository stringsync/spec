import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '~/package.json';
import { CallToolResultBuilder } from '~/util/mcp/call-tool-result-builder';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StderrLogger } from '~/util/logs/stderr-logger';
import { GetPromptResultBuilder } from '~/util/mcp/get-prompt-result-builder';
import { EXCLUDE_PATTERNS, INCLUDE_PATTERNS, SELECTORS, TAG_FILTERS } from '~/mcp/args';
import { Scope } from '~/specs/scope';
import { ExtendableGlobber } from '~/util/globber/extendable-globber';
import { scan } from '~/actions/scan';
import { Selector } from '~/specs/selector';
import { constants } from '~/constants';
import { SHOW_TOOL_TEMPLATE } from '~/templates/show-tool-template';
import { SCAN_TOOL_TEMPLATE } from '~/templates/scan-tool-template';

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
      selectors: SELECTORS,
      includePatterns: INCLUDE_PATTERNS,
      excludePatterns: EXCLUDE_PATTERNS,
      tagFilters: TAG_FILTERS,
    },
    showTool,
  );

  server.tool(
    'spec.scan',
    'show a summary of modules, specs, and tags',
    {
      selectors: SELECTORS.optional().default([]),
      includePatterns: INCLUDE_PATTERNS,
      excludePatterns: EXCLUDE_PATTERNS,
      tagFilters: TAG_FILTERS,
    },
    scanTool,
  );
}

function addPrompts(server: McpServer) {
  for (const prompt of constants.PROMPT_TEMPLATES) {
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

async function showTool(args: {
  selectors: string[];
  includePatterns: string[];
  excludePatterns: string[];
  tagFilters: string[];
}) {
  const selectors = Selector.parseAll(args.selectors);
  const includePatterns = args.includePatterns;
  const excludePatterns = args.excludePatterns;
  const tagFilters = args.tagFilters;

  const builder = new CallToolResultBuilder();

  const scope = new Scope({
    includePatterns,
    excludePatterns: [...constants.MUST_EXCLUDE_PATTERNS, ...excludePatterns],
  });
  const globber = ExtendableGlobber.fs().freeze();
  const result = await scan({ scope, selectors, globber, tagFilters });

  builder.text(SHOW_TOOL_TEMPLATE.render({ result, selectors }));

  return builder.build();
}

async function scanTool(args: {
  selectors: string[];
  includePatterns: string[];
  excludePatterns: string[];
  tagFilters: string[];
}) {
  const selectors = Selector.parseAll(args.selectors);
  const includePatterns = args.includePatterns;
  const excludePatterns = args.excludePatterns;
  const tagFilters = args.tagFilters;

  const builder = new CallToolResultBuilder();

  const scope = new Scope({
    includePatterns,
    excludePatterns: [...constants.MUST_EXCLUDE_PATTERNS, ...excludePatterns],
  });
  const globber = ExtendableGlobber.fs().cached().freeze();
  const result = await scan({ scope, selectors, globber, tagFilters });
  const paths = await globber.glob(scope);

  builder.text(SCAN_TOOL_TEMPLATE.render({ result, selectors, pathCount: paths.length }));

  return builder.build();
}
