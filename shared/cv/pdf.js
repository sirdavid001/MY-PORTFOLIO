import { CV_PROFILE } from "./profile.js";

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 30,
  marginTop: 32,
  marginBottom: 34,
};

const HEADER = {
  height: 158,
  paddingX: 30,
  topInset: 30,
};

const COLORS = {
  blue: [0.145, 0.388, 0.922],
  blueDark: [0.118, 0.251, 0.686],
  bluePale: [0.91, 0.947, 1],
  dark: [0.125, 0.161, 0.216],
  body: [0.247, 0.302, 0.388],
  muted: [0.392, 0.455, 0.545],
  white: [1, 1, 1],
  line: [0.82, 0.855, 0.914],
  panel: [0.985, 0.988, 0.996],
  page: [0.972, 0.976, 0.984],
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

function estimateTextWidth(text, size) {
  return String(text || "").length * Number(size || 12) * 0.52;
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
  let cursorY = PAGE.height - HEADER.height - 18;

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
        color: COLORS.blueDark,
      });

      currentPage.push({
        kind: "rect",
        x: 0,
        y: PAGE.height - HEADER.height,
        width: PAGE.width,
        height: 7,
        color: COLORS.blue,
      });

      currentPage.push({
        kind: "text",
        x: HEADER.paddingX,
        y: PAGE.height - HEADER.topInset,
        font: "F2",
        size: 29,
        color: COLORS.white,
        text: CV_PROFILE.name,
      });

      if (CV_PROFILE.classification) {
        currentPage.push({
          kind: "text",
          x: HEADER.paddingX,
          y: PAGE.height - HEADER.topInset - 22,
          font: "F1",
          size: 12.7,
          color: COLORS.white,
          text: CV_PROFILE.classification,
        });
      }

      const leftX = HEADER.paddingX;
      const rightX = PAGE.width / 2 + 16;
      const contactTop = PAGE.height - 92;
      const contactGap = 19.5;

      [
        `Location: ${CV_PROFILE.location}`,
        `Email: ${CV_PROFILE.email}`,
        `GitHub: ${CV_PROFILE.github}`,
      ].forEach((text, index) => {
        currentPage.push({
          kind: "text",
          x: leftX,
          y: contactTop - index * contactGap,
          font: "F1",
          size: 10.2,
          color: COLORS.white,
          text,
        });
      });

      [
        `Phone: ${CV_PROFILE.phone}`,
        `Portfolio: ${CV_PROFILE.portfolio}`,
        `LinkedIn: ${CV_PROFILE.linkedin}`,
      ].forEach((text, index) => {
        currentPage.push({
          kind: "text",
          x: rightX,
          y: contactTop - index * contactGap,
          font: "F1",
          size: 10.2,
          color: COLORS.white,
          text,
        });
      });

      cursorY = PAGE.height - HEADER.height - 22;
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

  function addSection(title, options = {}) {
    ensureSpace(44 + (options.keepWith || 0));
    currentPage.push({
      kind: "rect",
      x: PAGE.marginX,
      y: cursorY - 12,
      width: 4,
      height: 20,
      color: COLORS.blue,
    });
    drawTextLine(title.toUpperCase(), PAGE.marginX + 12, cursorY, {
      font: "F2",
      size: 14,
      color: COLORS.dark,
    });
    const ruleY = cursorY - 13;
    currentPage.push({
      kind: "line",
      x1: PAGE.marginX,
      x2: PAGE.width - PAGE.marginX,
      y: ruleY,
      width: 1,
      color: COLORS.line,
    });
    cursorY = ruleY - 16;
  }

  function addBoxedParagraph(text, options = {}) {
    const x = options.x ?? PAGE.marginX;
    const width = options.width ?? PAGE.width - PAGE.marginX * 2;
    const size = options.size ?? 11.8;
    const leading = options.leading ?? 14.8;
    const paddingX = 14;
    const paddingY = 14;
    const lines = wrapText(text, width - paddingX * 2, size);
    const boxHeight = lines.length * leading + paddingY * 2 - 3;

    ensureSpace(boxHeight + 12);
    currentPage.push({
      kind: "rect",
      x,
      y: cursorY - boxHeight + 6,
      width,
      height: boxHeight,
      color: COLORS.panel,
    });

    lines.forEach((line, index) => {
      drawTextLine(line, x + paddingX, cursorY - paddingY - index * leading + 3, {
        font: "F1",
        size,
        color: options.color || COLORS.body,
      });
    });

    cursorY -= boxHeight + 10;
  }

  function getSchoolRowLayout(entry) {
    const contentWidth = PAGE.width - PAGE.marginX * 2;
    const dateWidth = 88;
    const gap = 14;
    const schoolWidth = contentWidth - dateWidth - gap;
    const schoolLines = wrapText(entry.name, schoolWidth - 18, 11.8);
    const rowHeight = Math.max(42, schoolLines.length * 14 + 20);

    return {
      contentWidth,
      dateWidth,
      gap,
      schoolLines,
      rowHeight,
    };
  }

  function estimateFirstSchoolBlockHeight(entries) {
    if (!entries?.length) return 0;
    return getSchoolRowLayout(entries[0]).rowHeight + 8;
  }

  function addSchoolsTimeline(entries) {
    for (const entry of entries) {
      const { contentWidth, dateWidth, gap, schoolLines, rowHeight } = getSchoolRowLayout(entry);
      ensureSpace(rowHeight + 8);
      const rowY = cursorY;

      currentPage.push({
        kind: "rect",
        x: PAGE.marginX,
        y: rowY - rowHeight + 7,
        width: contentWidth,
        height: rowHeight,
        color: COLORS.panel,
      });
      currentPage.push({
        kind: "rect",
        x: PAGE.marginX,
        y: rowY - rowHeight + 7,
        width: 4,
        height: rowHeight,
        color: COLORS.blue,
      });
      currentPage.push({
        kind: "rect",
        x: PAGE.marginX + 13,
        y: rowY - 24,
        width: dateWidth,
        height: 21,
        color: COLORS.bluePale,
      });

      drawTextLine(entry.dateRange || "", PAGE.marginX + 20, rowY - 17.5, {
        font: "F2",
        size: 10.4,
        color: COLORS.blueDark,
      });

      schoolLines.forEach((line, index) => {
        drawTextLine(line, PAGE.marginX + dateWidth + gap + 12, rowY - 14 - index * 14, {
          font: "F2",
          size: 11.8,
          color: COLORS.dark,
        });
      });

      cursorY -= rowHeight + 7;
    }
  }

  function addQualificationsTable(entries) {
    const contentWidth = PAGE.width - PAGE.marginX * 2;
    const yearWidth = 58;
    const gap = 13;
    const titleWidth = 242;
    const institutionWidth = contentWidth - yearWidth - titleWidth - gap * 2;
    const headerHeight = 25;

    ensureSpace(headerHeight + 44);
    currentPage.push({
      kind: "rect",
      x: PAGE.marginX,
      y: cursorY - headerHeight + 5,
      width: contentWidth,
      height: headerHeight,
      color: COLORS.blueDark,
    });

    drawTextLine("YEAR", PAGE.marginX + 9, cursorY - 10, {
      font: "F2",
      size: 9.3,
      color: COLORS.white,
    });
    drawTextLine("CERTIFICATE / QUALIFICATION OBTAINED", PAGE.marginX + yearWidth + gap, cursorY - 10, {
      font: "F2",
      size: 9.3,
      color: COLORS.white,
    });
    drawTextLine("INSTITUTION", PAGE.marginX + yearWidth + titleWidth + gap * 2, cursorY - 10, {
      font: "F2",
      size: 9.3,
      color: COLORS.white,
    });

    cursorY -= headerHeight + 5;

    entries.forEach((entry, index) => {
      const titleLines = wrapText(entry.title, titleWidth, 10.9);
      const institutionLines = wrapText(entry.institution || "", institutionWidth, 10.5);
      const rowHeight = Math.max(42, Math.max(titleLines.length, institutionLines.length) * 13 + 19);
      ensureSpace(rowHeight + 6);
      const rowY = cursorY;

      currentPage.push({
        kind: "rect",
        x: PAGE.marginX,
        y: rowY - rowHeight + 5,
        width: contentWidth,
        height: rowHeight,
        color: index % 2 === 0 ? COLORS.panel : COLORS.white,
      });
      currentPage.push({
        kind: "line",
        x1: PAGE.marginX,
        x2: PAGE.width - PAGE.marginX,
        y: rowY - rowHeight + 5,
        width: 0.6,
        color: COLORS.line,
      });

      drawTextLine(entry.dateRange || "", PAGE.marginX + 10, rowY - 15, {
        font: "F2",
        size: 10.4,
        color: COLORS.blueDark,
      });
      titleLines.forEach((line, lineIndex) => {
        drawTextLine(line, PAGE.marginX + yearWidth + gap, rowY - 14 - lineIndex * 13, {
          font: "F2",
          size: 10.9,
          color: COLORS.dark,
        });
      });
      institutionLines.forEach((line, lineIndex) => {
        drawTextLine(line, PAGE.marginX + yearWidth + titleWidth + gap * 2, rowY - 14 - lineIndex * 13, {
          font: "F1",
          size: 10.5,
          color: COLORS.body,
        });
      });

      cursorY -= rowHeight + 4;
    });

    cursorY -= 4;
  }

  function addSkillColumns(items) {
    ensureSpace(60);
    const leftItems = items.slice(0, Math.ceil(items.length / 2));
    const rightItems = items.slice(Math.ceil(items.length / 2));
    const leftX = PAGE.marginX;
    const rightX = PAGE.width / 2 + 6;
    const bulletWidth = PAGE.width / 2 - PAGE.marginX - 14;
    const lineHeight = 14.4;
    const startY = cursorY;

    const renderColumn = (columnItems, x) => {
      let localY = startY;
      columnItems.forEach((item) => {
        const lines = wrapText(item, bulletWidth, 11.1, {
          firstPrefix: "- ",
          continuationPrefix: "  ",
        });
        lines.forEach((line, lineIndex) => {
          drawTextLine(line, x, localY - lineIndex * 12.3, {
            size: 10.9,
            color: COLORS.body,
          });
        });
        localY -= Math.max(lineHeight, lines.length * 12.3 + 1);
      });
      return localY;
    };

    const estimatedRows = Math.max(leftItems.length, rightItems.length);
    ensureSpace(estimatedRows * lineHeight + 6);

    const leftBottomY = renderColumn(leftItems, leftX);
    const rightBottomY = renderColumn(rightItems, rightX);
    cursorY = Math.min(leftBottomY, rightBottomY);
  }

  function addChipList(items) {
    const contentRight = PAGE.width - PAGE.marginX;
    let x = PAGE.marginX;
    const rowHeight = 24;

    ensureSpace(rowHeight + 8);

    for (const item of items) {
      const label = toAsciiSafe(item);
      const chipWidth = Math.min(Math.max(estimateTextWidth(label, 10.5) + 20, 64), 166);

      if (x + chipWidth > contentRight) {
        cursorY -= rowHeight;
        x = PAGE.marginX;
        ensureSpace(rowHeight + 8);
      }

      currentPage.push({
        kind: "rect",
        x,
        y: cursorY - 16,
        width: chipWidth,
        height: 20,
        color: COLORS.bluePale,
      });
      drawTextLine(label, x + 9, cursorY - 10.5, {
        font: "F2",
        size: 10,
        color: COLORS.blueDark,
      });
      x += chipWidth + 7;
    }

    cursorY -= rowHeight + 6;
  }

  function addBulletList(items) {
    items.forEach((item, index) => {
      addParagraph(item, {
        size: 11,
        color: COLORS.body,
        leading: 13.8,
        after: index === items.length - 1 ? 0 : 1,
        wrap: {
          firstPrefix: "- ",
          continuationPrefix: "  ",
        },
      });
    });
  }

  function addPersonalDetails(items) {
    const longLabels = new Set(["GSM Phone", "Contact Address", "Email Address"]);
    const compactItems = items.filter((item) => !longLabels.has(item.label));
    const fullWidthItems = items.filter((item) => longLabels.has(item.label));
    const gap = 18;
    const contentWidth = PAGE.width - PAGE.marginX * 2;
    const colWidth = (contentWidth - gap) / 2;

    function drawInfoItem(item, x, y, width) {
      const lines = wrapText(item.value, width, 10.5);
      drawTextLine(item.label.toUpperCase(), x, y, {
        font: "F2",
        size: 8.5,
        color: COLORS.blueDark,
      });
      lines.forEach((line, index) => {
        drawTextLine(line, x, y - 13 - index * 12, {
          font: "F1",
          size: 10.5,
          color: COLORS.body,
        });
      });
      return Math.max(32, 18 + lines.length * 12);
    }

    for (let index = 0; index < compactItems.length; index += 2) {
      const row = compactItems.slice(index, index + 2);
      const heights = row.map((item) => {
        const lines = wrapText(item.value, colWidth, 10.5);
        return Math.max(32, 18 + lines.length * 12);
      });
      const rowHeight = Math.max(...heights);
      ensureSpace(rowHeight + 5);
      const rowY = cursorY;

      row.forEach((item, itemIndex) => {
        drawInfoItem(item, PAGE.marginX + itemIndex * (colWidth + gap), rowY, colWidth);
      });

      currentPage.push({
        kind: "line",
        x1: PAGE.marginX,
        x2: PAGE.width - PAGE.marginX,
        y: rowY - rowHeight + 5,
        width: 0.6,
        color: COLORS.line,
      });
      cursorY -= rowHeight + 3;
    }

    for (const item of fullWidthItems) {
      const labelWidth = 118;
      const valueWidth = contentWidth - labelWidth - 12;
      const lines = wrapText(item.value, valueWidth, 10.6);
      const rowHeight = Math.max(32, 18 + lines.length * 12);
      ensureSpace(rowHeight + 5);
      const rowY = cursorY;

      drawTextLine(item.label.toUpperCase(), PAGE.marginX, rowY, {
        font: "F2",
        size: 8.5,
        color: COLORS.blueDark,
      });
      lines.forEach((line, index) => {
        drawTextLine(line, PAGE.marginX + labelWidth + 12, rowY - index * 12, {
          font: "F1",
          size: 10.6,
          color: COLORS.body,
        });
      });
      currentPage.push({
        kind: "line",
        x1: PAGE.marginX,
        x2: PAGE.width - PAGE.marginX,
        y: rowY - rowHeight + 5,
        width: 0.6,
        color: COLORS.line,
      });
      cursorY -= rowHeight + 3;
    }

    cursorY -= 6;
  }

  newPage(true);

  addSection("Schools Attended With Dates", {
    keepWith: estimateFirstSchoolBlockHeight(CV_PROFILE.schoolsAttended),
  });
  addSchoolsTimeline(CV_PROFILE.schoolsAttended);

  newPage(false);
  addSection("Certificates / Qualifications Obtained");
  addQualificationsTable(CV_PROFILE.qualifications);

  addSection("Personal Information");
  addPersonalDetails(CV_PROFILE.personalDetails || []);

  addSection("Professional Summary");
  addBoxedParagraph(CV_PROFILE.summary, {
    size: 11.8,
    color: COLORS.body,
    leading: 14.8,
  });

  addSection("Technical Skills");
  addChipList(CV_PROFILE.technicalSkills);
  if (CV_PROFILE.technicalSkillsNote) {
    addParagraph(CV_PROFILE.technicalSkillsNote, {
      size: 11.2,
      color: COLORS.body,
      leading: 14.2,
      after: 8,
    });
  }

  addSection("Workplace Skills");
  addSkillColumns(CV_PROFILE.workplaceSkills);
  cursorY -= 8;

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
