export const SITE_URL = "https://sirdavid.site";
export const SITE_NAME = "Chinedu David Nwadialo";
// Link previews need a raster image: Facebook, LinkedIn, X, and WhatsApp ignore SVG.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og/default.png`,
  alt: "Chinedu David Nwadialo, web developer in Asaba, Nigeria, with screenshots of Bookdara, CorperLink, QuickPOS, and UKM",
};

// lastmod feeds the generated sitemap. Update it when a page's content changes.
export const ROUTES = [
  {
    key: "home",
    path: "/",
    lastmod: "2026-11-21",
    title:
      "Chinedu David Nwadialo — Computer Science Graduate & Web Developer",
    description:
      "Portfolio of Chinedu David Nwadialo — Computer Science graduate and web developer. Featured projects, technical stack, downloadable CV, and contact details.",
  },
  {
    key: "projects",
    path: "/projects",
    lastmod: "2026-11-22",
    title: "Web & Mobile App Projects — Chinedu David Nwadialo",
    description:
      "Explore web apps, mobile apps, and backends Chinedu David Nwadialo built or contributed to, including Bookdara, CorperLink, QuickPOS, and TaxSense Nigeria.",
    ogImage: {
      url: `${SITE_URL}/og/projects.png`,
      alt: "Projects by Chinedu David Nwadialo: screenshots of Bookdara, CorperLink, QuickPOS, UKM, OEMS, Sirdavid Estates, Sirdavid Multi-Store, and SIRDAVID MULTI-TRADE",
    },
  },
  {
    key: "contact",
    path: "/contact",
    lastmod: "2026-11-21",
    title: "Contact — Chinedu David Nwadialo",
    description:
      "Start a project with Chinedu David Nwadialo. Submit a project request with your requirements, timeline, and budget.",
  },
];

export const ROUTE_BY_KEY = Object.fromEntries(
  ROUTES.map((route) => [route.key, route])
);

export const NOT_FOUND_ROUTE = {
  path: "/404",
  title: `Page not found — ${SITE_NAME}`,
  description: "The page you're looking for may have moved or been removed.",
  noindex: true,
};
