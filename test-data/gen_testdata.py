import json, random, os, datetime as dt
random.seed(42)
OUT = "/home/claude/kit/test-data"
L = OUT + "/logistics"; W = OUT + "/web"
os.makedirs(L, exist_ok=True); os.makedirs(W, exist_ok=True)
NOW = dt.datetime(2026, 11, 19, 13, 0)
def iso(d): return d.strftime("%Y-%m-%dT%H:%M:00+01:00")
def phone(): return "+234 800 000 " + str(random.randint(1000, 9999))
AL = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
def code(n): return "".join(random.choice(AL) for _ in range(n))
def dump(path, data): json.dump({"isTestData": True, "generated": iso(NOW), "items": data}, open(path, "w"), indent=2, ensure_ascii=False)

CITIES = {"Lagos (Ikeja)":(6.60,3.35),"Lagos (Yaba)":(6.51,3.38),"Lagos (Lekki)":(6.44,3.47),"Ibadan":(7.38,3.95),"Abeokuta":(7.15,3.35),"Benin City":(6.34,5.63),"Onitsha":(6.15,6.79),"Enugu":(6.46,7.55),"Abuja":(9.06,7.49),"Port Harcourt":(4.82,7.03),"Kano":(12.0,8.52),"Seme border":(6.37,2.71),"Cotonou (Benin Rep.)":(6.37,2.39),"Accra (Ghana)":(5.60,-0.19)}

partners = [
 {"id":"p1","name":"Swiftline Logistics","companyCode":"BZL-C-1042","status":"active","services":["intrastate","interstate"],"states":["Lagos","Ogun","Oyo","Edo","Anambra","FCT"],"baseRatePerKm":180,"buzzPercent":3.0,"modifiers":{"fragile":15,"highValueOver500k":10,"oversize":20},"inspectionScore":86,"rating":4.6,"riders":0,"joined":"2026-10-02","contact":{"name":"Babatunde Adeyemi","email":"ops@swiftline.test","phone":phone()},"payoutBank":"Test Bank •••• 4410","settlement":"T+2"},
 {"id":"p2","name":"KwikHaul Couriers","companyCode":"BZL-C-1043","status":"active","services":["intrastate"],"states":["Lagos"],"baseRatePerKm":150,"buzzPercent":2.5,"modifiers":{"fragile":10,"highValueOver500k":10,"oversize":15},"inspectionScore":78,"rating":4.3,"riders":0,"joined":"2026-10-11","contact":{"name":"Chiamaka Eze","email":"hello@kwikhaul.test","phone":phone()},"payoutBank":"Test Bank •••• 0927","settlement":"immediate"},
 {"id":"p3","name":"PanAfrica Express","companyCode":"BZL-C-1051","status":"active","services":["interstate","international"],"states":["Lagos","FCT","Rivers","Kano"],"countries":["Benin Republic","Ghana","Togo"],"baseRatePerKm":220,"buzzPercent":3.0,"modifiers":{"fragile":20,"highValueOver500k":15,"oversize":25},"inspectionScore":91,"rating":4.8,"riders":0,"joined":"2026-10-20","contact":{"name":"Kwame Mensah","email":"partners@panafrica.test","phone":phone()},"payoutBank":"Test Bank •••• 7731","settlement":"T+2"},
 {"id":"p4","name":"Eastgate Dispatch","companyCode":"BZL-C-1047","status":"suspended","suspendedReason":"Score fell below 60 after repeated failed deliveries (review open)","services":["intrastate","interstate"],"states":["Anambra","Enugu"],"baseRatePerKm":140,"buzzPercent":3.0,"modifiers":{"fragile":10,"highValueOver500k":5,"oversize":10},"inspectionScore":57,"rating":3.4,"riders":0,"joined":"2026-10-08","contact":{"name":"Obinna Nwosu","email":"info@eastgate.test","phone":phone()},"payoutBank":"Test Bank •••• 3388","settlement":"T+2"},
]

