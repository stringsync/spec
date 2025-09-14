import z from 'zod';
import { Module } from '~/specs/module';
import { Spec } from '~/specs/spec';
import { Tag } from '~/specs/tag';

export const SCAN_RESULT_TYPE = z.object({
  modules: z.array(z.instanceof(Module)),
  tags: z.array(z.instanceof(Tag)),
  specs: z.array(z.instanceof(Spec)),
});
