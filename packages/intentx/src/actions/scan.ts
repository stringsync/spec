import { Scanner } from '@stringsync/intent';
import type { FileSystem } from '@stringsync/core';

export async function scan({
  tsConfigPath,
  fileSystem,
}: {
  tsConfigPath: string;
  fileSystem: FileSystem;
}) {
  return await new Scanner(tsConfigPath, fileSystem).scan();
}
