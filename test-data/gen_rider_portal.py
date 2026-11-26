"""
Seed data for the individual rider portal (DESIGN.md §10.2, individual rider
portal): one approved individual rider, Kelechi Nwosu (account a2, rider code
BZL-I-2087), with a profile, his own rates, his parcels, batches, per-delivery
payouts, disputes and flags.

An individual rider works like a one-person partner (PRODUCT.md logistics
rules), so his parcels and batches use his account id as partnerId.
Company riders' screens read the company data in parcels.json, batches.json
and flags.json instead.

Everything is fictional. The clock is the same as the other fixtures:
19 Nov 2026, 13:00 WAT. Deterministic: no randomness.

    python test-data/gen_rider_portal.py
"""
import json
import pathlib

OUT = pathlib.Path(__file__).parent / "logistics" / "rider-portal.json"
NOW = "2026-11-19T13:00:00+01:00"
RIDER = "a2"
PER_KM = 160
BUZZ_PERCENT = 3.0
MODIFIERS = {"fragile": 10, "highValueOver500k": 5, "oversize": 15}


def t(day, hhmm):
    return f"2026-11-{day:02d}T{hhmm}:00+01:00"


def price(km, mods=()):
    base = PER_KM * km
    for m in mods:
        base = base * (100 + MODIFIERS[m]) // 100
    return {"base": base, "buzzPercent": BUZZ_PERCENT, "total": round(base * (1 + BUZZ_PERCENT / 100))}


def ev(status, label, city, at, by="rider", **kw):
    e = {"status": status, "label": label, "city": city, "at": at, "by": by, "viaBatch": False, "manualEntry": False}
    e.update(kw)
    return e


def parcel(tid, order, status, item, value, seller, receiver, route, km, timeline, mods=(), batch=None, delivery="home", **extra):
    p = {
        "trackingId": tid,
        "orderId": order,
        "partnerId": RIDER,
        "riderId": RIDER,
        "status": status,
        "deliveryType": delivery,
        "item": item,
        "declaredValue": value,
        "seller": seller,
        "receiver": {"name": receiver[0], "preferredContact": receiver[1], "verificationQuestion": "Last two digits of your order ID"},
        "route": route,
        "distanceKm": km,
        "pricing": price(km, mods),
        "batchId": batch,
        "timeline": [ev("booked", "Order placed on Depot", route[0], timeline[0], by="Buzz")] + timeline[1:],
    }
    p.update(extra)
    return p


YABA, IKEJA, LEKKI, SURULERE, IKOYI, AJAH = (
    "Lagos (Yaba)", "Lagos (Ikeja)", "Lagos (Lekki)", "Lagos (Surulere)", "Lagos (Ikoyi)", "Lagos (Ajah)",
)

