import { useEffect } from "react";

const SITE_URL = "https://sirdavid.site";

function upsertMeta(name, content, prop = false) {
  const attr = prop ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function useSEO({ title, description, path = "", noindex = false }) {
  useEffect(() => {
    document.title = title;
    const url = `${SITE_URL}${path}`;

    upsertMeta("description", description);
    upsertCanonical(url);

    upsertMeta("og:title", title, true);
    upsertMeta("og:description", description, true);
    upsertMeta("og:url", url, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("og:site_name", "Chinedu David Nwadialo", true);

    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    upsertMeta(
      "robots",
      noindex
        ? "noindex,follow"
        : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
    );
  }, [title, description, path, noindex]);
}
