import ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

export class TsConfigCollector {
  constructor(private globPatterns: string[]) {}

  collectTsConfigs(): Array<{ configPath: string; parsed: ts.ParsedCommandLine }> {
    const configs: Array<{ configPath: string; parsed: ts.ParsedCommandLine }> = [];

    for (const pattern of this.globPatterns) {
      // For now, we'll look for tsconfig.json files in the pattern directories
      // This is a simplified implementation - in a full implementation you'd use a proper glob library
      const configPath = this.findTsConfigInPattern(pattern);
      if (configPath) {
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
        const parsed = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(configPath),
          undefined,
          configPath,
        );
        configs.push({ configPath, parsed });
      }
    }

    return configs;
  }

  private findTsConfigInPattern(pattern: string): string | null {
    // Simplified pattern matching - look for tsconfig.json in the pattern directory
    const dir = path.dirname(pattern);
    const configPath = path.resolve(dir, 'tsconfig.json');

    if (fs.existsSync(configPath)) {
      return configPath;
    }

    // Also try looking in the current working directory
    const cwdConfigPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
    return cwdConfigPath || null;
  }
}