parcels = [
    # To collect today (booked, assigned to him, not picked up yet)
    parcel("BZT-KN2A-7Q4M", "DPT-640112", "booked", "Leather sandals", 18500, "Steps by Ada", ("Bisi O.", "buzz"),
           [YABA, LEKKI], 21, [t(19, "09:10")]),
    parcel("BZT-KN3B-8R5P", "DPT-640187", "booked", "Ceramic plates (set of 6)", 42000, "Clay & Co.", ("Emeka U.", "phone"),
           [IKEJA, SURULERE], 17, [t(19, "10:25")], mods=("fragile",)),
    # In his open batch
    parcel("BZT-KN4C-9S6Q", "DPT-639904", "in_transit", "Phone case and charger", 9500, "Gadget Hub NG", ("Tola A.", "buzz"),
           [YABA, IKOYI], 14, [t(19, "07:00"),
                               ev("picked_up", "Collected from seller", YABA, t(19, "08:05")),
                               ev("in_transit", "Linked to batch MQ-KN7TR", YABA, t(19, "08:21"), viaBatch=True)],
           batch="MQ-KN7TR"),
    parcel("BZT-KN5D-2T7R", "DPT-639951", "in_transit", "Hair products bundle", 26000, "Crown Beauty", ("Ngozi E.", "phone"),
           [YABA, LEKKI], 23, [t(19, "07:20"),
                               ev("picked_up", "Collected from seller", YABA, t(19, "08:12")),
                               ev("in_transit", "Batch MQ-KN7TR created on second scan", YABA, t(19, "08:21"), viaBatch=True)],
           batch="MQ-KN7TR"),
    parcel("BZT-KN6E-3U8S", "DPT-639977", "at_pickup_point", "Kids' school bag", 15500, "Little Steps", ("Femi K.", "buzz"),
           [YABA, SURULERE], 9, [t(19, "07:40"),
                                 ev("picked_up", "Collected from seller", YABA, t(19, "08:15")),
                                 ev("in_transit", "Linked to batch MQ-KN7TR", YABA, t(19, "08:21"), viaBatch=True),
                                 ev("at_pickup_point", "Unlinked from MQ-KN7TR at the Surulere pickup point", SURULERE, t(19, "10:02"))],
           batch="MQ-KN7TR", delivery="pickup"),
    # Out for delivery
    parcel("BZT-KN7F-4V9T", "DPT-639812", "out_for_delivery", "Wireless earbuds", 38000, "Gadget Hub NG", ("Ifeoma C.", "buzz"),
           [IKEJA, AJAH], 31, [t(18, "16:00"),
                               ev("picked_up", "Collected from seller", IKEJA, t(19, "07:30")),
                               ev("out_for_delivery", "Out for delivery", AJAH, t(19, "11:40"))]),
    # Delivered today
    parcel("BZT-KN8G-5W2U", "DPT-639701", "delivered", "Ankara fabric (6 yards)", 22000, "Stitch by Tobi", ("Halima S.", "phone"),
           [YABA, SURULERE], 9, [t(18, "15:00"),
                                 ev("picked_up", "Collected from seller", YABA, t(19, "07:05")),
                                 ev("delivered", "Delivered. Delivery code verified", SURULERE, t(19, "09:12"))],
           proof={"photo": True, "deliveryCodeVerified": True}),
    parcel("BZT-KN9H-6X3V", "DPT-639744", "delivered", "Rice cooker", 54000, "HomeBase", ("Uche N.", "buzz"),
           [IKEJA, IKOYI], 24, [t(18, "17:30"),
                                ev("picked_up", "Collected from seller", IKEJA, t(19, "07:45")),
                                ev("delivered", "Delivered. Delivery code verified", IKOYI, t(19, "11:05"))],
           proof={"photo": True, "deliveryCodeVerified": True}),
    # Failed attempt yesterday
    parcel("BZT-KM2J-7Y4W", "DPT-639390", "failed_attempt", "Office chair", 89000, "WorkWell", ("Segun A.", "phone"),
           [IKEJA, LEKKI], 29, [t(17, "12:00"),
                                ev("picked_up", "Collected from seller", IKEJA, t(18, "08:30")),
                                ev("failed_attempt", "Attempt 1: nobody home. Buyer asked to reschedule", LEKKI, t(18, "14:10"))],
           mods=("oversize",), attempts=1, nextStep="Second attempt booked for 20 Nov"),
    # Delivered earlier this week (payout history)
    parcel("BZT-KM3K-8Z5X", "DPT-638902", "delivered", "Perfume gift set", 31000, "Crown Beauty", ("Amaka P.", "buzz"),
           [YABA, LEKKI], 22, [t(17, "09:00"),
                               ev("picked_up", "Collected from seller", YABA, t(17, "11:00")),
                               ev("delivered", "Delivered. Delivery code verified", LEKKI, t(17, "13:40"))],
           proof={"photo": True, "deliveryCodeVerified": True}),
    parcel("BZT-KM4L-9A6Y", "DPT-638877", "disputed", "Smart watch", 61000, "Gadget Hub NG", ("Dayo F.", "phone"),
           [IKEJA, SURULERE], 16, [t(16, "10:00"),
                                   ev("picked_up", "Collected from seller", IKEJA, t(16, "13:00")),
                                   ev("delivered", "Delivered. Delivery code verified", SURULERE, t(16, "15:20")),
                                   ev("disputed", "Buyer opened a dispute", SURULERE, t(17, "09:30"), by="Buzz")],
           proof={"photo": True, "deliveryCodeVerified": True}),
    parcel("BZT-KM5M-2B7Z", "DPT-638650", "delivered", "Bluetooth speaker", 27500, "Gadget Hub NG", ("Kemi L.", "buzz"),
           [YABA, IKEJA], 12, [t(15, "09:00"),
                               ev("picked_up", "Collected from seller", YABA, t(15, "10:30")),
                               ev("delivered", "Delivered. Typed in by hand: QR label torn", IKEJA, t(15, "12:15"), manualEntry=True)],
           proof={"photo": True, "deliveryCodeVerified": True}),
]

