import { useEffect } from "react";
import SourceApp from "./SourceApp";

export default function ShopApp() {
  useEffect(() => {
    const linkId = "sirdavidgadget-source-shop-css";
    if (document.getElementById(linkId)) {
      return undefined;
    }

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "/source-repo.css";
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  return <SourceApp />;
}
