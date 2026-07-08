const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'apps', 'web', 'src', 'app');
const dirs = fs.readdirSync(appDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'dashboard' && d.name !== 'login')
  .map(d => d.name);

for (const dir of dirs) {
  const pagePath = path.join(appDir, dir, 'page.tsx');
  if (!fs.existsSync(pagePath)) continue;

  let content = fs.readFileSync(pagePath, 'utf8');
  let changed = false;

  // 1. Fix setInvoices / setMeta data unwrapping
  const setters = [
    { name: 'setInvoices', url: '/invoices' },
    { name: 'setProducts', url: '/products' },
    { name: 'setContacts', url: '/contacts' },
    { name: 'setCompanies', url: '/companies' },
    { name: 'setLeads', url: '/leads' },
    { name: 'setOpportunities', url: '/opportunities' },
    { name: 'setQuotes', url: '/quotes' },
    { name: 'setActivities', url: '/activities' },
    { name: 'setTasks', url: '/tasks' }
  ];

  for (const setter of setters) {
    // Look for: setX(data.data.data); setMeta(data.data.meta);
    const regex1 = new RegExp(`${setter.name}\\(data\\.data\\.data\\);`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `${setter.name}(data?.data ?? data?.data?.data ?? []);`);
      changed = true;
    }
    const regex2 = new RegExp(`setMeta\\(data\\.data\\.meta\\);`, 'g');
    if (regex2.test(content)) {
      content = content.replace(regex2, `setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });`);
      changed = true;
    }
  }

  // 2. Fix meta.total
  if (content.includes('meta.total / meta.limit')) {
    content = content.replace(/meta\.total \/ meta\.limit/g, '(meta?.total || 0) / (meta?.limit || 10)');
    changed = true;
  }
  if (content.includes('page * meta.limit, meta.total')) {
    content = content.replace(/page \* meta\.limit, meta\.total/g, 'page * (meta?.limit || 10), meta?.total || 0');
    changed = true;
  }
  if (content.includes('* meta.limit + 1')) {
    content = content.replace(/\* meta\.limit \+ 1/g, '* (meta?.limit || 10) + 1');
    changed = true;
  }
  if (content.includes('de {meta.total}')) {
    content = content.replace(/de \{meta\.total\}/g, 'de {meta?.total || 0}');
    changed = true;
  }

  // 3. Add Volver al inicio
  const headerRegex = /<div className="flex items-center justify-between">\s*<h1 className="text-3xl font-bold tracking-tight">([^<]+)<\/h1>/;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, (match, title) => {
      return `<div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">${title}</h1>
        </div>`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`Patched ${dir}/page.tsx`);
  }
}
console.log('Done!');
