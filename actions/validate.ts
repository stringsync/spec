import { Stopwatch } from '~/util/stopwatch';

export type ValidateResult =
  | {
      type: 'success';
      ms: number;
    }
  | {
      type: 'error';
      errors: string[];
      ms: number;
    };

export async function validate(input: { path: string }): Promise<ValidateResult> {
  const stopwatch = Stopwatch.start();

  return {
    type: 'success',
    ms: stopwatch.ms(),
  };
}
