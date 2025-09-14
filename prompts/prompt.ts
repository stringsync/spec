import { z, ZodObject, type ZodRawShape } from 'zod';

// spec(prompts.core)
export interface Prompt<T extends ZodRawShape> {
  readonly name: string;
  readonly description: string;
  readonly schema: ZodObject<T>;
  render(args: z.infer<ZodObject<T>>): string;
}
