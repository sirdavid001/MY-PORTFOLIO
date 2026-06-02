import { CV_PROFILE } from "./profile.js";

const contactLines = [
  `Location: ${CV_PROFILE.location}`,
  `Email: ${CV_PROFILE.email}`,
  `GitHub: ${CV_PROFILE.github}`,
  `LinkedIn: ${CV_PROFILE.linkedin}`,
  `Phone: ${CV_PROFILE.phone}`,
  `Portfolio: ${CV_PROFILE.portfolio}`,
];

function flattenDatedEntry(entry) {
  const lines = [
    {
      style: "subheading",
      text: entry.dateRange
        ? `${entry.title || entry.name}  -  ${entry.dateRange}`
        : entry.title || entry.name,
    },
  ];
  if (entry.institution) {
    lines.push({ style: "body", text: entry.institution });
  }
  for (const detail of entry.details || []) {
    lines.push({ style: "body", text: detail });
  }
  return lines;
}

export const CV_RESUME_LINES = [
  { style: "title", text: CV_PROFILE.name },
  ...(CV_PROFILE.classification
    ? [{ style: "subtitle", text: CV_PROFILE.classification }]
    : []),
  ...contactLines.map((text) => ({ style: "meta", text })),
  { style: "spacer" },
  { style: "section", text: "Personal Information" },
  ...(CV_PROFILE.personalDetails || []).map((item) => ({
    style: "body",
    text: `${item.label}: ${item.value}`,
  })),
  { style: "spacer" },
  { style: "section", text: "Professional Summary" },
  { style: "body", text: CV_PROFILE.summary },
  { style: "spacer" },
  { style: "section", text: "Schools Attended With Dates" },
  ...CV_PROFILE.schoolsAttended.flatMap((entry, index) => [
    ...flattenDatedEntry(entry),
    ...(index === CV_PROFILE.schoolsAttended.length - 1 ? [] : [{ style: "spacer" }]),
  ]),
  { style: "spacer" },
  { style: "section", text: "Certificates / Qualifications Obtained" },
  ...CV_PROFILE.qualifications.flatMap((entry, index) => [
    ...flattenDatedEntry(entry),
    ...(index === CV_PROFILE.qualifications.length - 1 ? [] : [{ style: "spacer" }]),
  ]),
  { style: "spacer" },
  { style: "section", text: "Technical Skills" },
  { style: "body", text: CV_PROFILE.technicalSkills.join(" | ") },
  ...(CV_PROFILE.technicalSkillsNote
    ? [{ style: "body", text: CV_PROFILE.technicalSkillsNote }]
    : []),
  { style: "spacer" },
  { style: "section", text: "Selected Projects" },
  ...CV_PROFILE.projects.flatMap((project, index) => [
    { style: "subheading", text: project.title },
    { style: "body", text: project.description },
    ...(index === CV_PROFILE.projects.length - 1 ? [] : [{ style: "spacer" }]),
  ]),
  { style: "spacer" },
  { style: "section", text: "Workplace Skills" },
  ...CV_PROFILE.workplaceSkills.map((text) => ({ style: "bullet", text })),
  { style: "spacer" },
  { style: "section", text: "Additional Information" },
  ...CV_PROFILE.additionalInformation.map((text) => ({ style: "bullet", text })),
];
