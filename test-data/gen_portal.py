"""
Seed data for the partner portal: staff accounts (super admin + managers),
14 days of rider activity, today's stops per rider and the portal activity log.

Everything here is fictional and temporary. It sits beside the fixtures made by
gen_testdata.py and refers to their ids (p1/p2 partners, r1..r10 riders, real
tracking IDs where a rider has them). Seeded, so output is stable.

    python test-data/gen_portal.py
"""
import datetime as dt
import json
import os
import random

random.seed(1042)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "logistics", "portal.json")

# Same "now" as the other fixtures, so everything lines up.
NOW = dt.datetime(2026, 11, 19, 13, 0)
TODAY = NOW.date()


def iso(d):
    return d.strftime("%Y-%m-%dT%H:%M:00+01:00")


def at(hour, minute=0, day=TODAY):
    return iso(dt.datetime.combine(day, dt.time(hour, minute)))


AL = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def code(n):
    return "".join(random.choice(AL) for _ in range(n))


def fake_tracking():
    return f"BZT-{code(4)}-{code(4)}"


# ---------------------------------------------------------------- staff
# One password and one 2FA code for every test account. Real accounts get
# hashed passwords and TOTP secrets from the auth service, never fixtures.
TEST_CREDENTIALS = {"password": "Buzz-test-2026", "code": "123456"}

staff = [
    {"id": "u1", "partnerId": "p1", "name": "Babatunde Adeyemi", "email": "ops@swiftline.test",
     "role": "super_admin", "status": "active", "addedAt": "2026-10-02", "lastSignInAt": at(8, 2)},
    {"id": "u2", "partnerId": "p1", "name": "Chiamaka Obi", "email": "chiamaka.obi@swiftline.test",
     "role": "manager", "status": "active", "addedAt": "2026-10-04", "lastSignInAt": at(7, 41)},
    {"id": "u3", "partnerId": "p1", "name": "Ifeanyi Uzor", "email": "ifeanyi.uzor@swiftline.test",
     "role": "manager", "status": "active", "addedAt": "2026-10-20", "lastSignInAt": at(18, 15, TODAY - dt.timedelta(days=1))},
    {"id": "u4", "partnerId": "p1", "name": "Grace Akpan", "email": "grace.akpan@swiftline.test",
     "role": "manager", "status": "invited", "addedAt": "2026-11-18", "lastSignInAt": None},
    {"id": "u5", "partnerId": "p1", "name": "Femi Ojo", "email": "femi.ojo@swiftline.test",
     "role": "manager", "status": "removed", "addedAt": "2026-10-05", "lastSignInAt": at(16, 30, TODAY - dt.timedelta(days=9)),
     "removedAt": at(10, 5, TODAY - dt.timedelta(days=8))},
    # A second company, so tests can prove one partner never sees another's data.
    {"id": "u6", "partnerId": "p2", "name": "Halima Yusuf", "email": "admin@kwikhaul.test",
     "role": "super_admin", "status": "active", "addedAt": "2026-10-11", "lastSignInAt": at(9, 12)},
    {"id": "u7", "partnerId": "p2", "name": "Tobi Martins", "email": "tobi.martins@kwikhaul.test",
     "role": "manager", "status": "active", "addedAt": "2026-10-12", "lastSignInAt": at(8, 55)},
]

# ---------------------------------------------------------------- other accounts
# Sign-in accounts that aren't approved company staff: companies still in
# review (tied to an application in applications.json) and individual riders.
# Pending accounts can sign in, but only reach the review status page.
# Individual riders sign in with rider code + password, or with their Buzz ID
# (confirmed in the Buzz app). A pending rider has no rider code yet, so they
# use their Buzz ID. Company riders sign in with company code + rider code
# from riders.json.
accounts = [
    {"id": "a1", "accountType": "company", "name": "Musa Garba", "email": "ops@greenline.test",
     "company": "Greenline Dispatch", "applicationId": "APP-295", "status": "pending_review",
     "riderCode": None, "buzzId": None, "createdAt": "2026-11-12"},
    {"id": "a2", "accountType": "individual", "name": "Kelechi Nwosu", "email": "kelechi.nwosu@rider.test",
     "company": None, "applicationId": None, "status": "active",
     "riderCode": "BZL-I-2087", "buzzId": "@kelechi.rides", "createdAt": "2026-10-09"},
    {"id": "a3", "accountType": "individual", "name": "Aisha Bello", "email": "aisha.bello@rider.test",
     "company": None, "applicationId": None, "status": "pending_review",
     "riderCode": None, "buzzId": "@aisha.bello", "createdAt": "2026-11-17"},
]

