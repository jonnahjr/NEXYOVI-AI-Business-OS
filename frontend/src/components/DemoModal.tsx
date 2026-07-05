"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ChevronDown } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";

type FlagsType = typeof Flags;
type FlagKey = keyof FlagsType;

const COUNTRY_CODES: { iso: FlagKey; code: string; name: string }[] = [
  { iso: "ET", code: "+251", name: "Ethiopia" },
  { iso: "US", code: "+1",   name: "USA" },
  { iso: "GB", code: "+44",  name: "United Kingdom" },
  { iso: "DE", code: "+49",  name: "Germany" },
  { iso: "FR", code: "+33",  name: "France" },
  { iso: "CN", code: "+86",  name: "China" },
  { iso: "IN", code: "+91",  name: "India" },
  { iso: "BR", code: "+55",  name: "Brazil" },
  { iso: "ZA", code: "+27",  name: "South Africa" },
  { iso: "NG", code: "+234", name: "Nigeria" },
  { iso: "KE", code: "+254", name: "Kenya" },
  { iso: "GH", code: "+233", name: "Ghana" },
  { iso: "TZ", code: "+255", name: "Tanzania" },
  { iso: "UG", code: "+256", name: "Uganda" },
  { iso: "RW", code: "+250", name: "Rwanda" },
  { iso: "SN", code: "+221", name: "Senegal" },
  { iso: "CI", code: "+225", name: "Côte d'Ivoire" },
  { iso: "CM", code: "+237", name: "Cameroon" },
  { iso: "MA", code: "+212", name: "Morocco" },
  { iso: "EG", code: "+20",  name: "Egypt" },
  { iso: "DZ", code: "+213", name: "Algeria" },
  { iso: "SD", code: "+249", name: "Sudan" },
  { iso: "SS", code: "+211", name: "South Sudan" },
  { iso: "SO", code: "+252", name: "Somalia" },
  { iso: "DJ", code: "+253", name: "Djibouti" },
  { iso: "ER", code: "+291", name: "Eritrea" },
  { iso: "MZ", code: "+258", name: "Mozambique" },
  { iso: "ZM", code: "+260", name: "Zambia" },
  { iso: "ZW", code: "+263", name: "Zimbabwe" },
  { iso: "BW", code: "+267", name: "Botswana" },
  { iso: "NA", code: "+264", name: "Namibia" },
  { iso: "MW", code: "+265", name: "Malawi" },
  { iso: "MG", code: "+261", name: "Madagascar" },
  { iso: "MU", code: "+230", name: "Mauritius" },
  { iso: "AO", code: "+244", name: "Angola" },
  { iso: "CG", code: "+242", name: "Congo" },
  { iso: "CD", code: "+243", name: "DR Congo" },
  { iso: "GA", code: "+241", name: "Gabon" },
  { iso: "TD", code: "+235", name: "Chad" },
  { iso: "BJ", code: "+229", name: "Benin" },
  { iso: "TG", code: "+228", name: "Togo" },
  { iso: "BF", code: "+226", name: "Burkina Faso" },
  { iso: "ML", code: "+223", name: "Mali" },
  { iso: "NE", code: "+227", name: "Niger" },
  { iso: "MR", code: "+222", name: "Mauritania" },
  { iso: "GM", code: "+220", name: "Gambia" },
  { iso: "GN", code: "+224", name: "Guinea" },
  { iso: "SL", code: "+232", name: "Sierra Leone" },
  { iso: "LR", code: "+231", name: "Liberia" },
  { iso: "BI", code: "+257", name: "Burundi" },
  { iso: "LY", code: "+218", name: "Libya" },
  { iso: "TN", code: "+216", name: "Tunisia" },
  { iso: "RU", code: "+7",   name: "Russia" },
  { iso: "JP", code: "+81",  name: "Japan" },
  { iso: "KR", code: "+82",  name: "South Korea" },
  { iso: "AU", code: "+61",  name: "Australia" },
  { iso: "CA", code: "+1",   name: "Canada" },
  { iso: "MX", code: "+52",  name: "Mexico" },
  { iso: "AR", code: "+54",  name: "Argentina" },
  { iso: "CL", code: "+56",  name: "Chile" },
  { iso: "CO", code: "+57",  name: "Colombia" },
  { iso: "PE", code: "+51",  name: "Peru" },
  { iso: "SA", code: "+966", name: "Saudi Arabia" },
  { iso: "AE", code: "+971", name: "UAE" },
  { iso: "TR", code: "+90",  name: "Turkey" },
  { iso: "IR", code: "+98",  name: "Iran" },
  { iso: "IQ", code: "+964", name: "Iraq" },
  { iso: "JO", code: "+962", name: "Jordan" },
  { iso: "LB", code: "+961", name: "Lebanon" },
  { iso: "IL", code: "+972", name: "Israel" },
  { iso: "PK", code: "+92",  name: "Pakistan" },
  { iso: "BD", code: "+880", name: "Bangladesh" },
  { iso: "LK", code: "+94",  name: "Sri Lanka" },
  { iso: "NP", code: "+977", name: "Nepal" },
  { iso: "MY", code: "+60",  name: "Malaysia" },
  { iso: "SG", code: "+65",  name: "Singapore" },
  { iso: "ID", code: "+62",  name: "Indonesia" },
  { iso: "PH", code: "+63",  name: "Philippines" },
  { iso: "VN", code: "+84",  name: "Vietnam" },
  { iso: "TH", code: "+66",  name: "Thailand" },
  { iso: "IT", code: "+39",  name: "Italy" },
  { iso: "ES", code: "+34",  name: "Spain" },
  { iso: "PT", code: "+351", name: "Portugal" },
  { iso: "NL", code: "+31",  name: "Netherlands" },
  { iso: "BE", code: "+32",  name: "Belgium" },
  { iso: "CH", code: "+41",  name: "Switzerland" },
  { iso: "AT", code: "+43",  name: "Austria" },
  { iso: "PL", code: "+48",  name: "Poland" },
  { iso: "SE", code: "+46",  name: "Sweden" },
  { iso: "NO", code: "+47",  name: "Norway" },
  { iso: "DK", code: "+45",  name: "Denmark" },
  { iso: "FI", code: "+358", name: "Finland" },
  { iso: "GR", code: "+30",  name: "Greece" },
  { iso: "UA", code: "+380", name: "Ukraine" },
];