hubs = [
 {"id":"h1","partnerId":"p1","name":"Swiftline Ikeja Hub","city":"Lagos (Ikeja)","address":"12 Test Close, Ikeja, Lagos","hours":"Mon–Sat 8:00–19:00","pickupPoint":True,"storageFeePerDayAfterFree":500},
 {"id":"h2","partnerId":"p1","name":"Swiftline Benin Hub","city":"Benin City","address":"4 Sample Road, Benin City","hours":"Mon–Sat 8:00–18:00","pickupPoint":True,"storageFeePerDayAfterFree":400},
 {"id":"h3","partnerId":"p1","name":"Swiftline Abuja Hub","city":"Abuja","address":"Plot 9 Demo Avenue, Wuse, Abuja","hours":"Mon–Sat 8:00–19:00","pickupPoint":True,"storageFeePerDayAfterFree":600},
 {"id":"h4","partnerId":"p2","name":"KwikHaul Yaba","city":"Lagos (Yaba)","address":"22 Placeholder Street, Yaba, Lagos","hours":"Mon–Sun 9:00–20:00","pickupPoint":True,"storageFeePerDayAfterFree":300},
 {"id":"h5","partnerId":"p2","name":"KwikHaul Lekki","city":"Lagos (Lekki)","address":"7 Example Way, Lekki Phase 1","hours":"Mon–Sun 9:00–20:00","pickupPoint":True,"storageFeePerDayAfterFree":300},
 {"id":"h6","partnerId":"p3","name":"PanAfrica Lagos Gateway","city":"Lagos (Ikeja)","address":"Cargo Terminal Test Shed 3, Ikeja","hours":"Mon–Fri 8:00–18:00","pickupPoint":False,"storageFeePerDayAfterFree":0},
 {"id":"h7","partnerId":"p3","name":"PanAfrica Accra","city":"Accra (Ghana)","address":"15 Demo Lane, Osu, Accra","hours":"Mon–Fri 8:00–17:00","pickupPoint":True,"storageFeePerDayAfterFree":0},
 {"id":"h8","partnerId":"p3","name":"PanAfrica Port Harcourt","city":"Port Harcourt","address":"3 Trial Road, GRA, Port Harcourt","hours":"Mon–Sat 8:00–18:00","pickupPoint":True,"storageFeePerDayAfterFree":500},
]

FIRST = ["Tunde","Musa","Emeka","Sani","Kelechi","Yusuf","Segun","Ibrahim","Chidi","Femi","Bashir","Uche","Kofi","Daniel","Ahmed","Joseph"]
LAST = ["Bakare","Abdullahi","Okoro","Danjuma","Nnaji","Lawal","Ogunleye","Garba","Obi","Adebayo","Usman","Ike","Asante","Peters","Bello","Etim"]
riders = []
spread = [("p1",6),("p2",4),("p3",4),("p4",2)]
i = 0
for pid, n in spread:
    for k in range(n):
        st = "active"
        if pid=="p1" and k==4: st="pending_verification"
        if pid=="p1" and k==5: st="deactivated"
        if pid=="p2" and k==3: st="pending_verification"
        if pid=="p4": st="frozen" if k==0 else "active"
        pc = [p for p in partners if p["id"]==pid][0]
        r = {"id":f"r{i+1}","partnerId":pid,"name":f"{FIRST[i]} {LAST[i]}","riderCode":f"R-{code(4)}-{random.randint(10,99)}","phone":phone(),
             "vehicle":random.choice(["Motorbike","Motorbike","Van","Car","Truck"]),"status":st,
             "verification":{"confirmedByCompany": st not in ("pending_verification",),"companyChecks":[{"label":"Government ID seen","done":st!="pending_verification"},{"label":"Guarantor form","done":st!="pending_verification"},{"label":"Rider's licence","done":True}]},
             "appSignedIn": st=="active","scansToday": random.randint(3,28) if st=="active" else 0,"rating": round(random.uniform(3.9,4.9),1) if st!="pending_verification" else None,
             "joined": f"2026-{random.choice(['10','11'])}-{random.randint(1,18):02d}"}
        if st=="deactivated": r["deactivatedAt"]="2026-11-12"; r["deactivatedReason"]="Left the company"
        if st=="frozen": r["frozenBy"]="Buzz admin (emergency freeze)"; r["frozenReason"]="Scans from a device linked to another company"
        riders.append(r); i += 1
for p in partners: p["riders"] = len([r for r in riders if r["partnerId"]==p["id"]])

