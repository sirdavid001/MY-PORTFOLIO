import { CV_RESUME_LINES } from "./cv-content.js";

const PAGE = {
  width: 612,
  height: 792,
  marginLeft: 50,
  marginRight: 50,
  marginTop: 56,
  marginBottom: 50,
};

const STYLE = {
  title: {
    font: "F2",
    size: 30,
    before: 4,
    after: 6,
    leading: 36,
    color: [0.06, 0.11, 0.22],
    upper: false,
  },
  subtitle: {
    font: "F2",
    size: 14,
    before: 1,
    after: 9,
    leading: 16,
    color: [0.18, 0.22, 0.26],
  },
  meta: {
    font: "F1",
    size: 9.8,
    before: 0,
    after: 5,
    leading: 12.5,
    color: [0.33, 0.41, 0.48],
  },
  section: {
    font: "F2",
    size: 12.2,
    before: 14,
    after: 6,
    leading: 16,
    color: [0.05, 0.13, 0.30],
    upper: true,
    addRule: true,
  },
  subheading: {
    font: "F2",
    size: 11.8,
    before: 9,
    after: 3.5,
    leading: 14.5,
    color: [0.15, 0.19, 0.24],
  },
  body: {
    font: "F1",
    size: 10.4,
    before: 0,
    after: 1.5,
    leading: 14.5,
    color: [0.21, 0.24, 0.28],
  },
  bullet: {
    font: "F1",
    size: 10.4,
    before: 0,
    after: 1.5,
    leading: 14.5,
    color: [0.21, 0.24, 0.28],
    bullet: "-",
  },
  spacer: {
    font: "F1",
    size: 6,
    before: 0,
    after: 7,
    leading: 6,
    color: [0.21, 0.24, 0.28],
  },
};

function toAsciiSafe(value) {
  return String(value || "")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u2022/g, "-")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/[^\x20-\x7e]/g, " ");
}

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function bytesLength(value) {
  return new TextEncoder().encode(String(value || "")).length;
}

function estimateLineLength(size) {
  const availableWidth = PAGE.width - PAGE.marginLeft - PAGE.marginRight;
  const averageCharWidth = Number(size || 11) * 0.56;
  return Math.max(32, Math.floor(availableWidth / averageCharWidth));
}

function wrapLine(text, maxChars, options = {}) {
  const safeText = toAsciiSafe(text || "").replace(/\s+/g, " ").trim();
  const firstPrefix = toAsciiSafe(options.firstPrefix || "");
  const continuationPrefix = toAsciiSafe(options.continuationPrefix || "");

  const words = safeText ? safeText.split(" ") : [""];
  if (words.length === 1 && !words[0]) {
    return [""];
  }

  const wrapped = [];
  const threshold = Math.max(10, Math.floor(maxChars));

  const firstWord = words.shift();
  let current = `${firstPrefix}${firstWord}`;

  for (const word of words) {
    if (`${current} ${word}`.length <= threshold) {
      current = `${current} ${word}`;
      continue;
    }

    wrapped.push(current);
    current = `${continuationPrefix}${word}`;
  }

  wrapped.push(current);
  return wrapped;
}

function normalizeLine(line) {
  const style = STYLE[line.style] || STYLE.body;
  const isSpacer = line.style === "spacer";
  const isBullet = line.style === "bullet";

  if (isSpacer) {
    return [
      {
        kind: "spacer",
        text: "",
        style: line.style,
        ...style,
      },
    ];
  }

  const rawText = line.text || "";
  const safeText = style.upper ? toAsciiSafe(rawText).toUpperCase() : toAsciiSafe(rawText);
  const chunks = isBullet
    ? wrapLine(safeText, estimateLineLength(style.size), {
        firstPrefix: `${style.bullet} `,
        continuationPrefix: "  ",
      })
    : wrapLine(safeText, estimateLineLength(style.size));

  return chunks.map((chunk) => ({
    kind: "text",
    style: line.style,
    text: chunk,
    font: style.font,
    size: style.size,
    before: style.before,
    after: style.after,
    leading: style.leading,
    color: style.color,
    addRule: style.addRule,
  }));
}

