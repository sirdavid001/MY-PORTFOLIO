import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiPhone, FiGithub, FiGlobe, FiSend } from "react-icons/fi";
import useBudgetContext from "../hooks/useBudgetContext";
import { formatMoney, getCurrencyForCountry, getLocationFactor } from "../../shared/budgeting.js";
import { CV_PROFILE } from "../../shared/cv/profile.js";

const inputClass =
  "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground outline-none ring-primary/20 placeholder:text-muted-foreground transition focus:ring-4 focus:border-primary";
const selectClass =
  "mt-2 w-full appearance-none rounded-2xl border border-border bg-background px-4 py-4 pr-10 text-foreground outline-none ring-primary/20 transition focus:ring-4 focus:border-primary cursor-pointer";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
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
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">
        ▾
      </span>
    );
  }

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-12 sm:py-20"
    >
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-foreground sm:text-7xl tracking-tight">
          Let&apos;s Build <span className="text-gradient">Something Great</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          Share your goals, requirements, timeline, and budget so I can propose the right solution for your next breakthrough.
        </motion.p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <motion.aside variants={itemVariants} className="glass-card rounded-[3rem] p-10 h-fit">
          <h2 className="text-3xl font-bold text-foreground mb-6">Get In Touch</h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-10">
            I&apos;m open to project work, collaborations, and professional opportunities. Feel free to reach out through any channel.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-5 group">
              <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <FiMail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                <a className="text-lg font-semibold text-foreground hover:text-primary transition-colors" href={`mailto:${CV_PROFILE.email}`}>
                  {CV_PROFILE.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5 group">
              <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <FiMapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                <p className="text-lg font-semibold text-foreground">{CV_PROFILE.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-5 group">
              <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <FiPhone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                <p className="text-lg font-semibold text-foreground">{CV_PROFILE.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-border/40">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Profiles</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={CV_PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-card border border-border px-5 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95"
              >
                <FiGithub className="h-4 w-4" />
                GitHub
              </a>
              <a
                href={CV_PROFILE.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
              >
                <FiGlobe className="h-4 w-4" />
                Portfolio
              </a>
            </div>
          </div>
        </motion.aside>

        <motion.form 
          variants={itemVariants} 
          onSubmit={handleSubmit} 
          className="glass-card rounded-[3rem] p-10 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Project Request Form</h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">I am a/an</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setClientType("Individual")}
                  className={`rounded-2xl border px-6 py-4 text-lg font-bold transition-all active:scale-95 ${
                    formData.clientType === "Individual"
                      ? "border-primary bg-primary/5 text-primary shadow-inner"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  👤 Individual
                </button>
                <button
                  type="button"
                  onClick={() => setClientType("Organization")}
                  className={`rounded-2xl border px-6 py-4 text-lg font-bold transition-all active:scale-95 ${
                    formData.clientType === "Organization"
                      ? "border-primary bg-primary/5 text-primary shadow-inner"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  🏢 Organization
                </button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                  {formData.clientType === "Organization" ? "Organization Name *" : "Your Name *"}
                </span>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder={formData.clientType === "Organization" ? "Your organization" : "John Doe"}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Email Address *</span>
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

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Phone (Optional)</span>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Country *</span>
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

            <label className="block">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Project Type *</span>
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
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Detailed Description *</span>
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
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Specific Requirements</span>
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
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Budget Range *</span>
                <div className="relative">
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className={selectClass}
                  >
                    <option value="">Min {formatMoney(roundMoney(250 * selectedUsdRate * selectedCountryFactor), selectedCurrencyCode)}</option>
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
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Desired Timeline *</span>
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
              <motion.label 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="block"
              >
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Custom Amount *</span>
                <input
                  name="customBudget"
                  value={formData.customBudget}
                  onChange={handleChange}
                  required
                  inputMode="decimal"
                  placeholder={`Min ${formatMoney(roundMoney(250 * selectedUsdRate * selectedCountryFactor), selectedCurrencyCode)}`}
                  className={inputClass}
                />
              </motion.label>
            )}

            <button
              type="submit"
              className="group relative flex w-full items-center justify-center gap-3 rounded-[2rem] bg-foreground px-8 py-5 text-xl font-bold text-background transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            >
              <FiSend className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              Send Project Request
            </button>
          </div>
        </motion.form>
      </div>
    </motion.section>
  );
}
