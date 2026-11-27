import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_FILES = [
  'index.html',
  'public/manifest.json',
  'public/favicon.svg',
  ...fs.readdirSync(path.join(ROOT, 'src')).filter((f) => f.endsWith('.js')).map((f) => path.join('src', f)),
  ...fs.readdirSync(path.join(ROOT, 'js')).map((f) => path.join('js', f))
];

const FORBIDDEN_PATTERNS = [
  /data:image\/(png|jpeg|jpg|webp);base64/i,
  /Gimnasia\s+y\s+Esgrima/i,
  /Gimnasia\s*\(J\)/i,
  /23\s+de\s+Agosto/i,
  /\bGYEJ\b/,
  /LOS\s+CACHORROS/i,
  /fixture\s+oficial\s+AFA/i,
  /Primera\s+Nacional/i,
  /Deportivo\s+Madryn/i,
  /San\s+Mart[ií]n\s*\(T\)/i,
  /Ferro\s+Carril\s+Oeste/i,
  /Hern[áa]n\s+Pellerano/i,
  /Milton\s+[ÁA]lvarez/i,
  /O\.\s*Bianchi/i,
  /D\.\s*Minervino/i,
  /L\.\s*Marinucci/i
];

let errors = 0;

// 1. Check .vercelignore excludes legacy HTML
const vercelIgnore = fs.readFileSync(path.join(ROOT, '.vercelignore'), 'utf8');
if (!vercelIgnore.includes('estadio_23_de_agosto_simulador_3d_de_ubicaciones_y_partido_en_vivo_gimnasia_y_esgrima_de_jujuy.html')) {
  console.error('FAIL: .vercelignore must exclude legacy HTML with base64 images.');
  errors++;
}

// 2. Scan active public files
for (const rel of PUBLIC_FILES) {
  const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  for (const rx of FORBIDDEN_PATTERNS) {
    if (rx.test(content)) {
      console.error(`FAIL [${rel}]: Matched forbidden pattern ${rx}`);
      errors++;
    }
  }
}

if (errors > 0) {
  process.exit(1);
}
console.log(`COMPLIANCE PASS: ${PUBLIC_FILES.length} public files verified clean for Escenario A (independent).`);
