# Test data

**Everything here is fictional.** Phone numbers use `+234 800 000 ....`, emails use `.test`, and CAC numbers are `RC-TEST-…`. Every file has `"isTestData": true`. Never import these files directly into components. Read them through `src/lib/data/*`.

## Files

| File | Contents |
|---|---|
| `logistics/partners.json` | 4 partners (3 active, 1 suspended), company codes, per-km rates, Buzz %, modifiers, scores |
| `logistics/hubs.json` | 8 hubs / pickup points with storage fees after 5 free days |
| `logistics/riders.json` | 16 riders across partners: active, pending verification, deactivated, frozen; rider codes; company checklists |
| `logistics/parcels.json` | 30 parcels covering every status, with full timelines (batch scans, manual entries), pricing, codes, storage windows, pickup delegates |
| `logistics/batches.json` | 3 mother-QR batches with child parcels (some unlinked at stops) |
| `logistics/disputes.json` | 5 disputes with 5-day windows, chat evidence and fault/decision |
| `logistics/flags.json` | 6 red flags (off-route, other-company scan, 48h silence, no delivery code, manual entry) |
| `logistics/applications.json` | 6 partner applications across every pipeline stage |
| `logistics/payouts.json` | 14 days of payouts for Swiftline (partner paid immediately, Buzz share T+2) |
| `logistics/admin-users.json` | Admin staff and roles |
| `logistics/admin-audit-log.json` | Recent admin actions |
| `logistics/portal.json` | Partner portal: 7 staff accounts (super admins and managers for Swiftline and KwikHaul, plus an invited and a removed account), 14 days of activity per rider, today's stops for each rider on a run, and the portal activity log. Made by `gen_portal.py` |
| `logistics/partner-portal.json` | Company records for the partner portal's Company screen: CAC number, documents on file (Eastgate's insurance rejected) and the inspection breakdown (offices, hubs, fleet, records) that adds up to each partner's score. Made by `gen_partner_portal.py` |
| `logistics/rider-portal.json` | Individual rider portal for Kelechi Nwosu (`BZL-I-2087`): profile, vehicle, documents, inspection score, his own rates, 12 parcels, 2 batches, per-delivery payouts (one held by a dispute), 2 disputes and 2 flags. Made by `gen_rider_portal.py` |
| `web/chats.json` | Signed-in user, 8 chats (direct, group, Pro), order and booking cards, priority delivery notifications, security update |

## Signed-in identities for the demo
- **Partner portal:** Swiftline Logistics, company code `BZL-C-1042`. Sign in at `/logistics/portal/login` with password `Buzz-test-2026` and 2FA code `123456`:
  - `ops@swiftline.test`: Babatunde Adeyemi, **super admin**
  - `chiamaka.obi@swiftline.test`: Chiamaka Obi, **manager**
  - `ifeanyi.uzor@swiftline.test`: Ifeanyi Uzor, manager
  - `admin@kwikhaul.test`: Halima Yusuf, super admin at KwikHaul (a second company, to check isolation)
  - `grace.akpan@swiftline.test` (invited) and `femi.ojo@swiftline.test` (removed) can't sign in
  - The full list is on `/dev/test-ids`
- **Rider portal:** sign in at `/logistics/portal/login`, top card:
  - Individual rider Kelechi Nwosu: rider code `BZL-I-2087` + password `Buzz-test-2026` (or Buzz ID `@kelechi.rides`). Sees every rider screen.
  - Company rider Tunde Bakare: company code `BZL-C-1042` + rider code `R-QJGF-85`. Sees Overview, Parcels, Batches, Flags and Profile.
- **Admin console:** Ifeoma Okafor (super admin)
- **Buzz Web:** Adaeze Okeke, `@adaeze.buzz`

## Tracking IDs by status (use these on `/logistics/track/[id]`)

| Status | Tracking IDs |
|---|---|
| `booked` | `BZT-EDQE-CXER`, `BZT-GG5Y-547D` |
| `picked_up` | `BZT-J5MT-7RE6`, `BZT-L2A2-S7U5` |
| `in_transit` | `BZT-LDFM-EER3`, `BZT-V7WE-A7GE`, `BZT-AVGJ-SHGK`, `BZT-AXJS-L65A`, `BZT-RGY4-KRLM` |
| `at_pickup_point` | `BZT-2C8Q-N7YV`, `BZT-SCG5-YW5H`, `BZT-WHVV-4W3U`, `BZT-W766-P8LF` |
| `out_for_delivery` | `BZT-N293-RKAG`, `BZT-56L8-6SRT`, `BZT-PE44-X74D` |
| `delivered` | `BZT-59B2-X3L7`, `BZT-T4SF-8BDY`, `BZT-LHLV-GBV2`, `BZT-G5Z7-K5MT`, `BZT-9PYS-XTTA`, `BZT-VZ8Y-5XY7`, `BZT-UGNU-QZMV` |
| `failed_attempt` | `BZT-DS8H-E39E`, `BZT-5VDG-PPSF` |
| `returned` | `BZT-QSN5-HQKT` |
| `disputed` | `BZT-WSBF-QBTC`, `BZT-U3C7-FWSW` |
| `refused` | `BZT-U69H-BRLV` |
| `storage_expiring` | `BZT-88R7-K2NJ` |

Regenerate with `python3 gen_testdata.py` and `python3 test-data/gen_portal.py` (both seeded, so IDs stay stable). The portal's automated tests (`npm test`, in `tests/`) run against these fixtures.
