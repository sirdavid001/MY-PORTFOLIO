export const SITE_URL = "https://sirdavid.site";
export const SITE_NAME = "Chinedu David Nwadialo";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.svg`;

export const ROUTES = [
  {
    key: "home",
    path: "/",
    title:
      "Chinedu David Nwadialo — Computer Science Graduate & Web Developer",
    description:
      "Portfolio of Chinedu David Nwadialo — Computer Science graduate and web developer. Featured projects, technical stack, downloadable CV, and contact details.",
  },
  {
    key: "projects",
    path: "/projects",
    title: "Projects — Chinedu David Nwadialo",
    description:
      "Featured engineering projects by Chinedu David Nwadialo — UKM (uKnowMe), Sirdavid Multi-Store, QuickPOS, and OEMS.",
  },
  {
    key: "contact",
    path: "/contact",
    title: "Contact — Chinedu David Nwadialo",
    description:
      "Start a project with Chinedu David Nwadialo. Submit a project request with your requirements, timeline, and budget.",
  },
];

export const ROUTE_BY_KEY = Object.fromEntries(
  ROUTES.map((route) => [route.key, route])
);