# Where each pending account is in review (the review status page).
# Inspection places are placeholders until real addresses are confirmed.
reviews = {
    "a1": {"receivedAt": "2026-11-15T13:00:00+01:00", "documents": "checked", "documentsCheckedAt": "2026-11-18T10:00:00+01:00",
           "inspection": {"at": "2026-11-24T10:00:00+01:00", "place": "Your offices, hubs and fleet, at the address on your application"}, "score": None},
    "a3": {"receivedAt": "2026-11-17T09:30:00+01:00", "documents": "received", "documentsCheckedAt": None,
           "inspection": {"at": "2026-11-26T14:00:00+01:00", "place": "[Inspection address]"}, "score": None},
}
for a in accounts:
    if a["id"] in reviews:
        a["review"] = reviews[a["id"]]

# ---------------------------------------------------------------- rider activity
# Per rider: (start date, deliveries/day range, fail chance, km/drop, profile end date)
profiles = {
    "r1": dict(start="2026-10-17", drops=(3, 7), fail=0.16, km=9, late=0.22),
    "r2": dict(start="2026-11-11", drops=(9, 15), fail=0.05, km=7, late=0.06),
    "r3": dict(start="2026-11-09", drops=(4, 8), fail=0.09, km=14, late=0.12),
    "r4": dict(start="2026-10-02", drops=(1, 4), fail=0.06, km=110, late=0.10),
    "r6": dict(start="2026-10-18", drops=(3, 8), fail=0.10, km=10, late=0.14, end="2026-11-12"),
    "r7": dict(start="2026-10-02", drops=(8, 14), fail=0.07, km=8, late=0.09),
    "r8": dict(start="2026-11-05", drops=(7, 12), fail=0.08, km=8, late=0.11),
    "r9": dict(start="2026-10-17", drops=(5, 10), fail=0.10, km=9, late=0.15),
}
scans_today = {"r1": 3, "r2": 27, "r3": 6, "r4": 14, "r7": 27, "r8": 23, "r9": 15}

