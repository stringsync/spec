import { Scanner, TsConfigCollector, type ScanEvent } from '@stringsync/intent';
import { NodeFileSystem } from '@stringsync/core';

export async function scan(patterns: string[]): Promise<ScanEvent[]> {
  const fileSystem = new NodeFileSystem();
  const collector = new TsConfigCollector(['**/*.ts'], fileSystem);
  const configs = await collector.collectTsConfigs();

  const scanner = new Scanner(configs, patterns);
  const events = await scanner.scan();

  return events;
}
