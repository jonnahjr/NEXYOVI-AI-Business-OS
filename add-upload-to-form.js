const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'frontend/src/components/document/DocumentManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const searchFor = `{renderModalFormFields()}
              </div>
              {modalMode !== "view" && (`;

const uploadZone = `{renderModalFormFields()}

                {activeTab === "storage" && modalMode !== "view" && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Upload File</label>
                    <div
                      onClick={() => { if (formUploading) return; formUploadInputRef.current?.click(); }}
                      className={\`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all \${
                        formUploadFile ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 hover:border-primary/40 hover:bg-slate-50/50"
                      }\`}
                    >
                      {formUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-slate-500">Uploading... {formUploadProgress}%</span>
                          {formUploadProgress > 0 && (
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: \`\${formUploadProgress}%\` }} />
                            </div>
                          )}
                        </div>
                      ) : formUploadFile ? (
                        <div className="flex items-center gap-2 justify-center">
                          <FileType size={16} className="text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-700 truncate max-w-[200px]">{formUploadFile.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFormUploadFile(null); setFormData((prev) => ({ ...prev, fileUrl: undefined, fileType: "", size: 0 })); }}
                            className="ml-1 text-slate-400 hover:text-red-500"
                          ><X size={12} /></button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={20} className="text-slate-300" />
                          <p className="text-xs text-slate-500">Click to select a file</p>
                          <p className="text-[10px] text-slate-400">PDF, DOCX, Images &mdash; Max 10MB</p>
                        </div>
                      )}
                      <input ref={formUploadInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFormUpload(f); if (e.target) e.target.value = ""; }} />
                    </div>
                    {formData.fileUrl && !formUploadFile && !formUploading && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle size={11} />
                        <span className="truncate">File uploaded: {String(formData.fileUrl).slice(0, 40)}...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {modalMode !== "view" && (`;

if (content.includes(searchFor)) {
  content = content.replace(searchFor, uploadZone);
  console.log("✅ Upload zone added successfully");
} else {
  console.log("❌ Could not find exact match. Trying fuzzy search...");
  const idx = content.indexOf('renderModalFormFields()');
  if (idx >= 0) {
    const snippet = content.substring(idx, idx + 150);
    console.log("Found at index:", idx);
    console.log("Snippet:", JSON.stringify(snippet));
  }
  process.exit(1);
}

// Add reset to modal close paths
content = content.replace(
  `setModalOpen(false); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600"><X size={18}`,
  `setModalOpen(false); setFormErrors({}); setFormUploadFile(null); setFormUploading(false); setFormUploadProgress(0); }} className="text-slate-400 hover:text-slate-600"><X size={18}`
);

content = content.replace(
  `setModalOpen(false); setFormErrors({}); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel`,
  `setModalOpen(false); setFormErrors({}); setFormUploadFile(null); setFormUploading(false); setFormUploadProgress(0); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("✅ File saved successfully");
