import { useEffect, useMemo, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none ring-blue-300/60 placeholder:text-slate-400 focus:ring";
const selectClass =
  "mt-1 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-slate-900 outline-none ring-blue-300/60 transition hover:border-slate-400 focus:border-blue-500 focus:ring";

const COUNTRY_CURRENCY_CONFIG = {
  US: { currency: "USD", usdRate: 1 },
  NG: { currency: "NGN", usdRate: 1600 },
  GB: { currency: "GBP", usdRate: 0.79 },
  CA: { currency: "CAD", usdRate: 1.35 },
  DE: { currency: "EUR", usdRate: 0.92 },
  FR: { currency: "EUR", usdRate: 0.92 },
  AE: { currency: "AED", usdRate: 3.67 },
  IN: { currency: "INR", usdRate: 83 },
  KE: { currency: "KES", usdRate: 129 },
  GH: { currency: "GHS", usdRate: 15.6 },
  ZA: { currency: "ZAR", usdRate: 18.6 },
};

function countryCodeToFlag(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function roundMoney(value) {
  if (value < 1000) return Math.round(value / 10) * 10;
  if (value < 10000) return Math.round(value / 100) * 100;
  if (value < 100000) return Math.round(value / 500) * 500;
  return Math.round(value / 1000) * 1000;
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const defaultForm = {
  clientType: "Individual",
  countryCode: "US",
  fullName: "",
  email: "",
  phone: "",
  projectType: "",
  goals: "",
  features: "",
  timeline: "",
  budget: "",
  customBudget: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(defaultForm);
  const [countryOptions, setCountryOptions] = useState([
    { code: "US", name: "United States", flag: countryCodeToFlag("US") },
  ]);

  const selectedCountry =
    countryOptions.find((country) => country.code === formData.countryCode) || countryOptions[0];
  const selectedCurrency = COUNTRY_CURRENCY_CONFIG[formData.countryCode] || { currency: "USD", usdRate: 1 };

  useEffect(() => {
    const locale = navigator.language || "en";
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    const regions =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("region")
            .filter((code) => /^[A-Z]{2}$/.test(code))
            .sort((a, b) => (displayNames.of(a) || a).localeCompare(displayNames.of(b) || b))
        : ["US", "GB", "CA", "DE", "FR", "NG", "IN", "AE", "ZA"];

    const countries = regions.map((code) => ({
      code,
      name: displayNames.of(code) || code,
      flag: countryCodeToFlag(code),
    }));

    setCountryOptions(countries);

    const region = locale.includes("-") ? locale.split("-")[1]?.toUpperCase() : "";
    if (region && countries.some((country) => country.code === region)) {
      setFormData((prev) => ({ ...prev, countryCode: region }));
    }
  }, []);

  const budgetOptions = useMemo(() => {
    const baseMin = roundMoney(250 * selectedCurrency.usdRate);
    const tier2 = roundMoney(baseMin * 2);
    const tier3 = roundMoney(baseMin * 4);
    const tier4 = roundMoney(baseMin * 8);

    return [
      { value: "tier1", label: `${formatCurrency(baseMin, selectedCurrency.currency)} - ${formatCurrency(tier2, selectedCurrency.currency)}` },
      { value: "tier2", label: `${formatCurrency(tier2, selectedCurrency.currency)} - ${formatCurrency(tier3, selectedCurrency.currency)}` },
      { value: "tier3", label: `${formatCurrency(tier3, selectedCurrency.currency)} - ${formatCurrency(tier4, selectedCurrency.currency)}` },
      { value: "tier4", label: `${formatCurrency(tier4, selectedCurrency.currency)}+` },
      { value: "custom", label: "Custom" },
    ];
  }, [selectedCurrency]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => {
      if (name === "countryCode") {
        return { ...prev, countryCode: value, budget: "", customBudget: "" };
      }
      return { ...prev, [name]: value };
    });
  }

  function setClientType(type) {
    setFormData((prev) => ({ ...prev, clientType: type }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const minBudget = roundMoney(250 * selectedCurrency.usdRate);
    const customBudgetAmount = Number(String(formData.customBudget).replace(/[^0-9.]/g, ""));

    if (formData.budget === "custom" && (!customBudgetAmount || customBudgetAmount < minBudget)) {
      alert(
        `Minimum budget is ${formatCurrency(minBudget, selectedCurrency.currency)} for ${selectedCountry.name}.`
      );
      return;
    }

    const pickedBudget = budgetOptions.find((option) => option.value === formData.budget);
    const budgetValue =
      formData.budget === "custom" ? formData.customBudget : pickedBudget?.label || "Not specified";

    const subject = encodeURIComponent(`Project Request - ${formData.projectType || "New Inquiry"}`);
    const body = encodeURIComponent(
      `Client Type: ${formData.clientType}
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone || "N/A"}
Organization: ${formData.clientType === "Organization" ? formData.fullName : "N/A"}
Country: ${selectedCountry.name}
Currency: ${selectedCurrency.currency}
Project Type: ${formData.projectType}
Budget: ${budgetValue || "Not specified"}
Timeline: ${formData.timeline}

What do you want to build:
${formData.goals}

Specific requirements:
${formData.features}`
    );

    alert("Request prepared. Your email app will open so you can send your project brief.");
    window.location.href = `mailto:itssirdavid@gmail.com?subject=${subject}&body=${body}`;
  }

  function SelectArrow() {
    return (
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
        ▾
      </span>
    );
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto mb-10 max-w-4xl text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-6xl">Tell Me About Your Project</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-xl">
          Share your goals, requirements, timeline, and budget so I can propose the right solution.
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
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.33-1.77-1.33-1.77-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.62-2.67-.31-5.48-1.33-5.48-5.94 0-1.31.47-2.38 1.23-3.22-.12-.31-.53-1.57.12-3.27 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.7.24 2.96.12 3.27.76.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.62-5.49 5.93.43.38.82 1.11.82 2.24v3.32c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg text-white"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.03-1.84-3.03-1.84 0-2.12 1.44-2.12 2.93v5.68H9.38V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77A1.77 1.77 0 0 0 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73A1.77 1.77 0 0 0 22.22 0Z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/sirdavid._"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-lg text-white"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5ZM17.3 6.7a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
                </svg>
              </a>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-4xl font-bold text-slate-900">Project Request Form</h2>

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
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">👤</span>
                <span>Individual</span>
              </span>
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
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">🏢</span>
                <span>Organization</span>
              </span>
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              {formData.clientType === "Organization" ? "Organization Name *" : "Your Name *"}
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder={formData.clientType === "Organization" ? "Your organization name" : "John Doe"}
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

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Phone Number (Optional)
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Country *
              <div className="relative">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Project Type *
            <div className="relative">
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                required
                className={selectClass}
              >
                <option value="">Select a project type</option>
                <option>Website</option>
                <option>Web App</option>
                <option>E-commerce</option>
                <option>Mobile App</option>
                <option>Redesign</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
              <SelectArrow />
            </div>
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Detailed Project Description *
            <textarea
              rows="4"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              required
              placeholder="Describe your vision, goals, target users, and what success looks like."
              className={inputClass}
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Specific Requirements
            <textarea
              rows="3"
              name="features"
              value={formData.features}
              onChange={handleChange}
              required
              placeholder="e.g. authentication, payments, dashboard, notifications, API integration"
              className={inputClass}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Budget Range *
              <div className="relative">
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">Select budget range (min {formatCurrency(roundMoney(250 * selectedCurrency.usdRate), selectedCurrency.currency)})</option>
                  {budgetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Desired Timeline *
              <div className="relative">
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">Select timeline</option>
                  <option>ASAP (1-2 weeks)</option>
                  <option>Short Term (3-4 weeks)</option>
                  <option>Medium Term (1-2 months)</option>
                  <option>Flexible</option>
                </select>
                <SelectArrow />
              </div>
            </label>
          </div>

          {formData.budget === "custom" && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Custom Budget *
              <input
                name="customBudget"
                value={formData.customBudget}
                onChange={handleChange}
                required
                inputMode="decimal"
                placeholder={`Enter amount (minimum ${formatCurrency(roundMoney(250 * selectedCurrency.usdRate), selectedCurrency.currency)})`}
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
