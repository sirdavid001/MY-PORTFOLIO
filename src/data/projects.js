function preview(file, width, height, alt) {
  return {
    src: `/projects/${file}-800.webp`,
    srcSet: [480, 800, 1200].map((size) => `/projects/${file}-${size}.webp ${size}w`).join(", "),
    width,
    height,
    alt,
  };
}

function domainOf(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

// Every link points at the deployed site. Featured projects are live products on their own
// domains; the rest follow, production-ready first.
export const projects = [
  {
    title: "Bookdara",
    featured: true,
    sector: "Appointment booking",
    status: "Production ready",
    description:
      "Online booking for Nigerian salons, barbers, lash technicians, and clinics. Each business gets its own booking page, and customers choose services and a time, then pay a deposit or the full price through Paystack.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Paystack"],
    link: "https://bookdara.com.ng",
    image: preview("bookdara", 2560, 1440, "Bookdara homepage with a sample salon booking page"),
  },
  {
    title: "CorperLink",
    featured: true,
    sector: "NYSC placement",
    status: "Production ready",
    description:
      "Helps NYSC corps members find a place of primary assignment. Members choose a deployment state and LGA, upload their CV and call-up letter, and send their approved application to eligible companies.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Paystack", "Resend"],
    link: "https://corperlink.com.ng",
    image: preview("corperlink", 2560, 1440, "CorperLink homepage: find your PPA and apply with confidence"),
  },
  {
    title: "QuickPOS",
    featured: true,
    sector: "Retail point of sale",
    status: "Production ready",
    description:
      "Point-of-sale software for Nigerian retail stores. Owners run sales, stock, staff, customers, receipts, and reports from one account, and the till keeps selling offline and syncs when the connection returns.",
    stack: ["Vite", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "WebSockets", "Docker"],
    link: "https://quickpos.com.ng",
    image: preview("quickpos", 2880, 1620, "QuickPOS homepage with the point-of-sale checkout screen"),
  },
  {
    title: "UKM (uKnowMe)",
    sector: "Social messaging",
    status: "Production ready",
    description:
      "An anonymous inbox where people answer prompts and send feedback.",
    stack: ["Expo Router", "TypeScript", "NativeWind", "Supabase", "Zustand"],
    link: "https://www.uknowme.sbs",
    image: preview("ukm", 2560, 1426, "UKM anonymous messaging homepage"),
  },
  {
    title: "SIRDAVID MULTI-TRADE LTD",
    sector: "Trade and procurement",
    status: "Production ready",
    description:
      "The company website for a trading business that sources and supplies vehicles, electronics, equipment, and commercial goods, with quote requests for individuals and businesses.",
    stack: ["Next.js", "React", "TypeScript", "shadcn/ui", "Drizzle ORM"],
    link: "https://sirdavid-multi-trade.vercel.app",
    image: preview("sirdavid-multi-trade", 2560, 1440, "SIRDAVID MULTI-TRADE LTD homepage listing the goods it handles"),
  },
  {
    title: "Streamora",
    sector: "Entertainment streaming",
    status: "MVP stage",
    description:
      "A free, ad-supported site for discovering and streaming movies, TV series, and anime, from Hollywood to Nollywood.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
    link: "https://streamora-psi.vercel.app",
    image: preview("streamora", 2560, 1440, "Streamora homepage with a featured film"),
  },
  {
    title: "Sirdavid Estates",
    sector: "Real estate",
    status: "MVP stage",
    description:
      "A luxury real estate platform for browsing listings, contacting agents, and upgrading to premium listings.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Auth.js", "Stripe"],
    link: "https://sirdavid-estate.vercel.app",
    image: preview("sirdavid-estates", 2560, 1440, "Sirdavid Estates luxury property homepage"),
  },
  {
    title: "Sirdavid Multi-Store",
    sector: "E-commerce",
    status: "MVP stage",
    description:
      "An electronics storefront backed by a management API for running online stores.",
    stack: ["JavaScript", "Python", "Django", "PostgreSQL", "Tailwind CSS"],
    link: "https://sirdavidshop.sirdavid.site",
    image: preview("store", 2560, 1426, "Sirdavid Multi-Store storefront"),
  },
  {
    title: "OEMS (Online Exam Management System)",
    sector: "Education",
    status: "MVP stage",
    description:
      "A university exam portal with question authoring, timed tests, automated grading, and separate workflows for students, teachers, and administrators.",
    stack: ["TypeScript", "React", "NestJS", "Prisma", "PostgreSQL"],
    link: "https://oems-tau.vercel.app/login",
    image: preview("exam_system", 1200, 675, "OEMS examination portal sign-in screen"),
  },
].map((project) => ({ ...project, domain: domainOf(project.link) }));

export const featuredProject = projects.find((project) => project.title === "Sirdavid Multi-Store");
