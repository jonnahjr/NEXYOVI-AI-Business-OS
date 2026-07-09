"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Warehouse } from "lucide-react";

export interface WarehouseOption {
  id: string;
  label: string;
  code: string;
  location: string;
  capacity: number;
}

interface WarehouseAutocompleteProps {
  value: string;
  onChange: (value: string, warehouseId?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function WarehouseAutocomplete({
  value,
  onChange,
  disabled = false,
  placeholder = "Search warehouse by name or code...",
}: WarehouseAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<WarehouseOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const doSearch = useCallback(async (term: string) => {
    if (!term || term.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        `http://localhost:3002/api/v1/modules/inventory-warehouse/warehouses?search=${encodeURIComponent(term)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      const data = json?.data || [];
      setResults(data);
      setIsOpen(true);
      setHighlightIndex(-1);
    } catch {
      setResults([]);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSelectedId(null);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val.trim()), 250);
  };

  const handleSelect = (wh: WarehouseOption) => {
    setInputValue(wh.label);
    setSelectedId(wh.id);
    setIsOpen(false);
    onChange(wh.label, wh.id);
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedId(null);
    setResults([]);
    setIsOpen(false);
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < results.length) {
          handleSelect(results[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-400"
          autoComplete="off"
        />
        {loading ? (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 animate-spin" />
        ) : inputValue ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-3.5 py-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
              Searching warehouses...
            </div>
          ) : results.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Warehouse size={14} className="text-slate-300" />
              {inputValue.trim() ? `No warehouses matching "${inputValue.trim()}"` : "Type to search warehouses..."}
            </div>
          ) : (
            results.map((wh, i) => (
              <button
                key={wh.id}
                type="button"
                onClick={() => handleSelect(wh)}
                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                  i === highlightIndex ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Warehouse size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{wh.label}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {wh.code && <span className="font-mono font-medium">{wh.code}</span>}
                    {wh.location && <span>· {wh.location}</span>}
                    {wh.capacity > 0 && <span>· {wh.capacity}m²</span>}
                  </div>
                </div>
                {selectedId === wh.id && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Selected</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