ITEMS = [("Ankara two-piece set",28500,"Ada's Fabrics"),("Wireless earbuds",19900,"GadgetHub NG"),("Leather sandals, size 42",24000,"Kano Leatherworks"),("Hair growth oil (3 pack)",12500,"Naturally Kemi"),("Phone case + screen guard",6500,"GadgetHub NG"),("Hand-woven aso-oke",85000,"Iseyin Looms"),("Blender, 1.5L",42000,"HomeEase"),("Men's kaftan, custom",55000,"Stitch by Tobi"),("Shea butter, 1kg",9000,"Naturally Kemi"),("Laptop bag",31000,"Carry Co."),("Kids' school shoes",17500,"Little Steps"),("Smart watch",64000,"GadgetHub NG"),("Bead necklace set",22000,"Beads by Funke"),("Rice cooker",48000,"HomeEase"),("Perfume oil set",15000,"Scent Lagos")]
BUYERS = ["Ngozi A.","Tobi O.","Aisha M.","Chuka E.","Bisi F.","Ifeanyi N.","Hauwa B.","Kemi D.","Efe U.","Zainab Y.","Ola S.","Nkechi I.","Gbenga T.","Amina K.","Yaw B."]
def pc_of(pid): return [p for p in partners if p["id"]==pid][0]
def rider_of(pid):
    rs=[r for r in riders if r["partnerId"]==pid and r["status"]=="active"]; return random.choice(rs)["id"] if rs else None

ROUTES = {
 "p1":[["Lagos (Ikeja)","Ibadan"],["Lagos (Ikeja)","Benin City","Onitsha"],["Lagos (Ikeja)","Benin City","Abuja"],["Lagos (Ikeja)","Abeokuta"]],
 "p2":[["Lagos (Yaba)","Lagos (Lekki)"],["Lagos (Lekki)","Lagos (Ikeja)"],["Lagos (Ikeja)","Lagos (Yaba)"]],
 "p3":[["Lagos (Ikeja)","Seme border","Cotonou (Benin Rep.)"],["Lagos (Ikeja)","Seme border","Accra (Ghana)"],["Lagos (Ikeja)","Port Harcourt"],["Abuja","Kano"]],
 "p4":[["Onitsha","Enugu"]]
}
STATES = [("booked",2),("picked_up",2),("in_transit",5),("at_pickup_point",4),("out_for_delivery",3),("delivered",7),("failed_attempt",2),("returned",1),("disputed",2),("refused",1),("storage_expiring",1)]
parcels = []; n = 0
for state, count in STATES:
    for _ in range(count):
        n += 1
        pid = random.choice(["p1","p1","p2","p3"]) if state!="refused" else "p4"
        route = random.choice(ROUTES[pid])
        item, price, seller = random.choice(ITEMS)
        start = NOW - dt.timedelta(days=random.randint(1,6), hours=random.randint(0,10))
        tid = f"BZT-{code(4)}-{code(4)}"
        rid = rider_of(pid)
        delivery = random.choice(["home","pickup"])
        tl = [{"status":"booked","label":"Order placed on Depot","city":route[0],"at":iso(start),"by":"Buzz"}]
        t = start + dt.timedelta(hours=random.randint(3,18))
        def add(stt,label,city,by="rider",batch=False,manual=False):
            global t
            tl.append({"status":stt,"label":label,"city":city,"at":iso(t),"by":by,"viaBatch":batch,"manualEntry":manual}); t += dt.timedelta(hours=random.randint(4,20))
        order = ["booked","picked_up","in_transit","at_pickup_point","out_for_delivery","delivered"]
        reach = {"booked":0,"picked_up":1,"in_transit":2,"at_pickup_point":3,"out_for_delivery":4,"delivered":5,"failed_attempt":4,"returned":5,"disputed":5,"refused":4,"storage_expiring":3}[state]
        if reach>=1: add("picked_up","Label printed and collected from seller",route[0])
        if reach>=2:
            for c in route[1:-1] or [route[0]]:
                add("in_transit",f"Scanned at checkpoint",c,batch=random.random()<.6)
        final_city = route[-1]
        if delivery=="pickup" or state in ("at_pickup_point","storage_expiring"):
            delivery = "pickup" if state in ("at_pickup_point","storage_expiring") else delivery
        if reach>=3 and delivery=="pickup":
            add("at_pickup_point","Unlinked from batch. Available for pickup",final_city,batch=True)
        if reach>=4 and delivery=="home" and state not in ("refused",):
            add("out_for_delivery","Out for delivery",final_city)
        status = state
        extra = {}
        if state=="failed_attempt":
            delivery="home"; add("failed_attempt","Delivery attempt 1 failed: receiver not home",final_city); extra["attempts"]=1; extra["nextStep"]="Buyer to reschedule, change address or switch to pickup"
        if state=="delivered":
            if delivery=="pickup": add("delivered","Collected with pickup code",final_city,by="hub")
            else: add("delivered","Delivered. Delivery code verified",final_city)
            extra["proof"]={"photo":True,"deliveryCodeVerified":True}
            extra["escrow"]={"status":random.choice(["released","held_dispute_window"]),"autoReleaseAt":iso(t+dt.timedelta(days=5))}
        if state=="returned":
            add("failed_attempt","Delivery attempt 2 failed: address not found",final_city); add("at_pickup_point","Moved to pickup point after 2 attempts",final_city); add("returned","Not collected within 10 days. Returned to seller",route[0],by="hub"); delivery="home"
        if state=="disputed":
            add("delivered","Delivered. Delivery code verified",final_city); add("disputed","Buyer opened a dispute: item not as described",final_city,by="buyer")
            extra["escrow"]={"status":"held_dispute","disputeId":None}
        if state=="refused":
            add("refused","Receiver refused the parcel (photo recorded)",final_city); delivery="home"
        if state=="storage_expiring":
            extra["storage"]={"freeDays":5,"dayNumber":5,"feeAfter":500,"returnAfterDays":10}
        if state=="at_pickup_point":
            extra["storage"]={"freeDays":5,"dayNumber":random.randint(1,3),"feeAfter":500,"returnAfterDays":10}
            if random.random()<.5: extra["pickupDelegate"]={"name":random.choice(["Femi Ade","Grace Obi","Musa Ali"]),"codeActive":True,"codeExpiresAt":iso(NOW+dt.timedelta(days=3))}
        dist = random.randint(12,780) if pid!="p2" else random.randint(5,35)
        pc = pc_of(pid)
        base = dist*pc["baseRatePerKm"]
        fee = round(base*(1+pc["buzzPercent"]/100))
        parcels.append({"trackingId":tid,"orderId":f"DPT-{random.randint(100000,999999)}","partnerId":pid,"riderId":rid if reach>=1 else None,"status":status,"deliveryType":delivery,
            "item":item,"declaredValue":price,"seller":seller,"receiver":{"name":random.choice(BUYERS),"preferredContact":random.choice(["buzz","phone"]),"verificationQuestion":"Last two digits of your order ID"},
            "route":route,"distanceKm":dist,"pricing":{"base":base,"buzzPercent":pc["buzzPercent"],"total":fee},"batchId":None,"timeline":tl,**extra})

