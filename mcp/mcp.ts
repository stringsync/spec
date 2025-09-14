import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { name, version } from '~/package.json';
import { CallToolResultBuilder } from '~/util/mcp/call-tool-result-builder';
import { NotImplementedError } from '~/util/errors';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StderrLogger } from '~/util/logs/stderr-logger';
import { GetPromptResultBuilder } from '~/util/mcp/get-prompt-result-builder';
import { Prompt } from '~/prompts/prompt';
import { EXCLUDE_PATTERNS, INCLUDE_PATTERNS, SELECTORS } from '~/mcp/args';
import { Scope } from '~/specs/scope';
import { ExtendableGlobber } from '~/util/globber/extendable-globber';
import { scan } from '~/actions/scan';
import { Selector } from '~/specs/selector';
import { ScanToolTemplate } from '~/templates/scan-tool-template';

const log = new StderrLogger();

const MUST_IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

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
    },
    showTool,
  );

  server.tool(
    'spec.scan',
    'show a summary of modules, specs, and tags',
    {
      selectors: SELECTORS,
      includePatterns: INCLUDE_PATTERNS,
      excludePatterns: EXCLUDE_PATTERNS,
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

  const scope = new Scope({
    includePatterns,
    excludePatterns: [...MUST_IGNORE_PATTERNS, ...excludePatterns],
  });
  const globber = ExtendableGlobber.fs().freeze();
  const result = await scan({
    scope,
    selectors: Selector.parseAll(selectors),
    globber,
  });

  builder.error(new NotImplementedError());

  return builder.build();
}

async function scanTool(args: {
  selectors: string[];
  includePatterns: string[];
  excludePatterns: string[];
}) {
  const builder = new CallToolResultBuilder();

  const selectors = Selector.parseAll(args.selectors);
  const includePatterns = args.includePatterns;
  const excludePatterns = args.excludePatterns;
  const scope = new Scope({
    includePatterns,
    excludePatterns: [...MUST_IGNORE_PATTERNS, ...excludePatterns],
  });
  const globber = ExtendableGlobber.fs().freeze();
  const result = await scan({ scope, selectors, globber });

  const template = new ScanToolTemplate(result, selectors, result.modules.length);
  builder.text(template.render());

  return builder.build();
}
