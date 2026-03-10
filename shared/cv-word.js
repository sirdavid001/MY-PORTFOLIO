import { CV_PROFILE } from "./cv-profile.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items) {
  return items
    .map(
      (item) =>
        `<li style="margin: 0 0 8px 18px; color: #3f4d63; font-size: 15px; line-height: 1.55;">${escapeHtml(item)}</li>`
    )
    .join("");
}

function renderEducation() {
  return CV_PROFILE.education
    .map((entry) => {
      const details = entry.details
        .map(
          (detail) =>
            `<div style="margin-top: 4px; color: #4b5563; font-size: 14px; line-height: 1.45;">${escapeHtml(detail)}</div>`
        )
        .join("");

      return `<div style="margin-top: 18px;">
        <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${escapeHtml(entry.title)}</div>
        ${details}
      </div>`;
    })
    .join("");
}

function renderProjects() {
  return CV_PROFILE.projects
    .map(
      (project) => `<div style="margin-top: 18px;">
        <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${escapeHtml(project.title)}</div>
        <div style="margin-top: 6px; color: #3f4d63; font-size: 15px; line-height: 1.55;">${escapeHtml(project.description)}</div>
      </div>`
    )
    .join("");
}

function renderSection(title, body) {
  return `<div style="margin-top: 34px;">
    <div style="font-size: 19px; font-weight: 700; color: #1f2937;">${escapeHtml(title)}</div>
    <div style="height: 3px; margin-top: 8px; background: #2563eb;"></div>
    ${body}
  </div>`;
}

export function buildCvWordDocument() {
  const leftSkills = CV_PROFILE.keySkills.items.slice(0, Math.ceil(CV_PROFILE.keySkills.items.length / 2));
  const rightSkills = CV_PROFILE.keySkills.items.slice(Math.ceil(CV_PROFILE.keySkills.items.length / 2));

  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="ProgId" content="Word.Document" />
    <meta name="Generator" content="OpenAI Codex" />
    <title>${escapeHtml(CV_PROFILE.name)} - CV</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <div style="max-width: 960px; margin: 0 auto; background: #f3f4f6;">
      <div style="background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 28px 32px 26px;">
        <div style="font-size: 30px; line-height: 1.2; font-weight: 700;">${escapeHtml(CV_PROFILE.name)}</div>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 18px; color: #ffffff;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 18px;">
              <div style="font-size: 15px; line-height: 1.9;">${escapeHtml(CV_PROFILE.location)}</div>
              <div style="font-size: 15px; line-height: 1.9;">${escapeHtml(CV_PROFILE.email)}</div>
              <div style="font-size: 15px; line-height: 1.9;">GitHub: ${escapeHtml(CV_PROFILE.github)}</div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 18px;">
              <div style="font-size: 15px; line-height: 1.9;">${escapeHtml(CV_PROFILE.phone)}</div>
              <div style="font-size: 15px; line-height: 1.9;">Portfolio: ${escapeHtml(CV_PROFILE.portfolio)}</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 28px 30px 36px;">
        ${renderSection(
          "Professional Summary",
          `<div style="margin-top: 14px; color: #3f4d63; font-size: 15px; line-height: 1.6;">${escapeHtml(CV_PROFILE.summary)}</div>`
        )}

        ${renderSection(
          "Key Skills",
          `<div style="margin-top: 14px; font-size: 16px; font-weight: 700; color: #1f2937;">${escapeHtml(CV_PROFILE.keySkills.title)}</div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 8px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 18px;">
                <ul style="margin: 0; padding: 0;">${renderList(leftSkills)}</ul>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 18px;">
                <ul style="margin: 0; padding: 0;">${renderList(rightSkills)}</ul>
              </td>
            </tr>
          </table>`
        )}

        ${renderSection("Education", renderEducation())}
        ${renderSection("Selected Projects", renderProjects())}
        ${renderSection(
          "Technical Skills",
          `<div style="margin-top: 14px; color: #3f4d63; font-size: 15px; line-height: 1.6;">${escapeHtml(
            CV_PROFILE.technicalSkills.join(" | ")
          )}</div>`
        )}
        ${renderSection(
          "Additional Information",
          `<ul style="margin: 14px 0 0; padding: 0;">${renderList(CV_PROFILE.additionalInformation)}</ul>`
        )}
      </div>
    </div>
  </body>
</html>`;
}
