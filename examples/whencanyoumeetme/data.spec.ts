import { it } from '@stringsync/intent';
import { sdk } from './intent.config';

export const data = sdk.spec('data', {
  identityAndTime: it.multi(
    it.must('assign each Event a human-friendly, hard-to-guess identifier suitable for URLs'),
    it.must('record creation and update timestamps for top-level records'),
    it.should('associate writes with a stable actor when available'),
  ),

  user: it.multi(
    it.must('support an anonymous user that can act and be remembered on the same device'),
    it.must('support upgrading an anonymous user to an account without losing prior work'),
    it.should('separate public-facing participant info from any PII'),
    it.may('support optional profile attributes such as display name and photo'),
  ),

  event: it.multi(
    it.must('represent an Event with title, host, and a bounded date range'),
    it.must('associate the Event with a single canonical timezone for interpretation'),
    it.must('default to expiring the Event after 180 days and make this visible to users'),
    it.should('support lifecycle states such as draft, open, finalized, and expired'),
    it.may('record lightweight sharing and access policy for link holders'),
  ),

  participant: it.multi(
    it.must('relate Users to Events as participants, including the host'),
    it.should('carry a public badge facet (e.g., name/avatar) for presence UI'),
    it.should('derive or cache an earliest-available day per participant for navigation'),
    it.may('record ephemeral activity such as last seen time for UX polish'),
  ),

  availability: it.multi(
    it.must('store availability as positive selections (when a participant CAN meet)'),
    it.must('evaluate availability against the Event’s timezone'),
    it.should('support multiple intervals within a day and merging of overlaps'),
    it.may('support an all-day indicator and optional per-day notes'),
    it.should('enable summarization per participant and per day to support UI'),
  ),

  overlap: it.multi(
    it.must('derive overlap from participant availability rather than storing as primary data'),
    it.should('group consecutive days with overlap into ranges for list presentation'),
    it.may('cache overlap results per Event to accelerate reads, with invalidation on updates'),
  ),

  finalization: it.multi(
    it.must('allow recording a final single date or date range within the Event bounds'),
    it.must('lock further availability edits after finalization (host may override)'),
    it.may('record a minimal announcement state for notifications or audit'),
  ),

  expiration: it.multi(
    it.must('mark Events as expired at the configured deadline and make them read-only'),
    it.should('preserve read access to expired Events for reference'),
    it.may('allow bounded extensions by the host before expiration'),
  ),

  presence: it.multi(
    it.should('model real-time presence outside of durable storage'),
    it.should('avoid retaining presence history beyond what the UI immediately needs'),
  ),

  privacySecurity: it.multi(
    it.must('isolate PII from public participant data and enforce scoped reads'),
    it.should('discourage identifier enumeration (e.g., by throttling and anomaly logging)'),
    it.may('maintain a minimal audit trail of write actions without storing sensitive payloads'),
  ),

  portability: it.multi(
    it.should('avoid coupling the spec to a particular database, schema, or index layout'),
    it.may('recommend non-binding implementation hints separately (e.g., indexes, caches)'),
  ),
});