# batches: link in-transit parcels of p1 and p3
batches=[]
for b,(pid,route) in enumerate([("p1",["Lagos (Ikeja)","Benin City","Abuja"]),("p1",["Lagos (Ikeja)","Benin City","Onitsha"]),("p3",["Lagos (Ikeja)","Seme border","Accra (Ghana)"])]):
    mid=f"MQ-{code(5)}"
    kids=[p for p in parcels if p["partnerId"]==pid and p["status"] in ("in_transit","picked_up","at_pickup_point") and p["batchId"] is None][:4]
    if len(kids)<3:
        kids += [p for p in parcels if p["status"] in ("in_transit","picked_up","at_pickup_point","out_for_delivery") and p["batchId"] is None and p not in kids][:3-len(kids)]
        for k in kids: k["partnerId"]=pid; k["route"]=route
    for k in kids: k["batchId"]=mid
    batches.append({"id":mid,"partnerId":pid,"riderId":rider_of(pid),"route":route,"autoLinked":True,"status":"in_transit" if b<2 else "at_checkpoint",
        "lastScan":{"city":route[1],"at":iso(NOW-dt.timedelta(hours=random.randint(1,9)))},
        "children":[{"trackingId":k["trackingId"],"status":k["status"],"unlinkedAt": k["route"][-1] if k["status"]=="at_pickup_point" else None} for k in kids]})

