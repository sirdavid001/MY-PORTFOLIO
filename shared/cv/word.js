import { CV_PROFILE } from "./profile.js";
import { escapeHtml } from "../utils.js";

function renderBulletList(items) {
  return items
    .map(
      (item) =>
        `<li style="margin: 0 0 7px 18px; color: #334155; font-size: 14px; line-height: 1.55;">${escapeHtml(item)}</li>`
    )
    .join("");
}

function renderSkillColumns(items) {
  const midpoint = Math.ceil(items.length / 2);
  const left = items.slice(0, midpoint);
  const right = items.slice(midpoint);

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 12px;">
    <tr>
      <td style="width: 50%; vertical-align: top; padding-right: 18px;">
        <ul style="margin: 0; padding: 0;">${renderBulletList(left)}</ul>
      </td>
      <td style="width: 50%; vertical-align: top; padding-left: 18px;">
        <ul style="margin: 0; padding: 0;">${renderBulletList(right)}</ul>
      </td>
    </tr>
  </table>`;
}

function renderSkillTags(items) {
  return `<div style="margin-top: 12px;">
    ${items
      .map(
        (item) =>
          `<span style="display: inline-block; margin: 0 7px 8px 0; padding: 6px 10px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; font-size: 13px; font-weight: 700;">${escapeHtml(item)}</span>`
      )
      .join("")}
  </div>`;
}

function renderSchoolsAttended(entries) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin-top: 12px;">
    ${entries
      .map(
        (entry) => `<tr>
          <td style="width: 112px; vertical-align: top; padding: 10px 12px; border-left: 4px solid #2563eb; border-bottom: 1px solid #e5e7eb; background: #eff6ff; color: #1d4ed8; font-size: 13px; font-weight: 700; white-space: nowrap;">${escapeHtml(entry.dateRange || "")}</td>
          <td style="vertical-align: top; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; background: #ffffff; color: #1f2937; font-size: 15px; line-height: 1.45; font-weight: 700;">${escapeHtml(entry.name)}</td>
        </tr>`
      )
      .join("")}
  </table>`;
}

function renderQualificationsTable(entries) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin-top: 12px; border: 1px solid #dbe3ef;">
    <tr>
      <td style="width: 78px; padding: 9px 10px; background: #0f2f6b; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Year</td>
      <td style="padding: 9px 12px; background: #0f2f6b; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Certificate / Qualification Obtained</td>
      <td style="width: 245px; padding: 9px 12px; background: #0f2f6b; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Institution</td>
    </tr>
    ${entries
      .map(
        (entry, index) => `<tr>
          <td style="vertical-align: top; padding: 10px; border-top: 1px solid #e5e7eb; background: ${
            index % 2 === 0 ? "#f8fbff" : "#ffffff"
          }; color: #1d4ed8; font-size: 13.5px; font-weight: 700;">${escapeHtml(entry.dateRange || "")}</td>
          <td style="vertical-align: top; padding: 10px 12px; border-top: 1px solid #e5e7eb; background: ${
            index % 2 === 0 ? "#f8fbff" : "#ffffff"
          }; color: #1f2937; font-size: 14.5px; line-height: 1.45; font-weight: 700;">${escapeHtml(entry.title)}</td>
          <td style="vertical-align: top; padding: 10px 12px; border-top: 1px solid #e5e7eb; background: ${
            index % 2 === 0 ? "#f8fbff" : "#ffffff"
          }; color: #475569; font-size: 14px; line-height: 1.45;">${escapeHtml(entry.institution || "")}</td>
        </tr>`
      )
      .join("")}
  </table>`;
}

function renderProjects() {
  return CV_PROFILE.projects
    .map(
      (project) => `<div style="margin-top: 14px; padding-left: 12px; border-left: 3px solid #bfdbfe;">
        <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${escapeHtml(project.title)}</div>
        <div style="margin-top: 4px; color: #3f4d63; font-size: 14.5px; line-height: 1.55;">${escapeHtml(project.description)}</div>
      </div>`
    )
    .join("");
}

function renderPersonalDetails() {
  const longLabels = new Set(["GSM Phone", "Contact Address", "Email Address"]);
  const compactItems = (CV_PROFILE.personalDetails || []).filter((item) => !longLabels.has(item.label));
  const fullWidthItems = (CV_PROFILE.personalDetails || []).filter((item) => longLabels.has(item.label));

  const renderCell = (item) => `<div style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
    <div style="font-size: 11px; line-height: 1.35; color: #1d4ed8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;">${escapeHtml(item.label)}</div>
    <div style="margin-top: 3px; color: #1f2937; font-size: 14px; line-height: 1.45;">${escapeHtml(item.value)}</div>
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

function renderSection(title, body) {
  return `<div style="margin-top: 24px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-bottom: 10px;">
      <tr>
        <td style="width: 6px; background: #2563eb;"></td>
        <td style="padding-left: 10px; color: #111827; font-size: 17px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(title)}</td>
      </tr>
    </table>
    ${body}
  </div>`;
}

function renderContactRow(label, value) {
  return `<div style="font-size: 13.5px; line-height: 1.75;">
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
  </head>
  <body style="margin: 0; padding: 0; background: #eef2f7; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <div style="max-width: 980px; margin: 0 auto; padding: 18px; background: #eef2f7;">
      <div style="background: #ffffff; border: 1px solid #d1d5db;">
        <div style="background: #0f2f6b; color: #ffffff; padding: 30px 34px 24px; border-bottom: 6px solid #2563eb;">
          <div style="font-size: 31px; line-height: 1.16; font-weight: 700; letter-spacing: 0.2px;">${escapeHtml(CV_PROFILE.name)}</div>
          ${
            CV_PROFILE.classification
              ? `<div style="margin-top: 6px; font-size: 14px; font-weight: 600; color: #dbeafe; letter-spacing: 0.2px;">${escapeHtml(CV_PROFILE.classification)}</div>`
              : ""
          }
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 18px; color: #ffffff;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 22px;">
                ${renderContactRow("Location", CV_PROFILE.location)}
                ${renderContactRow("Email", CV_PROFILE.email)}
                ${renderContactRow("GitHub", CV_PROFILE.github)}
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 22px;">
                ${renderContactRow("Phone", CV_PROFILE.phone)}
                ${renderContactRow("Portfolio", CV_PROFILE.portfolio)}
                ${renderContactRow("LinkedIn", CV_PROFILE.linkedin)}
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 26px 34px 34px;">
          ${renderSection("Personal Information", renderPersonalDetails())}

          ${renderSection(
            "Professional Summary",
            `<div style="padding: 14px 16px; border: 1px solid #dbeafe; background: #f8fbff; color: #334155; font-size: 14.5px; line-height: 1.62;">${escapeHtml(CV_PROFILE.summary)}</div>`
          )}

          ${renderSection("Schools Attended With Dates", renderSchoolsAttended(CV_PROFILE.schoolsAttended))}

          ${renderSection(
            "Certificates / Qualifications Obtained",
            renderQualificationsTable(CV_PROFILE.qualifications)
          )}

          ${renderSection(
            "Technical Skills",
            `${renderSkillTags(CV_PROFILE.technicalSkills)}${
              CV_PROFILE.technicalSkillsNote
                ? `<div style="margin-top: 8px; color: #4b5563; font-size: 13.5px; line-height: 1.55; font-style: italic;">${escapeHtml(CV_PROFILE.technicalSkillsNote)}</div>`
                : ""
            }`
          )}

          ${renderSection("Selected Projects", renderProjects())}

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
