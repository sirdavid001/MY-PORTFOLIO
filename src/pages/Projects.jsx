import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import useSEO from "../hooks/useSEO";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";

const projects = [
  {
    title: "UKM (uKnowMe)",
    description:
      "A premium anonymous inbox application focused on meaningful interactions. Unlike generic anonymous apps, UKM uses a 'Prompt-first' approach to spark community engagement.",
    uniqueness:
      "Features 'Launch-mode safety' and prompt-driven engagement nudges to prevent toxicity and encourage deeper user connections.",
    stack: ["Expo Router", "TypeScript", "NativeWind", "Supabase", "Zustand"],
    code: "https://github.com/sirdavid001/ukm",
    link: "http://www.uknowme.sbs",
    image: "/projects/ukm.png",
    status: "Production Ready",
  },
  {
    title: "Sirdavid Multi-Store",
    description:
      "A comprehensive full-stack e-commerce solution for managing online stores. Features end-to-end integration of a high-performance storefront and a backend management API.",
    uniqueness:
      "A complete end-to-end custom integration of a frontend shop and specialized backend inventory management tools.",
    stack: ["JavaScript", "Python", "Django", "PostgreSQL", "Tailwind CSS"],
    code: "https://github.com/sirdavid001/Store",
    link: "https://sirdavidshop.sirdavid.site",
    image: "/projects/store.png",
    status: "MVP Stage",
  },
  {
    title: "QuickPOS",
    description:
      "A high-performance Point of Sale system designed for retail efficiency. It supports offline-first usage and real-time inventory management.",
    uniqueness:
      "Supports hardware barcode scanning (USB/Bluetooth/Camera) and automated product lookups via Open Food Facts API.",
    stack: ["JavaScript", "CSS", "Chart.js", "Docker", "PWA"],
    code: "https://github.com/sirdavid001/QuickPOS",
    link: "https://pos-client-ruddy.vercel.app",
    image: "/projects/quickpos.png",
    status: "Production Ready",
  },
  {
    title: "Online Exam System",
    description:
      "An end-to-end academic portal for university examinations. Manages the full lifecycle from question creation to automated grading.",
    uniqueness:
      "Features specialized workflows for Students, Teachers, and University Admins with a recently refreshed, high-usability interface.",
    stack: ["Python", "Django", "HTML", "CSS", "JavaScript"],
    code: "https://github.com/sirdavid001/online-exam-system",
    link: "https://online-exam-system-nine-topaz.vercel.app",
    image: "/projects/exam_system.png",
    status: "MVP Stage",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

function ProjectCard({ project, variants }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      variants={variants}
      whileHover={{ y: -8 }}
      className="group glass-card overflow-hidden rounded-[2.5rem] bg-card/40 transition-all hover:shadow-2xl hover:shadow-primary/10 border-border/40 flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-700">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
        )}
        <ImageWithFallback
          src={project.image}
          alt={project.title}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60" />
        {project.status && (
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-primary/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-primary border border-primary/20">
              {project.status}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-5 p-8">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{project.title}</h2>
          <div className="flex gap-2">
            <a
              href={project.code}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-accent/50 text-foreground transition-all hover:bg-primary hover:text-white"
              title="View Source"
              aria-label={`View ${project.title} source on GitHub`}
            >
              <FiGithub className="h-5 w-5" />
            </a>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
                title="Live Demo"
                aria-label={`Open ${project.title} live demo`}
              >
                <FiExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          {project.uniqueness && (
            <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
              <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Why it&apos;s unique</p>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                &quot;{project.uniqueness}&quot;
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.stack.map((tag) => (
            <span
              key={tag}
              className="rounded-xl border border-border bg-background/50 px-3 py-1 text-xs font-bold text-foreground/80 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-4 mt-auto">
          <a
            href={project.link || project.code}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all underline-offset-4 hover:underline"
          >
            Explore Project
            <FiExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  useSEO({
    title: "Projects — Chinedu David Nwadialo",
    description: "Featured web development projects by Chinedu David Nwadialo, including portfolio sites, exam systems, and more.",
    path: "/projects",
  });

  const prefersReducedMotion = useReducedMotion();
  const activeContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants;
  const activeItemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : itemVariants;

  return (
    <motion.section
      variants={activeContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 py-12"
    >
      <div className="max-w-3xl">
        <motion.p variants={activeItemVariants} className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
          Featured Engineering
        </motion.p>
        <motion.h1 variants={activeItemVariants} className="text-4xl font-extrabold text-foreground sm:text-6xl tracking-tight">
          Real-World <span className="text-gradient">Projects</span>
        </motion.h1>
        <motion.p variants={activeItemVariants} className="mt-4 text-lg text-muted-foreground sm:text-xl leading-relaxed">
          A selection of my public and private engineering work, focusing on MVP and production-stage applications with unique value propositions.
        </motion.p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} variants={activeItemVariants} />
        ))}
      </div>
    </motion.section>
  );
}