disputes=[]
dp=[p for p in parcels if p["status"]=="disputed"]
reasons=["Item not as described","Item damaged on arrival","Wrong size sent","Parcel marked delivered but not received","Missing item from order"]
for j in range(5):
    p = dp[j] if j<len(dp) else random.choice([x for x in parcels if x["status"]=="delivered"])
    opened = NOW-dt.timedelta(days=random.randint(0,4),hours=random.randint(1,20))
    did=f"DSP-{random.randint(1000,9999)}"
    if p["status"]=="disputed": p["escrow"]["disputeId"]=did
    disputes.append({"id":did,"trackingId":p["trackingId"],"orderId":p["orderId"],"partnerId":p["partnerId"],"reason":reasons[j],"openedAt":iso(opened),"windowEndsAt":iso(opened+dt.timedelta(days=5)),
        "status":["open","open","awaiting_partner","awaiting_seller","resolved"][j],"amount":p["declaredValue"],
        "faultAssigned":None if j<4 else "partner","decision":None if j<4 else "partial_refund",
        "evidence":{"chat":[{"from":"buyer","name":p["receiver"]["name"],"text":["The colour is completely different from the photo","The blender jar was cracked when I opened it","I ordered 42, this is 40","Rider marked it delivered but I didn't get anything","Only one of the two items came"][j],"at":iso(opened)},
                             {"from":"seller","name":p["seller"],"text":["It's the same fabric, the light in the photo is different","It left us sealed and fine","Abeg, I'll send the right one","My side shows it was collected","Second item was sent separately"][j],"at":iso(opened+dt.timedelta(hours=2))},
                             {"from":"system","name":"SunPay","text":"Payment is held while this dispute is reviewed.","at":iso(opened+dt.timedelta(hours=2,minutes=5))}],
                    "photos":random.randint(0,3),"deliveryCodeVerified":j!=3}})

flags=[]
FT=[("off_route","Scan 140 km off the expected route"),("other_company_scan","Scanned by a rider from another company"),("silent_48h","No scan for 48 hours while in transit"),("no_delivery_code","Marked delivered without delivery code (photo + GPS fallback)"),("manual_entry","Tracking ID typed manually 3 times today"),("off_route","Checkpoint scan outside the batch route")]
for j,(k,label) in enumerate(FT):
    p=random.choice([x for x in parcels if x["riderId"]])
    flags.append({"id":f"FLG-{200+j}","type":k,"label":label,"trackingId":p["trackingId"],"partnerId":p["partnerId"],"riderId":p["riderId"],"raisedAt":iso(NOW-dt.timedelta(hours=random.randint(1,60))),"status":"open" if j<4 else "reviewed"})

applications=[
 {"id":"APP-301","company":"Northstar Movers Ltd","stage":"new","cac":"RC-TEST-00321","services":["interstate"],"states":["Kaduna","Kano","FCT"],"submittedAt":iso(NOW-dt.timedelta(hours=5)),"documents":{"partnerAgreement":"missing","dataProtection":"missing","riderDeclaration":"missing"},"meeting":None,"inspectionScore":None},
 {"id":"APP-298","company":"Coastline Couriers","stage":"documents_received","cac":"RC-TEST-00298","services":["intrastate"],"states":["Rivers"],"submittedAt":iso(NOW-dt.timedelta(days=2)),"documents":{"partnerAgreement":"uploaded","dataProtection":"uploaded","riderDeclaration":"rejected","rejectionReason":"Unsigned page 2"},"meeting":None,"inspectionScore":None},
 {"id":"APP-295","company":"Greenline Dispatch","stage":"meeting_booked","cac":"RC-TEST-00295","services":["intrastate","interstate"],"states":["Oyo","Ogun","Lagos"],"submittedAt":iso(NOW-dt.timedelta(days=4)),"documents":{"partnerAgreement":"approved","dataProtection":"approved","riderDeclaration":"approved"},"meeting":{"at":iso(NOW+dt.timedelta(days=1,hours=-2)),"timezone":"WAT","link":"[meeting link]"},"inspectionScore":None},
 {"id":"APP-290","company":"Sahel Freight","stage":"inspection","cac":"RC-TEST-00290","services":["interstate","international"],"states":["Kano","Sokoto"],"countries":["Niger"],"submittedAt":iso(NOW-dt.timedelta(days=7)),"documents":{"partnerAgreement":"approved","dataProtection":"approved","riderDeclaration":"approved"},"meeting":{"at":iso(NOW-dt.timedelta(days=2)),"timezone":"WAT"},"inspectionScore":{"draft":72,"criteria":{"vehicles":16,"hubs":14,"tracking":12,"staffVerification":15,"insurance":15}}},
 {"id":"APP-287","company":"Delta Swift Logistics","stage":"approved","cac":"RC-TEST-00287","services":["intrastate"],"states":["Delta"],"submittedAt":iso(NOW-dt.timedelta(days=10)),"documents":{"partnerAgreement":"approved","dataProtection":"approved","riderDeclaration":"approved"},"meeting":{"at":iso(NOW-dt.timedelta(days=6)),"timezone":"WAT"},"inspectionScore":{"final":81},"companyCodeIssued":"BZL-C-1055"},
 {"id":"APP-284","company":"QuickBox NG","stage":"rejected","cac":"RC-TEST-00284","services":["intrastate"],"states":["Lagos"],"submittedAt":iso(NOW-dt.timedelta(days=12)),"documents":{"partnerAgreement":"approved","dataProtection":"approved","riderDeclaration":"approved"},"meeting":{"at":iso(NOW-dt.timedelta(days=8)),"timezone":"WAT"},"inspectionScore":{"final":48},"rejectionReason":"No rider verification process in place"},
]

