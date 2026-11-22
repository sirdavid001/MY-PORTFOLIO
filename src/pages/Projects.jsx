import { FiExternalLink } from "react-icons/fi";
import { ROUTE_BY_KEY } from "../../shared/seo.js";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { projects } from "../data/projects";
import useSEO from "../hooks/useSEO";

const featured = projects.filter((project) => project.featured);
const more = projects.filter((project) => !project.featured && project.image);
const otherWork = projects.filter((project) => !project.featured && !project.image);

function headingId(project) {
  return `project-${(project.domain || project.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`;
}

// Duplicate of each project's visible link for pointer users; kept out of the tab order.
function Screenshot({ project, sizes, eager = false }) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noreferrer"
      tabIndex={-1}
      aria-hidden="true"
      className="group block aspect-video min-w-0 overflow-hidden rounded-2xl border border-border bg-muted"
    >
      <ImageWithFallback
        {...project.image}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-[1.015]"
      />
    </a>
  );
}

function ProjectFacts({ project }) {
  return (
    <dl className="grid w-full grid-cols-[max-content_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
      <dt className="text-muted-foreground">Sector</dt>
      <dd className="font-medium text-foreground">{project.sector}</dd>
      {project.status && (
        <>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium text-foreground">{project.status}</dd>
        </>
      )}
      <dt className="text-muted-foreground">Built with</dt>
      <dd className="text-foreground">{project.stack.join(", ")}</dd>
    </dl>
  );
}

function VisitLabel({ project }) {
  return (
    <>
      <span className="min-w-0 [overflow-wrap:anywhere]">Visit {project.domain}</span>
      <FiExternalLink aria-hidden="true" className="shrink-0" />
      <span className="sr-only"> (live {project.title} site, opens in a new tab)</span>
    </>
  );
}

function FeaturedProject({ project, first }) {
  return (
    <article
      aria-labelledby={headingId(project)}
      className="grid gap-6 py-10 first:pt-8 sm:py-12 sm:first:pt-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:py-14 lg:first:pt-10"
    >
      <Screenshot
        project={project}
        eager={first}
        sizes="(min-width: 72rem) 38rem, (min-width: 64rem) 55vw, calc(100vw - 2rem)"
      />

      <div className="flex min-w-0 flex-col items-start">
        <h3 id={headingId(project)} className="text-2xl font-bold text-foreground sm:text-3xl">
          {project.title}
        </h3>
        <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{project.description}</p>
        <div className="mt-6 w-full border-t border-border pt-5">
          <ProjectFacts project={project} />
        </div>
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <VisitLabel project={project} />
        </a>
      </div>
    </article>
  );
}

function MoreProject({ project }) {
  const layout = project.image
    ? "row-span-5 grid grid-rows-subgrid gap-y-0"
    : "flex flex-col border-t border-border pt-5";

  return (
    <article aria-labelledby={headingId(project)} className={`min-w-0 ${layout}`}>
      {project.image && (
        <Screenshot
          project={project}
          sizes="(min-width: 72rem) 21rem, (min-width: 64rem) calc((100vw - 8rem) / 3), (min-width: 48rem) calc((100vw - 5rem) / 2), calc(100vw - 2rem)"
        />
      )}
      <h3 id={headingId(project)} className={`text-xl font-bold text-foreground ${project.image ? "mt-5" : ""}`}>
        {project.title}
      </h3>
      <p className="mt-2 leading-relaxed text-muted-foreground">{project.description}</p>
      <div className="mt-5 border-t border-border pt-4">
        <ProjectFacts project={project} />
      </div>
      {project.link && (
        <div className={project.image ? "pt-4" : "mt-auto pt-4"}>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 max-w-full items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
          >
            <VisitLabel project={project} />
          </a>
        </div>
      )}
    </article>
  );
}

export default function Projects() {
  useSEO(ROUTE_BY_KEY.projects);

  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-6xl">Projects</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Web apps, mobile apps, and backend systems I&apos;ve built or contributed to.
        </p>
        <nav aria-label="Project sections" className="mt-3 flex flex-wrap gap-x-5">
          <a href="#featured-projects" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
            Featured
          </a>
          <a href="#more-projects" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
            More projects
          </a>
          <a href="#other-work" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
            Other builds and contributions
          </a>
        </nav>
      </div>

      <section aria-labelledby="featured-projects" className="mt-10 border-t border-border pt-10 sm:mt-12 sm:pt-12">
        <h2 id="featured-projects" className="scroll-mt-24 text-xl font-bold text-foreground">Featured projects</h2>
        <div className="divide-y divide-border">
          {featured.map((project, index) => (
            <FeaturedProject key={project.title} project={project} first={index === 0} />
          ))}
        </div>
      </section>

      <section aria-labelledby="more-projects" className="border-t border-border pt-10 sm:pt-12 lg:pt-14">
        <h2 id="more-projects" className="scroll-mt-24 text-xl font-bold text-foreground">More projects</h2>
        <div className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {more.map((project) => (
            <MoreProject key={project.title} project={project} />
          ))}
        </div>
      </section>

      <section aria-labelledby="other-work" className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12">
        <h2 id="other-work" className="scroll-mt-24 text-xl font-bold text-foreground">Other builds and contributions</h2>
        <div className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {otherWork.map((project) => (
            <MoreProject key={project.title} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
