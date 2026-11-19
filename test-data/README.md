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
| `web/chats.json` | Signed-in user, 8 chats (direct, group, Pro), order and booking cards, priority delivery notifications, security update |

## Signed-in identities for the demo
- **Partner portal:** Swiftline Logistics, company code `BZL-C-1042`
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

Regenerate with `python3 gen_testdata.py` (seeded, so IDs stay stable).
