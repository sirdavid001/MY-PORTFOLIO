import { CV_PROFILE } from "./cv-profile.js";

const PAGE = {
  width: 612,
  height: 792,
  marginX: 32,
  marginTop: 34,
  marginBottom: 36,
};

const HEADER = {
  height: 110,
  paddingX: 28,
  topInset: 24,
};

const COLORS = {
  blue: [0.145, 0.388, 0.922],
  blueDark: [0.118, 0.251, 0.686],
  dark: [0.125, 0.161, 0.216],
  body: [0.247, 0.302, 0.388],
  white: [1, 1, 1],
  page: [0.957, 0.957, 0.961],
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

function estimateChars(width, size) {
  const averageCharWidth = Number(size || 12) * 0.52;
  return Math.max(12, Math.floor(width / averageCharWidth));
}

function wrapText(text, width, size, options = {}) {
  const safeText = toAsciiSafe(text || "").replace(/\s+/g, " ").trim();
  const firstPrefix = toAsciiSafe(options.firstPrefix || "");
  const continuationPrefix = toAsciiSafe(options.continuationPrefix || "");
  const maxChars = estimateChars(width, size);
  const words = safeText ? safeText.split(" ") : [""];

  if (words.length === 1 && !words[0]) {
    return [""];
  }

  let current = `${firstPrefix}${words.shift()}`;
  const lines = [];

  for (const word of words) {
    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
      continue;
    }

    lines.push(current);
    current = `${continuationPrefix}${word}`;
  }

  lines.push(current);
  return lines;
}

function createBuilder() {
  const pages = [];
  let currentPage = null;
  let cursorY = PAGE.height - HEADER.height - 16;

  function newPage(includeHeader = false) {
    currentPage = [];
    pages.push(currentPage);

    currentPage.push({
      kind: "rect",
      x: 0,
      y: 0,
      width: PAGE.width,
      height: PAGE.height,
      color: COLORS.page,
    });

    if (includeHeader) {
      currentPage.push({
        kind: "rect",
        x: 0,
        y: PAGE.height - HEADER.height,
        width: PAGE.width,
        height: HEADER.height,
        color: COLORS.blue,
      });

      currentPage.push({
        kind: "text",
        x: HEADER.paddingX,
        y: PAGE.height - HEADER.topInset,
        font: "F2",
        size: 22,
        color: COLORS.white,
        text: CV_PROFILE.name,
      });

      const leftX = HEADER.paddingX;
      const rightX = PAGE.width / 2 + 16;
      const contactTop = PAGE.height - 62;
      const contactGap = 18;

      [
        CV_PROFILE.location,
        CV_PROFILE.email,
        `GitHub: ${CV_PROFILE.github}`,
      ].forEach((text, index) => {
        currentPage.push({
          kind: "text",
          x: leftX,
          y: contactTop - index * contactGap,
          font: "F1",
          size: 9.8,
          color: COLORS.white,
          text,
        });
      });

      [
        CV_PROFILE.phone,
        `Portfolio: ${CV_PROFILE.portfolio}`,
      ].forEach((text, index) => {
        currentPage.push({
          kind: "text",
          x: rightX,
          y: contactTop - index * contactGap,
          font: "F1",
          size: 9.8,
          color: COLORS.white,
          text,
        });
      });

      cursorY = PAGE.height - HEADER.height - 16;
      return;
    }

    cursorY = PAGE.height - PAGE.marginTop;
  }

  function ensureSpace(heightNeeded) {
    if (cursorY - heightNeeded < PAGE.marginBottom) {
      newPage(false);
    }
  }

  function drawTextLine(text, x, y, options) {
    currentPage.push({
      kind: "text",
      x,
      y,
      font: options.font || "F1",
      size: options.size || 12,
      color: options.color || COLORS.body,
      text,
    });
  }

  function addParagraph(text, options = {}) {
    const x = options.x ?? PAGE.marginX;
    const width = options.width ?? PAGE.width - PAGE.marginX * 2;
    const size = options.size ?? 12;
    const leading = options.leading ?? size + 5;
    const after = options.after ?? 10;
    const lines = wrapText(text, width, size, options.wrap || {});

    for (const line of lines) {
      ensureSpace(leading + after);
      drawTextLine(line, x, cursorY, options);
      cursorY -= leading;
    }

    cursorY -= after;
  }

  function addSection(title) {
    ensureSpace(22);
    drawTextLine(title, PAGE.marginX, cursorY, {
      font: "F2",
      size: 13.5,
      color: COLORS.dark,
    });
    currentPage.push({
      kind: "line",
      x1: PAGE.marginX,
      x2: PAGE.width - PAGE.marginX,
      y: cursorY - 10,
      width: 1.5,
      color: COLORS.blue,
    });
    cursorY -= 16;
  }

  function addEducationEntry(entry) {
    ensureSpace(42);
    addParagraph(entry.title, {
      font: "F2",
      size: 12.4,
      color: COLORS.dark,
      leading: 13.2,
      after: 2,
    });

    entry.details.forEach((detail, index) => {
      addParagraph(detail, {
        size: 10.8,
        color: COLORS.body,
        leading: 13.2,
        after: index === entry.details.length - 1 ? 5 : 1,
      });
    });
  }

  function addProject(project) {
    ensureSpace(52);
    addParagraph(project.title, {
      font: "F2",
      size: 12.3,
      color: COLORS.dark,
      leading: 14,
      after: 2,
    });
    addParagraph(project.description, {
      size: 10.6,
      color: COLORS.body,
      leading: 13.4,
      after: 5,
    });
  }

  function addSkillColumns(title, items) {
    ensureSpace(68);
    addParagraph(title, {
      font: "F2",
      size: 11.5,
      color: COLORS.dark,
      leading: 13,
      after: 5,
    });

    const leftItems = items.slice(0, Math.ceil(items.length / 2));
    const rightItems = items.slice(Math.ceil(items.length / 2));
    const leftX = PAGE.marginX;
    const rightX = PAGE.width / 2 + 6;
    const bulletWidth = PAGE.width / 2 - PAGE.marginX - 14;
    const lineHeight = 13;
    const startY = cursorY;

    const renderColumn = (columnItems, x) => {
      let localY = startY;
      columnItems.forEach((item) => {
        const lines = wrapText(item, bulletWidth, 10.4, {
          firstPrefix: "- ",
          continuationPrefix: "  ",
        });
        lines.forEach((line, lineIndex) => {
          drawTextLine(line, x, localY - lineIndex * 11, {
            size: 10.2,
            color: COLORS.body,
          });
        });
        localY -= Math.max(lineHeight, lines.length * 11 + 1);
      });
      return localY;
    };

    const estimatedRows = Math.max(leftItems.length, rightItems.length);
    ensureSpace(estimatedRows * lineHeight + 6);

    const leftBottomY = renderColumn(leftItems, leftX);
    const rightBottomY = renderColumn(rightItems, rightX);
    cursorY = Math.min(leftBottomY, rightBottomY);
  }

  function addBulletList(items) {
    items.forEach((item, index) => {
      addParagraph(item, {
        size: 10.2,
        color: COLORS.body,
        leading: 12.6,
        after: index === items.length - 1 ? 0 : 1,
        wrap: {
          firstPrefix: "- ",
          continuationPrefix: "  ",
        },
      });
    });
  }

  newPage(true);

  addSection("Professional Summary");
  addParagraph(CV_PROFILE.summary, {
    size: 10.7,
    color: COLORS.body,
    leading: 13,
    after: 8,
  });

  addSection("Key Skills");
  addSkillColumns(CV_PROFILE.keySkills.title, CV_PROFILE.keySkills.items);
  cursorY -= 8;

  addSection("Education");
  CV_PROFILE.education.forEach(addEducationEntry);

  addSection("Selected Projects");
  CV_PROFILE.projects.forEach(addProject);

  addSection("Technical Skills");
  addParagraph(CV_PROFILE.technicalSkills.join(" | "), {
    size: 10.7,
    color: COLORS.body,
    leading: 13.2,
    after: 8,
  });

  addSection("Additional Information");
  addBulletList(CV_PROFILE.additionalInformation);

  return pages;
}

