import { beforeEach, describe, expect, it } from 'bun:test';
import { Sdk } from './sdk';
import { TestTransport } from './transport/test-transport';

describe('Spec', () => {
  let testTransport: TestTransport;
  let sdk: Sdk;

  beforeEach(() => {
    testTransport = new TestTransport();
    sdk = new Sdk({ transport: testTransport });
  });

  it('returns the spec id', () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    expect(spec.getSpecId()).toBe('foo');
  });

  it('returns the intent ids', () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    expect(spec.getIntentIds()).toEqual(['bar']);
  });

  it('tracks implementations', async () => {
    const spec = sdk.spec('foo', { bar: 'baz' });

    spec.impl('bar');
    await sdk.settle();

    const events = testTransport.getSentEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('impl');
    expect(events[0].specId).toBe('foo');
  });

  it('tracks todos', async () => {
    const spec = sdk.spec('foo', { bar: 'baz' });

    spec.todo('bar');
    await sdk.settle();

    const events = testTransport.getSentEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('todo');
    expect(events[0].specId).toBe('foo');
  });

  it('creates references', async () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    const bar = spec.ref('bar');

    bar.impl();
    await sdk.settle();

    const events = testTransport.getSentEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('impl');
    expect(events[0].specId).toBe('foo');
    expect(events[0].intentId).toBe('bar');
  });

  it('can be read', async () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    const content = await spec.read('bar');
    expect(content).toBe('baz');
  });

  it('can be turned to markdown', async () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    const markdown = await spec.toMarkdown();
    expect(markdown).toBe(`# foo

## bar

baz`);
  });
});
