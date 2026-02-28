import { useState } from "react";

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
  notes: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(defaultForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const budgetValue = formData.budget === "Custom" ? formData.customBudget : formData.budget;
    const subject = encodeURIComponent(`Project Request - ${formData.projectType || "New Inquiry"}`);
    const body = encodeURIComponent(
      `Client Type: ${formData.clientType}
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone/WhatsApp: ${formData.phone}
Organization: ${formData.organization || "N/A"}
Project Type: ${formData.projectType}
Timeline: ${formData.timeline}
Budget: ${budgetValue || "Not specified"}

Project Goals:
${formData.goals}

Requested Features:
${formData.features}

Extra Notes:
${formData.notes || "N/A"}`
    );

    window.location.href = `mailto:itssirdavid@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <section className="grid gap-6 py-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-widest text-blue-600">Project Request</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
          Let&apos;s Plan Your Build
        </h1>
        <p className="mt-4 text-base text-slate-600 sm:text-lg">
          Fill this form with your goals, required features, timeline, and budget. I&apos;ll review your request and get back with the best next steps.
        </p>

        <dl className="mt-6 space-y-3 text-base text-slate-700 sm:text-lg">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd>
              <a className="text-blue-600 hover:underline" href="mailto:itssirdavid@gmail.com">
                itssirdavid@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd>Lagos, Nigeria</dd>
          </div>
          <div>
            <dt className="text-slate-500">Response Time</dt>
            <dd>Usually within 24-48 hours</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
          Request Form
        </h2>

        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm text-slate-700">
            Are you an individual or organization?
            <select
              name="clientType"
              value={formData.clientType}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
            >
              <option>Individual</option>
              <option>Organization</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-700">
              Full Name
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-700">
              Phone / WhatsApp
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-700">
              Organization Name
              <input
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder={formData.clientType === "Organization" ? "Required for organizations" : "Optional"}
                required={formData.clientType === "Organization"}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-700">
              Project Type
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              >
                <option value="">Select project type</option>
                <option>Portfolio Website</option>
                <option>Business Website</option>
                <option>Web App</option>
                <option>Landing Page</option>
                <option>Dashboard</option>
                <option>Other</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Timeline
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              >
                <option value="">Select timeline</option>
                <option>ASAP (1-2 weeks)</option>
                <option>Short Term (3-4 weeks)</option>
                <option>Medium Term (1-2 months)</option>
                <option>Flexible</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1 text-sm text-slate-700">
            Budget
            <select
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
            >
              <option value="">Select budget range</option>
              <option>$100 - $300</option>
              <option>$300 - $700</option>
              <option>$700 - $1,500</option>
              <option>$1,500+</option>
              <option>Custom</option>
            </select>
          </label>

          {formData.budget === "Custom" && (
            <label className="grid gap-1 text-sm text-slate-700">
              Custom Budget
              <input
                name="customBudget"
                value={formData.customBudget}
                onChange={handleChange}
                placeholder="Enter your budget"
                required
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
              />
            </label>
          )}

          <label className="grid gap-1 text-sm text-slate-700">
            Project Goals
            <textarea
              rows="4"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              required
              placeholder="What do you want this project to achieve?"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Required Features
            <textarea
              rows="4"
              name="features"
              value={formData.features}
              onChange={handleChange}
              required
              placeholder="List important features you want included"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Extra Notes (Optional)
            <textarea
              rows="3"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Reference links, design style, or any other details"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring"
            />
          </label>

          <button type="submit" className="mt-2 rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800">
            Send Request
          </button>
        </div>
      </form>
    </section>
  );
}
