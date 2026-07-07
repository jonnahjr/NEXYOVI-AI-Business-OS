const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
}

replaceFile('src/app/dashboard/page.tsx', (c) => {
  return c.replace(/k\.positive \? "[^"]+" : "[^"]+"/g, '"bg-slate-100 text-slate-900"');
});

replaceFile('src/app/dashboard/[pillarSlug]/page.tsx', (c) => {
  return c.replace(/kpi\.positive \? "[^"]+" : "[^"]+"/g, '"bg-slate-100 text-slate-900"');
});

replaceFile('src/lib/pillar-config.ts', (c) => {
  let res = c.replace(/color:\s*"from-[^"]+"/g, 'color: "from-slate-900 to-black"');
  res = res.replace(/color:\s*"bg-[^"]+"/g, 'color: "bg-slate-100 text-slate-900"');
  return res;
});

replaceFile('src/app/dashboard/[pillarSlug]/[moduleSlug]/page.tsx', (c) => {
  let res = c.replace(/"bg-[a-z]+-\d+\s+text-[a-z]+-\d+"/g, '"bg-slate-100 text-slate-900"');
  return res;
});

console.log('Colors removed successfully!');
