import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, HeadingLevel, Packer,
  Paragraph, Table, TableCell, TableLayoutType, TableRow, TextRun, VerticalAlign, WidthType,
} from "docx";
import { CV_PROFILE } from "./profile.js";

const widthByColumn = [950, 5200, 4010];
const tableBorder = { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" };

function heading(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, keepNext: true });
}

function link(label, text, url) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text: `${label} ${text}`, style: "Hyperlink", size: 19 })],
  });
}

function qualificationRow(values, fill, header = false) {
  return new TableRow({
    tableHeader: header,
    cantSplit: true,
    children: values.map((text, index) => new TableCell({
      width: { size: widthByColumn[index], type: WidthType.DXA },
      shading: { fill },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 0, line: 255 },
        children: [new TextRun({ text, bold: header, size: 21, color: header ? "FFFFFF" : "202B3B" })],
      })],
    })),
  });
}

export function buildCvDocx() {
  const document = new Document({
    title: `${CV_PROFILE.name} CV`,
    creator: CV_PROFILE.name,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 23, color: "202B3B" },
          paragraph: { spacing: { after: 115, line: 280 } },
        },
        title: {
          run: { font: "Calibri", size: 56, bold: true, color: "000000" },
          paragraph: { spacing: { after: 55 }, keepNext: true },
        },
        heading1: {
          run: { font: "Calibri", size: 28, bold: true, color: "000000" },
          paragraph: { spacing: { before: 320, after: 115 }, keepNext: true },
        },
      },
    },
    sections: [{
      properties: { page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1000, bottom: 950, left: 870, right: 870 },
      } },
      children: [
        new Paragraph({ text: CV_PROFILE.name, heading: HeadingLevel.TITLE }),
        new Paragraph({
          keepNext: true,
          children: [new TextRun({ text: CV_PROFILE.classification, bold: true, size: 25 })],
        }),
        new Paragraph({
          spacing: { after: 110, line: 280 },
          children: [
            link("LinkedIn", CV_PROFILE.linkedin, CV_PROFILE.linkedinUrl),
            new TextRun("   |   "),
            link("GitHub", CV_PROFILE.github, CV_PROFILE.githubUrl),
            new TextRun("   |   "),
            link("Portfolio", CV_PROFILE.portfolio, CV_PROFILE.portfolioUrl),
          ],
        }),
        heading("Personal Information"),
        ...CV_PROFILE.personalDetails.map(({ label, value }) => new Paragraph({
          children: [new TextRun({ text: `${label}  `, bold: true }), new TextRun(value)],
        })),
        heading("Professional Summary"),
        new Paragraph(CV_PROFILE.summary),
        heading("Schools Attended With Dates"),
        ...CV_PROFILE.schoolsAttended.map(({ name, dateRange }) => new Paragraph({
          children: [new TextRun({ text: `${dateRange}  `, bold: true }), new TextRun(name)],
        })),
        new Paragraph({
          text: "Certificates / Qualifications Obtained",
          heading: HeadingLevel.HEADING_1,
          keepNext: true,
          pageBreakBefore: true,
        }),
        new Table({
          width: { size: widthByColumn.reduce((sum, width) => sum + width, 0), type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          columnWidths: widthByColumn,
          margins: { top: 90, bottom: 90, left: 125, right: 125 },
          borders: {
            top: tableBorder, left: tableBorder, bottom: tableBorder, right: tableBorder,
            insideHorizontal: tableBorder, insideVertical: tableBorder,
          },
          rows: [
            qualificationRow(["Year", "Certificate / Qualification", "Institution"], "1E3A6D", true),
            ...CV_PROFILE.qualifications.map(({ dateRange, title, institution }, index) =>
              qualificationRow([dateRange, title, institution], index % 2 ? "F1F5F9" : "FFFFFF")
            ),
          ],
        }),
        heading("Workplace Skills"),
        ...CV_PROFILE.workplaceSkills.map((text) => new Paragraph({ text, bullet: { level: 0 } })),
        heading("Additional Information"),
        ...CV_PROFILE.additionalInformation.map((text) => new Paragraph({ text, bullet: { level: 0 } })),
      ],
    }],
  });

  return Packer.toBuffer(document);
}
