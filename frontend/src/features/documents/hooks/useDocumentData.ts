"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3002/api/v1/modules";

export function useDocumentData(pillarSlug: string) {
  const [storageData, setStorageData] = useState<any[]>([]);
  const [versionsData, setVersionsData] = useState<any[]>([]);
  const [ocrData, setOcrData] = useState<any[]>([]);
  const [aiSearchData, setAiSearchData] = useState<any[]>([]);
  const [signaturesData, setSignaturesData] = useState<any[]>([]);
  const [templatesData, setTemplatesData] = useState<any[]>([]);
  const [pdfData, setPdfData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getApiUrl = useCallback(
    (tabSlug: string) => `${API_BASE}/${pillarSlug}/${tabSlug}`,
    [pillarSlug]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [sRes, vRes, oRes, aRes, sigRes, tRes, pRes] =
        await Promise.allSettled([
          fetch(getApiUrl("file-storage"), { headers }).then((r) => r.json()),
          fetch(getApiUrl("version-control"), { headers }).then((r) =>
            r.json()
          ),
          fetch(getApiUrl("ocr"), { headers }).then((r) => r.json()),
          fetch(getApiUrl("ai-document-search"), { headers }).then((r) =>
            r.json()
          ),
          fetch(getApiUrl("digital-signatures"), { headers }).then((r) =>
            r.json()
          ),
          fetch(getApiUrl("templates"), { headers }).then((r) => r.json()),
          fetch(getApiUrl("pdf-generation"), { headers }).then((r) => r.json()),
        ]);

      const extract = (res: PromiseSettledResult<any>) =>
        res.status === "fulfilled" && res.value?.data ? res.value.data : [];

      setStorageData(extract(sRes));
      setVersionsData(extract(vRes));
      setOcrData(extract(oRes));
      setAiSearchData(extract(aRes));
      setSignaturesData(extract(sigRes));
      setTemplatesData(extract(tRes));
      setPdfData(extract(pRes));
    } catch (err) {
      console.error("Error loading document data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    storageData,
    versionsData,
    ocrData,
    aiSearchData,
    signaturesData,
    templatesData,
    pdfData,
    isLoading,
    setStorageData,
    setVersionsData,
    setOcrData,
    setAiSearchData,
    setSignaturesData,
    setTemplatesData,
    setPdfData,
    loadData,
    getApiUrl,
  };
}