payouts=[]
for d in range(14):
    day=(NOW-dt.timedelta(days=d)).date()
    jobs=random.randint(6,22); gross=jobs*random.randint(2500,9000)
    payouts.append({"partnerId":"p1","date":str(day),"deliveries":jobs,"partnerEarnings":gross,"partnerPaid":"immediate","buzzShare":round(gross*0.03),"buzzSettlement":"T+2","buzzSettled": d>=2})

admins=[{"id":"a1","name":"Ifeoma Okafor","role":"super_admin"},{"id":"a2","name":"Dapo Fashola","role":"partner_manager"},{"id":"a3","name":"Halima Sule","role":"support"},{"id":"a4","name":"Victor Edet","role":"finance"}]
audit=[{"at":iso(NOW-dt.timedelta(hours=h)),"admin":a,"action":act} for h,a,act in [(1,"Dapo Fashola","Booked meeting for APP-295"),(3,"Halima Sule","Opened dispute DSP case review"),(6,"Ifeoma Okafor","Froze rider code on Eastgate Dispatch"),(20,"Victor Edet","Exported payouts statement for Oct"),(26,"Dapo Fashola","Changed Buzz % for KwikHaul Couriers 3.0 → 2.5 (deal)")]]

dump(L+"/partners.json",partners); dump(L+"/hubs.json",hubs); dump(L+"/riders.json",riders); dump(L+"/parcels.json",parcels)
dump(L+"/batches.json",batches); dump(L+"/disputes.json",disputes); dump(L+"/flags.json",flags); dump(L+"/applications.json",applications)
dump(L+"/payouts.json",payouts); dump(L+"/admin-users.json",admins); dump(L+"/admin-audit-log.json",audit)

