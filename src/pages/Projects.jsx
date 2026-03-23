import { motion } from "framer-motion";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";

const projects = [
  {
    title: "MY-PORTFOLIO",
    description:
      "Personal portfolio application combining project showcase, CV export and email delivery, contact flows, and location-aware project budgeting.",
    stack: ["TypeScript", "React", "Portfolio", "Vite"],
    code: "https://github.com/sirdavid001/MY-PORTFOLIO",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "online-exam-system",
    description:
      "Web-based examination system for managing tests, delivering questions online, handling submissions, and supporting result workflows.",
    stack: ["Python", "HTML", "CSS", "Education"],
    code: "https://github.com/sirdavid001/online-exam-system",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
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

export default function Projects() {
  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 py-12"
    >
      <div className="max-w-2xl">
        <motion.p variants={itemVariants} className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
          Featured Work
        </motion.p>
        <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-foreground sm:text-6xl">
          Projects
        </motion.h1>
        <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground sm:text-xl leading-relaxed">
          A selection of projects I&apos;ve built, ranging from web applications to specialized tools.
        </motion.p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <motion.article 
            key={project.title} 
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="group glass-card overflow-hidden rounded-[2.5rem] bg-card/40 transition-all hover:shadow-2xl hover:shadow-primary/10 border-border/40"
          >
            <div className="relative aspect-video overflow-hidden">
              <ImageWithFallback 
                src={project.image} 
                alt={project.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="space-y-4 p-8">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{project.title}</h2>
                <div className="flex gap-3">
                  <a
                    href={project.code}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-accent/50 text-foreground transition-all hover:bg-primary hover:text-white"
                    title="View Code"
                  >
                    <FiGithub className="h-5 w-5" />
                  </a>
                </div>
              </div>
              
              <p className="text-lg leading-relaxed text-muted-foreground line-clamp-3">
                {project.description}
              </p>
              
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
              
              <div className="pt-6">
                <a
                  href={project.code}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:underline"
                >
                  Explore Documentation
                  <FiExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
