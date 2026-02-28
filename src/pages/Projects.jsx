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
    <section className="space-y-8 py-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-blue-600">Featured Work</p>
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">Projects</h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">Real work and practical products from my GitHub.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <img src={project.image} alt={project.title} className="h-44 w-full object-cover" />
            <div className="space-y-3 p-5">
              <h2 className="font-display text-2xl font-semibold text-slate-900">{project.title}</h2>
              <p className="text-base text-slate-600 sm:text-lg">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={project.code}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
