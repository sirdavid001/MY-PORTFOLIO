import { CV_PROFILE } from "./profile.js";

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 30,
  marginTop: 32,
  marginBottom: 34,
};

const HEADER = {
  height: 92,
  paddingX: 30,
  topInset: 31,
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
  let section = null;

  function tag(role = "P", parent = section) {
    return { role, parent };
  }
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
        size: 28,
        color: COLORS.white,
        text: CV_PROFILE.name,
        tag: tag("H1"),
      });

      if (CV_PROFILE.classification) {
        currentPage.push({
          kind: "text",
          x: HEADER.paddingX,
          y: PAGE.height - HEADER.topInset - 21,
          font: "F1",
          size: 12.5,
          color: COLORS.white,
          text: CV_PROFILE.classification,
          tag: tag(),
        });
      }

      currentPage.push({
        kind: "text",
        x: HEADER.paddingX,
        y: PAGE.height - HEADER.topInset - 43,
        font: "F1",
        size: 9.4,
        color: COLORS.white,
        text: `LinkedIn: ${CV_PROFILE.linkedin} | GitHub: ${CV_PROFILE.github} | Portfolio: ${CV_PROFILE.portfolio}`,
        tag: tag(),
      });

      cursorY = PAGE.height - HEADER.height - 18;
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
      tag: options.tag || tag(),
    });
  }

  function addParagraph(text, options = {}) {
    const x = options.x ?? PAGE.marginX;
    const width = options.width ?? PAGE.width - PAGE.marginX * 2;
    const size = options.size ?? 12;
    const leading = options.leading ?? size + 5;
    const after = options.after ?? 10;
    const lines = wrapText(text, width, size, options.wrap || {});

    const paragraphTag = options.tag || tag();
    for (const line of lines) {
      ensureSpace(leading + after);
      drawTextLine(line, x, cursorY, { ...options, tag: paragraphTag });
      cursorY -= leading;
    }

    cursorY -= after;
  }

  function addSection(title, options = {}) {
    section = tag("Sect", null);
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
      tag: tag("H2"),
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

    const paragraphTag = tag();
    lines.forEach((line, index) => {
      drawTextLine(line, x + paddingX, cursorY - paddingY - index * leading + 3, {
        font: "F1",
        size,
        color: options.color || COLORS.body,
        tag: paragraphTag,
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

  function estimateSchoolsBlockHeight(entries) {
    return (entries || []).reduce((total, entry) => total + getSchoolRowLayout(entry).rowHeight + 7, 0);
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

      const schoolTag = tag();
      drawTextLine(entry.dateRange || "", PAGE.marginX + 20, rowY - 17.5, {
        font: "F2",
        size: 10.4,
        color: COLORS.blueDark,
        tag: schoolTag,
      });

      schoolLines.forEach((line, index) => {
        drawTextLine(line, PAGE.marginX + dateWidth + gap + 12, rowY - 14 - index * 14, {
          font: "F2",
          size: 11.8,
          color: COLORS.dark,
          tag: schoolTag,
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
    const tableTag = tag("Table");
    const headerTag = tag("TR", tableTag);

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
      tag: tag("TH", headerTag),
    });
    drawTextLine("CERTIFICATE / QUALIFICATION OBTAINED", PAGE.marginX + yearWidth + gap, cursorY - 10, {
      font: "F2",
      size: 9.3,
      color: COLORS.white,
      tag: tag("TH", headerTag),
    });
    drawTextLine("INSTITUTION", PAGE.marginX + yearWidth + titleWidth + gap * 2, cursorY - 10, {
      font: "F2",
      size: 9.3,
      color: COLORS.white,
      tag: tag("TH", headerTag),
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

      const rowTag = tag("TR", tableTag);
      const titleTag = tag("TD", rowTag);
      const institutionTag = tag("TD", rowTag);
      drawTextLine(entry.dateRange || "", PAGE.marginX + 10, rowY - 15, {
        font: "F2",
        size: 10.4,
        color: COLORS.blueDark,
        tag: tag("TD", rowTag),
      });
      titleLines.forEach((line, lineIndex) => {
        drawTextLine(line, PAGE.marginX + yearWidth + gap, rowY - 14 - lineIndex * 13, {
          font: "F2",
          size: 10.9,
          color: COLORS.dark,
          tag: titleTag,
        });
      });
      institutionLines.forEach((line, lineIndex) => {
        drawTextLine(line, PAGE.marginX + yearWidth + titleWidth + gap * 2, rowY - 14 - lineIndex * 13, {
          font: "F1",
          size: 10.5,
          color: COLORS.body,
          tag: institutionTag,
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
    const listTag = tag("L");
    const estimatedRows = Math.max(leftItems.length, rightItems.length);
    ensureSpace(estimatedRows * lineHeight + 6);
    const startY = cursorY;

    const renderColumn = (columnItems, x) => {
      let localY = startY;
      columnItems.forEach((item) => {
        const lines = wrapText(item, bulletWidth, 11.1, {
          firstPrefix: "- ",
          continuationPrefix: "  ",
        });
        const itemTag = tag("LBody", tag("LI", listTag));
        lines.forEach((line, lineIndex) => {
          drawTextLine(line, x, localY - lineIndex * 12.3, {
            size: 10.9,
            color: COLORS.body,
            tag: itemTag,
          });
        });
        localY -= Math.max(lineHeight, lines.length * 12.3 + 1);
      });
      return localY;
    };

    const leftBottomY = renderColumn(leftItems, leftX);
    const rightBottomY = renderColumn(rightItems, rightX);
    cursorY = Math.min(leftBottomY, rightBottomY);
  }

  function addBulletList(items) {
    const listTag = tag("L");
    items.forEach((item, index) => {
      addParagraph(item, {
        tag: tag("LBody", tag("LI", listTag)),
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
    const longLabels = new Set(["Email Address"]);
    const compactItems = items.filter((item) => !longLabels.has(item.label));
    const fullWidthItems = items.filter((item) => longLabels.has(item.label));
    const gap = 18;
    const contentWidth = PAGE.width - PAGE.marginX * 2;
    const colWidth = (contentWidth - gap) / 2;

    function drawInfoItem(item, x, y, width) {
      const lines = wrapText(item.value, width, 10.5);
      const detailTag = tag();
      drawTextLine(item.label.toUpperCase(), x, y, {
        font: "F2",
        size: 8.5,
        color: COLORS.blueDark,
        tag: detailTag,
      });
      lines.forEach((line, index) => {
        drawTextLine(line, x, y - 13 - index * 12, {
          font: "F1",
          size: 10.5,
          color: COLORS.body,
          tag: detailTag,
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
      const detailTag = tag();

      drawTextLine(item.label.toUpperCase(), PAGE.marginX, rowY, {
        font: "F2",
        size: 8.5,
        color: COLORS.blueDark,
        tag: detailTag,
      });
      lines.forEach((line, index) => {
        drawTextLine(line, PAGE.marginX + labelWidth + 12, rowY - index * 12, {
          font: "F1",
          size: 10.6,
          color: COLORS.body,
          tag: detailTag,
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

  addSection("Personal Information");
  addPersonalDetails(CV_PROFILE.personalDetails || []);

  addSection("Professional Summary");
  addBoxedParagraph(CV_PROFILE.summary, {
    size: 11.8,
    color: COLORS.body,
    leading: 14.8,
  });

  addSection("Schools Attended With Dates", {
    keepWith: estimateSchoolsBlockHeight(CV_PROFILE.schoolsAttended),
  });
  addSchoolsTimeline(CV_PROFILE.schoolsAttended);

  newPage(false);
  addSection("Certificates / Qualifications Obtained");
  addQualificationsTable(CV_PROFILE.qualifications);

  addSection("Workplace Skills");
  addSkillColumns(CV_PROFILE.workplaceSkills);
  cursorY -= 8;

  addSection("Additional Information");
  addBulletList(CV_PROFILE.additionalInformation);

  return pages;
}

function buildContentForPage(operations, registerText) {
  const output = [];

  for (const operation of operations) {
    const color = operation.color.map((value) => value.toFixed(3)).join(" ");
    if (operation.kind === "rect") {
      output.push(
        "/Artifact BMC", "q", `${color} rg`,
        `${operation.x.toFixed(2)} ${operation.y.toFixed(2)} ${operation.width.toFixed(2)} ${operation.height.toFixed(2)} re`,
        "f", "Q", "EMC",
      );
    } else if (operation.kind === "line") {
      output.push(
        "/Artifact BMC", "q", `${operation.width.toFixed(2)} w`, `${color} RG`,
        `${operation.x1.toFixed(2)} ${operation.y.toFixed(2)} m`,
        `${operation.x2.toFixed(2)} ${operation.y.toFixed(2)} l`,
        "S", "Q", "EMC",
      );
    } else {
      const mcid = registerText(operation.tag);
      output.push(
        `/Span << /MCID ${mcid} >> BDC`, "BT", `${color} rg`,
        `1 0 0 1 ${operation.x.toFixed(2)} ${operation.y.toFixed(2)} Tm`,
        `/${operation.font} ${operation.size.toFixed(2)} Tf`,
        `(${escapePdfText(toAsciiSafe(operation.text))}) Tj`,
        "ET", "EMC",
      );
    }
  }

  return output.join("\n");
}

function reference(id) {
  return `${id} 0 R`;
}

export function buildCvPdf() {
  const pages = createBuilder();
  const objects = [];
  const pageIds = [];
  const parentTreeEntries = [];
  const structure = new Map();
  const documentChildren = [];
  let nextObjectId = 9;

  function getStructureElement(tag) {
    if (structure.has(tag)) return structure.get(tag);

    const parent = tag.parent ? getStructureElement(tag.parent) : null;
    const element = { id: nextObjectId++, parent: parent?.id || 6, role: tag.role, children: [] };
    (parent?.children || documentChildren).push(reference(element.id));
    structure.set(tag, element);
    return element;
  }

  for (const [pageIndex, operations] of pages.entries()) {
    const pageId = nextObjectId++;
    const contentId = nextObjectId++;
    const pageParents = [];
    const content = buildContentForPage(operations, (tag) => {
      const element = getStructureElement(tag);
      const mcid = pageParents.length;
      pageParents.push(reference(element.id));
      element.children.push(`<< /Type /MCR /Pg ${reference(pageId)} /MCID ${mcid} >>`);
      return mcid;
    });

    objects.push({
      id: pageId,
      content: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${reference(contentId)} /StructParents ${pageIndex} /Tabs /S >>`,
    });
    objects.push({
      id: contentId,
      content: `<< /Length ${bytesLength(content)} >>\nstream\n${content}\nendstream`,
    });
    pageIds.push(reference(pageId));
    parentTreeEntries.push(`${pageIndex} [${pageParents.join(" ")}]`);
  }

  for (const { id, parent, role, children } of structure.values()) {
    const attributes = role === "TH" ? " /A << /O /Table /Scope /Column >>" : "";
    objects.push({
      id,
      content: `<< /Type /StructElem /S /${role} /P ${reference(parent)} /K [${children.join(" ")}]${attributes} >>`,
    });
  }

  const catalog = {
    id: 1,
    content: "<< /Type /Catalog /Pages 2 0 R /Lang (en-NG) /MarkInfo << /Marked true >> /StructTreeRoot 5 0 R /ViewerPreferences << /DisplayDocTitle true >> >>",
  };
  const pagesObj = {
    id: 2,
    content: `<< /Type /Pages /Kids [${pageIds.join(" ")}] /Count ${pageIds.length} >>`,
  };
  const font1 = { id: 3, content: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" };
  const font2 = { id: 4, content: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>" };
  const root = { id: 5, content: `<< /Type /StructTreeRoot /K [6 0 R] /ParentTree 7 0 R /ParentTreeNextKey ${pages.length} >>` };
  const document = { id: 6, content: `<< /Type /StructElem /S /Document /P 5 0 R /K [${documentChildren.join(" ")}] >>` };
  const parentTree = { id: 7, content: `<< /Nums [${parentTreeEntries.join(" ")}] >>` };
  const info = { id: 8, content: `<< /Title (${escapePdfText(`${CV_PROFILE.name} CV`)}) >>` };

  const allObjects = [catalog, pagesObj, font1, font2, root, document, parentTree, info, ...objects];
  const objectMap = new Map(allObjects.map((entry) => [entry.id, entry.content]));
  const maxId = allObjects.reduce((max, entry) => Math.max(max, entry.id), 0);

  let pdf = "%PDF-1.7\n";
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
  pdf += `<< /Size ${maxId + 1} /Root 1 0 R /Info 8 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}
