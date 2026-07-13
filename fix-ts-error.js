const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'frontend/src/components/document/DocumentManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: The setFormData((prev) => pattern in the upload zone (line ~2225)
content = content.replace(
  'setFormUploadFile(null); setFormData((prev) => ({ ...prev, fileUrl: undefined, fileType: "", size: 0 }));',
  'setFormUploadFile(null); setFormData((prev: any) => ({ ...prev, fileUrl: undefined, fileType: "", size: 0 }));'
);

// Fix 2: The handleFormUpload function may also use setFormData((prev) => ...)
content = content.replace(
  "setFormData((prev) => ({\n        ...prev,\n        fileUrl: data.url,\n        fileType,\n        size: file.size,\n        status: prev.status || \"Final\",\n        title: prev.title || file.name.replace(`.${file.name.split(\".\").pop()}`, \"\"),\n      }));",
  "setFormData((prev: any) => ({\n        ...prev,\n        fileUrl: data.url,\n        fileType,\n        size: file.size,\n        status: prev.status || \"Final\",\n        title: prev.title || file.name.replace(`.${file.name.split(\".\").pop()}`, \"\"),\n      }));"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("✅ TS fix applied");
