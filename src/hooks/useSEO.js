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

export default function useSEO({ title, description, path = "" }) {
  useEffect(() => {
    document.title = title;
    const url = `${SITE_URL}${path}`;
    upsertMeta("description", description);
    upsertMeta("og:title", title, true);
    upsertMeta("og:description", description, true);
    upsertMeta("og:url", url, true);
    upsertMeta("og:type", "website", true);
  }, [title, description, path]);
}
