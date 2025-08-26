import { it } from '@stringsync/intent';
import { sdk } from './intent.config';

export const cujs = sdk.spec('cujs', {
  // ————————————————————————————————————————————————————————————————————————
  // User Onboarding / Identity
  // ————————————————————————————————————————————————————————————————————————
  userOnboarding: it.multi(
    it
      .should('let a new visitor start using the app with near-zero friction')
      .example('Open a share link and view availability without creating an account'),
    it
      .must('defer named account creation until a user performs a write action')
      .example('No prompt to name or sign in until they try to set availability'),
    it
      .must('remember the returning user on the same device')
      .example('Stable anonymous user via cookie/local storage device ID'),
    it
      .should('support progressive profiling without a password initially')
      .example('Anonymous user can later add email + password to persist identity'),
    it
      .must('communicate the tradeoff of anonymous use (cookie loss => profile loss)')
      .example('Banner: “Using a temporary profile. Add an email to keep your events.”'),
  ),

  // ————————————————————————————————————————————————————————————————————————
  // Event Creation (Host flow)
  // ————————————————————————————————————————————————————————————————————————
  createEvent: it.multi(
    it.must('allow a host to create an event'),
    it.must('allow the host to name an event').example('“Board game night”'),
    it
      .must('allow the host to constrain the event to a date range')
      .example('Start: 2025-09-01, End: 2025-09-30'),
    it.must('allow the host to finalize the event and generate a share link'),
    it
      .should('use a neat, human-friendly but hard-to-guess slug as the event ID')
      .example('https://whencanyoumeet.me/events/f2jf329jd'),
    it
      .must('clearly display when the event will expire')
      .example('“Expires on Feb 22, 2026 (in 180 days).”'),
    it
      .must('expire events after 180 days by default')
      .example('Auto-archive on day 181 with read-only view thereafter'),
  ),

  // ————————————————————————————————————————————————————————————————————————
  // Event Viewing (Share link)
  // ————————————————————————————————————————————————————————————————————————
  viewEvent: it.multi(
    it
      .must('let a visitor join an event given its share link')
      .example('Open link → see title, date range, participants, availability grid'),
    it
      .must('avoid prompting for a named user on mere view')
      .example('Create a stable anonymous user silently for presence & drafts'),
    it
      .should('show live presence badges for users currently viewing the event')
      .example('Circles with initials or photos like Google Docs'),
    it.should('jump the calendar to a user’s earliest available day when clicking their badge'),
  ),

  // ————————————————————————————————————————————————————————————————————————
  // Updating Availability (Participant flow)
  // ————————————————————————————————————————————————————————————————————————
  updateAvailability: it.multi(
    it
      .must('let users specify when they CAN meet (positive selection), not when they cannot)')
      .example('Tap/drag-to-mark “available” blocks; unmarked means unknown/unavailable'),
    it
      .should('make the positive-selection model visually obvious and intuitive')
      .example('Legend: “Highlight the times you can make it”'),
    it
      .must(
        'prompt for a display name (and optional photo) if current user lacks one at first write',
      )
      .example('“Add your name to save your availability”'),
    it.may('allow continuing as “Anonymous” while still saving availability to device'),
  ),

  // ————————————————————————————————————————————————————————————————————————
  // Overlap & Decision Support
  // ————————————————————————————————————————————————————————————————————————
  overlap: it.multi(
    it.must('prominently display a list of days where everyone overlaps'),
    it
      .should('group consecutive overlapping days into a single range entry')
      .example('“Oct 3–5 (3 days)” instead of three separate rows'),
    it.must('let users click an overlap list item to jump the calendar to that day or range'),
    it.may('rank overlap entries by participant count, then by tightest time window'),
  ),

  // ————————————————————————————————————————————————————————————————————————
  // Share & Finalization
  // ————————————————————————————————————————————————————————————————————————
  shareAndFinalize: it.multi(
    it.must('produce a shareable event link after creation'),
    it
      .should('indicate when the link holders can edit vs. view')
      .example('“Anyone with the link can update availability” toggle'),
    it.must('allow the host to finalize a single date (or range) and lock editing'),
    it.may('notify participants when the host finalizes the event'),
  ),

  // ————————————————————————————————————————————————————————————————————————
  // Resilience, Privacy, and Abuse Resistance
  // ————————————————————————————————————————————————————————————————————————
  resiliencePrivacy: it.multi(
    it
      .should('rate-limit event lookup to make slug brute forcing uneconomical')
      .example('Backoff + IP throttling on repeated 404s'),
    it.should('avoid exposing participant emails/PII unless explicitly added to profile'),
    it.should('store anonymous user identity only on the device unless upgraded to an account'),
  ),
});
