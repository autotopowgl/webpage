import { z } from 'astro/zod';
import raw from '../data/autotopo.json';

const texto = z.string().min(1);
const item = z.object({ titulo: texto, texto: texto });

const Esquema = z.object({
  marca: z.object({ nombre: texto, dominio: z.string().url(), lema: texto, descripcion: texto }),
  cifras: z.object({
    precision: z.literal('8 mm', { errorMap: () => ({ message: 'La precisión canónica es "8 mm" (nunca 3 mm).' }) }),
    precisionDetalle: texto.refine((s) => s.includes('8 mm') && !/\b3\s*(-|–)?\s*\d*\s*mm/.test(s), 'Debe decir 8 mm'),
    puntosDia: z.literal('1.000+'),
    puntosDiaDetalle: texto,
    capex: z.literal('0%'),
    capexDetalle: texto,
    puntosPor100MW: z.literal('50.000+'),
    cuadrilla: z.literal('6 a 9'),
    supervision: texto,
    proteccion: texto,
  }),
  contacto: z.object({
    whatsapp: z.string().regex(/^(\d{8,15}|PENDIENTE_WHATSAPP_COMERCIAL)$/, 'WhatsApp: solo dígitos con código de país (ej. 569XXXXXXXX)'),
    correo: z.string().email(),
    mensajePiloto: texto,
    asuntoCorreo: texto,
  }),
  hero: z.object({ titulo: texto, bajada: texto, cta: texto }),
  problema: z.object({
    titulo: texto,
    bajada: texto,
    items: z.array(z.object({ cifra: texto, texto: texto })).length(3),
  }),
  pasos: z.array(item).length(3),
  comparacion: z.object({
    titulo: texto,
    filas: z.array(z.object({ criterio: texto, manual: texto, autotopo: texto })).min(3),
  }),
  tecnologia: z.object({ titulo: texto, bajada: texto, items: z.array(item).min(3) }),
  impacto: z.object({
    titulo: texto,
    bajada: texto,
    ods: z.array(z.object({ numero: z.number().int().min(1).max(17), nombre: texto })).min(1),
  }),
  equipo: z.object({
    titulo: texto,
    bajada: texto,
    personas: z.array(z.object({ nombre: texto, rol: texto, iniciales: texto })).length(3),
  }),
  videos: z.object({ demo: z.string().url().or(z.literal('')) }),
  media: z.object({ hero: z.string(), tecnologia: z.string() }),
});

export type Contenido = z.infer<typeof Esquema>;

const resultado = Esquema.safeParse(raw);
if (!resultado.success) {
  const detalle = resultado.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`autotopo.json no es válido:\n${detalle}`);
}

// Ninguna cifra o texto del sitio puede hablar de 3 mm.
const plano = JSON.stringify(raw);
if (/\b3\s*(-|–|a)?\s*\d*\s*mm\b/.test(plano)) {
  const m = plano.match(/[^"]{0,30}\b3\s*(-|–|a)?\s*\d*\s*mm\b[^"]{0,30}/);
  throw new Error(`autotopo.json menciona una precisión distinta de 8 mm: "${m?.[0]}"`);
}

export const contenido: Contenido = resultado.data;
