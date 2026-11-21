import { PUBLIC_PROFILE } from "../profile.js";

export const CV_PROFILE = {
  ...PUBLIC_PROFILE,
  classification: "BSc Computer Science",
  personalDetails: [
    { label: "Location", value: PUBLIC_PROFILE.location },
    { label: "Email Address", value: PUBLIC_PROFILE.email },
    { label: "Phone Number", value: PUBLIC_PROFILE.phone },
  ],
  summary:
    "Computer Science graduate with hands-on experience building web applications, organizing information, and solving problems using both technical and analytical skills. Strong attention to detail, communication, teamwork, and customer service abilities. Comfortable using office software, digital tools, and technology to support business operations. Open to entry-level opportunities in offshore operations, roustabout roles, IT support, administration, operations, and customer-facing positions where reliability, adaptability, and problem-solving are valued.",
  schoolsAttended: [
    {
      name: "Dennis Osadebay University, Asaba, Nigeria",
      dateRange: "2021 - 2026",
    },
    {
      name: "Redeemers International High School, Asaba",
      dateRange: "2013 - 2019",
    },
    {
      name: "Jasmine Children's School, Asaba",
      dateRange: "Completed 2013",
    },
  ],
  qualifications: [
    {
      title: "Bachelor of Science (BSc), Computer Science",
      dateRange: "2026",
      institution: "Dennis Osadebay University, Asaba, Nigeria",
    },
    {
      title: "West African Senior School Certificate Examination (WAEC)",
      dateRange: "2019",
      institution: "Redeemers International High School, Asaba",
    },
    {
      title: "National Examination Council Certificate (NECO)",
      dateRange: "2019",
      institution: "Redeemers International High School, Asaba",
    },
    {
      title: "Leadership Conference Certificate of Attendance (Leadership Development Training)",
      dateRange: "2018",
      institution: "",
    },
    {
      title: "Executive Certificate in Leadership and Entrepreneurship (S.O.L.E.)",
      dateRange: "2017",
      institution: "",
    },
    {
      title: "Basic Education Certificate Examination (BECE)",
      dateRange: "2016",
      institution: "Redeemers International High School, Asaba",
    },
    {
      title: "First School Leaving Certificate (FSLC)",
      dateRange: "2013",
      institution: "Jasmine Children's School, Asaba",
    },
  ],
  technicalSkills: [
    "JavaScript",
    "Python",
    "SQL",
    "HTML & CSS",
    "React",
    "Next.js",
    "Git & version control",
    "Basic database management",
  ],
  technicalSkillsNote:
    "Also comfortable with Microsoft Office, Google Workspace, and common online collaboration tools.",
  projects: [
    {
      title: "Online Examination System",
      description:
        "Developed a web-based platform that allows administrators and teachers to manage exams, track student results, and generate reports. Includes timed tests, automated scoring, and result export features.",
    },
    {
      title: "Personal Portfolio Website (sirdavid.site)",
      description:
        "Designed, built, and deployed a personal website showcasing projects and technical work. Manage hosting, updates, and site performance independently.",
    },
  ],
  workplaceSkills: [
    "Communication and teamwork",
    "Customer service and client interaction",
    "Problem solving and analytical thinking",
    "Data entry, record keeping, and documentation",
    "Time management and organization",
    "Adaptability and willingness to learn new systems quickly",
    "Safety awareness and following procedures",
  ],
  additionalInformation: [
    "Nigerian passport holder",
    "Available for full-time, part-time, offshore, and rotational roles",
    "Open to both technical and non-technical positions",
    "Comfortable working with computers, office software, and online tools",
  ],
};
