import z from 'zod';
import { Module } from '~/specs/module';
import { Selector } from '~/specs/selector';
import { Spec } from '~/specs/spec';
import { Tag } from '~/specs/tag';

export const SCAN_RESULT = z.object({
  modules: z.array(z.instanceof(Module)),
  tags: z.array(z.instanceof(Tag)),
  specs: z.array(z.instanceof(Spec)),
});

export const STRING_SELECTOR = z
  .string()
  .describe('the module or spec name (e.g. "foo" or "foo.bar")');

export const SELECTOR = z.instanceof(Selector);

export const SELECTORS = z.array(SELECTOR);

export const CONTEXT = z
  .string()
  .optional()
  .default('')
  .describe('additional free form text to add to the prompt');
