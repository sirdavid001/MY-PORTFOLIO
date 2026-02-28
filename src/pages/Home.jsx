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
      <section className="grid min-h-[70vh] items-center gap-8 py-10 md:grid-cols-[1fr_0.95fr] md:gap-10 md:py-12">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Hi, I&apos;m <span className="text-blue-600">Sirdavid</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            I build practical, high-impact digital products focused on speed, usability, and clear business value.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            From idea to launch, I combine clean code, thoughtful design, and reliable engineering to deliver solutions that people actually use.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:text-base"
            >
              View My Work
            </Link>
            <Link
              to="/contact"
              className="rounded-xl border border-slate-400 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:px-6 sm:text-base"
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

      <section className="border-t border-slate-200 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">My Approach</h2>
          <p className="mt-3 text-base text-slate-600 sm:text-xl">I build with purpose, precision, and long-term thinking.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {principles.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#efeff1] p-7">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                {item.icon}
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Technologies I Use</h2>
          <p className="mt-3 text-base text-slate-600 sm:text-xl">Tools I use to design, build, and scale web products.</p>
        </div>

        <div className="mx-auto mt-9 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {tech.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm sm:px-5 sm:text-base"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-none bg-[#08183c] py-16 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-5xl">Let&apos;s Build Something Great</h2>
          <p className="mt-4 text-base text-slate-200 sm:text-xl">
            Open to freelance opportunities, collaborations, and product partnerships. Let&apos;s talk about your next project.
          </p>
          <a
            href="mailto:itssirdavid@gmail.com"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:px-7 sm:text-base"
          >
            Start a Conversation
          </a>
        </div>
      </section>
    </div>
  );
}
