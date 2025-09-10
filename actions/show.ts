import type { Tag } from '~/tags/types';

export type ShowResult =
  | {
      type: 'success';
      id: string;
      tags: Tag[];
    }
  | {
      type: 'error';
      errors: string[];
    };

export async function show(input: {
  id: string;
  patterns: string[];
  ignore?: string[];
}): Promise<ShowResult> {
  return {
    type: 'error',
    errors: ['Not implemented yet'],
  };
}
