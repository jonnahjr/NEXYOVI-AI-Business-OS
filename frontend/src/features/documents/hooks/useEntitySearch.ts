"use client";

import { useCallback, useRef, useState } from "react";
import type { EntityRef } from "../types/documents";
import { ENTITY_MODULES } from "../types/documents";

const API_BASE = "http://localhost:3002/api/v1/modules";

/**
 * Hook for cross-module entity searching.
 * Allows the Document Management module to link documents to
 * entities in other modules: Customers, Employees, Projects, etc.
 */
export function useEntitySearch() {
  const [results, setResults] = useState<EntityRef[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const getToken = () => localStorage.getItem("token") || "";

  const searchModule = useCallback(
    async (
      type: string,
      query: string,
      signal: AbortSignal
    ): Promise<EntityRef[]> => {
      const config = ENTITY_MODULES[type];
      if (!config) return [];

      try {
        const res = await fetch(
          `${API_BASE}/${config.pillarSlug}/${config.moduleSlug}?search=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
            signal,
          }
        );
        if (!res.ok) return [];
        const json = await res.json();
        const items = json.data || json || [];
        return (Array.isArray(items) ? items : [])
          .filter((item: any) => item[config.labelKey])
          .slice(0, 25)
          .map((item: any) => ({
            type: type as EntityRef["type"],
            id: item.id,
            name: item[config.labelKey] || item.name || item.title || "Unknown",
            pillarSlug: config.pillarSlug,
            moduleSlug: config.moduleSlug,
          }));
      } catch {
        return [];
      }
    },
    []
  );

  const search = useCallback(
    async (query: string) => {
      // Cancel previous search
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const signal = controller.signal;

      setSearchTerm(query);

      if (!query || query.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      const entityTypes = Object.keys(ENTITY_MODULES);
      const allResults = await Promise.all(
        entityTypes.map((type) => searchModule(type, query, signal))
      );

      if (!signal.aborted) {
        setResults(allResults.flat().slice(0, 50));
        setIsSearching(false);
      }
    },
    [searchModule]
  );

  const resolveEntity = useCallback(
    async (
      type: string,
      id: string
    ): Promise<EntityRef | null> => {
      if (!type || !id) return null;
      const config = ENTITY_MODULES[type];
      if (!config) return null;

      try {
        const res = await fetch(
          `${API_BASE}/${config.pillarSlug}/${config.moduleSlug}/${id}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        if (!res.ok) return null;
        const json = await res.json();
        const item = json.data || json;
        return {
          type: type as EntityRef["type"],
          id: item.id,
          name: item[config.labelKey] || item.name || item.title || "Unknown",
          pillarSlug: config.pillarSlug,
          moduleSlug: config.moduleSlug,
        };
      } catch {
        return null;
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    setResults([]);
    setSearchTerm("");
    setIsSearching(false);
  }, []);

  return {
    results,
    isSearching,
    searchTerm,
    search,
    clearSearch,
    resolveEntity,
    entityTypes: Object.keys(ENTITY_MODULES),
  };
}
