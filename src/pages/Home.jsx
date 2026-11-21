import { useState } from "react";
import { FiArrowRight, FiDownload, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CV_FORMATS } from "../../shared/cv/formats.js";
import { PUBLIC_PROFILE } from "../../shared/profile.js";
import { ROUTE_BY_KEY } from "../../shared/seo.js";
import Button from "../components/ui/Button";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { featuredProject } from "../data/projects";
import useSEO from "../hooks/useSEO";

const cvFormats = Object.values(CV_FORMATS);
const technologies = ["React", "TypeScript", "Node.js", "Next.js", "Tailwind CSS", "JavaScript", "HTML", "CSS", "Python", "Git"];

export default function Home() {
  useSEO(ROUTE_BY_KEY.home);

  const [cvFormat, setCvFormat] = useState("pdf");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleRequestCv(event) {
    event.preventDefault();
    setStatus(null);
    setSending(true);

    try {
      const response = await fetch("/api/send-cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), format: cvFormat }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        throw new Error("CV delivery failed");
      }

      setStatus({ text: `The ${CV_FORMATS[cvFormat].label} CV was sent to ${email.trim()}.` });
      setEmail("");
    } catch {
      setStatus({ error: true, text: "The email could not be sent. Download the CV above or try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section className="grid items-center gap-10 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="min-w-0">
          <p className="mb-3 text-sm font-semibold text-primary">Web developer in Asaba, Nigeria</p>
          <h1 className="max-w-xl text-balance text-5xl font-extrabold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
            {PUBLIC_PROFILE.displayName}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
            I&apos;m a Computer Science graduate who builds web applications for retail, education, and everyday use.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/projects"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View projects <FiArrowRight aria-hidden="true" />
            </Link>
            <a
              href="#cv"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-border px-5 py-3 font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Get my CV
            </a>
          </div>
        </div>

        <figure className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card">
          <a
            href={featuredProject.link}
            aria-label={`Visit the live ${featuredProject.title} site at ${featuredProject.domain}`}
            className="group block aspect-video overflow-hidden border-b border-border bg-muted focus-visible:outline-offset-[-3px]"
          >
            <ImageWithFallback
              {...featuredProject.image}
              sizes="(min-width: 72rem) 35rem, (min-width: 64rem) 50vw, calc(100vw - 2rem)"
              fetchPriority="high"
              className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-[1.02]"
            />
          </a>
          <figcaption className="px-5 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-foreground">{featuredProject.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              I built the electronics storefront and the API that supports store management.
            </p>
          </figcaption>
        </figure>
      </section>

      <section id="cv" tabIndex={-1} aria-labelledby="cv-title" className="scroll-mt-24 border-t border-border py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="cv-title" className="text-3xl font-extrabold text-foreground sm:text-4xl">Download my CV</h2>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
              My education, qualifications, and workplace skills in PDF or Word format.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {cvFormats.map((format) => (
                <a
                  key={format.value}
                  href={format.href}
                  download={format.fileName}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  <FiDownload aria-hidden="true" /> Download {format.label}
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={handleRequestCv} className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h3 className="text-xl font-bold text-foreground">Get a copy by email</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="block text-sm font-medium">
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  disabled={sending}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 block min-h-11 w-full rounded-xl border border-border bg-background px-3"
                />
              </label>
              <label className="block text-sm font-medium">
                Format
                <select
                  name="format"
                  value={cvFormat}
                  disabled={sending}
                  onChange={(event) => setCvFormat(event.target.value)}
                  className="mt-1 block min-h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground"
                >
                  {cvFormats.map((format) => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit" variant="outline" disabled={sending} className="mt-4">
              <FiMail aria-hidden="true" /> {sending ? "Sending…" : "Email my CV"}
            </Button>
            <p role="status" className={`min-h-5 pt-2 text-sm [overflow-wrap:anywhere] ${status?.error ? "text-red-700 dark:text-red-300" : "text-muted-foreground"}`}>
              {status?.text}
            </p>
          </form>
        </div>
      </section>

      <section className="grid gap-9 border-t border-border py-12 sm:py-16 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Technologies I use</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {technologies.map((name) => (
              <li key={name} className="rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">{name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Work with me</h2>
          <p className="mt-3 text-muted-foreground">I&apos;m open to freelance projects, collaborations, and web development roles.</p>
          <Link to="/contact" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
            Get in touch <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
