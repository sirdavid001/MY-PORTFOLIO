import { useMemo, useRef, useState } from "react";
import useSEO from "../hooks/useSEO";
import { ROUTE_BY_KEY } from "../../shared/seo.js";
import { FiMail, FiMapPin, FiPhone, FiGithub, FiLinkedin, FiSend } from "react-icons/fi";
import useBudgetContext from "../hooks/useBudgetContext";
import { formatMoney, getCurrencyForCountry, getLocationFactor } from "../../shared/budgeting.js";
import { countryNames } from "../data/countries";
import { PUBLIC_PROFILE } from "../../shared/profile.js";

const inputClass =
  "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground placeholder:text-muted-foreground transition focus:border-primary";
const selectClass =
  "mt-2 w-full appearance-none rounded-2xl border border-border bg-background px-4 py-4 pr-10 text-foreground  transition focus:border-primary cursor-pointer";

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

const defaultForm = {
  clientType: "Individual",
  countryCode: "",
  fullName: "",
  email: "",
  phone: "",
  projectType: "",
  goals: "",
  features: "",
  timeline: "",
  budget: "",
  customBudget: "",
  website: "",
};

const countryOptions = countryNames.map(([code, name]) => ({
  code,
  name,
  flag: countryCodeToFlag(code),
}));

function SelectArrow() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">
      ▾
    </span>
  );
}

export default function Contact() {
  useSEO(ROUTE_BY_KEY.contact);

  const budgetContext = useBudgetContext();
  const [formData, setFormData] = useState(defaultForm);
  const [budgetPricing, setBudgetPricing] = useState(null);
  const [budgetError, setBudgetError] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customBudgetInput = useRef(null);

  const detectedCountry = countryOptions.find((country) => country.code === budgetContext.countryCode);
  const countryCode = budgetPricing?.countryCode || formData.countryCode || detectedCountry?.code || "NG";
  const selectedCountry = countryOptions.find((country) => country.code === countryCode);
  const localCurrency = getCurrencyForCountry(countryCode, "USD");
  const selectedCurrencyCode = budgetPricing?.currency || (budgetContext.rates[localCurrency] ? localCurrency : "USD");
  const selectedUsdRate = budgetPricing?.rate || budgetContext.rates[selectedCurrencyCode] || 1;
  const selectedCountryFactor = getLocationFactor(countryCode);
  const minBudget = roundMoney(250 * selectedUsdRate * selectedCountryFactor);

  const budgetOptions = useMemo(() => {
    const baseMin = minBudget;
    const tier2 = roundMoney(baseMin * 2);
    const tier3 = roundMoney(baseMin * 4);
    const tier4 = roundMoney(baseMin * 8);

    return [
      { value: "tier1", label: `${formatMoney(baseMin, selectedCurrencyCode)} - ${formatMoney(tier2, selectedCurrencyCode)}` },
      { value: "tier2", label: `${formatMoney(tier2, selectedCurrencyCode)} - ${formatMoney(tier3, selectedCurrencyCode)}` },
      { value: "tier3", label: `${formatMoney(tier3, selectedCurrencyCode)} - ${formatMoney(tier4, selectedCurrencyCode)}` },
      { value: "tier4", label: `${formatMoney(tier4, selectedCurrencyCode)}+` },
      { value: "custom", label: "Custom" },
    ];
  }, [minBudget, selectedCurrencyCode]);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "countryCode") {
      setBudgetPricing(null);
      setBudgetError("");
      setFormData((prev) => ({ ...prev, countryCode: value, budget: "", customBudget: "" }));
      return;
    }

    if (name === "budget") {
      setBudgetPricing((prev) => value ? prev || { countryCode, currency: selectedCurrencyCode, rate: selectedUsdRate } : null);
      setBudgetError("");
    }
    if (name === "customBudget") setBudgetError("");

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function buildMailtoHref(subject, body) {
    return `mailto:${PUBLIC_PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBudgetError("");
    setSubmitStatus(null);

    const customBudget = formData.customBudget.trim();
    const customAmount = Number(customBudget.replaceAll(",", ""));
    if (formData.budget === "custom" && (
      !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(customBudget) ||
      !Number.isFinite(customAmount) || customAmount < minBudget
    )) {
      setBudgetError(`Enter an amount of at least ${formatMoney(minBudget, selectedCurrencyCode)}.`);
      customBudgetInput.current?.focus();
      return;
    }

    const pickedBudget = budgetOptions.find((option) => option.value === formData.budget);
    const budgetValue =
      formData.budget === "custom" ? `${customBudget} ${selectedCurrencyCode}` : pickedBudget?.label || "Not specified";

    const subject = `Project Request - ${formData.projectType || "New Inquiry"}`;
    const body =
      `Client Type: ${formData.clientType}
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone || "N/A"}
Organization: ${formData.clientType === "Organization" ? formData.fullName : "N/A"}
Country: ${selectedCountry.name}
Currency: ${selectedCurrencyCode}
Project Type: ${formData.projectType}
Budget: ${budgetValue || "Not specified"}
Timeline: ${formData.timeline}

What do you want to build:
${formData.goals}

