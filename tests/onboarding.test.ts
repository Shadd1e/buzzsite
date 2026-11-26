/**
 * Sign up (DESIGN.md §10.1): partner apply and individual rider apply. Each
 * step's checks, the server-side re-check on submit, and the slot list.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  checkPartnerStep,
  checkRiderStep,
  emptyPartnerDraft,
  emptyRiderDraft,
  listOnboardingSlots,
  submitPartnerApplication,
  submitRiderApplication,
  type PartnerDraft,
  type RiderDraft,
} from "@/lib/data/onboarding";
import { PortalError } from "@/lib/data/portal";

const DOCS = ["Partner agreement", "Data protection addendum", "Rider verification declaration"];
const file = { fileName: "signed.pdf" };

function goodPartner(): PartnerDraft {
  return {
    ...emptyPartnerDraft(DOCS),
    legalName: "Lagoon Movers Ltd",
    cac: "RC1234567",
    address: "14 Test Avenue, Yaba, Lagos",
    contactName: "Tolu Adebayo",
    contactEmail: "tolu@lagoonmovers.test",
    contactPhone: "0803 000 1234",
    confirm: true,
    services: ["intrastate"],
    states: ["Lagos"],
    vehicles: ["Motorbike"],
    riders: "6",
    vehicleCount: "6",
    hubs: "1",
    years: "3",
    documents: Object.fromEntries(DOCS.map((d) => [d, file])),
    perKm: "170",
    slot: "2026-11-23T10:00:00+01:00",
  };
}

function goodRider(): RiderDraft {
  return {
    ...emptyRiderDraft(["Rider agreement", "Data protection addendum"], ["Front of the vehicle", "Side of the vehicle"]),
    fullName: "Chidi Okeke",
    phone: "08030005678",
    email: "chidi@rider.example",
    address: "3 Test Street, Surulere, Lagos",
    idType: "nin",
    idNumber: "12345678901",
    vehicleType: "Motorbike",
    plate: "TEST-123-AB",
    model: "Bajaj Boxer 150",
    year: "2021",
    papers: [{ id: "p1", name: "Vehicle licence", file }],
    photos: { "Front of the vehicle": file, "Side of the vehicle": file },
    documents: { "Rider agreement": file, "Data protection addendum": file },
    perKm: "150",
    slot: "2026-11-23T09:00:00+01:00",
  };
}

describe("partner apply", () => {
  test("a complete application passes every step and submits", async () => {
    const d = goodPartner();
    for (let s = 0; s < 6; s++) assert.deepEqual(checkPartnerStep(s, d), {}, `step ${s}`);
    assert.match((await submitPartnerApplication(d)).reference, /^APP-\d{3}$/);
  });

  test("each step names what's wrong", () => {
    const e0 = checkPartnerStep(0, { ...goodPartner(), cac: "12", confirm: false, contactEmail: "ops@swiftline.test" });
    assert.deepEqual(e0, { cac: "cac", confirm: "confirm", contactEmail: "emailTaken" });
    assert.equal(checkPartnerStep(1, { ...goodPartner(), services: ["international"] }).countries, "countries");
    assert.equal(checkPartnerStep(2, { ...goodPartner(), riders: "0" }).riders, "ridersMin");
    assert.equal(checkPartnerStep(3, { ...goodPartner(), documents: { ...goodPartner().documents, "Partner agreement": null } })["doc:Partner agreement"], "document");
    assert.equal(checkPartnerStep(4, { ...goodPartner(), perKm: "10" }).perKm, "perKm");
    assert.equal(checkPartnerStep(5, { ...goodPartner(), slot: null }).slot, "slot");
  });

  test("submit re-checks everything and says which step failed", async () => {
    await assert.rejects(submitPartnerApplication({ ...goodPartner(), vehicles: [] }), (e) => e instanceof PortalError && (e as PortalError & { step: number }).step === 1);
  });
});

describe("individual rider apply", () => {
  test("a complete sign up passes and submits", async () => {
    const d = goodRider();
    for (let s = 0; s < 5; s++) assert.deepEqual(checkRiderStep(s, d), {}, `step ${s}`);
    assert.match((await submitRiderApplication(d)).reference, /^RDR-\d{3}$/);
  });

  test("checks ID, papers and photos", () => {
    assert.equal(checkRiderStep(0, { ...goodRider(), idNumber: "123" }).idNumber, "nin");
    assert.equal(checkRiderStep(0, { ...goodRider(), buzzId: "a b" }).buzzId, "buzzId");
    const v = checkRiderStep(1, { ...goodRider(), papers: [{ id: "p1", name: "", file: null }], photos: { "Front of the vehicle": null, "Side of the vehicle": file } });
    assert.equal(v["paperName:p1"], "paperName");
    assert.equal(v["paperFile:p1"], "paperFile");
    assert.equal(v["photo:Front of the vehicle"], "photo");
    // A bicycle needs no plate
    assert.equal(checkRiderStep(1, { ...goodRider(), vehicleType: "Bicycle", plate: "" }).plate, undefined);
  });
});

test("slots are weekdays after the test clock, with some already taken", async () => {
  const meeting = await listOnboardingSlots("meeting");
  assert.ok(meeting.length > 20 && meeting.length < 40);
  assert.ok(meeting.every((s) => ![0, 6].includes(new Date(s).getUTCDay())));
  assert.ok(meeting[0] > "2026-11-19");
});