# ---------- web chats ----------
me={"name":"Adaeze Okeke","buzzId":"@adaeze.buzz","avatar":None}
def m(frm,text,mins_ago,**kw): return {"from":frm,"text":text,"at":iso(NOW-dt.timedelta(minutes=mins_ago)),**kw}
dp0=[p for p in parcels if p["status"]=="out_for_delivery"][0]
dp1=[p for p in parcels if p["status"]=="at_pickup_point"][0]
chats=[
 {"id":"c1","type":"direct","name":"Mum","buzzId":"@mama.okeke","unread":2,"pinned":True,"messages":[m("them","Have you eaten?",95),m("me","Yes ma, I made jollof",90,status="read"),m("them","Voice note",40,kind="voice",duration="0:38"),m("them","Call me when you're free",38)]},
 {"id":"c2","type":"group","name":"Okeke Family","members":14,"unread":5,"messages":[m("Chidi","Who's coming for Christmas?",300),m("Auntie Rose","We'll be there by the 23rd",280),m("me","I'll be there on the 22nd",270,status="read"),m("Uncle Ben","Sticker",30,kind="sticker"),m("Chidi","Don't forget the rice o",12)]},
 {"id":"c3","type":"direct","name":"Ada's Fabrics","pro":True,"buzzId":"PRO-31877","unread":1,"messages":[m("me","Abeg, is the ankara two-piece still available in blue?",2000,status="read"),m("them","Yes, size M and L",1990),m("me","I'll take M",1985,status="read"),m("them","Order",60,kind="order",trackingId=dp0["trackingId"],orderId=dp0["orderId"],item=dp0["item"],orderStatus="out_for_delivery"),m("them","Your rider is on the way. Have your delivery code ready",58)]},
 {"id":"c4","type":"group","name":"Estate Residents (Block C)","members":48,"unread":12,"messages":[m("Funmi","Light don come back?",180),m("me","Yes o, since 6",178,status="read"),m("Mr Bello","Who's going out this evening?",150),m("Funmi","Check the alert first",149),m("Kemi","Seen it. Everyone stay indoors for now",140)]},
 {"id":"c5","type":"direct","name":"Emeka Fix-It","pro":True,"buzzId":"PRO-48213","unread":0,"messages":[m("me","Good afternoon. Are you free to check a faulty socket tomorrow?",1500,status="read"),m("them","Yes, 10am works. Booking sent",1490),m("them","Booking",1489,kind="booking",when="Tomorrow, 10:00")]},
 {"id":"c6","type":"direct","name":"Tobi","buzzId":"@tobi.o","unread":0,"messages":[m("them","I don land for Abuja",3000),m("me","Thank God. Call me when you settle",2995,status="read")]},
 {"id":"c7","type":"direct","name":"Naturally Kemi","pro":True,"buzzId":"PRO-20455","unread":0,"messages":[m("them","Order",4300,kind="order",trackingId=dp1["trackingId"],orderId=dp1["orderId"],item=dp1["item"],orderStatus="at_pickup_point"),m("them","It's at the pickup point. You can send someone too, just add their name in the app",4290)]},
 {"id":"c8","type":"group","name":"UNILAG Class of '24","members":112,"unread":0,"muted":True,"messages":[m("Zainab","Anyone has the past questions?",6000),m("Gbenga","Check the drive",5990)]},
]
notifications=[
 {"id":"n1","priority":True,"kind":"delivery","title":"Out for delivery","body":f"{dp0['item']} is on its way. Your delivery code is ready in the Buzz app.","trackingId":dp0["trackingId"],"at":iso(NOW-dt.timedelta(minutes=58)),"read":False},
 {"id":"n2","priority":True,"kind":"delivery","title":"Ready for pickup","body":f"{dp1['item']} is at the pickup point. Free for 5 days.","trackingId":dp1["trackingId"],"at":iso(NOW-dt.timedelta(hours=7)),"read":False},
 {"id":"n3","priority":False,"kind":"escrow","title":"Payment held in escrow","body":"₦28,500 is held by SunPay until you confirm delivery.","at":iso(NOW-dt.timedelta(days=1)),"read":True},
 {"id":"n4","priority":False,"kind":"mention","title":"Chidi mentioned you","body":"Okeke Family","at":iso(NOW-dt.timedelta(minutes=12)),"read":False},
]
updates=[{"id":"u1","kind":"security","verified":True,"source":"[Verified agency]","text":"Road blocked at [location]. Avoid the area and use an alternative route.","area":"Within [radius] of [location]","at":iso(NOW-dt.timedelta(minutes=150))},
         {"id":"u2","kind":"status","name":"Tobi","text":"Abuja sunsets","at":iso(NOW-dt.timedelta(hours=5))}]
json.dump({"isTestData":True,"me":me,"chats":chats,"notifications":notifications,"updates":updates},open(W+"/chats.json","w"),indent=2,ensure_ascii=False)

# README with IDs per state
rows=[]
for st,_ in STATES:
    ps=[p["trackingId"] for p in parcels if p["status"]==st]
    rows.append(f"| `{st}` | " + ", ".join(f"`{x}`" for x in ps) + " |")
readme=f"""# Test data

**Everything here is fictional.** Phone numbers use `+234 800 000 ....`, emails use `.test`, and CAC numbers are `RC-TEST-…`. Every file has `"isTestData": true`. Never import these files directly into components. Read them through `src/lib/data/*`.

## Files

| File | Contents |
|---|---|
| `logistics/partners.json` | 4 partners (3 active, 1 suspended), company codes, per-km rates, Buzz %, modifiers, scores |
| `logistics/hubs.json` | 8 hubs / pickup points with storage fees after 5 free days |
| `logistics/riders.json` | {len(riders)} riders across partners: active, pending verification, deactivated, frozen; rider codes; company checklists |
| `logistics/parcels.json` | {len(parcels)} parcels covering every status, with full timelines (batch scans, manual entries), pricing, codes, storage windows, pickup delegates |
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
{chr(10).join(rows)}

Regenerate with `python3 gen_testdata.py` (seeded, so IDs stay stable).
"""
open(OUT+"/README.md","w").write(readme)
print(len(parcels), len(riders), [b["id"] for b in batches])
