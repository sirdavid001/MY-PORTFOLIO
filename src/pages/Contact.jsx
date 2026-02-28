import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none ring-blue-300/60 placeholder:text-slate-400 focus:ring";

const defaultForm = {
  clientType: "Individual",
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  projectType: "",
  goals: "",
  features: "",
  timeline: "",
  budget: "",
  customBudget: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(defaultForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function setClientType(type) {
    setFormData((prev) => ({ ...prev, clientType: type }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const budgetValue = formData.budget === "Custom" ? formData.customBudget : formData.budget;

    const subject = encodeURIComponent(`Project Request - ${formData.projectType || "New Inquiry"}`);
    const body = encodeURIComponent(
      `Client Type: ${formData.clientType}
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone || "N/A"}
Organization: ${formData.organization || "N/A"}
Project Type: ${formData.projectType}
Budget: ${budgetValue || "Not specified"}
Timeline: ${formData.timeline}

What do you want to build:
${formData.goals}

Specific requirements:
${formData.features}`
    );

    window.location.href = `mailto:itssirdavid@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto mb-10 max-w-4xl text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-6xl">
          Let&apos;s Build Something Great Together
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-xl">
          Share your project details and budget so I can understand your needs and provide the best solution.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <aside className="rounded-2xl border border-slate-200 bg-[#f7f7f9] p-6">
          <h2 className="font-display text-4xl font-bold text-slate-900">Get In Touch</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            Feel free to reach out through any of the following channels.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600">
                @
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">Email</p>
                <a className="text-lg text-slate-600 hover:text-blue-600" href="mailto:itssirdavid@gmail.com">
                  itssirdavid@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600">
                o
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">Location</p>
                <p className="text-lg text-slate-600">Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xl font-semibold text-slate-900">Connect on Social Media</p>
            <div className="mt-3 flex gap-2">
              <a
                href="https://github.com/sirdavid001"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg text-white"
              >
                G
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg text-white"
              >
                in
              </a>
              <a
                href="https://instagram.com/sirdavid._"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-lg text-white"
              >
                ig
              </a>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-4xl font-bold text-slate-900">Tell Me About Your Project</h2>

          <p className="mt-4 text-sm font-medium text-slate-700">I am a/an</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setClientType("Individual")}
              className={`rounded-xl border px-4 py-3 text-lg font-medium transition ${
                formData.clientType === "Individual"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setClientType("Organization")}
              className={`rounded-xl border px-4 py-3 text-lg font-medium transition ${
                formData.clientType === "Organization"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Organization
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Your Name *
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email Address *
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className={inputClass}
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Phone Number (Optional)
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              className={inputClass}
            />
          </label>

          {formData.clientType === "Organization" && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Organization Name *
              <input
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                placeholder="Your organization name"
                className={inputClass}
              />
            </label>
          )}

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Project Type *
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select a project type</option>
              <option>Portfolio Website</option>
              <option>Business Website</option>
              <option>Web App</option>
              <option>Landing Page</option>
              <option>Dashboard</option>
              <option>Other</option>
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            What do you want to build? *
            <textarea
              rows="4"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              required
              placeholder="Describe your project vision, goals, and what problem it solves..."
              className={inputClass}
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Specific Requirements or Features
            <textarea
              rows="3"
              name="features"
              value={formData.features}
              onChange={handleChange}
              required
              placeholder="e.g., user authentication, payment integration, admin dashboard, API integration..."
              className={inputClass}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Budget Range *
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select budget range</option>
                <option>$100 - $300</option>
                <option>$300 - $700</option>
                <option>$700 - $1,500</option>
                <option>$1,500+</option>
                <option>Custom</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Desired Timeline *
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select timeline</option>
                <option>ASAP (1-2 weeks)</option>
                <option>Short Term (3-4 weeks)</option>
                <option>Medium Term (1-2 months)</option>
                <option>Flexible</option>
              </select>
            </label>
          </div>

          {formData.budget === "Custom" && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Custom Budget *
              <input
                name="customBudget"
                value={formData.customBudget}
                onChange={handleChange}
                required
                placeholder="Enter your budget"
                className={inputClass}
              />
            </label>
          )}

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
          >
            Send Project Request
          </button>
        </form>
      </div>
    </section>
  );
}