batches = [
    {
        "id": "MQ-KN7TR",
        "partnerId": RIDER,
        "riderId": RIDER,
        "route": [YABA, SURULERE, IKOYI, LEKKI],
        "autoLinked": True,
        "status": "in_transit",
        "lastScan": {"city": YABA, "at": t(19, "08:21")},
        "openedAt": t(19, "08:21"),
        "children": [
            {"trackingId": "BZT-KN4C-9S6Q", "status": "in_transit", "unlinkedAt": None},
            {"trackingId": "BZT-KN5D-2T7R", "status": "in_transit", "unlinkedAt": None},
            {"trackingId": "BZT-KN6E-3U8S", "status": "at_pickup_point", "unlinkedAt": SURULERE, "unlinkedTime": t(19, "10:02")},
        ],
        "history": [
            {"event": "Mother QR MQ-KN7TR created on the second scan (BZT-KN5D-2T7R)", "city": YABA, "at": t(19, "08:21")},
            {"event": "BZT-KN4C-9S6Q linked", "city": YABA, "at": t(19, "08:21")},
            {"event": "BZT-KN6E-3U8S linked", "city": YABA, "at": t(19, "08:24")},
            {"event": "Mother scanned: 3 parcels updated to In transit", "city": YABA, "at": t(19, "08:40")},
            {"event": "BZT-KN6E-3U8S unlinked: available for pickup", "city": SURULERE, "at": t(19, "10:02")},
        ],
    },
    {
        "id": "MQ-KM4QX",
        "partnerId": RIDER,
        "riderId": RIDER,
        "route": [YABA, LEKKI],
        "autoLinked": True,
        "status": "delivered",
        "lastScan": {"city": LEKKI, "at": t(17, "13:40")},
        "openedAt": t(17, "11:00"),
        "closedAt": t(17, "13:40"),
        "children": [
            {"trackingId": "BZT-KM3K-8Z5X", "status": "delivered", "unlinkedAt": LEKKI, "unlinkedTime": t(17, "13:40")},
        ],
        "history": [
            {"event": "Mother QR MQ-KM4QX created on the second scan", "city": YABA, "at": t(17, "11:00")},
            {"event": "BZT-KM3K-8Z5X unlinked: delivered", "city": LEKKI, "at": t(17, "13:40")},
            {"event": "Batch closed: no parcels left", "city": LEKKI, "at": t(17, "13:40")},
        ],
    },
]

# One payout per delivery, paid straight after it (PRODUCT.md: individual riders
# are paid directly after each delivery; Buzz takes its percentage).
payouts = []
for p in parcels:
    delivered = next((e for e in p["timeline"] if e["status"] == "delivered"), None)
    if not delivered:
        continue
    base = p["pricing"]["base"]
    payouts.append({
        "accountId": RIDER,
        "trackingId": p["trackingId"],
        "deliveredAt": delivered["at"],
        "distanceKm": p["distanceKm"],
        "earnings": base,
        "buzzShare": round(base * BUZZ_PERCENT / 100),
        "status": "held" if p["status"] == "disputed" else "paid",
        "paidAt": None if p["status"] == "disputed" else delivered["at"],
    })
payouts.sort(key=lambda x: x["deliveredAt"], reverse=True)

