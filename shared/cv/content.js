import { CV_PROFILE } from "./profile.js";

const contactLines = [
  `Location: ${CV_PROFILE.location}`,
  `Email: ${CV_PROFILE.email}`,
  `GitHub: ${CV_PROFILE.github}`,
  `Phone: ${CV_PROFILE.phone}`,
  `Portfolio: ${CV_PROFILE.portfolio}`,
];

export const CV_RESUME_LINES = [
  { style: "title", text: CV_PROFILE.name },
  ...contactLines.map((text) => ({ style: "meta", text })),
  { style: "spacer" },
  { style: "section", text: "Professional Summary" },
  { style: "body", text: CV_PROFILE.summary },
  { style: "spacer" },
  { style: "section", text: "Key Skills" },
  { style: "subheading", text: CV_PROFILE.keySkills.title },
  ...CV_PROFILE.keySkills.items.map((text) => ({ style: "bullet", text })),
  { style: "spacer" },
  { style: "section", text: "Education" },
  ...CV_PROFILE.education.flatMap((entry, index) => [
    { style: "subheading", text: entry.title },
    ...entry.details.map((text) => ({ style: "body", text })),
    ...(index === CV_PROFILE.education.length - 1 ? [] : [{ style: "spacer" }]),
  ]),
  { style: "spacer" },
  { style: "section", text: "Selected Projects" },
  ...CV_PROFILE.projects.flatMap((project, index) => [
    { style: "subheading", text: project.title },
    { style: "body", text: project.description },
    ...(index === CV_PROFILE.projects.length - 1 ? [] : [{ style: "spacer" }]),
  ]),
  { style: "spacer" },
  { style: "section", text: "Technical Skills" },
  { style: "body", text: CV_PROFILE.technicalSkills.join(" | ") },
  { style: "spacer" },
  { style: "section", text: "Additional Information" },
  ...CV_PROFILE.additionalInformation.map((text) => ({ style: "bullet", text })),
];
