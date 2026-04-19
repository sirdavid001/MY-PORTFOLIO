import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import useSEO from "../hooks/useSEO";
import Button from "../components/ui/Button";
import { FiDownload, FiMail, FiArrowRight } from "react-icons/fi";
import {
  SiCss3,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { CV_PROFILE } from "../../shared/cv/profile.js";

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || ""));
}

const principles = [
  {
    title: "Clean Code",
    text: "Writing maintainable, well-structured code that scales with your needs.",
    icon: "</>",
  },
  {
    title: "Performance First",
    text: "Optimizing every detail for speed, efficiency, and excellent user experience.",
    icon: "⚡",
  },
  {
    title: "Problem Solver",
    text: "Focused on creating practical solutions that address real challenges.",
    icon: "◎",
  },
];

const tech = [
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
  { name: "Next.js", icon: SiNextdotjs, color: "#111111" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "HTML", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS", icon: SiCss3, color: "#1572B6" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Git", icon: SiGit, color: "#F05032" },
];

const cvFormats = [
  { value: "pdf", label: "PDF", href: "/api/cv-download?format=pdf", download: "chineduDavidNwadialoCv.pdf" },
  { value: "word", label: "Word", href: "/api/cv-download?format=word", download: "chineduDavidNwadialoCv.doc" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function Home() {
  useSEO({
    title: "Chinedu David Nwadialo — Web Developer",
    description: "Portfolio of Chinedu David Nwadialo, a Computer Science graduate and web developer building high-performance digital products.",
    path: "/",
  });

  const prefersReducedMotion = useReducedMotion();
  const activeContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants;
  const activeItemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : itemVariants;

  const [cvFormat, setCvFormat] = useState("pdf");
  const selectedCvFormat = cvFormats.find((option) => option.value === cvFormat) || cvFormats[0];
  const [requestEmail, setRequestEmail] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [isRequestingCv, setIsRequestingCv] = useState(false);
  const [isDownloadingCv, setIsDownloadingCv] = useState(false);

  async function handleDownloadCv() {
    setRequestStatus("");
    setIsDownloadingCv(true);

    try {
      const separator = selectedCvFormat.href.includes("?") ? "&" : "?";
      const downloadUrl = `${selectedCvFormat.href}${separator}ts=${Date.now()}`;
      const response = await fetch(downloadUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not download CV right now.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = selectedCvFormat.download;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setRequestStatus(
        error?.message || "Could not download your CV at this time. Please try again in a moment."
      );
    } finally {
      setIsDownloadingCv(false);
    }
  }

  async function handleRequestCv(event) {
    event.preventDefault();
    setRequestStatus("");

    if (!isValidEmail(requestEmail)) {
      setRequestStatus("Please enter a valid email address.");
      return;
    }

    setIsRequestingCv(true);
    try {
      const response = await fetch("/api/send-cv", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: requestEmail.trim(), format: cvFormat }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Could not send CV right now.");
      }

      setRequestStatus(`Done. My ${selectedCvFormat.label} CV has been sent to ${requestEmail}.`);
      setRequestEmail("");
    } catch (error) {
      setRequestStatus(
        error?.message || "Could not send your CV at this time. Please try again in a moment."
      );
    } finally {
      setIsRequestingCv(false);
    }
  }

  return (
    <motion.div
      variants={activeContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-0"
    >
      <section className="relative min-h-[70vh] flex items-center py-20 md:py-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-4xl">
          <motion.h1 
            variants={activeItemVariants}
            className="text-5xl font-extrabold leading-tight text-foreground sm:text-6xl md:text-7xl"
          >
            Hi, I&apos;m <span className="text-gradient">{CV_PROFILE.displayName}</span>
          </motion.h1>
          <motion.p 
            variants={activeItemVariants}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            I&apos;m a recent Computer Science graduate and web developer dedicated to building practical, high-performance digital products and elegant user experiences.
          </motion.p>
          <motion.p 
            variants={activeItemVariants}
            className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            I bridge the gap between technical complexity and intuitive design, delivering robust solutions with meticulous attention to detail.
          </motion.p>
          <motion.div 
            variants={activeItemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/projects"
              className="group relative flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
            >
              View My Work
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 rounded-2xl border border-border bg-background/50 backdrop-blur-sm px-8 py-4 text-base font-bold text-foreground transition-all hover:-translate-y-1 hover:bg-accent active:scale-95"
            >
              Get In Touch
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/40 py-24 sm:py-32">
        <div className="text-center mb-16">
          <motion.h2 
            variants={activeItemVariants}
            className="text-3xl font-bold text-foreground sm:text-5xl"
          >
            My Approach
          </motion.h2>
          <motion.p 
            variants={activeItemVariants}
            className="mt-4 text-lg text-muted-foreground sm:text-xl"
          >
            I build with purpose, precision, and a focus on long-term scalability.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item, idx) => (
            <motion.article 
              key={item.title}
              variants={activeItemVariants}
              whileHover={{ y: -5 }}
              className="glass-card rounded-[2.5rem] p-10 flex flex-col items-start text-left"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-8 text-2xl">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 py-24 sm:py-32">
        <div className="text-center mb-12">
          <motion.h2 
            variants={activeItemVariants}
            className="text-3xl font-bold text-foreground sm:text-5xl"
          >
            Technologies I Use
          </motion.h2>
          <motion.p 
            variants={activeItemVariants}
            className="mt-4 text-lg text-muted-foreground sm:text-xl"
          >
            A curated stack for building modern, resilient web applications.
          </motion.p>
        </div>

        <motion.div 
          variants={activeItemVariants}
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4"
        >
          {tech.map((item) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card/50 backdrop-blur-sm px-6 py-3 text-base font-semibold text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 sm:px-7 sm:text-lg"
            >
              <item.icon
                className="h-5 w-5 sm:h-6 sm:w-6"
                aria-hidden="true"
                style={{ color: item.color }}
              />
              {item.name}
            </span>
          ))}
        </motion.div>
      </section>

      <section className="relative my-12 rounded-[3rem] bg-[#08183c] py-20 px-4 text-center text-white sm:py-32 overflow-hidden shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl z-10">
          <motion.h2 
            variants={activeItemVariants}
            className="text-4xl font-extrabold sm:text-6xl tracking-tight"
          >
            Let&apos;s Build Something Great
          </motion.h2>
          <motion.p 
            variants={activeItemVariants}
            className="mt-6 text-xl text-blue-100/80 leading-relaxed"
          >
            Ready for your next digital breakthrough? I&apos;m open to freelance opportunities, high-impact collaborations, and forward-thinking partnerships.
          </motion.p>
          <motion.div variants={activeItemVariants} className="mt-12">
            <a
              href={`mailto:${CV_PROFILE.email}`}
              className="inline-flex rounded-2xl bg-white px-10 py-5 text-lg font-bold text-[#08183c] transition-all hover:-translate-y-1 hover:bg-blue-50 active:scale-95 shadow-xl"
            >
              Start a Conversation
            </a>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/40 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div 
            variants={activeItemVariants}
            className="glass-card rounded-[3rem] p-8 sm:p-12 relative overflow-hidden"
          >
            <div className="relative z-10">
              <span className="inline-block text-sm font-bold uppercase tracking-widest text-primary mb-4 px-3 py-1 rounded-full bg-primary/10">
                Curriculum Vitae
              </span>
              <h2 className="text-3xl font-extrabold text-foreground sm:text-5xl leading-tight">
                Download or Request My CV
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Explore my full professional journey, academic background, and detailed project experience in your preferred format.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDownloadCv}
                  disabled={isDownloadingCv}
                  className="min-w-[200px]"
                >
                  <FiDownload className="h-5 w-5" aria-hidden="true" />
                  {isDownloadingCv ? "Downloading..." : `Download ${selectedCvFormat.label} CV`}
                </Button>
                
                <div className="flex items-center gap-4 bg-background/50 px-4 py-2 rounded-2xl border border-border">
                  <label htmlFor="cv-format" className="text-sm font-bold text-foreground">
                    Format:
                  </label>
                  <select
                    id="cv-format"
                    value={cvFormat}
                    onChange={(event) => setCvFormat(event.target.value)}
                    className="bg-transparent text-sm font-bold text-primary outline-none cursor-pointer"
                  >
                    {cvFormats.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <form onSubmit={handleRequestCv} className="mt-12 max-w-2xl pt-8 border-t border-border/40">
                <p className="mb-4 text-sm font-bold text-foreground">Request CV via Email</p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <input
                    type="email"
                    name="cvRequestEmail"
                    placeholder="you@example.com"
                    required
                    aria-label="Email address to receive CV"
                    value={requestEmail}
                    onChange={(event) => setRequestEmail(event.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-base text-foreground outline-none ring-primary/20 transition focus:ring-4"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isRequestingCv}
                  >
                    <FiMail className="h-5 w-5" aria-hidden="true" />
                    {isRequestingCv ? "Sending..." : "Send to Inbox"}
                  </Button>
                </div>
                {requestStatus ? (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    {requestStatus}
                  </motion.p>
                ) : null}
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
