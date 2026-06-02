import test from "node:test";
import assert from "node:assert/strict";
import { getCurrencyForCountry, getLocationFactor } from "../shared/budgeting.js";
import {
  normalizeCountryCode,
  normalizeCurrencyCode,
  normalizeLocationPayload,
  isProbablyPublicIp,
} from "../shared/location.js";
import { CV_RESUME_LINES } from "../shared/cv/content.js";
import { buildCvPdf } from "../shared/cv/pdf.js";
import { buildCvWordDocument } from "../shared/cv/word.js";

test("budget helpers resolve common currencies and regional factors", () => {
  assert.equal(getCurrencyForCountry("US", "NGN"), "USD");
  assert.equal(getCurrencyForCountry("DE", "NGN"), "EUR");
  assert.equal(getCurrencyForCountry("ZZ", "NGN"), "NGN");
  assert.equal(getLocationFactor("FR"), 1.09);
  assert.equal(getLocationFactor("US"), 1);
});

test("location helpers normalize trusted location data", () => {
  assert.equal(normalizeCountryCode(" us "), "US");
  assert.equal(normalizeCountryCode("XX"), "");
  assert.equal(normalizeCurrencyCode(" usd "), "USD");
  assert.equal(normalizeCurrencyCode("dollar"), "");

  assert.deepEqual(normalizeLocationPayload({ countryCode: "ng", currency: "ngn" }), {
    countryCode: "NG",
    countryName: "Nigeria",
    currency: "NGN",
    source: "unknown",
  });
});

test("public IP detection rejects private and loopback addresses", () => {
  assert.equal(isProbablyPublicIp("8.8.8.8"), true);
  assert.equal(isProbablyPublicIp("127.0.0.1"), false);
  assert.equal(isProbablyPublicIp("192.168.1.4"), false);
  assert.equal(isProbablyPublicIp("::1"), false);
});

test("CV builders generate downloadable document content", () => {
  const pdf = buildCvPdf();
  assert.ok(pdf instanceof Uint8Array);
  assert.equal(Buffer.from(pdf.slice(0, 8)).toString("utf8"), "%PDF-1.4");
  const pdfText = Buffer.from(pdf).toString("latin1");
  assert.doesNotMatch(pdfText, /Selected Projects/);
  assert.doesNotMatch(pdfText, /Location:|Email:|Phone:/);

  const word = buildCvWordDocument();
  assert.match(word, /Nwadialo David Chinedu/);
  assert.match(word, /linkedin\.com\/in\/sirdaviddev/);
  assert.match(word, /Personal Information/);
  assert.match(word, /4th March, 2003/);
  assert.match(word, /Professional Summary/);
  assert.match(word, /Schools Attended With Dates/);
  assert.match(word, /Certificates \/ Qualifications Obtained/);
  assert.match(word, /West African Senior School Certificate Examination \(WAEC\)/);
  assert.match(word, /National Examination Council Certificate \(NECO\)/);
  assert.match(word, /Executive Certificate in Leadership and Entrepreneurship \(S\.O\.L\.E\.\)/);
  assert.match(word, /Leadership Conference Certificate of Attendance \(Leadership Development Training\)/);
  assert.match(word, /Jasmine Children&#39;s School, Asaba/);
  assert.match(word, /Basic Education Certificate Examination \(BECE\)/);
  assert.match(word, /First School Leaving Certificate \(FSLC\)/);
  assert.doesNotMatch(word, />Education</);
  assert.doesNotMatch(word, /Selected Projects/);
  assert.doesNotMatch(word, /Technical Skills/);
  assert.doesNotMatch(word, /Location:<\/span>|Email:<\/span>|Phone:<\/span>/);
  assert.ok(
    CV_RESUME_LINES.findIndex((line) => line.text === "Personal Information") <
      CV_RESUME_LINES.findIndex((line) => line.text === "Professional Summary")
  );
  assert.ok(
    CV_RESUME_LINES.findIndex((line) => line.text === "Professional Summary") <
      CV_RESUME_LINES.findIndex((line) => line.text === "Schools Attended With Dates")
  );
  assert.ok(
    CV_RESUME_LINES.findIndex((line) => line.text === "Schools Attended With Dates") <
      CV_RESUME_LINES.findIndex((line) => line.text === "Certificates / Qualifications Obtained")
  );
  assert.equal(CV_RESUME_LINES.some((line) => line.text === "Selected Projects"), false);
  assert.equal(CV_RESUME_LINES.some((line) => line.text === "Technical Skills"), false);
  assert.equal(
    CV_RESUME_LINES.some((line) => ["Location:", "Email:", "Phone:"].some((prefix) => line.text?.startsWith(prefix))),
    false
  );
});
