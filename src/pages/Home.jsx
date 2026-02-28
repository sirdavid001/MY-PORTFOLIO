import { Link } from "react-router-dom";

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

const tech = ["React", "TypeScript", "Node.js", "Next.js", "Tailwind CSS", "JavaScript", "Git", "REST APIs"];

export default function Home() {
  return (
    <div className="space-y-0">
      <section className="grid min-h-[70vh] items-center gap-10 py-12 md:grid-cols-[1fr_0.95fr]">
        <div>
          <h1 className="font-display text-5xl font-bold leading-tight text-slate-900 sm:text-6xl">
            Hi, I&apos;m <span className="text-blue-600">Chinedu David</span>
          </h1>
          <p className="mt-6 max-w-2xl text-2xl leading-relaxed text-slate-600">
            I build practical, high-impact digital experiences with strong attention to performance, usability, and clean execution.
          </p>
          <p className="mt-5 max-w-2xl text-2xl leading-relaxed text-slate-600">
            I&apos;m a focused developer with a strong drive to create useful products that solve real problems.
            I combine creativity with technical discipline to deliver websites and apps that look sharp and work reliably.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="rounded-xl bg-slate-900 px-6 py-3 text-lg font-semibold text-white transition hover:bg-slate-800"
            >
              View My Work
            </Link>
            <Link
              to="/contact"
              className="rounded-xl border border-slate-400 px-6 py-3 text-lg font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Get In Touch
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <img
            src="/assets/profile.jpg"
            alt="Portrait of Chinedu David"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="border-t border-slate-200 py-20">
        <div className="text-center">
          <h2 className="font-display text-5xl font-bold text-slate-900">My Approach</h2>
          <p className="mt-3 text-2xl text-slate-600">I believe in building with purpose, precision, and passion.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#efeff1] p-7">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                {item.icon}
              </div>
              <h3 className="mt-5 font-display text-3xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-xl leading-relaxed text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 py-20">
        <div className="text-center">
          <h2 className="font-display text-5xl font-bold text-slate-900">Technologies I Use</h2>
          <p className="mt-3 text-2xl text-slate-600">A curated toolkit for building modern web applications.</p>
        </div>

        <div className="mx-auto mt-9 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {tech.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-lg font-medium text-slate-700 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-none bg-[#08183c] py-24 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-5xl font-bold">Let&apos;s Build Something Great</h2>
          <p className="mt-4 text-2xl text-slate-200">
            I&apos;m always interested in new opportunities and collaborations. Let&apos;s connect and discuss your project.
          </p>
          <a
            href="mailto:itssirdavid@gmail.com"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Start a Conversation
          </a>
        </div>
      </section>
    </div>
  );
}
