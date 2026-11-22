import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { projects } from "../src/data/projects.js";
import { DEFAULT_OG_IMAGE, OG_IMAGE_SIZE, ROUTES, SITE_URL } from "../shared/seo.js";
import { buildSitemap, jsonLdScript, projectImageUrl, projectsStructuredData } from "../scripts/seo-documents.js";

const publicFile = (url) => fileURLToPath(new URL(`../public${new URL(url).pathname}`, import.meta.url));

function pngSize(file) {
  const buffer = readFileSync(file);
  assert.equal(buffer.toString("latin1", 1, 4), "PNG", `${file} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test("route titles and descriptions fit in search results", () => {
  for (const route of ROUTES) {
    assert.ok(route.title.length <= 70, `${route.key} title is ${route.title.length} characters`);
    assert.ok(route.description.length <= 160, `${route.key} description is ${route.description.length} characters`);
    assert.match(route.lastmod, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("link-preview images are 1200x630 PNGs that exist", () => {
  const images = [DEFAULT_OG_IMAGE, ...ROUTES.map((route) => route.ogImage).filter(Boolean)];
  for (const image of images) {
    assert.ok(image.url.startsWith(`${SITE_URL}/`), image.url);
    assert.ok(image.alt.length > 20, `missing alt text for ${image.url}`);
    assert.deepEqual(pngSize(publicFile(image.url)), OG_IMAGE_SIZE);
  }
});

test("projects structured data lists every project with valid links and images", () => {
  const data = projectsStructuredData();
  assert.equal(data["@type"], "CollectionPage");
  assert.equal(data.url, `${SITE_URL}/projects`);
  assert.equal(data.mainEntity.numberOfItems, projects.length);
  assert.equal(data.mainEntity.itemListElement.length, projects.length);

  data.mainEntity.itemListElement.forEach((entry, index) => {
    assert.equal(entry.position, index + 1);
    assert.equal(entry.item.name, projects[index].title);
    assert.ok(entry.item.description);
    if (entry.item.url) assert.match(entry.item.url, /^https:\/\//);
    if (entry.item.image) assert.ok(existsSync(publicFile(entry.item.image)), `missing ${entry.item.image}`);
    assert.equal(Object.values(entry.item).includes(undefined), false);
  });
});

test("JSON-LD script tags cannot be closed by their content", () => {
  const script = jsonLdScript({ name: "</script><script>alert(1)</script>" });
  assert.equal(script.match(/<\/script>/g).length, 1);
  assert.deepEqual(JSON.parse(script.slice(script.indexOf(">") + 1, -"</script>".length)), {
    name: "</script><script>alert(1)</script>",
  });
});

test("sitemap lists each page and every project screenshot", () => {
  const sitemap = buildSitemap();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locs, ROUTES.map((route) => `${SITE_URL}${route.path}`));

  const images = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((match) => match[1]);
  assert.deepEqual(images, projects.map(projectImageUrl).filter(Boolean));
  for (const image of images) assert.ok(existsSync(publicFile(image)), `missing ${image}`);
});
