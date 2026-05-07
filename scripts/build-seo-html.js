import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ROUTES, SITE_URL } from "../shared/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const ssrDir = path.resolve(__dirname, "..", "dist-ssr");
const baseHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(baseHtmlPath)) {
  console.error(`[build-seo-html] missing ${baseHtmlPath} — run vite build first`);
  process.exit(1);
}

const ssrEntryPath = path.join(ssrDir, "entry-server.js");
if (!fs.existsSync(ssrEntryPath)) {
  console.error(`[build-seo-html] missing ${ssrEntryPath} — run vite build --ssr first`);
  process.exit(1);
}

const { render } = await import(pathToFileURL(ssrEntryPath).href);

const baseHtml = fs.readFileSync(baseHtmlPath, "utf8");

function escape(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    throw new Error(`[build-seo-html] tag not found: ${regex}`);
  }
  return html.replace(regex, replacement);
}

function injectFor(route) {
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const title = escape(route.title);
  const desc = escape(route.description);
  const urlEsc = escape(url);

  let html = baseHtml;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = replaceTag(html, /<meta\s+name="description"[^>]*\/>/, `<meta name="description" content="${desc}" />`);
  html = replaceTag(html, /<link\s+rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${urlEsc}" />`);
  html = replaceTag(html, /<meta\s+property="og:url"[^>]*\/>/, `<meta property="og:url" content="${urlEsc}" />`);
  html = replaceTag(html, /<meta\s+property="og:title"[^>]*\/>/, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta\s+property="og:description"[^>]*\/>/, `<meta property="og:description" content="${desc}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${title}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${desc}" />`);

  const appHtml = render(route.path);
  html = replaceTag(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${appHtml}</div>`
  );

  return html;
}

let written = 0;
for (const route of ROUTES) {
  const html = injectFor(route);
  let outPath;
  if (route.path === "/") {
    outPath = baseHtmlPath;
  } else {
    const segments = route.path.replace(/^\//, "").split("/");
    const outDir = path.join(distDir, ...segments);
    fs.mkdirSync(outDir, { recursive: true });
    outPath = path.join(outDir, "index.html");
  }
  fs.writeFileSync(outPath, html);
  console.log(`  ✓ ${path.relative(path.resolve(__dirname, ".."), outPath)}`);
  written++;
}
console.log(`[build-seo-html] wrote ${written} per-route HTML file(s) with prerendered content.`);
