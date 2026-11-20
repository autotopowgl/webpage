#!/usr/bin/env node
// Revisa el sitio construido (dist/) y falla si encuentra contenido prohibido
// según specs/contenido-publico: datos personales, márgenes internos,
// precisiones distintas de 8 mm o el marcador de WhatsApp sin configurar.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = process.argv[2] ?? 'dist';
const aqui = dirname(fileURLToPath(import.meta.url));
const { literales } = JSON.parse(readFileSync(join(aqui, 'prohibidos.json'), 'utf8'));

const reglas = [
  { nombre: 'RUT chileno', re: /\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/ },
  { nombre: 'Precisión distinta de 8 mm (3 mm / 3-8 mm)', re: /\b3\s*(?:-|–|a)?\s*\d*\s*mm\b/i },
  { nombre: 'Margen interno', re: /\bm[aá]rgen(?:es)?\b/i, soloTexto: true },
  { nombre: 'Porcentaje 80%', re: /\b80\s*%/, soloTexto: true },
  { nombre: 'WhatsApp comercial sin configurar', re: /PENDIENTE_WHATSAPP_COMERCIAL/ },
  ...literales.map((l) => ({ nombre: `Dato personal (${l.slice(0, 3)}…)`, re: new RegExp(l.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'i') })),
];

// Las reglas soloTexto no se aplican a CSS/JS (ej. gradientes con 80%).
const deTexto = new Set(['.html', '.xml', '.txt', '.json', '.svg']);
const extensiones = new Set(['.html', '.xml', '.txt', '.json', '.js', '.css', '.svg']);
function archivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : extensiones.has(extname(p)) ? [p] : [];
  });
}

let errores = 0;
for (const f of archivos(raiz)) {
  // Se descartan bloques <style> en línea: su CSS no es contenido publicado.
  const crudo = readFileSync(f, 'utf8').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  let decodificado = crudo;
  try { decodificado = decodeURIComponent(crudo.replace(/\+/g, ' ')); } catch { /* texto con % sueltos */ }
  const texto = crudo + '\n' + decodificado
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  for (const r of reglas) {
    if (r.soloTexto && !deTexto.has(extname(f))) continue;
    const m = texto.match(r.re);
    if (m) {
      errores++;
      console.error(`✗ ${f}: ${r.nombre} → "${m[0]}"`);
    }
  }
}

if (errores) {
  console.error(`\ncheck-contenido: ${errores} problema(s). No publicar.`);
  process.exit(1);
}
console.log(`✓ check-contenido: sin contenido prohibido en ${raiz}/`);
