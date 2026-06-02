import { CV_PROFILE } from "./profile.js";
import { escapeHtml } from "../utils.js";

function renderBulletList(items) {
  return items
    .map(
      (item) =>
        `<li style="margin: 0 0 9px 20px; color: #334155; font-size: 15.5px; line-height: 1.6;">${escapeHtml(item)}</li>`
    )
    .join("");
}

function renderSkillColumns(items) {
  const midpoint = Math.ceil(items.length / 2);
  const left = items.slice(0, midpoint);
  const right = items.slice(midpoint);

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 14px;">
    <tr>
      <td style="width: 50%; vertical-align: top; padding-right: 20px;">
        <ul style="margin: 0; padding: 0;">${renderBulletList(left)}</ul>
      </td>
      <td style="width: 50%; vertical-align: top; padding-left: 20px;">
        <ul style="margin: 0; padding: 0;">${renderBulletList(right)}</ul>
      </td>
    </tr>
  </table>`;
}

function renderSkillTags(items) {
  return `<div style="margin-top: 14px;">
    ${items
      .map(
        (item) =>
          `<span style="display: inline-block; margin: 0 8px 9px 0; padding: 7px 11px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; font-size: 14.5px; font-weight: 700;">${escapeHtml(item)}</span>`
      )
      .join("")}
  </div>`;
}

function renderSchoolsAttended(entries) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin-top: 14px;">
    ${entries
      .map(
        (entry) => `<tr>
          <td style="width: 126px; vertical-align: top; padding: 12px 13px; border-left: 4px solid #2563eb; border-bottom: 1px solid #e5e7eb; background: #eff6ff; color: #1d4ed8; font-size: 14.5px; font-weight: 700; white-space: nowrap;">${escapeHtml(entry.dateRange || "")}</td>
          <td style="vertical-align: top; padding: 12px 15px; border-bottom: 1px solid #e5e7eb; background: #ffffff; color: #1f2937; font-size: 16.2px; line-height: 1.5; font-weight: 700;">${escapeHtml(entry.name)}</td>
        </tr>`
      )
      .join("")}
  </table>`;
}

function renderQualificationsTable(entries) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin-top: 14px; border: 1px solid #dbe3ef;">
    <tr>
      <td style="width: 86px; padding: 10px 11px; background: #0f2f6b; color: #ffffff; font-size: 13.3px; font-weight: 700; text-transform: uppercase;">Year</td>
      <td style="padding: 10px 13px; background: #0f2f6b; color: #ffffff; font-size: 13.3px; font-weight: 700; text-transform: uppercase;">Certificate / Qualification Obtained</td>
      <td style="width: 250px; padding: 10px 13px; background: #0f2f6b; color: #ffffff; font-size: 13.3px; font-weight: 700; text-transform: uppercase;">Institution</td>
    </tr>
    ${entries
      .map(
        (entry, index) => `<tr>
          <td style="vertical-align: top; padding: 12px 11px; border-top: 1px solid #e5e7eb; background: ${
            index % 2 === 0 ? "#f8fbff" : "#ffffff"
          }; color: #1d4ed8; font-size: 15px; font-weight: 700;">${escapeHtml(entry.dateRange || "")}</td>
          <td style="vertical-align: top; padding: 12px 13px; border-top: 1px solid #e5e7eb; background: ${
            index % 2 === 0 ? "#f8fbff" : "#ffffff"
          }; color: #1f2937; font-size: 15.5px; line-height: 1.5; font-weight: 700;">${escapeHtml(entry.title)}</td>
          <td style="vertical-align: top; padding: 12px 13px; border-top: 1px solid #e5e7eb; background: ${
            index % 2 === 0 ? "#f8fbff" : "#ffffff"
          }; color: #475569; font-size: 15px; line-height: 1.5;">${escapeHtml(entry.institution || "")}</td>
        </tr>`
      )
      .join("")}
  </table>`;
}

function renderPersonalDetails() {
  const longLabels = new Set(["GSM Phone", "Contact Address", "Email Address"]);
  const compactItems = (CV_PROFILE.personalDetails || []).filter((item) => !longLabels.has(item.label));
  const fullWidthItems = (CV_PROFILE.personalDetails || []).filter((item) => longLabels.has(item.label));

  const renderCell = (item) => `<div style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
    <div style="font-size: 12px; line-height: 1.35; color: #1d4ed8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;">${escapeHtml(item.label)}</div>
    <div style="margin-top: 4px; color: #1f2937; font-size: 15px; line-height: 1.5;">${escapeHtml(item.value)}</div>
  </div>`;

  const rows = [];
  for (let index = 0; index < compactItems.length; index += 2) {
    const left = compactItems[index];
    const right = compactItems[index + 1];
    rows.push(`<tr>
      <td style="width: 50%; vertical-align: top; padding-right: 8px;">${left ? renderCell(left) : ""}</td>
      <td style="width: 50%; vertical-align: top; padding-left: 8px;">${right ? renderCell(right) : ""}</td>
    </tr>`);
  }

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 12px; border-collapse: collapse;">
    ${rows.join("")}
    ${fullWidthItems
      .map(
        (item) => `<tr>
          <td colspan="2" style="padding: 0;">${renderCell(item)}</td>
        </tr>`
      )
      .join("")}
  </table>`;
}