disputes = [
    {
        "id": "DSP-3112",
        "trackingId": "BZT-KM4L-9A6Y",
        "orderId": "DPT-638877",
        "partnerId": RIDER,
        "reason": "Buyer says the watch box was crushed",
        "openedAt": t(17, "09:30"),
        "windowEndsAt": t(22, "09:30"),
        "status": "awaiting_partner",
        "amount": 61000,
        "faultAssigned": None,
        "decision": None,
        "evidence": {
            "chat": [
                {"from": "buyer", "name": "Dayo F.", "text": "The box was crushed on one side when it arrived", "at": t(17, "09:30")},
                {"from": "seller", "name": "Gadget Hub NG", "text": "It left our shop in perfect condition, we have photos", "at": t(17, "11:10")},
                {"from": "system", "name": "SunPay", "text": "Payment is held while this dispute is reviewed.", "at": t(17, "11:12")},
            ],
            "photos": 3,
            "deliveryCodeVerified": True,
        },
    },
    {
        "id": "DSP-3071",
        "trackingId": "BZT-KM5M-2B7Z",
        "orderId": "DPT-638650",
        "partnerId": RIDER,
        "reason": "Buyer says it arrived late",
        "openedAt": t(15, "16:00"),
        "windowEndsAt": t(20, "16:00"),
        "status": "resolved",
        "amount": 27500,
        "faultAssigned": None,
        "decision": "release",
        "evidence": {
            "chat": [
                {"from": "buyer", "name": "Kemi L.", "text": "It came two hours after the time I was told", "at": t(15, "16:00")},
                {"from": "system", "name": "SunPay", "text": "Released to the seller: delivered within the booked day.", "at": t(16, "10:00")},
            ],
            "photos": 0,
            "deliveryCodeVerified": True,
        },
    },
]

flags = [
    {"id": "FLG-310", "type": "manual_entry", "label": "Tracking ID typed in by hand at delivery (QR label torn)",
     "trackingId": "BZT-KM5M-2B7Z", "partnerId": RIDER, "riderId": RIDER, "raisedAt": t(15, "12:15"), "status": "open"},
    {"id": "FLG-302", "type": "off_route", "label": "Scan 9 km off the expected route",
     "trackingId": "BZT-KM3K-8Z5X", "partnerId": RIDER, "riderId": RIDER, "raisedAt": t(17, "12:30"), "status": "reviewed"},
]

profiles = [{
    "accountId": RIDER,
    "phone": "+234 800 000 4521",
    "area": "Lagos (Yaba and nearby)",
    "vehicle": {"type": "Motorbike", "model": "Bajaj Boxer 150", "year": 2022, "plate": "TEST-482-KJA"},
    "documents": [
        {"name": "Vehicle licence", "status": "approved", "uploadedAt": t(9, "10:00").replace("-11-", "-10-")},
        {"name": "Proof of ownership", "status": "approved", "uploadedAt": t(9, "10:05").replace("-11-", "-10-")},
        {"name": "Rider's permit", "status": "approved", "uploadedAt": t(9, "10:08").replace("-11-", "-10-")},
        {"name": "Rider agreement (signed)", "status": "approved", "uploadedAt": t(9, "10:12").replace("-11-", "-10-")},
        {"name": "Data protection addendum (signed)", "status": "approved", "uploadedAt": t(9, "10:13").replace("-11-", "-10-")},
    ],
    "inspection": {
        "at": "2026-10-16T11:00:00+01:00",
        "score": 86,
        "breakdown": [
            {"label": "Vehicle condition", "score": 88},
            {"label": "Papers", "score": 92},
            {"label": "Safety gear", "score": 78},
        ],
    },
    "rating": 4.7,
    "joined": "2026-10-17",
}]

rates = [{
    "accountId": RIDER,
    "perKm": PER_KM,
    "buzzPercent": BUZZ_PERCENT,
    "modifiers": MODIFIERS,
    "agreedAt": "2026-10-17",
}]

data = {
    "isTestData": True,
    "generated": NOW,
    "profiles": profiles,
    "rates": rates,
    "parcels": parcels,
    "batches": batches,
    "payouts": payouts,
    "disputes": disputes,
    "flags": flags,
}
OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"wrote {OUT}: {len(parcels)} parcels, {len(batches)} batches, {len(payouts)} payouts, {len(disputes)} disputes, {len(flags)} flags")
