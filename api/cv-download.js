import { buildCvDocx } from "../shared/cv/docx.js";
import { CV_FORMATS } from "../shared/cv/formats.js";
import { buildCvPdf } from "../shared/cv/pdf.js";
import { buildCvWordDocument } from "../shared/cv/word.js";

const METHODS = "GET, OPTIONS";
const LEGACY_WORD_FORMAT = {
  contentType: "application/msword; charset=utf-8",
  fileName: "chineduDavidNwadialoCv.doc",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://sirdavid.site");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method === "OPTIONS") return res.status(200).json({ ok: true });
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed." });

  const url = new URL(req.url, "http://localhost");
  const requested = url.searchParams.get("format")?.trim().toLowerCase();
  const format = requested === "doc"
    ? LEGACY_WORD_FORMAT
    : requested === "word" || requested === "docx" ? CV_FORMATS.word : CV_FORMATS.pdf;

  try {
    const document = format === LEGACY_WORD_FORMAT
      ? Buffer.from(buildCvWordDocument(), "utf8")
      : format === CV_FORMATS.word ? await buildCvDocx() : Buffer.from(buildCvPdf());

    res.status(200);
    res.setHeader("Content-Type", format.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${format.fileName}"`);
    res.setHeader("Content-Length", document.length);
    return res.end(document);
  } catch {
    return res.status(500).json({ ok: false, error: "The CV could not be generated. Try again shortly." });
  }
}
