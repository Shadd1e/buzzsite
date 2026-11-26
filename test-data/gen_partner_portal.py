"""
Company records for the partner portal's Company screen (DESIGN.md §10.2):
registration details, the signed documents on file, and the physical
inspection with its score breakdown (offices, hubs, fleet, records).

The overall score matches inspectionScore in partners.json. Everything is
fictional: CAC numbers are RC-TEST-..., addresses are placeholders.

    python test-data/gen_partner_portal.py
"""
import json
import pathlib

OUT = pathlib.Path(__file__).parent / "logistics" / "partner-portal.json"
NOW = "2026-11-19T13:00:00+01:00"
partners = json.loads((pathlib.Path(__file__).parent / "logistics" / "partners.json").read_text(encoding="utf-8"))["items"]

# Breakdown weights add up to 100; each part is scored out of 100.
WEIGHTS = [("Offices", 20), ("Hubs and pickup points", 30), ("Fleet", 35), ("Records and insurance", 15)]
# Per-partner offsets so breakdowns differ but average to the overall score
OFFSETS = {"p1": [4, -2, 1, -4], "p2": [-3, 5, -2, 1], "p3": [2, 1, -3, 4], "p4": [-6, -4, 6, 2]}
CAC = {"p1": "RC-TEST-00142", "p2": "RC-TEST-00143", "p3": "RC-TEST-00151", "p4": "RC-TEST-00147"}
INSPECTED = {"p1": "2026-07-14T10:00:00+01:00", "p2": "2026-08-02T11:00:00+01:00", "p3": "2026-08-20T10:30:00+01:00", "p4": "2026-06-11T09:00:00+01:00"}


def breakdown(pid, score):
    parts = []
    for (label, weight), off in zip(WEIGHTS, OFFSETS[pid]):
        parts.append({"label": label, "weight": weight, "score": max(0, min(100, score + off))})
    # Nudge the largest part so the weighted total equals the overall score exactly
    total = sum(p["score"] * p["weight"] for p in parts) / 100
    parts[2]["score"] = max(0, min(100, round(parts[2]["score"] + (score - total) * 100 / parts[2]["weight"])))
    return parts


profiles = []
for p in partners:
    pid = p["id"]
    profiles.append({
        "partnerId": pid,
        "cac": CAC[pid],
        "address": f"[{p['name']} head office address]",
        "documents": [
            {"name": "Partner agreement (signed)", "status": "approved", "uploadedAt": "2026-06-20T10:00:00+01:00"},
            {"name": "Data protection addendum (signed)", "status": "approved", "uploadedAt": "2026-06-20T10:02:00+01:00"},
            {"name": "Rider verification declaration (signed)", "status": "approved", "uploadedAt": "2026-06-20T10:04:00+01:00"},
            {"name": "CAC certificate", "status": "approved", "uploadedAt": "2026-06-18T15:30:00+01:00"},
            {"name": "Goods-in-transit insurance", "status": "approved" if pid != "p4" else "rejected", "uploadedAt": "2026-06-18T15:34:00+01:00",
             **({"note": "Expired on 30 Oct 2026. Upload the renewed policy."} if pid == "p4" else {})},
        ],
        "inspection": {"at": INSPECTED[pid], "score": p["inspectionScore"], "breakdown": breakdown(pid, p["inspectionScore"])},
    })

data = {"isTestData": True, "generated": NOW, "companies": profiles}
OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"wrote {OUT}: {len(profiles)} companies")