function buildPages() {
  const startY = PAGE.height - PAGE.marginTop;
  const minY = PAGE.marginBottom;
  const allLines = [];

  for (const line of CV_RESUME_LINES) {
    allLines.push(...normalizeLine(line));
  }

  const pages = [];
  let currentPage = [];
  let y = startY;

  const pushPage = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
    }
    y = startY;
  };

  for (const line of allLines) {
    if (line.kind === "spacer") {
      y -= line.after || 0;
      if (y < minY) {
        pushPage();
      }
      continue;
    }

    if (line.style !== "spacer") {
      if (y - line.before - line.leading < minY) {
        pushPage();
      }

      y -= line.before;
      if (y - line.leading < minY) {
        pushPage();
      }

      currentPage.push({ ...line, x: PAGE.marginLeft.toFixed(2), y });
      y -= line.leading;
      y -= line.after || 0;

      if (line.addRule) {
        const ruleY = y - 3;
        if (ruleY < minY) {
          pushPage();
          currentPage.push({
            kind: "rule",
            x1: PAGE.marginLeft,
            x2: PAGE.width - PAGE.marginRight,
            y: y - 1,
          });
          y -= 7;
        } else {
          currentPage.push({
            kind: "rule",
            x1: PAGE.marginLeft,
            x2: PAGE.width - PAGE.marginRight,
            y: ruleY,
          });
          y -= 7;
        }
      }

      if (y < minY) {
        pushPage();
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

function buildContentForPage(lines) {
  const linesOutput = [];
  let inTextObject = false;

  const beginText = () => {
    if (!inTextObject) {
      linesOutput.push("BT");
      inTextObject = true;
    }
  };

  const endText = () => {
    if (inTextObject) {
      linesOutput.push("ET");
      inTextObject = false;
    }
  };

  for (const line of lines) {
    if (line.kind === "rule") {
      endText();
      linesOutput.push("q");
      linesOutput.push("0.65 w");
      linesOutput.push("0.38 0.38 0.38 RG");
      linesOutput.push(`${line.x1.toFixed(2)} ${line.y.toFixed(2)} m`);
      linesOutput.push(`${line.x2.toFixed(2)} ${line.y.toFixed(2)} l`);
      linesOutput.push("S");
      linesOutput.push("Q");
      continue;
    }

    if (!line.text || line.style === "spacer") {
      continue;
    }

    beginText();
    const color = line.color || [0, 0, 0];
    linesOutput.push(`${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg`);
    linesOutput.push(`1 0 0 1 ${Number(line.x).toFixed(2)} ${line.y.toFixed(2)} Tm`);
    linesOutput.push(`/${line.font} ${line.size} Tf`);
    linesOutput.push(`(${escapePdfText(line.text)}) Tj`);
  }

  endText();
  return linesOutput.join("\n");
}

export function buildCvPdf() {
  const pages = buildPages();
  const pageObjectIds = [];
  const contentObjectIds = [];
  const objects = [];
  let nextObjectId = 5;

  for (let index = 0; index < pages.length; index += 1) {
    pageObjectIds.push(nextObjectId);
    contentObjectIds.push(nextObjectId + 1);
    nextObjectId += 2;
  }

  const children = [];

  for (let index = 0; index < pages.length; index += 1) {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    const lines = pages[index];
    const content = buildContentForPage(lines);
    const contentLength = bytesLength(content);

    objects.push({
      id: pageId,
      content: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    });
    objects.push({
      id: contentId,
      content: `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
    });
    children.push(pageId);
  }

  const catalog = { id: 1, content: "<< /Type /Catalog /Pages 2 0 R >>" };
  const pagesObj = {
    id: 2,
    content: `<< /Type /Pages /Kids [${children.map((id) => `${id} 0 R`).join(" ")}] /Count ${children.length} >>`,
  };
  const font1 = { id: 3, content: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" };
  const font2 = { id: 4, content: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>" };

  const allObjects = [catalog, pagesObj, font1, font2, ...objects];
  const objectMap = new Map(allObjects.map((entry) => [entry.id, entry.content]));
  const maxId = allObjects.reduce((max, entry) => Math.max(max, entry.id), 0);

  let pdf = "%PDF-1.4\n";
  const offsets = new Array(maxId + 1).fill(0);
  offsets[0] = 0;

  for (let id = 1; id <= maxId; id += 1) {
    const content = objectMap.get(id) || "<< /Type /Null >>";
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${content}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${maxId + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= maxId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${maxId + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}