function FlagIcon({ iso, className }: { iso: FlagKey; className?: string }) {
  const FlagComponent = Flags[iso] as React.FC<{ className?: string }>;
  if (!FlagComponent) return <span className="text-base">🏳</span>;
  return <FlagComponent className={className ?? "w-5 h-4 rounded-sm"} />;
}

export default function DemoModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", industry: "", message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-primary" />
          </button>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Request a Demo</h2>
                <p className="text-slate-500 font-light text-sm">
                  See NEXYOVI in action. Our team will reach out within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    name="name" required value={form.name} onChange={handleChange}
                    placeholder="Abebe Girma"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                {/* Phone with SVG flag country selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">Phone</label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setShowCountryDropdown(!showCountryDropdown); setCountrySearch(""); }}
                        className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium hover:bg-slate-100 transition-all whitespace-nowrap min-w-[105px]"
                      >
                        <FlagIcon iso={selectedCountry.iso} className="w-5 h-4 rounded-sm object-cover" />
                        <span className="text-xs font-mono">{selectedCountry.code}</span>
                        <ChevronDown size={12} className="text-slate-400" />
                      </button>

                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-68 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden" style={{ width: 270 }}>
                          <div className="p-2 border-b border-slate-100">
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country or code..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {filteredCountries.map((c, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 text-left transition-colors"
                              >
                                <FlagIcon iso={c.iso} className="w-5 h-4 rounded-sm object-cover shrink-0" />
                                <span className="flex-1 text-slate-700">{c.name}</span>
                                <span className="text-slate-400 font-mono text-xs">{c.code}</span>
                              </button>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div className="px-4 py-4 text-sm text-slate-400 text-center">No country found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      name="phone" value={form.phone} onChange={handleChange}
                      placeholder="91 234 5678"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Business Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">Business Email</label>
                  <input
                    name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="abebe@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">Company Name</label>
                  <input
                    name="company" required value={form.company} onChange={handleChange}
                    placeholder="Abyssinia Trading PLC"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">Industry</label>
                  <select
                    name="industry" value={form.industry} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  >
                    <option value="">Select industry...</option>
                    <option>Manufacturing</option>
                    <option>Retail & E-commerce</option>
                    <option>Healthcare</option>
                    <option>Finance & Banking</option>
                    <option>Construction</option>
                    <option>Agriculture</option>
                    <option>Government</option>
                    <option>Education</option>
                    <option>Logistics & Transport</option>
                    <option>Hospitality & Tourism</option>
                    <option>NGO & Non-Profit</option>
                    <option>Energy & Mining</option>
                    <option>Telecommunications</option>
                    <option>Real Estate</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">Message (optional)</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange} rows={3}
                    placeholder="Tell us about your business needs..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : "Submit Demo Request"}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Request Received!</h2>
              <p className="text-slate-500 font-light text-sm max-w-xs">
                Thank you, <strong className="text-slate-900">{form.name}</strong>. Our team will contact you at <strong className="text-slate-900">{form.email}</strong> within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all"
              >
                Close
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
