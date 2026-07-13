"use client";

import { useState, useCallback, useRef } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useDocumentUpload(
  getApiUrl: (slug: string) => string,
  loadData: () => Promise<void>,
  onToast: (message: string, type: "success" | "error" | "info") => void
) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("General");
  const [uploadTags, setUploadTags] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileSizeTooLarge = uploadFile ? uploadFile.size > MAX_FILE_SIZE : false;
  const fileSizePercent = uploadFile
    ? Math.min(100, Math.round((uploadFile.size / MAX_FILE_SIZE) * 100))
    : 0;

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  }, []);

  const resetUpload = useCallback(() => {
    setUploadFile(null);
    setUploadProgress(0);
    setUploadCategory("General");
    setUploadTags("");
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadFile) {
        onToast("Please select a file to upload", "error");
        return;
      }
      setIsUploading(true);
      setUploadProgress(10);
      try {
        const token = localStorage.getItem("token") || "";

        const formData = new FormData();
        formData.append("file", uploadFile);

        setUploadProgress(30);
        const uploadRes = await fetch(
          "http://localhost:3002/api/v1/uploads/file",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData?.message || "Upload failed");
        }

        setUploadProgress(60);
        const uploadData = await uploadRes.json();

        const sizeMB = (uploadFile.size / (1024 * 1024)).toFixed(1);
        const sizeStr =
          parseFloat(sizeMB) >= 1
            ? `${sizeMB} MB`
            : `${Math.round(uploadFile.size / 1024)} KB`;
        const fileExt =
          uploadFile.name.split(".").pop()?.toUpperCase() || "OTHER";
        const typeMap: Record<string, string> = {
          PDF: "PDF",
          DOC: "DOCX",
          DOCX: "DOCX",
          XLS: "XLSX",
          XLSX: "XLSX",
          PPT: "PPTX",
          PPTX: "PPTX",
          PNG: "Image",
          JPG: "Image",
          JPEG: "Image",
          GIF: "Image",
          SVG: "Image",
          WEBP: "Image",
          MP4: "Video",
          AVI: "Video",
          MOV: "Video",
          MP3: "Audio",
          WAV: "Audio",
          ZIP: "Archive",
          RAR: "Archive",
          GZ: "Archive",
        };
        const fileType = typeMap[fileExt] || "Other";

        const docPayload = {
          name: uploadFile.name.replace(
            `.${uploadFile.name.split(".").pop()}`,
            ""
          ),
          title: uploadFile.name.replace(
            `.${uploadFile.name.split(".").pop()}`,
            ""
          ),
          fileType,
          type: fileType,
          size: sizeStr,
          url: uploadData.url,
          category: uploadCategory,
          tags: uploadTags,
          status: "Final",
          owner: "Current User",
          modified: new Date().toISOString().split("T")[0],
        };

        setUploadProgress(80);
        const saveRes = await fetch(getApiUrl("file-storage"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(docPayload),
        });

        if (!saveRes.ok) {
          console.warn(
            "File uploaded but metadata save failed (API may not support it)"
          );
        }

        setUploadProgress(100);
        setTimeout(() => {
          setUploadModalOpen(false);
          resetUpload();
          loadData();
          onToast("File uploaded successfully!", "success");
        }, 400);
      } catch (err: any) {
        console.error("Upload error:", err);
        onToast(err?.message || "Failed to upload file", "error");
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
    },
    [
      uploadFile,
      uploadCategory,
      uploadTags,
      getApiUrl,
      loadData,
      onToast,
      resetUpload,
    ]
  );

  return {
    uploadModalOpen,
    setUploadModalOpen,
    uploadFile,
    setUploadFile,
    uploadProgress,
    isUploading,
    uploadCategory,
    setUploadCategory,
    uploadTags,
    setUploadTags,
    fileInputRef,
    fileSizeTooLarge,
    fileSizePercent,
    formatFileSize,
    handleFileUpload,
  };
}
