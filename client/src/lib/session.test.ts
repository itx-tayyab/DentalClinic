import test from "node:test";
import assert from "node:assert/strict";
import {
  SESSION_TTL_SECONDS,
  createSession,
  verifySession,
} from "./session";

test("accepts a freshly signed session", async () => {
  const session = await createSession("correct horse", 1_000);
  assert.equal(session.maxAge, SESSION_TTL_SECONDS);
  assert.equal(await verifySession(session.value, "correct horse", 2_000), true);
});

test("rejects a tampered signature and a wrong password", async () => {
  const session = await createSession("correct horse", 1_000);
  assert.equal(
    await verifySession(`${session.value.slice(0, -1)}x`, "correct horse", 2_000),
    false,
  );
  assert.equal(await verifySession(session.value, "wrong password", 2_000), false);
});

test("rejects an expired or missing session", async () => {
  const session = await createSession("correct horse", 1_000);
  assert.equal(
    await verifySession(
      session.value,
      "correct horse",
      1_000 + SESSION_TTL_SECONDS * 1000 + 1,
    ),
    false,
  );
  assert.equal(await verifySession(undefined, "correct horse"), false);
  assert.equal(await verifySession(session.value, undefined), false);
});
