"use client";

import React, { useState, useEffect, useRef } from "react";

export type SearchableSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  /** Optional custom className for the trigger button */
  className?: string;
};

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isCustomMode = value && !options.includes(value);

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const selectedLabel = isCustomMode
    ? value
    : options.find(o => o === value) || "";

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={
          className ||
          `w-full border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors ${
            disabled
              ? "bg-slate-50 text-slate-400 cursor-not-allowed"
              : "bg-white hover:border-slate-300"
          }`
        }
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedLabel ? "text-slate-900" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && filtered.length > 0) {
                  onChange(filtered[0]);
                  setIsOpen(false);
                }
                if (e.key === "Escape") setIsOpen(false);
              }}
              placeholder="Type to search..."
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-300"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && !search.trim() && (
              <div className="px-3 py-2 text-xs text-slate-400">
                Type to search options...
              </div>
            )}
            {filtered.length === 0 && search.trim() && (
              <button
                className="w-full px-3 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 font-medium"
                onClick={() => {
                  onChange(search.trim());
                  setIsOpen(false);
                }}
              >
                + Use &ldquo;{search.trim()}&rdquo; as custom value
              </button>
            )}
            {filtered.map(opt => (
              <button
                key={opt}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                  opt === value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-700"
                }`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt === value && (
                  <svg
                    className="w-3.5 h-3.5 text-primary shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {opt !== value && <span className="w-3.5 shrink-0" />}
                {opt}
              </button>
            ))}
            {filtered.length > 0 &&
              search.trim() &&
              !options.some(o => o.toLowerCase() === search.toLowerCase()) && (
                <button
                  className="w-full px-3 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 font-medium border-t border-slate-100"
                  onClick={() => {
                    onChange(search.trim());
                    setIsOpen(false);
                  }}
                >
                  + Add &ldquo;{search.trim()}&rdquo;
                </button>
              )}
          </div>
          <div className="p-1.5 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 rounded-b-xl">
            {filtered.length} option{filtered.length !== 1 ? "s" : ""} · Enter
            to select · Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
