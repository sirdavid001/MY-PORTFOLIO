import { useEffect } from "react";
import sourceRepoCss from "./source-repo.css?raw";
import SourceApp from "./SourceApp";

export default function ShopApp() {
  useEffect(() => {
    const styleId = "sirdavidgadget-source-shop-css";
    if (document.getElementById(styleId)) {
      return undefined;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = sourceRepoCss;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return <SourceApp />;
}
