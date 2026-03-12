import { useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiGithub, FiGlobe, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
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
import { CV_PROFILE } from "../../shared/cv-profile.js";
import profileImage from "../../assets/profile.jpg";
import { ImageWithFallback } from "../components/ImageWithFallback";

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

const cvPreviewContacts = [
  { label: "Location", value: CV_PROFILE.location, icon: FiMapPin },
  { label: "Email", value: CV_PROFILE.email, icon: FiMail },
  { label: "GitHub", value: CV_PROFILE.github, icon: FiGithub },
  { label: "Phone", value: CV_PROFILE.phone, icon: FiPhone },
  { label: "Portfolio", value: CV_PROFILE.portfolio, icon: FiGlobe },
];

const cvPreviewSkillColumns = [
  CV_PROFILE.keySkills.items.slice(0, Math.ceil(CV_PROFILE.keySkills.items.length / 2)),
  CV_PROFILE.keySkills.items.slice(Math.ceil(CV_PROFILE.keySkills.items.length / 2)),
];

export default function Home() {
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
    <div className="space-y-0">
      <section className="grid min-h-[70vh] items-center gap-8 py-10 md:grid-cols-[1fr_0.95fr] md:gap-10 md:py-12">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Hi, I&apos;m <span className="text-blue-600">{CV_PROFILE.displayName}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            I&apos;m a recent Computer Science graduate and web developer focused on practical, reliable digital products
            and clear user experiences.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            My work combines hands-on project delivery, problem solving, communication, and strong attention to detail
            across both technical and operational tasks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:text-base"
            >
              View My Work
            </Link>
            <Link
              to="/shop"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:px-6 sm:text-base"
            >
              Visit Shop
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
          <ImageWithFallback
            src={profileImage}
            alt="Portrait of Chinedu David"
            className="h-full w-full rounded-2xl object-cover object-top"
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
              key={item.name}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm sm:px-5 sm:text-base"
            >
              <item.icon
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
                style={{ color: item.color }}
              />
              {item.name}
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
            href={`mailto:${CV_PROFILE.email}`}
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:px-7 sm:text-base"
          >
            Start a Conversation
          </a>
        </div>
      </section>

      <section className="border-t border-slate-200 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-6 rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/60 p-6 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.88fr)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">CV</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                Download or Request My CV
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                I refreshed the CV layout to make it cleaner, easier to scan, and closer to the professional format you
                shared.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleDownloadCv}
                  disabled={isDownloadingCv}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-5 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:px-6 sm:text-base"
                >
                  <FiDownload className="h-4 w-4" aria-hidden="true" />
                  {isDownloadingCv ? "Downloading..." : `Download CV (${selectedCvFormat.label})`}
                </button>
                <div className="flex items-center gap-3">
                  <label htmlFor="cv-format" className="text-sm font-semibold text-slate-800">
                    Choose format:
                  </label>
                  <select
                    id="cv-format"
                    value={cvFormat}
                    onChange={(event) => setCvFormat(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {cvFormats.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {cvFormat === "pdf" ? (
                <p className="mt-3 text-xs text-slate-600">
                  PDF option downloads a true PDF file of the resume.
                </p>
              ) : (
                <p className="mt-3 text-xs text-slate-600">
                  Word option downloads a Word-compatible document file.
                </p>
              )}

              <form onSubmit={handleRequestCv} className="mt-6 max-w-2xl">
                <p className="mb-2 text-sm font-semibold text-slate-800">Request CV by email</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    name="cvRequestEmail"
                    placeholder="you@example.com"
                    required
                    aria-label="Email address to receive CV"
                    value={requestEmail}
                    onChange={(event) => setRequestEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="submit"
                    disabled={isRequestingCv}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
                  >
                    <FiMail className="h-4 w-4" aria-hidden="true" />
                    {isRequestingCv ? "Sending..." : `Email My ${selectedCvFormat.label} CV`}
                  </button>
                </div>
                {requestStatus ? <p className="mt-3 text-sm text-slate-700">{requestStatus}</p> : null}
              </form>
            </div>

            <div className="mx-auto w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-[#e5e7eb] p-3 shadow-[0_26px_70px_rgba(15,23,42,0.14)]">
              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-[#f3f4f6]">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 px-6 py-6 text-white">
                  <h3 className="text-[1.8rem] font-bold leading-tight sm:text-[2rem]">{CV_PROFILE.name}</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2.5">
                        {cvPreviewContacts.slice(0, 3).map((item) => (
                        <div key={item.label} className="flex items-start gap-2.5 text-sm leading-relaxed text-blue-50">
                          <item.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2.5">
                      {cvPreviewContacts.slice(3).map((item) => (
                        <div key={item.label} className="flex items-start gap-2.5 text-sm leading-relaxed text-blue-50">
                          <item.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>
                            {item.label === "Portfolio" ? `Portfolio: ${item.value}` : item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 px-6 py-6 text-slate-700">
                  <div>
                    <div className="text-[1.65rem] font-bold tracking-tight text-slate-900">Professional Summary</div>
                    <div className="mt-2 h-1 bg-blue-600" />
                    <p className="mt-4 text-sm leading-7">{CV_PROFILE.summary}</p>
                  </div>

                  <div>
                    <div className="text-[1.65rem] font-bold tracking-tight text-slate-900">Key Skills</div>
                    <div className="mt-2 h-1 bg-blue-600" />
                    <div className="mt-4 text-lg font-semibold text-slate-900">{CV_PROFILE.keySkills.title}</div>
                    <div className="mt-3 grid gap-2 text-sm leading-7 sm:grid-cols-2">
                      {cvPreviewSkillColumns.map((column, columnIndex) => (
                        <ul key={columnIndex} className="space-y-1.5">
                          {column.map((skill) => (
                            <li key={skill} className="list-disc pl-1 marker:text-slate-700">
                              {skill}
                            </li>
                          ))}
                        </ul>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[1.65rem] font-bold tracking-tight text-slate-900">Education</div>
                    <div className="mt-2 h-1 bg-blue-600" />
                    <div className="mt-4 space-y-4 text-sm leading-7">
                      {CV_PROFILE.education.map((entry) => (
                        <div key={entry.title}>
                          <div className="font-semibold text-slate-900">{entry.title}</div>
                          {entry.details.map((detail) => (
                            <div key={detail}>{detail}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[1.65rem] font-bold tracking-tight text-slate-900">Selected Projects</div>
                    <div className="mt-2 h-1 bg-blue-600" />
                    <div className="mt-4 space-y-3 text-sm leading-7">
                      {CV_PROFILE.projects.map((project) => (
                        <div key={project.title}>
                          <div className="font-semibold text-slate-900">{project.title}</div>
                          <div>{project.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[1.65rem] font-bold tracking-tight text-slate-900">Technical Skills</div>
                    <div className="mt-2 h-1 bg-blue-600" />
                    <p className="mt-4 text-sm leading-7">{CV_PROFILE.technicalSkills.join(" • ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
