import { buildCvPdf } from "../shared/cv-pdf.js";
import { buildCvWordDocument } from "../shared/cv-word.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function readFormat(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "word" || normalized === "doc") return "word";
  return "pdf";
}

function setCacheHeaders(res) {
  res.setHeader("Cache-Control", "public, max-age=3600");
}

export default function handler(req, res) {
  const methods = "GET, OPTIONS";
  setCors(res, methods);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const requestUrl = new URL(req.url, "http://localhost");
  const format = readFormat(requestUrl.searchParams.get("format"));

  if (format === "word") {
    const docContent = buildCvWordDocument();
    const docBuffer = Buffer.from(docContent, "utf8");
    setCacheHeaders(res);
    res.status(200);
    res.setHeader("Content-Type", "application/msword; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"chineduDavidNwadialoCv.doc\"");
    res.setHeader("Content-Length", docBuffer.length);
    return res.end(docBuffer);
  }

  const pdf = buildCvPdf();
  setCacheHeaders(res);
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=\"chineduDavidNwadialoCv.pdf\"");
  res.setHeader("Content-Length", Buffer.from(pdf).length);
  return res.end(Buffer.from(pdf));
}
