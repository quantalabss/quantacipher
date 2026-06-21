const fs = require('fs');

const files = [
  "e:/temp/quantacipher/quantacipher-web/src/app/support/page.tsx",
  "e:/temp/quantacipher/quantacipher-web/src/app/privacy/page.tsx",
  "e:/temp/quantacipher/quantacipher-web/src/app/terms/page.tsx",
  "e:/temp/quantacipher/quantacipher-web/src/app/security/page.tsx",
  "e:/temp/quantacipher/quantacipher-web/src/app/pricing/page.tsx"
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  
  // First, we remove any erroneously injected styles that were placed by the fuzzy matcher.
  c = c.replace(/style=\{\{\s+backgroundImage: \`url\("data:image\/svg\+xml,[^"]+"\)\`,\s+backgroundRepeat: 'repeat',\s+backgroundSize: '120px 120px'\s+\}\}/g, "");
  
  // Now we fix the actual bad noise overlay syntax at the bottom of the files.
  // We look for the exact bad string:
  let bad = "backgroundImage: \\url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")\\,";
  
  let good = "backgroundImage: `url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")`,";
  
  c = c.replace(bad, good);
  
  fs.writeFileSync(file, c);
}
