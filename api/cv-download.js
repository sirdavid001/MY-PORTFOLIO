import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildCvPdf } from "../shared/cv-pdf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const docPath = path.join(__dirname, "../public/chineduDavidNwadialoCv.doc");
    const docContent = fs.readFileSync(docPath);
    setCacheHeaders(res);
    res.status(200);
    res.setHeader("Content-Type", "application/msword");
    res.setHeader("Content-Disposition", "attachment; filename=\"chineduDavidNwadialoCv.doc\"");
    return res.send(docContent);
  }

  const pdf = buildCvPdf();
  setCacheHeaders(res);
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=\"chineduDavidNwadialoCv.pdf\"");
  res.setHeader("Content-Length", Buffer.from(pdf).length);
  return res.end(Buffer.from(pdf));
}
