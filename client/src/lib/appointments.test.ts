import test from "node:test";
import assert from "node:assert/strict";
import {
  findPhone,
  buildFixtureAppointments,
  normalizeN8nPayload,
  parseSummary,
} from "./appointments";
import { isDateString, resolveRequestedDate } from "./api";

test("parses the Name - phone (service) summary format", () => {
  assert.deepEqual(
    parseSummary("Ayesha Khan - +92 300 1234567 (Dental cleaning)"),
    {
      patientName: "Ayesha Khan",
      phone: "+92 300 1234567",
      service: "Dental cleaning",
    },
  );
});

test("falls back when the summary has no phone/service parentheses", () => {
  const parsed = parseSummary("Bilal Ahmed - 0300 1234567");
  assert.equal(parsed.patientName, "Bilal Ahmed");
  assert.equal(parsed.phone, "0300 1234567");
  assert.equal(parsed.service, "Appointment");
});

test("extracts a phone number from free text", () => {
  assert.equal(findPhone("Call the clinic at +92 300 7654321."), "+92 300 7654321");
  assert.equal(findPhone("no number here"), "");
});

test("normalizes calendar events, prefers the description phone, sorts, and skips all-day events", () => {
  const payload = [
    {
      id: "b",
      summary: "Bilal Ahmed - +92 300 1234567 (Root canal review)",
      description: "Phone: +92 300 7654321",
      start: { dateTime: "2026-11-16T10:00:00+05:00" },
      end: { dateTime: "2026-11-16T11:00:00+05:00" },
    },
    {
      id: "a",
      summary: "Ayesha Khan - +92 300 1234568 (Dental cleaning)",
      start: { dateTime: "2026-11-16T09:00:00+05:00" },
      end: { dateTime: "2026-11-16T09:30:00+05:00" },
    },
    {
      id: "all-day",
      summary: "Clinic closed - 000 (Holiday)",
      start: { date: "2026-11-16" },
      end: { date: "2026-11-17" },
    },
  ];

  const result = normalizeN8nPayload(
    payload,
    Date.parse("2026-11-16T05:00:00.000Z"),
  );

  assert.equal(result.length, 2);
  assert.deepEqual(
    result.map((appointment) => appointment.id),
    ["a", "b"],
  );
  assert.equal(result[0]?.status, "past");
  assert.equal(result[1]?.status, "now");
  assert.equal(result[1]?.phone, "+92 300 7654321");
});

test("accepts an n8n item wrapper and an events object", () => {
  const payload = {
    events: [
      {
        json: {
          id: "wrapped",
          summary: "Sana Iqbal - +92 300 0000005 (Braces adjustment)",
          start: { dateTime: "2026-11-16T14:00:00+05:00" },
          end: { dateTime: "2026-11-16T14:30:00+05:00" },
        },
      },
    ],
  };

  const result = normalizeN8nPayload(
    payload,
    Date.parse("2026-11-16T04:00:00.000Z"),
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.patientName, "Sana Iqbal");
  assert.equal(result[0]?.status, "upcoming");
});

test("fixtures are built on the requested clinic day with computed status", () => {
  const payload = {
    appointments: [
      {
        id: "late",
        patientName: "Late Patient",
        phone: "+92 300 0000009",
        service: "Consultation",
        startTime: "19:30",
        durationMinutes: 30,
      },
      {
        id: "early",
        patientName: "Early Patient",
        phone: "+92 300 0000001",
        service: "Cleaning",
        startTime: "09:00",
        durationMinutes: 30,
      },
    ],
  };

  const result = buildFixtureAppointments(
    payload,
    "2026-11-16",
    "Asia/Karachi",
    Date.parse("2026-11-16T05:00:00.000Z"),
  );

  assert.deepEqual(
    result.map((appointment) => appointment.id),
    ["early", "late"],
  );
  assert.equal(result[0]?.start, "2026-11-16T04:00:00.000Z");
  assert.equal(result[0]?.status, "past");
  assert.equal(result[1]?.status, "upcoming");
});

test("rejects impossible dates and defaults to today", () => {
  assert.equal(isDateString("2026-02-31"), false);
  assert.equal(isDateString("16-11-2026"), false);
  assert.equal(resolveRequestedDate("2026-11-16", "Asia/Karachi"), "2026-11-16");
  assert.equal(resolveRequestedDate("2026-02-31", "Asia/Karachi"), null);
  assert.match(
    resolveRequestedDate(null, "Asia/Karachi") ?? "",
    /^\d{4}-\d{2}-\d{2}$/,
  );
});

test("hardened parsing handles Roman Urdu names and manual events with odd punctuation", () => {
  const case1 = parseSummary("Chaudhry Muhammad Zubair - 03001234567 (Root canal)");
  assert.equal(case1.patientName, "Chaudhry Muhammad Zubair");
  assert.equal(case1.phone, "03001234567");
  assert.equal(case1.service, "Root canal");

  const case2 = parseSummary("Imran lab guy - crown pickup?? call b4 (Dr. S)");
  assert.equal(case2.patientName, "Imran lab guy");
  assert.equal(case2.service, "Dr. S");

  const case3 = parseSummary("Just a walk-in patient with no phone or service");
  assert.equal(case3.patientName, "Just a walk-in patient with no phone or service");
  assert.equal(case3.phone, "");
  assert.equal(case3.service, "Appointment");
});
