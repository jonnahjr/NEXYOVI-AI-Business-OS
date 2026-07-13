"use client";

import { useCallback, useState } from "react";

export interface CrudState {
  modalOpen: boolean;
  modalMode: "create" | "edit" | "view";
  activeRow: any | null;
  formData: any;
  formErrors: Record<string, string>;
  isSaving: boolean;
  confirmDeleteId: string | null;
  generatingPdfId: string | null;
}

export function useDocumentCrud(
  getApiUrl: (slug: string) => string,
  loadData: () => Promise<void>,
  onToast: (message: string, type: "success" | "error" | "info") => void
) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const validateForm = useCallback(
    (fields: { key: string; required?: boolean; label: string }[], data: any) => {
      const errors: Record<string, string> = {};
      for (const field of fields) {
        if (field.required) {
          const val = data[field.key];
          if (
            val === undefined ||
            val === null ||
            val === "" ||
            val === 0
          ) {
            errors[field.key] = `${field.label} is required`;
          }
        }
      }
      return errors;
    },
    []
  );

  const handleOpenModal = useCallback(
    (
      mode: "create" | "edit" | "view",
      row: any = null,
      fields: { key: string; type?: string; label: string }[],
      activeTab: string,
      initialOverrides?: Record<string, any>
    ) => {
      setModalMode(mode);
      setActiveRow(row);
      setFormErrors({});
      if (mode === "create") {
        const initial: any = {};
        fields.forEach((f) => {
          initial[f.key] = f.type === "number" ? 0 : "";
        });
        if (initialOverrides) {
          Object.assign(initial, initialOverrides);
        }
        setFormData(initial);
      } else {
        const editData = { ...(row || {}) };
        if (!editData.title && editData.name) editData.title = editData.name;
        if (!editData.requestName && editData.name)
          editData.requestName = editData.name;
        setFormData(editData);
      }
      setModalOpen(true);
    },
    []
  );

  const handleSave = useCallback(
    async (
      e: React.FormEvent,
      fields: { key: string; required?: boolean; label: string }[],
      apiSlug: string,
      pillarSlug: string
    ) => {
      e.preventDefault();
      const errors = validateForm(fields, formData);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        onToast("Please fix the highlighted errors before saving", "error");
        return;
      }
      setIsSaving(true);
      try {
        const token = localStorage.getItem("token") || "";
        const url =
          modalMode === "edit"
            ? `${getApiUrl(apiSlug)}/${activeRow?.id}`
            : getApiUrl(apiSlug);
        const method = modalMode === "edit" ? "PUT" : "POST";
        const { id, createdAt, updatedAt, ...cleanData } = formData;
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cleanData),
        });
        if (res.ok) {
          setModalOpen(false);
          loadData();
          onToast("Record saved successfully", "success");
        } else {
          const err = await res.json().catch(() => ({}));
          onToast(err?.message || "Failed to save", "error");
        }
      } catch {
        onToast("Error saving record", "error");
      } finally {
        setIsSaving(false);
      }
    },
    [validateForm, formData, modalMode, activeRow, getApiUrl, loadData, onToast]
  );

  const confirmDeleteAction = useCallback(
    async (apiSlug: string) => {
      if (!confirmDeleteId) return;
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `${getApiUrl(apiSlug)}/${confirmDeleteId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          loadData();
          onToast("Record deleted", "success");
        } else {
          onToast("Failed to delete", "error");
        }
      } catch {
        onToast("Error deleting record", "error");
      } finally {
        setConfirmDeleteId(null);
      }
    },
    [confirmDeleteId, getApiUrl, loadData, onToast]
  );

  return {
    modalOpen,
    setModalOpen,
    modalMode,
    activeRow,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isSaving,
    confirmDeleteId,
    setConfirmDeleteId,
    generatingPdfId,
    setGeneratingPdfId,
    handleOpenModal,
    handleSave,
    confirmDeleteAction,
  };
}
