import React, { useRef, useState } from "react";
import { Upload, X, FileText, Image, CheckCircle, Loader2 } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  value?: string;          // current URL stored
  onChange: (url: string, name: string) => void;
  required?: boolean;
  accept?: string;
}

export default function FileUploadField({ label, value, onChange, required, accept }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setFileName(file.name);

    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3002/api/v1/uploads/file", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url, file.name);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setFileName("");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    onChange("", "");
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isImage = value?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <div>
      <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-[#F9A230]">*</span>}
      </label>

      {value ? (
        <div className="flex items-center gap-3 border border-black/20 rounded-md px-4 py-3 bg-black/[0.02] group">
          <CheckCircle size={16} className="text-black shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-black truncate">{fileName || "File uploaded"}</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-black/50 hover:text-black underline transition truncate block">
              View file ↗
            </a>
          </div>
          <button onClick={handleClear} className="p-1 text-black/30 hover:text-black transition opacity-0 group-hover:opacity-100 shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border border-dashed border-black/30 rounded-md px-4 py-4 flex flex-col items-center gap-2 hover:border-black hover:bg-black/[0.02] transition disabled:opacity-50 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin text-black" />
              <span className="text-xs font-semibold text-black/50">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={18} className="text-black" />
              <span className="text-xs font-semibold text-black/60">Click to upload</span>
              <span className="text-[10px] text-black/40">PDF, JPG, PNG, DOCX — max 10MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept || ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
