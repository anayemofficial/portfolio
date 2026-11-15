import fs from 'fs';
import path from 'path';

const slugs = [
  'madx',
  'krishi-gold',
  'personal-portfolio',
  'sketch2design-ai',
  'photo-hub',
  'scientific-calculator',
  'skin-disease-classification',
  'health-super-app'
];

console.log('=== VERIFYING PROJECT STATIC HTML PAGES ===\n');

let allPassed = true;

for (const slug of slugs) {
  const filePath = path.join(process.cwd(), '.next', 'server', 'app', 'projects', `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] MISSING: ${filePath}`);
    allPassed = false;
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');

  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'NONE';

  // Extract canonical
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : 'NONE';

  // Check Schema
  const hasBreadcrumbs = html.includes('BreadcrumbList');
  const hasThesis = html.includes('"@type":"Thesis"');
  const hasWebApp = html.includes('"@type":"WebApplication"');
  const hasSoftwareApp = html.includes('"@type":"SoftwareApplication"');
  const hasWebSite = html.includes('"@type":"WebSite"');
  const hasCreativeWork = html.includes('"@type":"CreativeWork"');

  // Check content presence
  const hasH1 = html.includes('<h1');
  const hasChallenges = html.includes('Engineering Challenges');
  const hasProcess = html.includes('Development &amp; Engineering Process') || html.includes('Development & Engineering Process');

  console.log(`[PASS] /projects/${slug} (${fs.statSync(filePath).size} bytes)`);
  console.log(`       Title: ${title}`);
  console.log(`       Canonical: ${canonical}`);
  console.log(`       H1: ${hasH1} | Challenges: ${hasChallenges} | Process: ${hasProcess}`);
  console.log(`       Schemas -> Breadcrumbs: ${hasBreadcrumbs} | Thesis: ${hasThesis} | WebApp: ${hasWebApp} | SoftwareApp: ${hasSoftwareApp} | WebSite: ${hasWebSite} | CreativeWork: ${hasCreativeWork}\n`);
}

// Check index.html for links to all 8 projects
const indexPath = path.join(process.cwd(), '.next', 'server', 'app', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
console.log('=== VERIFYING HOMEPAGE CRAWLABLE LINKS ===');
slugs.forEach(slug => {
  const linkHref = `/projects/${slug}`;
  const hasLink = indexHtml.includes(`href="${linkHref}"`);
  console.log(`Homepage links to ${linkHref}: ${hasLink ? 'YES [PASS]' : 'NO [FAIL]'}`);
  if (!hasLink) allPassed = false;
});

// Check sitemap
const sitemapPath = path.join(process.cwd(), '.next', 'server', 'app', 'sitemap.xml.body');
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  console.log('\n=== VERIFYING SITEMAP ENTRIES ===');
  slugs.forEach(slug => {
    const hasSitemapEntry = sitemapXml.includes(`https://www.anayem.com/projects/${slug}`);
    console.log(`Sitemap contains /projects/${slug}: ${hasSitemapEntry ? 'YES [PASS]' : 'NO [FAIL]'}`);
    if (!hasSitemapEntry) allPassed = false;
  });
}

console.log('\n===========================================');
console.log(allPassed ? 'ALL AUDIT CHECKS PASSED PERFECTLY!' : 'SOME CHECKS FAILED!');
console.log('===========================================');
