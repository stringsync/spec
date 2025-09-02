'use client';

export type EventRecord = {
  slug: string;
  title: string;
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string; // ISO date (YYYY-MM-DD)
  createdAt: number; // ms since epoch
  expiresAt: number; // ms since epoch
  finalized: boolean;
};

const STORAGE_KEY = 'wym-events';

export function generateSlug(): string {
  // Human-friendly, hard-to-guess: 4-4 base36 segments
  const seg = () => Math.random().toString(36).slice(2, 6);
  return `${seg()}-${seg()}`;
}

export function createEvent(input: {
  title: string;
  startDate: string;
  endDate: string;
}): EventRecord {
  const now = Date.now();
  const expiresAt = now + 180 * 24 * 60 * 60 * 1000; // 180 days
  const slug = generateSlug();

  const record: EventRecord = {
    slug,
    title: input.title.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now,
    expiresAt,
    finalized: true, // Created and finalized to generate a share link
  };

  saveEvent(record);
  return record;
}

export function saveEvent(event: EventRecord) {
  const all = readAll();
  all[event.slug] = event;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getEvent(slug: string): EventRecord | null {
  const all = readAll();
  return all[slug] ?? null;
}

export function listEvents(): EventRecord[] {
  const all = readAll();
  return Object.values(all);
}

function readAll(): Record<string, EventRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, EventRecord>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function isExpired(event: EventRecord, now = Date.now()): boolean {
  return now >= event.expiresAt;
}

export function daysUntil(timestampMs: number, now = Date.now()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((timestampMs - startOfDay(now)) / msPerDay);
}

export function daysSince(timestampMs: number, now = Date.now()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((startOfDay(now) - timestampMs) / msPerDay);
}

export function formatDate(dateOrMs: number | Date): string {
  const d = typeof dateOrMs === 'number' ? new Date(dateOrMs) : dateOrMs;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function startOfDay(now: number) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