function buildContentForPage(operations) {
  const output = [];
  let inTextObject = false;

  const beginText = () => {
    if (!inTextObject) {
      output.push("BT");
      inTextObject = true;
    }
  };

  const endText = () => {
    if (inTextObject) {
      output.push("ET");
      inTextObject = false;
    }
  };

  for (const operation of operations) {
    if (operation.kind === "rect") {
      endText();
      output.push("q");
      output.push(`${operation.color[0].toFixed(3)} ${operation.color[1].toFixed(3)} ${operation.color[2].toFixed(3)} rg`);
      output.push(`${operation.x.toFixed(2)} ${operation.y.toFixed(2)} ${operation.width.toFixed(2)} ${operation.height.toFixed(2)} re`);
      output.push("f");
      output.push("Q");
      continue;
    }

    if (operation.kind === "line") {
      endText();
      output.push("q");
      output.push(`${operation.width.toFixed(2)} w`);
      output.push(`${operation.color[0].toFixed(3)} ${operation.color[1].toFixed(3)} ${operation.color[2].toFixed(3)} RG`);
      output.push(`${operation.x1.toFixed(2)} ${operation.y.toFixed(2)} m`);
      output.push(`${operation.x2.toFixed(2)} ${operation.y.toFixed(2)} l`);
      output.push("S");
      output.push("Q");
      continue;
    }

    if (operation.kind === "text" && operation.text) {
      beginText();
      output.push(`${operation.color[0].toFixed(3)} ${operation.color[1].toFixed(3)} ${operation.color[2].toFixed(3)} rg`);
      output.push(`1 0 0 1 ${operation.x.toFixed(2)} ${operation.y.toFixed(2)} Tm`);
      output.push(`/${operation.font} ${operation.size.toFixed(2)} Tf`);
      output.push(`(${escapePdfText(toAsciiSafe(operation.text))}) Tj`);
    }
  }

  endText();
  return output.join("\n");
}

export function buildCvPdf() {
  const pages = createBuilder();
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
    const content = buildContentForPage(pages[index]);
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
