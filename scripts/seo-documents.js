// Build-time SEO documents: the Projects page's structured data and the sitemap.
// Kept out of the client bundle; scripts/build-seo-html.js writes them into dist/.
import { projects } from "../src/data/projects.js";
import { ROUTE_BY_KEY, ROUTES, SITE_URL } from "../shared/seo.js";

const PERSON_ID = `${SITE_URL}/#person`;

function absolute(pathname) {
  return new URL(pathname, SITE_URL).href;
}

// Largest published screenshot, or undefined for projects listed without one.
export function projectImageUrl(project) {
  return project.image ? absolute(project.image.src.replace(/-800\.webp$/, "-1200.webp")) : undefined;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// CreativeWork rather than SoftwareApplication: Google's software rich results require
// prices and ratings, and marking these up without them shows as errors in Search Console.
export function projectsStructuredData() {
  const route = ROUTE_BY_KEY.projects;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${route.path}#page`,
    url: `${SITE_URL}${route.path}`,
    name: route.title,
    description: route.description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": PERSON_ID },
    primaryImageOfPage: route.ogImage?.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        // Optional fields are left out when a project has no deployment, screenshot, or status.
        item: Object.fromEntries(Object.entries({
          "@type": "CreativeWork",
          name: project.title,
          url: project.link,
          description: project.description,
          image: projectImageUrl(project),
          genre: project.sector,
          creativeWorkStatus: project.status,
          keywords: project.stack.join(", "),
          creator: { "@id": PERSON_ID },
        }).filter(([, value]) => value !== undefined)),
      })),
    },
  };
}

export const STRUCTURED_DATA_BY_ROUTE = {
  projects: projectsStructuredData,
};

export function jsonLdScript(data) {
  // Escaping "<" keeps a value such as "</script>" from ending the tag early.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

export function buildSitemap() {
  const urls = ROUTES.map((route) => {
    const images = route.key === "projects" ? projects.map(projectImageUrl).filter(Boolean) : [];
    return [
      "  <url>",
      `    <loc>${escapeXml(`${SITE_URL}${route.path}`)}</loc>`,
      `    <lastmod>${escapeXml(route.lastmod)}</lastmod>`,
      ...images.map((image) => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`),
      "  </url>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
