const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'DocumentManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');
let changes = 0;

const pdfBtn = (id) => `                <button
                  onClick={() => generatePdf(${id})}
                  disabled={generatingPdfId === ${id}.id}
                  className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                  title="Generate PDF Report"
                >
                  {generatingPdfId === ${id}.id ? (
                    <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileDown size={13} />
                  )}
                </button>`;

// 1. Version Control - add PDF after View
let old1 = `                                <button onClick={() => handleOpenModal("view", v)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                              </div></td>`;
let new1 = `                                <button onClick={() => handleOpenModal("view", v)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                ${pdfBtn('v').trim()}
                              </div></td>`;

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  changes++;
  console.log('1. Version Control - PDF button added');
}

// 2. OCR - add PDF after View
let old2 = `                                <button onClick={() => handleOpenModal("view", o)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                </div></td>`;
let new2 = `                                <button onClick={() => handleOpenModal("view", o)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                ${pdfBtn('o').trim()}
                                </div></td>`;

if (content.includes(old2)) {
  content = content.replace(old2, new2);
  changes++;
  console.log('2. OCR - PDF button added');
}

// 3. AI Search - add PDF after View
let old3 = `                                <button onClick={() => handleOpenModal("view", a)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                              </div></td>`;
let new3 = `                                <button onClick={() => handleOpenModal("view", a)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                ${pdfBtn('a').trim()}
                              </div></td>`;

if (content.includes(old3)) {
  content = content.replace(old3, new3);
  changes++;
  console.log('3. AI Search - PDF button added');
}

// 4. Signatures - add PDF after View
let old4 = `                                <button onClick={() => handleOpenModal("view", s)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                <button onClick={() => handleOpenModal("edit", s)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                                <button onClick={() => setConfirmDeleteId(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>`;
let new4 = `                                <button onClick={() => handleOpenModal("view", s)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                <button onClick={() => handleOpenModal("edit", s)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                                ${pdfBtn('s').trim()}
                                <button onClick={() => setConfirmDeleteId(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>`;

if (content.includes(old4)) {
  content = content.replace(old4, new4);
  changes++;
  console.log('4. Signatures - PDF button added');
}

// 5. Templates - add PDF after View
let old5 = `                                <button onClick={() => handleOpenModal("view", t)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                <button onClick={() => handleOpenModal("edit", t)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                                <button onClick={() => setConfirmDeleteId(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>`;
let new5 = `                                <button onClick={() => handleOpenModal("view", t)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                <button onClick={() => handleOpenModal("edit", t)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                                ${pdfBtn('t').trim()}
                                <button onClick={() => setConfirmDeleteId(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>`;

if (content.includes(old5)) {
  content = content.replace(old5, new5);
  changes++;
  console.log('5. Templates - PDF button added');
}

if (changes > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\nSUCCESS: ${changes} PDF buttons added.`);
} else {
  console.log('\nFAILED: No matches found. No changes made.');
  process.exit(1);
}
