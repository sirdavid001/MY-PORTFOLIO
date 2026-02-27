const projects = [
  {
    title: "uknowme",
    description:
      "Identity and profile-focused application designed to present user information with a clear and engaging interface.",
    stack: ["JavaScript", "Frontend"],
    code: "https://github.com/sirdavid001/uknowme",
    image:
      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "settlex-backend",
    description:
      "Backend service project with API-focused architecture and core transaction logic implementation.",
    stack: ["TypeScript", "Backend API"],
    code: "https://github.com/sirdavid001/settlex-backend",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "online-exam-system",
    description:
      "Exam management project with question delivery and submission workflows for online assessment use cases.",
    stack: ["Python", "Education Tech"],
    code: "https://github.com/sirdavid001/online-exam-system",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Projects() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-emerald-200">Featured Work</p>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Projects</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-glow backdrop-blur">
            <img src={project.image} alt={project.title} className="h-44 w-full object-cover" />
            <div className="space-y-3 p-5">
              <h2 className="font-display text-xl font-semibold text-white">{project.title}</h2>
              <p className="text-slate-300">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span key={tag} className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={project.code}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Code
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
