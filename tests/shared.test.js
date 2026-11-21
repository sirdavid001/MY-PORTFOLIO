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
import { buildCvDocx } from "../shared/cv/docx.js";
import { PUBLIC_PROFILE } from "../shared/profile.js";
import { buildCvPdf } from "../shared/cv/pdf.js";
import { buildCvWordDocument } from "../shared/cv/word.js";

test("budget helpers resolve common currencies and regional factors", () => {
  assert.equal(getCurrencyForCountry("US", "NGN"), "USD");
  assert.equal(getCurrencyForCountry("DE", "NGN"), "EUR");
  assert.equal(getCurrencyForCountry("JP", "USD"), "JPY");
  assert.equal(getCurrencyForCountry("BG", "USD"), "EUR");
  assert.equal(getCurrencyForCountry("AQ", "USD"), "USD");
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

test("CV builders generate tagged PDF and native Word with a public contact profile", async () => {
  const pdf = buildCvPdf();
  assert.ok(pdf instanceof Uint8Array);
  assert.equal(Buffer.from(pdf.slice(0, 8)).toString("utf8"), "%PDF-1.7");
  const pdfText = Buffer.from(pdf).toString("latin1");
  assert.match(pdfText, /\/MarkInfo << \/Marked true >>/);
  assert.match(pdfText, /\/StructTreeRoot/);
  assert.match(pdfText, /\/S \/H1/);
  assert.match(pdfText, /\/S \/Table/);
  assert.match(pdfText, /\/S \/LBody/);
  assert.doesNotMatch(pdfText, /Date of Birth|Contact Address|Selected Projects/i);
  const docx = await buildCvDocx();
  assert.deepEqual([...docx.subarray(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
  assert.ok(docx.includes(Buffer.from("word/document.xml")));
  assert.doesNotMatch(pdfText, /Location:|Email:|Phone:/);

  const word = buildCvWordDocument();
  assert.match(word, /Nwadialo David Chinedu/);
  assert.match(word, /linkedin\.com\/in\/sirdaviddev/);
  assert.match(word, /Personal Information/);
  assert.ok(word.includes(PUBLIC_PROFILE.email));
  assert.doesNotMatch(word, /Date of Birth|Contact Address|Marital Status/i);
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
  assert.ok(CV_RESUME_LINES.some((line) => line.text?.includes(PUBLIC_PROFILE.location)));
  assert.equal(CV_RESUME_LINES.some((line) => /Date of Birth|Contact Address/i.test(line.text)), false);
});
