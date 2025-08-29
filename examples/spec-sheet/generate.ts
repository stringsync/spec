import { markdown } from '../../packages/intent/src/markdown';
import { it } from '../intent';
import { sdk } from './intent.config';
import fs from 'node:fs/promises';
import path from 'node:path';

type LlmIntent = { id: string; level: 'must' | 'mustNot' | 'should' | 'shouldNot' | 'may'; text: string };

async function callOpenAIOrFallback(requirements: string): Promise<LlmIntent[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackHeuristic(requirements);
  }

  // Lazy import to avoid dependency for users without OpenAI installed
  let OpenAI: any;
  try {
    // @ts-ignore dynamic import
    OpenAI = (await import('openai')).default;
  } catch {
    return fallbackHeuristic(requirements);
  }

  const client = new OpenAI({ apiKey });
  const system = [
    'You convert a product spec sheet into structured intent statements.',
    'Return JSON array with fields: id (kebab-case), level (must|mustNot|should|shouldNot|may), text (imperative).',
    'IDs must match regex ^[a-zA-Z0-9_-]+$ and be short and meaningful.',
  ].join(' ');

  const prompt = `Extract intents from the following Requirements section. Keep 5-12 intents.\n\n${requirements}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content);
  const intents: LlmIntent[] = parsed.intents ?? parsed ?? [];
  return intents;
}

function fallbackHeuristic(requirements: string): LlmIntent[] {
  const lines = requirements
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.replace(/^[-*]\s+/, ''));

  const intents: LlmIntent[] = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    let level: LlmIntent['level'] = 'may';
    if (lower.includes('must not') || lower.includes('mustn\'t')) level = 'mustNot';
    else if (lower.includes('must')) level = 'must';
    else if (lower.includes('should not') || lower.includes("shouldn't")) level = 'shouldNot';
    else if (lower.includes('should')) level = 'should';

    const id = toId(line);
    intents.push({ id, level, text: line });
  }
  return intents;
}

function toId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

async function main() {
  const root = path.resolve(__dirname);
  const sheetPath = path.join(root, 'spec-sheet.md');
  const outputPath = path.join(root, 'generated.md');

  const reqReader = markdown({ path: sheetPath }).subheading('Requirements');
  const requirements = await reqReader.read();

  const intents = await callOpenAIOrFallback(requirements);

  const specIntents = Object.fromEntries(
    intents.map((i) => [
      i.id,
      intentFromLevel(i.level, i.text),
    ]),
  );

  const spec = sdk.spec('billing', specIntents);
  const md = await spec.toMarkdown();

  const checklist = toChecklist(md);
  await fs.writeFile(outputPath, checklist, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
}

function intentFromLevel(level: LlmIntent['level'], text: string) {
  switch (level) {
    case 'must':
      return it.must(text);
    case 'mustNot':
      return it.must.not(text);
    case 'should':
      return it.should(text);
    case 'shouldNot':
      return it.should.not(text);
    case 'may':
    default:
      return it.may(text);
  }
}

function toChecklist(markdownSpec: string): string {
  const lines = markdownSpec.split('\n');
  const out: string[] = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      out.push(`- [ ] ${line.slice(3)}`);
    } else if (line.startsWith('it ')) {
      out.push(`  ${line}`);
    } else if (line.trim().length === 0) {
      out.push('');
    } else if (line.startsWith('# ')) {
      out.push(`# ${line.slice(2)} (Generated)`);
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

// Bun/Node entry
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


