import { describe, test, expect } from 'bun:test';
import { it } from './it';
import { StringReader } from '@stringsync/core/src/reader/string-reader';

describe('it', () => {
  test('creates an intention from a string', async () => {
    const intention = await it.may('do something').read();
    expect(intention).toBe('it MAY do something');
  });

  test('creates an intention from a Reader', async () => {
    const reader = new StringReader('do something else');
    const intention = await it.must(reader).read();
    expect(intention).toBe('it MUST do something else');
  });

  test('create negated intentions', async () => {
    const intention = await it.should.not('not do this').read();
    expect(intention).toBe('it SHOULD NOT not do this');
  });
});
