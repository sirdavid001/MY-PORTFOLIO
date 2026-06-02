import test from "node:test";
import assert from "node:assert/strict";
import { applyRateLimitAsync } from "../api/_lib/rate-limit.js";
import { buildContactEmailPayload, buildContactFromEmail, normalizeContactPayload } from "../api/contact.js";
import { buildCvFromEmail } from "../api/send-cv.js";

function validContactPayload(overrides = {}) {
  return {
    clientType: "Individual",
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 555 0100",
    countryCode: "US",
    countryName: "United States",
    currency: "USD",
    projectType: "Web App",
    goals: "Build a dashboard for project reporting.",
    features: "Authentication, reports, export workflow.",
    timeline: "Medium Term (1-2 months)",
    budget: "tier2",
    budgetLabel: "$500 - $1,000",
    customBudget: "",
    website: "",
    ...overrides,
  };
}

test("contact payload normalization accepts complete briefs", () => {
  const result = normalizeContactPayload(validContactPayload({ countryCode: "us", currency: "usd" }));

  assert.equal(result.ok, true);
  assert.equal(result.data.countryCode, "US");
  assert.equal(result.data.currency, "USD");
  assert.equal(result.data.email, "ada@example.com");
});

test("contact payload normalization rejects invalid submissions", () => {
  assert.equal(normalizeContactPayload(validContactPayload({ email: "nope" })).ok, false);
  assert.equal(normalizeContactPayload(validContactPayload({ website: "https://spam.test" })).ok, false);
  assert.equal(normalizeContactPayload(validContactPayload({ goals: "" })).error, "Project description is required.");
});

test("contact email payload escapes HTML in rich content", () => {
  const normalized = normalizeContactPayload(
    validContactPayload({
      goals: "<script>alert('x')</script>",
      features: "Use <b>bold</b> reports",
    })
  );
  const email = buildContactEmailPayload(normalized.data);

  assert.match(email.subject, /Project Request - Web App - Ada Lovelace/);
  assert.match(email.html, /&lt;script&gt;alert/);
  assert.doesNotMatch(email.html, /<script>alert/);
  assert.match(email.text, /Use <b>bold<\/b> reports/);
});

test("email sender display names ignore stale environment names", () => {
  process.env.RESEND_FROM_NAME = "sirdavid Gadgets";

  assert.equal(buildCvFromEmail("hello@sirdavid.site"), "Nwadialo David Chinedu <hello@sirdavid.site>");
  assert.equal(buildContactFromEmail("hello@sirdavid.site"), "Sirdavid Portfolio <hello@sirdavid.site>");
});

test("rate limiter blocks after the configured memory limit", async () => {
  delete process.env.RATE_LIMIT_REDIS_REST_URL;
  delete process.env.RATE_LIMIT_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const headers = new Map();
  const res = {
    setHeader(key, value) {
      headers.set(key, value);
    },
  };
  const key = `test:${Date.now()}:${Math.random()}`;

  assert.equal((await applyRateLimitAsync(res, { key, limit: 2, windowMs: 1000 })).ok, true);
  assert.equal((await applyRateLimitAsync(res, { key, limit: 2, windowMs: 1000 })).ok, true);
  const blocked = await applyRateLimitAsync(res, { key, limit: 2, windowMs: 1000 });

  assert.equal(blocked.ok, false);
  assert.equal(headers.get("Retry-After"), "1");
});
