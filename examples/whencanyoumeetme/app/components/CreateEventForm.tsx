'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, daysUntil, formatDate, type EventRecord } from '../lib/events';

type State = { stage: 'form' } | { stage: 'created'; event: EventRecord; shareUrl: string };

export default function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<State>({ stage: 'form' });

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && isIsoDate(startDate) && isIsoDate(endDate);
  }, [title, startDate, endDate]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    if (!t) {
      setError('Please enter a title.');
      return;
    }
    if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
      setError('Please select a valid date range.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be on or before end date.');
      return;
    }

    const event = createEvent({ title: t, startDate, endDate });
    const shareUrl = `${window.location.origin}/events/${event.slug}`;

    setState({ stage: 'created', event, shareUrl });
  }

  if (state.stage === 'created') {
    const { event, shareUrl } = state;
    const days = Math.max(0, daysUntil(event.expiresAt));
    return (
      <div className="space-y-4 text-left">
        <h2 className="text-2xl font-semibold text-neutral-900">Event created</h2>
        <div className="rounded-lg border border-neutral-200 p-4 space-y-2 bg-white">
          <div className="text-neutral-900">
            <span className="font-medium">Title:</span> {event.title}
          </div>
          <div className="text-neutral-900">
            <span className="font-medium">Range:</span> {event.startDate} → {event.endDate}
          </div>
          <div className="text-neutral-700">
            Expires on {formatDate(event.expiresAt)} (in {days} day{days === 1 ? '' : 's'}).
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              className="flex-1 px-3 py-2 border border-neutral-200 rounded-md text-neutral-700 bg-neutral-50"
              value={shareUrl}
              readOnly
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl).catch(() => {});
              }}
            >
              Copy
            </button>
            <button
              className="bg-transparent hover:bg-neutral-50 text-neutral-700 font-medium py-2 px-4 rounded-md border border-neutral-200 transition-colors duration-200"
              onClick={() => router.push(`/events/${event.slug}`)}
            >
              Open
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="text-left space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-neutral-800">
          Event title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Board game night"
          className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-neutral-800">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium text-neutral-800">
            End date
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        Create event and generate share link
      </button>

      <p className="text-xs text-neutral-500">
        We'll expire events after 180 days by default. You can share the link with anyone to update
        availability.
      </p>
    </form>
  );
}

function isIsoDate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}