Specific requirements:
${formData.features}`;

    const requestPayload = {
      ...formData,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      currency: selectedCurrencyCode,
      budgetLabel: budgetValue,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result?.ok) {
        setSubmitStatus({ text: "Project request sent. I’ll get back to you soon." });
        setBudgetPricing(null);
        setFormData({ ...defaultForm, countryCode: selectedCountry.code });
        return;
      }

      if (result?.fallback === "mailto") {
        setSubmitStatus({ text: "Your email app will open with your project brief ready to send." });
        window.location.href = buildMailtoHref(subject, body);
        return;
      }

      throw new Error("Project request could not be sent");
    } catch {
      setSubmitStatus({ error: true, text: "The request could not be sent. Try again or email me directly." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="pb-16 pt-8 sm:pt-12">
      <div className="mb-9 max-w-2xl sm:mb-12">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-6xl">Start a project</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Tell me what you want to build, when you need it, and what you plan to spend.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8">
        <form onSubmit={handleSubmit} className="min-w-0 rounded-3xl border border-border bg-card p-5 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Project brief</h2>

          <div className="space-y-6">
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <fieldset className="min-w-0">
              <legend className="mb-3 text-sm font-semibold text-foreground">Who is the project for?</legend>
              <div className="flex flex-wrap gap-3">
                {["Individual", "Organization"].map((type) => (
                  <label key={type} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium has-checked:border-primary">
                    <input
                      type="radio"
                      name="clientType"
                      value={type}
                      checked={formData.clientType === type}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-muted-foreground px-1">
                  {formData.clientType === "Organization" ? "Organization Name *" : "Your Name *"}
                </span>
                <input
                  name="fullName"
                  autoComplete={formData.clientType === "Organization" ? "organization" : "name"}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder={formData.clientType === "Organization" ? "Your organization" : "John Doe"}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-muted-foreground px-1">Email Address *</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-muted-foreground px-1">Phone (Optional)</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-muted-foreground px-1">Country *</span>
                <div className="relative">
                  <select
                    name="countryCode"
                    autoComplete="country"
                    value={countryCode}
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

            <label className="block">
              <span className="text-sm font-semibold text-muted-foreground px-1">Project Type *</span>
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

            <label className="block">
              <span className="text-sm font-semibold text-muted-foreground px-1">Detailed Description *</span>
              <textarea
                rows="4"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                required
                placeholder="Describe your vision, goals, and what success looks like."
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-muted-foreground px-1">Specific Requirements *</span>
              <textarea
                rows="2"
                name="features"
                value={formData.features}
                onChange={handleChange}
                required
                placeholder="e.g. auth, payments, dashboard, API integration"
                className={inputClass}
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-muted-foreground px-1">Budget Range *</span>
                <div className="relative">
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className={selectClass}
                  >
                    <option value="">Select a range in {selectedCurrencyCode}</option>
                    {budgetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <SelectArrow />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-muted-foreground px-1">Desired Timeline *</span>
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
              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-muted-foreground px-1">Custom Amount *</span>
                  <input
                    name="customBudget"
                    ref={customBudgetInput}
                    aria-invalid={Boolean(budgetError)}
                    aria-describedby={budgetError ? "custom-budget-hint custom-budget-error" : "custom-budget-hint"}
                    value={formData.customBudget}
                    onChange={handleChange}
                    required
                    inputMode="decimal"
                    className={inputClass}
                  />
                </label>
                <p id="custom-budget-hint" className="mt-2 text-sm text-muted-foreground">
                  Minimum {formatMoney(minBudget, selectedCurrencyCode)} ({selectedCurrencyCode})
                </p>
                <p id="custom-budget-error" role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
                  {budgetError}
                </p>
              </div>
            )}

            <p role="status" className={`text-sm font-medium ${submitStatus?.error ? "text-red-700 dark:text-red-300" : "text-muted-foreground"}`}>
              {submitStatus?.text}
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <FiSend aria-hidden="true" />
              {isSubmitting ? "Sending…" : "Send project request"}
            </button>
          </div>
        </form>

        <aside className="h-fit min-w-0 rounded-3xl border border-border bg-card p-5 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Contact details</h2>

          <div className="space-y-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiMail aria-hidden="true" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Email</p>
                <a className="text-lg font-semibold text-foreground transition-colors [overflow-wrap:anywhere] hover:text-primary" href={`mailto:${PUBLIC_PROFILE.email}`}>
                  {PUBLIC_PROFILE.email}
                </a>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiMapPin aria-hidden="true" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Location</p>
                <p className="text-lg font-semibold text-foreground">{PUBLIC_PROFILE.location}</p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiPhone aria-hidden="true" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                <a href={`tel:${PUBLIC_PROFILE.phone.replaceAll(" ", "")}`} className="text-lg font-semibold text-foreground underline-offset-4 hover:underline">{PUBLIC_PROFILE.phone}</a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Profiles</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={PUBLIC_PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-card border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <FiGithub aria-hidden="true" className="h-4 w-4" />
                GitHub
              </a>
              <a
                href={PUBLIC_PROFILE.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <FiLinkedin aria-hidden="true" className="h-4 w-4" />
                LinkedIn
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
