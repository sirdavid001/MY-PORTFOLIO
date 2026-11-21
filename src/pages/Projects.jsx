import { FiExternalLink } from "react-icons/fi";
import { ROUTE_BY_KEY } from "../../shared/seo.js";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { projects } from "../data/projects";
import useSEO from "../hooks/useSEO";

function ProjectCard({ project, eager }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="aspect-video overflow-hidden border-b border-border bg-muted">
        <ImageWithFallback
          {...project.image}
          sizes="(min-width: 72rem) 33rem, (min-width: 48rem) calc((100vw - 6rem) / 2), calc(100vw - 2rem)"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="flex flex-1 flex-col items-start gap-4 p-5 sm:p-7">
        <p className="text-sm font-medium text-muted-foreground">{project.status}</p>
        <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
        <p className="leading-relaxed text-muted-foreground">{project.description}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Technologies">
          {project.stack.map((tag) => (
            <li key={tag} className="rounded-lg bg-muted px-2.5 py-1 text-sm text-muted-foreground">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-3">
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
            aria-label={`Live demo for ${project.title}`}
          >
            Live demo <FiExternalLink aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  useSEO(ROUTE_BY_KEY.projects);

  return (
    <section className="space-y-9 pb-16 pt-8 sm:pt-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-6xl">Projects</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Four applications for messaging, retail, and education. Explore the live demos.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} eager={index === 0} />
        ))}
      </div>
    </section>
  );
}
