import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../context/LanguageContext";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { Metadata } from "libphonenumber-js";
import metadata from "libphonenumber-js/metadata.min.json";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const countryList = getCountries()
  .map((country) => ({
    code: country,
    name: regionNames.of(country),
    callingCode: `+${getCountryCallingCode(country)}`,
    flagUrl: `https://flagcdn.com/w40/${country.toLowerCase()}.png`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const meta = new Metadata(metadata);

export const getMaxLengthForCountry = (countryCode) => {
  if (countryCode === "PK") return 10;
  try {
    meta.selectNumberingPlan(countryCode);
    const lengths = meta.numberingPlan.possibleLengths();
    return Math.max(...lengths);
  } catch (e) {
    return 15;
  }
};

export const CustomCountrySelector = ({ selected, onSelect }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const filteredCountries = countryList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.callingCode.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-slate-50 border-r border-slate-100 px-3 py-3 hover:bg-slate-100 transition-colors gap-2"
      >
        <img src={selected.flagUrl} alt={selected.code} className="w-6 h-auto rounded-sm" />
        <span className="text-slate-600 font-medium">{selected.callingCode}</span>
        <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder={t.countrySearchPlaceholder}
                className="bg-transparent border-none outline-none text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-themed">
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left",
                  selected.code === c.code && "bg-primary-50"
                )}
              >
                <img src={c.flagUrl} alt={c.code} className="w-5 h-auto rounded-sm shadow-sm" />
                <span className="flex-1 font-medium text-slate-700">{c.name}</span>
                <span className="text-slate-400 text-sm">{c.callingCode}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm">{t.countryNoResults}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