function renderSection(title, body, options = {}) {
  const pageBreakStyle = options.pageBreakBefore ? "page-break-before: always; break-before: page; " : "";
  return `<div style="${pageBreakStyle}margin-top: 28px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-bottom: 12px;">
      <tr>
        <td style="width: 6px; background: #2563eb;"></td>
        <td style="padding-left: 11px; color: #111827; font-size: 19px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(title)}</td>
      </tr>
    </table>
    ${body}
  </div>`;
}

function renderContactRow(label, value) {
  return `<div style="font-size: 14.8px; line-height: 1.8;">
    <span style="font-weight: 700; color: #bfdbfe;">${escapeHtml(label)}:</span> ${escapeHtml(value)}
  </div>`;
}

export function buildCvWordDocument() {
  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="ProgId" content="Word.Document" />
    <meta name="Generator" content="sirdavid.site" />
    <title>${escapeHtml(CV_PROFILE.name)} - CV</title>
    <style>
      @page WordSection1 {
        size: 595.3pt 841.9pt;
        margin: 36pt 32pt 36pt 32pt;
      }
      div.WordSection1 {
        page: WordSection1;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background: #eef2f7; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <div class="WordSection1" style="max-width: 794px; margin: 0 auto; padding: 20px; background: #eef2f7; box-sizing: border-box;">
      <div style="background: #ffffff; border: 1px solid #d1d5db;">
        <div style="background: #0f2f6b; color: #ffffff; padding: 34px 38px 28px; border-bottom: 6px solid #2563eb;">
          <div style="font-size: 34px; line-height: 1.16; font-weight: 700; letter-spacing: 0.2px;">${escapeHtml(CV_PROFILE.name)}</div>
          ${
            CV_PROFILE.classification
              ? `<div style="margin-top: 7px; font-size: 16px; font-weight: 600; color: #dbeafe; letter-spacing: 0.2px;">${escapeHtml(CV_PROFILE.classification)}</div>`
              : ""
          }
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 21px; color: #ffffff;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 24px;">
                ${renderContactRow("Location", CV_PROFILE.location)}
                ${renderContactRow("Email", CV_PROFILE.email)}
                ${renderContactRow("GitHub", CV_PROFILE.github)}
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 24px;">
                ${renderContactRow("Phone", CV_PROFILE.phone)}
                ${renderContactRow("Portfolio", CV_PROFILE.portfolio)}
                ${renderContactRow("LinkedIn", CV_PROFILE.linkedin)}
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 30px 38px 38px;">
          ${renderSection("Schools Attended With Dates", renderSchoolsAttended(CV_PROFILE.schoolsAttended))}

          ${renderSection(
            "Certificates / Qualifications Obtained",
            renderQualificationsTable(CV_PROFILE.qualifications),
            {
              pageBreakBefore: true,
            }
          )}

          ${renderSection("Personal Information", renderPersonalDetails())}

          ${renderSection(
            "Professional Summary",
            `<div style="padding: 16px 18px; border: 1px solid #dbeafe; background: #f8fbff; color: #334155; font-size: 15.8px; line-height: 1.65;">${escapeHtml(CV_PROFILE.summary)}</div>`
          )}

          ${renderSection(
            "Technical Skills",
            `${renderSkillTags(CV_PROFILE.technicalSkills)}${
              CV_PROFILE.technicalSkillsNote
                ? `<div style="margin-top: 9px; color: #4b5563; font-size: 15px; line-height: 1.58; font-style: italic;">${escapeHtml(CV_PROFILE.technicalSkillsNote)}</div>`
                : ""
            }`
          )}

          ${renderSection(
            "Workplace Skills",
            renderSkillColumns(CV_PROFILE.workplaceSkills)
          )}

          ${renderSection(
            "Additional Information",
            `<ul style="margin: 12px 0 0; padding: 0;">${renderBulletList(CV_PROFILE.additionalInformation)}</ul>`
          )}
        </div>
      </div>
    </div>
  </body>
</html>`;
}
