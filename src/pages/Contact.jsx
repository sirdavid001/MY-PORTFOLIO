import { useEffect, useMemo, useState } from "react";
import useBudgetContext from "../hooks/useBudgetContext";
import { formatMoney, getCurrencyForCountry, getLocationFactor } from "../lib/budgeting";
import { CV_PROFILE } from "../../shared/cv-profile.js";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none ring-blue-300/60 placeholder:text-slate-400 focus:ring";
const selectClass =
  "mt-1 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-slate-900 outline-none ring-blue-300/60 transition hover:border-slate-400 focus:border-blue-500 focus:ring";

const COUNTRY_CODES = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ",
  "CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ",
  "EC","EE","EG","EH","ER","ES","ET",
  "FI","FJ","FK","FM","FO","FR",
  "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY",
  "HK","HM","HN","HR","HT","HU",
  "ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT",
  "JE","JM","JO","JP",
  "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ",
  "OM",
  "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY",
  "QA",
  "RE","RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","UM","US","UY","UZ",
  "VA","VC","VE","VG","VI","VN","VU",
  "WF","WS",
  "YE","YT",
  "ZA","ZM","ZW",
];

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
  const budgetContext = useBudgetContext();
  const [formData, setFormData] = useState(defaultForm);
  const [countryOptions, setCountryOptions] = useState([
    { code: "US", name: "United States", flag: countryCodeToFlag("US") },
  ]);

  const selectedCountry =
    countryOptions.find((country) => country.code === formData.countryCode) || countryOptions[0];
  const selectedCurrencyCode = getCurrencyForCountry(formData.countryCode, budgetContext.currency);
  const selectedUsdRate = budgetContext.rates[selectedCurrencyCode] || 1;
  const selectedCountryFactor = getLocationFactor(formData.countryCode);

  useEffect(() => {
    const locale = navigator.language || "en";
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    const regions = [...COUNTRY_CODES].sort((a, b) =>
      (displayNames.of(a) || a).localeCompare(displayNames.of(b) || b)
    );

    const countries = regions.map((code) => ({
      code,
      name: displayNames.of(code) || code,
      flag: countryCodeToFlag(code),
    }));

    setCountryOptions(countries);

    const detectedRegion = budgetContext.countryCode || (locale.includes("-") ? locale.split("-")[1]?.toUpperCase() : "");
    if (detectedRegion && countries.some((country) => country.code === detectedRegion)) {
      setFormData((prev) => ({ ...prev, countryCode: detectedRegion }));
    }
  }, [budgetContext.countryCode]);

  const budgetOptions = useMemo(() => {
    const baseMin = roundMoney(250 * selectedUsdRate * selectedCountryFactor);
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
  }, [selectedCountryFactor, selectedCurrencyCode, selectedUsdRate]);

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
    const minBudget = roundMoney(250 * selectedUsdRate * selectedCountryFactor);
    const customBudgetAmount = Number(String(formData.customBudget).replace(/[^0-9.]/g, ""));

    if (formData.budget === "custom" && (!customBudgetAmount || customBudgetAmount < minBudget)) {
      alert(
        `Minimum budget is ${formatMoney(minBudget, selectedCurrencyCode)} for ${selectedCountry.name}.`
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
Currency: ${selectedCurrencyCode}
Project Type: ${formData.projectType}
Budget: ${budgetValue || "Not specified"}
Timeline: ${formData.timeline}

What do you want to build:
${formData.goals}

Specific requirements:
${formData.features}`
    );

    alert("Request prepared. Your email app will open so you can send your project brief.");
    window.location.href = `mailto:${CV_PROFILE.email}?subject=${subject}&body=${body}`;
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
            I&apos;m open to project work, collaborations, and professional opportunities. Feel free to reach out through
            the channels below.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600">
                @
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">Email</p>
                <a className="text-lg text-slate-600 hover:text-blue-600" href={`mailto:${CV_PROFILE.email}`}>
                  {CV_PROFILE.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600">
                o
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">Location</p>
                <p className="text-lg text-slate-600">{CV_PROFILE.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600">
                #
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">Phone</p>
                <p className="text-lg text-slate-600">{CV_PROFILE.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xl font-semibold text-slate-900">Portfolio and Profiles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={CV_PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                GitHub
              </a>
              <a
                href={CV_PROFILE.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Portfolio
              </a>
              <a
                href={`mailto:${CV_PROFILE.email}`}
                className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Email
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
                  <option value="">Select budget range (min {formatMoney(roundMoney(250 * selectedUsdRate * selectedCountryFactor), selectedCurrencyCode)})</option>
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
                placeholder={`Enter amount (minimum ${formatMoney(roundMoney(250 * selectedUsdRate * selectedCountryFactor), selectedCurrencyCode)})`}
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
