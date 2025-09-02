'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getEvent,
  isExpired,
  daysUntil,
  daysSince,
  formatDate,
  type EventRecord,
} from '../../lib/events';

export default function EventPage() {
  const params = useParams();
  const slug = String((params as Record<string, string | string[]>).slug ?? '');
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on client
    if (!slug) return;
    const rec = getEvent(slug);
    setEvent(rec);
    setLoaded(true);
  }, [slug]);

  const shareUrl = useMemo(() => {
    if (!event) return '';
    return `${window.location.origin}/events/${event.slug}`;
  }, [event]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-2/3" />
            <div className="h-4 bg-neutral-200 rounded w-3/5" />
            <div className="h-28 bg-neutral-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-neutral-900">Event not found</h1>
          <p className="text-neutral-600">
            We couldn't find this event on your device. Make sure you have the correct link and that
            the event was created on this device.
          </p>
        </div>
      </div>
    );
  }

  const expired = isExpired(event);
  const expiresInDays = daysUntil(event.expiresAt);
  const expiredAgoDays = daysSince(event.expiresAt);

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">{event.title}</h1>
          <p className="text-neutral-700">
            Date range: <span className="font-medium">{event.startDate}</span> →{' '}
            <span className="font-medium">{event.endDate}</span>
          </p>

          <div
            className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${
              expired
                ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            {expired ? (
              <span>
                Expired on {formatDate(event.expiresAt)} (read-only, expired {expiredAgoDays} day
                {expiredAgoDays === 1 ? '' : 's'} ago).
              </span>
            ) : (
              <span>
                Expires on {formatDate(event.expiresAt)} (in {expiresInDays} day
                {expiresInDays === 1 ? '' : 's'}).
              </span>
            )}
          </div>
        </header>

        <section className="rounded-lg border border-neutral-200 p-4 bg-white space-y-3">
          <label className="block text-sm font-medium text-neutral-800">Share link</label>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 px-3 py-2 border border-neutral-200 rounded-md text-neutral-700 bg-neutral-50"
              value={shareUrl}
              readOnly
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              onClick={() => navigator.clipboard?.writeText(shareUrl).catch(() => {})}
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Anyone with the link can update availability until the host locks the event.
          </p>
        </section>

        <section className="rounded-lg border border-neutral-200 p-4 bg-white">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Availability</h2>
          {expired ? (
            <p className="text-neutral-600">
              This event is expired and is now read-only for reference.
            </p>
          ) : (
            <p className="text-neutral-600">
              Coming soon: Mark the times you can meet. Unmarked means unknown/unavailable.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
