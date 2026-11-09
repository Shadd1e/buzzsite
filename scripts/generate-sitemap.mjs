import { writeFile } from 'node:fs/promises';

const origin = process.env.BUZZ_SITE_URL;
if (!origin) {
  console.error('Set BUZZ_SITE_URL to the approved canonical website origin, e.g. https://www.example.com');
  process.exit(1);
}
const base = new URL(origin).origin;
const routes = [
  '/', '/app', '/buzz-pro', '/marketplace', '/payments', '/safety', '/about', '/careers', '/contact', '/waitlist',
  '/logistics', '/logistics/how-it-works', '/track-my-package', '/logistics/coverage', '/logistics/partners',
  '/logistics/partners/apply', '/logistics/partner-login', '/logistics/partner-dashboard', '/help', '/privacy-policy',
  '/terms', '/community-guidelines', '/safety-guidelines', '/marketplace-terms', '/logistics-terms', '/payment-terms', '/cookie-policy'
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${base}${route}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('../sitemap.xml', import.meta.url), xml);
await writeFile(new URL('../robots.txt', import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log(`Wrote sitemap.xml and robots.txt for ${routes.length} routes at ${base}`);
