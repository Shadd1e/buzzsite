# Production Integration and Approval Register

This website is built to keep the public experience separate from the mobile application. No backend is assumed or fabricated.

| Area | Required dependency | Current behaviour | Needed before production activation |
|---|---|---|---|
| Waitlist | Approved API/database/CRM, consent text, confirmation process | Validates fields; clearly reports not connected | Endpoint contract, data owner, retention policy, success/error schema |
| Contact | Email or CRM routing destination | Validates fields; does not send | Routing address/CRM, category ownership, spam protection |
| Partner application | Secure API, document storage, review workflow, notifications | Nine-step form and review; no data sent or saved | Submission schema, required fields, upload policy, retention, reviewer and confirmation workflow |
| Tracking | Logistics tracking API | Validates reference; states live lookup unavailable | Reference lookup endpoint, auth, status schema, timestamp/location/ETA semantics, error codes |
| Partner login | Authentication provider | Validates fields; no sign-in attempt | Account provisioning, password recovery, session, MFA and access policy |
| Partner dashboard | Partner data APIs and role/tenant authorization | Access-not-connected state; no data shown | Authenticated delivery/staff/status APIs and permission model |
| Payments | SunPay partnership and integration documentation | Editorial explanation only; no transactions | Processor, custody, escrow eligibility/release, methods, currencies, fees, refunds, disputes and support roles |
| Safety | Approved product and operational policy | Careful editorial content and limitations | EMBA definition, alert sources, incident/evidence handling, access rules, escalation and emergency disclaimer approval |
| Analytics | Selected analytics provider and consent model | No analytics calls | Event plan, provider, consent configuration and privacy review |
| Downloads | Official store listings | No app-store links invented | iOS/Android URLs and confirmed availability |
| Legal | Approved policy documents | Eight draft routes | Legal review and approval for privacy, terms, community, safety, marketplace, logistics, payments and cookies |
| SEO | Official canonical domain and social metadata | Metadata and sitemap generator; no guessed domain | Set `BUZZ_SITE_URL`, approve social profiles and canonical metadata |
| Brand | Official logo, font and visual assets | Replaceable text wordmark, working palette, editorial imagery | Official logo/wordmark, fonts, real app screenshots, social links and photo rights approval |

## Current website behaviour is deliberately honest

- Waitlist/contact forms never display a success state or transmit data.
- Partner application is browser-only; it does not save/resume, upload documents or submit.
- Tracking does not return a fake “not found” or sample shipment; it explains that the live lookup service is not connected.
- Partner login does not send or store credentials.
- Partner dashboard does not show invented employees, deliveries or performance metrics.
- No payment, escrow, wallet, refund or settlement action is offered.
- Policy routes are visibly marked draft and must not be published as governing legal documents.

## SEO setup

Set `BUZZ_SITE_URL` to the approved canonical domain and run `npm run sitemap` to generate the 27-route `sitemap.xml`. The domain is intentionally not guessed.
