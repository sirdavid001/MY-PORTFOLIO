function preview(file, width, height, alt) {
  return {
    src: `/projects/${file}-800.webp`,
    srcSet: [480, 800, 1200].map((size) => `/projects/${file}-${size}.webp ${size}w`).join(", "),
    width,
    height,
    alt,
  };
}

export const projects = [
  {
    title: "UKM (uKnowMe)",
    description:
      "An anonymous inbox where people answer prompts and send feedback.",
    stack: ["Expo Router", "TypeScript", "NativeWind", "Supabase", "Zustand"],
    code: "https://github.com/sirdavid001/ukm",
    link: "https://www.uknowme.sbs",
    image: preview("ukm", 2560, 1426, "UKM anonymous messaging homepage"),
    status: "Production Ready",
  },
  {
    title: "Sirdavid Multi-Store",
    description:
      "An electronics storefront backed by a management API for running online stores.",
    stack: ["JavaScript", "Python", "Django", "PostgreSQL", "Tailwind CSS"],
    code: "https://github.com/sirdavid001/Store",
    link: "https://sirdavidshop.sirdavid.site",
    image: preview("store", 2560, 1426, "Sirdavid Multi-Store storefront"),
    status: "MVP Stage",
  },
  {
    title: "QuickPOS",
    description:
      "A retail point-of-sale system that supports offline sales and real-time inventory tracking.",
    stack: ["JavaScript", "CSS", "Chart.js", "Docker", "PWA"],
    code: "https://github.com/sirdavid001/QuickPOS",
    link: "https://quickposs.vercel.app",
    image: preview("quickpos", 3840, 2224, "QuickPOS point-of-sale sign-in screen"),
    status: "Production Ready",
  },
  {
    title: "OEMS (Online Exam Management System)",
    description:
      "A university exam portal with question authoring, timed tests, automated grading, and separate workflows for students, teachers, and administrators.",
    stack: ["TypeScript", "React", "NestJS", "Prisma", "PostgreSQL"],
    code: "https://github.com/sirdavid001/OEMS",
    link: "https://oems-tau.vercel.app/login",
    image: preview("exam_system", 1200, 675, "OEMS examination portal sign-in screen"),
    status: "MVP Stage",
  },
];

export const featuredProject = projects.find((project) => project.title === "Sirdavid Multi-Store");
