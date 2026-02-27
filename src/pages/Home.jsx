import { Link } from "react-router-dom";

const principles = [
  { title: "Clean Code", text: "Readable, maintainable, and practical implementation." },
  { title: "Performance First", text: "Fast load times, smooth interactions, mobile-ready." },
  { title: "Problem Solver", text: "Building useful products for real user needs." },
];

const tech = ["React", "JavaScript", "TypeScript", "Node.js", "Tailwind CSS", "GitHub"];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur sm:p-8">
          <p className="mb-3 inline-flex rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Portfolio
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Chinedu David
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            I build practical, high-impact digital experiences focused on performance,
            usability, and clear product value.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-slate-200">Based in Lagos, Nigeria</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-slate-200">Open to Work</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-slate-200">Frontend + Backend</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/projects" className="rounded-full bg-emerald-300 px-5 py-2.5 font-semibold text-ink transition hover:translate-y-[-1px]">
              View Projects
            </Link>
            <Link to="/contact" className="rounded-full border border-white/20 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10">
              Contact Me
            </Link>
            <a href="/assets/Chinedu-David-CV.pdf" download className="rounded-full border border-white/20 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10">
              Download CV
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-glow backdrop-blur">
          <img
            src="/assets/profile.jpg"
            alt="Portrait of Chinedu David"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
            <h2 className="font-display text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-white">Technologies</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tech.map((item) => (
            <span key={item} className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
