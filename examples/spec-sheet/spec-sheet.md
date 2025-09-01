# Acme Billing Service - Spec Sheet (Draft)

## Context
The billing service processes customer invoices and payments. It must integrate with Stripe and provide monthly statements.

## Requirements
- The system must create an invoice when a new subscription starts.
- The system must record a successful payment event and update invoice status.
- The system should retry failed Stripe payments up to 3 times.
- The system may send a courtesy email on payment failure.
- The system must generate a monthly statement per customer including invoice totals.

## Non-Functional
- Availability MUST be at least 99.9%.
- Response time SHOULD be under 300ms for read endpoints.