activity = []
for rider_id, p in profiles.items():
    start = dt.date.fromisoformat(p["start"])
    end = dt.date.fromisoformat(p["end"]) if "end" in p else TODAY
    days = []
    for back in range(13, -1, -1):
        day = TODAY - dt.timedelta(days=back)
        if day < start or day > end:
            continue
        # Sundays are quieter
        lo, hi = p["drops"]
        if day.weekday() == 6:
            lo, hi = max(0, lo - 3), max(1, hi - 5)
        attempts = random.randint(lo, hi)
        if day == TODAY:  # the day is only half done
            attempts = max(1, attempts // 2)
        failed = sum(1 for _ in range(attempts) if random.random() < p["fail"])
        delivered = attempts - failed
        late = sum(1 for _ in range(delivered) if random.random() < p["late"])
        scans = delivered * 2 + failed * 2 + random.randint(0, 4)
        if day == TODAY and rider_id in scans_today:
            scans = scans_today[rider_id]
        days.append({
            "date": day.isoformat(),
            "delivered": delivered,
            "failed": failed,
            "onTime": delivered - late,
            "scans": scans,
            "km": round(attempts * p["km"] * random.uniform(0.8, 1.2)),
            "hoursOnline": round(random.uniform(5.5, 10.5) if attempts else 0, 1),
        })
    activity.append({"riderId": rider_id, "days": days})

# ---------------------------------------------------------------- today's stops
AREAS = {
    "Lagos (Ikeja)": ["Allen Avenue", "Opebi", "Alausa", "Oregun", "GRA Ikeja", "Agidingbi"],
    "Lagos (Yaba)": ["Sabo", "Onike", "Akoka", "Herbert Macaulay Way"],
    "Lagos (Lekki)": ["Lekki Phase 1", "Admiralty Way", "Chevron Drive", "Ikate"],
    "Abeokuta": ["Kuto", "Panseke", "Oke-Ilewo"],
    "Ibadan": ["Bodija", "Ring Road", "Dugbe"],
    "Benin City": ["Ugbowo", "GRA Benin", "Ring Road Benin"],
}
NAMES = ["Adaeze O.", "Tolu A.", "Kemi D.", "Uche N.", "Bola S.", "Hauwa B.", "Ngozi A.", "Seyi F.",
         "Zainab Y.", "Chuka E.", "Ola S.", "Amina K.", "Efe I.", "Bisi F.", "Gbenga T.", "Nkechi I."]

# Real parcels a rider is carrying today, so stops link to the parcel record.
real = {
    "r1": [("BZT-J5MT-7RE6", "pickup", "Lagos (Ikeja)", "Hauwa B."), ("BZT-AXJS-L65A", "drop", "Abeokuta", "Ngozi A.")],
    "r2": [("BZT-T4SF-8BDY", "drop", "Abeokuta", "Ola S."), ("BZT-PE44-X74D", "drop", "Lagos (Ikeja)", "Bisi F.")],
    "r4": [("BZT-SCG5-YW5H", "hub", "Ibadan", None)],
    "r8": [("BZT-W766-P8LF", "hub", "Lagos (Ikeja)", None)],
    "r9": [("BZT-56L8-6SRT", "drop", "Lagos (Ikeja)", "Ifeanyi N.")],
}
home_city = {"r1": "Lagos (Ikeja)", "r2": "Lagos (Ikeja)", "r3": "Lagos (Ikeja)", "r4": "Ibadan",
             "r7": "Lagos (Yaba)", "r8": "Lagos (Lekki)", "r9": "Lagos (Ikeja)"}
hub_for = {"p1": ("Swiftline Ikeja Hub", "Lagos (Ikeja)"), "p2": ("KwikHaul Yaba", "Lagos (Yaba)")}
partner_of = {"r1": "p1", "r2": "p1", "r3": "p1", "r4": "p1", "r7": "p2", "r8": "p2", "r9": "p2"}
plan = {"r1": 6, "r2": 12, "r3": 7, "r4": 4, "r7": 11, "r8": 9, "r9": 8}

stops = []
FAIL_REASONS = ["Receiver not at address", "Receiver asked to come back tomorrow", "Gate locked, no answer"]
for rider_id, total in plan.items():
    hub_name, hub_city = hub_for[partner_of[rider_id]]
    city = home_city[rider_id]
    seq_items = [{"kind": "hub", "place": hub_name, "city": hub_city, "trackingId": None, "receiverName": None}]
    for tid, kind, c, rname in real.get(rider_id, []):
        place = hub_name if kind == "hub" else random.choice(AREAS[c])
        seq_items.append({"kind": kind, "place": place, "city": c, "trackingId": tid, "receiverName": rname if kind == "drop" else None})
    while len(seq_items) < total:
        kind = random.choice(["pickup", "drop", "drop", "drop"])
        seq_items.append({"kind": kind, "place": random.choice(AREAS[city]), "city": city,
                          "trackingId": fake_tracking(), "receiverName": random.choice(NAMES) if kind == "drop" else None})
    # Progress through the day: done → (one current) → upcoming
    done_n = {"r1": 2, "r2": 8, "r3": 3, "r4": 2, "r7": 7, "r8": 6, "r9": 4}[rider_id]
    clock = dt.datetime.combine(TODAY, dt.time(7, 30))
    for i, s in enumerate(seq_items):
        clock += dt.timedelta(minutes=random.randint(25, 55) if s["kind"] != "hub" else 20)
        if i < done_n:
            status = "done"
            if s["kind"] == "drop" and random.random() < 0.18:
                status = "failed"
        elif i == done_n:
            status = "current"
        else:
            status = "upcoming"
        stops.append({
            "id": f"s-{rider_id}-{i + 1}",
            "riderId": rider_id,
            "seq": i + 1,
            **s,
            "status": status,
            "plannedAt": iso(clock),
            "doneAt": iso(clock + dt.timedelta(minutes=random.randint(-6, 14))) if status in ("done", "failed") else None,
            "note": random.choice(FAIL_REASONS) if status == "failed" else None,
        })

# ---------------------------------------------------------------- activity log
log = [
    {"at": at(8, 2), "partnerId": "p1", "actorId": "u1", "action": "signed_in", "summary": "Signed in"},
    {"at": at(7, 41), "partnerId": "p1", "actorId": "u2", "action": "signed_in", "summary": "Signed in"},
    {"at": at(16, 10, TODAY - dt.timedelta(days=1)), "partnerId": "p1", "actorId": "u1", "action": "team_invited",
     "summary": "Invited Grace Akpan as a manager"},
    {"at": at(11, 20, TODAY - dt.timedelta(days=7)), "partnerId": "p1", "actorId": "u2", "action": "rider_registered",
     "summary": "Registered rider Kelechi Nnaji (waiting for verification)", "riderId": "r5"},
    {"at": at(9, 48, TODAY - dt.timedelta(days=7)), "partnerId": "p1", "actorId": "u1", "action": "rider_deactivated",
     "summary": "Deactivated rider Yusuf Lawal: Left the company", "riderId": "r6"},
    {"at": at(10, 5, TODAY - dt.timedelta(days=8)), "partnerId": "p1", "actorId": "u1", "action": "team_removed",
     "summary": "Removed Femi Ojo from the team"},
    {"at": at(14, 2, TODAY - dt.timedelta(days=10)), "partnerId": "p1", "actorId": "u3", "action": "rider_registered",
     "summary": "Registered rider Emeka Okoro", "riderId": "r3"},
    {"at": at(9, 12), "partnerId": "p2", "actorId": "u6", "action": "signed_in", "summary": "Signed in"},
]
log.sort(key=lambda e: e["at"], reverse=True)
for i, e in enumerate(log):
    e["id"] = f"act-{i + 1:03d}"

data = {
    "isTestData": True,
    "generated": iso(NOW),
    "now": iso(NOW),
    "testCredentials": TEST_CREDENTIALS,
    "staff": staff,
    "accounts": accounts,
    "riderActivity": activity,
    "stops": stops,
    "activityLog": log,
}
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"wrote {OUT}: {len(staff)} staff, {len(accounts)} other accounts, {len(activity)} riders' activity, {len(stops)} stops, {len(log)} log entries")
