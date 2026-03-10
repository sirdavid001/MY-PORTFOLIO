import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { shopRoutes } from "./shopRoutes";
import sourceRepoCss from "./source-repo.css?raw";

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

  return useRoutes(shopRoutes);
}
