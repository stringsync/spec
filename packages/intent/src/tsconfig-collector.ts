import ts from 'typescript';
import * as path from 'path';
import type { FileSystem } from '@stringsync/core';

export class TsConfigCollector {
  constructor(
    private globPatterns: string[],
    private fileSystem: FileSystem,
  ) {}

  async collectTsConfigs(): Promise<Array<{ configPath: string; parsed: ts.ParsedCommandLine }>> {
    const configs: Array<{ configPath: string; parsed: ts.ParsedCommandLine }> = [];

    for (const pattern of this.globPatterns) {
      // For now, we'll look for tsconfig.json files in the pattern directories
      // This is a simplified implementation - in a full implementation you'd use a proper glob library
      const configPath = await this.findTsConfigInPattern(pattern);
      if (configPath) {
        const configContent = await this.fileSystem.read(configPath);
        const configFile = { config: JSON.parse(configContent), error: undefined };
        const parsed = ts.parseJsonConfigFileContent(
          configFile.config,
          {
            ...ts.sys,
            readFile: (path: string) => {
              // We'll need to handle this synchronously for TypeScript's API
              // For now, we'll fall back to ts.sys.readFile
              return ts.sys.readFile(path);
            },
          },
          path.dirname(configPath),
          undefined,
          configPath,
        );
        configs.push({ configPath, parsed });
      }
    }

    return configs;
  }

  private async findTsConfigInPattern(pattern: string): Promise<string | null> {
    // Simplified pattern matching - look for tsconfig.json in the pattern directory
    const dir = path.dirname(pattern);
    const configPath = path.resolve(dir, 'tsconfig.json');

    if (await this.fileSystem.exists(configPath)) {
      return configPath;
    }

    // Also try looking in the current working directory
    const cwdConfigPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
    return cwdConfigPath || null;
  }
}
