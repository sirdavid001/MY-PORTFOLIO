import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import Shell from "./Shell";

export function render(url) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <Shell />
      </StaticRouter>
    </React.StrictMode>
  );
}
