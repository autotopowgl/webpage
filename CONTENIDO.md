# Sitio AutoTopo: guía de contenido

Todo el texto y todas las cifras del sitio están en **un solo archivo**: `src/data/autotopo.json`.
Las páginas (`/` y `/ignite/`) no tienen texto escrito a mano. Para cambiar una cifra o una frase, se edita el JSON y se vuelve a construir.

## Flujo de edición

```bash
cd web
npm install          # solo la primera vez
npm run dev          # vista previa en http://localhost:4321 mientras editas
npm run build        # construye dist/ y valida el JSON (falla si falta algo o si la precisión no es "8 mm")
npm run check        # revisa dist/ y bloquea datos personales, márgenes, "3 mm" o el WhatsApp sin configurar
npm test             # pruebas en celular (375x667) y escritorio (1440x900)
```

**No publicar si `npm run build`, `npm run check` o `npm test` fallan.**

## Qué campo controla qué

| Campo del JSON | Dónde aparece |
|---|---|
| `cifras.*` | Hero, comparación, tecnología, `/ignite`. **Precisión siempre "8 mm".** |
| `contacto.whatsapp` | Todos los botones de WhatsApp. Solo dígitos con código de país, sin `+` (ej. `569XXXXXXXX`). Mientras diga `PENDIENTE_WHATSAPP_COMERCIAL`, `npm run check` impide publicar. |
| `contacto.correo` | Enlaces de correo (`mailto:`). |
| `contacto.mensajePiloto` / `mensajeIgnite` | Mensaje precargado de WhatsApp desde la home y desde `/ignite`. |
| `hero`, `problema`, `pasos`, `comparacion`, `tecnologia`, `impacto`, `equipo` | Secciones de la home. |
| `ignite.*` | Página `/ignite`. |
| `videos.pitch` / `videos.mvp` | URL pública de YouTube. Vacío = aviso "Video próximamente". |
| `media.hero` / `media.tecnologia` | Ruta de una foto real (dentro de `public/`, ej. `/img/rover.jpg`) o una URL de YouTube. Vacío = esquema ilustrado. |

## Qué NO se publica nunca

Lo exige `specs/contenido-publico` y lo bloquea `npm run check`:

- Datos personales de los fundadores: RUT, cédula, fecha de nacimiento, dirección, teléfono o correo personal.
- Distribución accionaria, pactos de socios, márgenes internos, deudas, valorización o financiamiento previo.
- Detalles internos de la electrónica, sensores o mecanismos antes de presentar la solicitud ante INAPI.
- Fotos de stock presentadas como si fueran el rover.

Los datos personales concretos que se bloquean están en `scripts/prohibidos.json`. Ese archivo no forma parte del sitio publicado.

## Inconsistencias del formulario CORFO que hay que corregir en Charly.io

La web usa los valores canónicos. Estas respuestas del formulario (Start-Up Chile BIG13, ID 1123486) contradicen la web o se contradicen entre sí y conviene corregirlas antes de enviar:

| # | Sección / pregunta | Problema | Corrección sugerida |
|---|---|---|---|
| 1 | *Start-Up Chile Program*, Q4 "main activities", ítem "Pilotos en Terreno" | Dice "validar precisión de **3-8 mm**". | "validar precisión de **8 mm**". |
| 2 | *Market and Business*, Q15 vs Q16 | Q15 nombra Brasil, Guatemala y Costa Rica. Q16 (GTM) dice "Año 3 (Brasil/**México**)". | Usar los mismos países en ambas respuestas. |
| 3 | *Project Information*, Q3 "Main objective" | "Escalar nuestro prototipo **hacia un Producto Mínimo Viable (MVP)**" choca con declarar que ya existe un MVP (*Startup Description*, Q19), que Ignite exige. | "Industrializar nuestro MVP funcional (TRL 6) hacia una unidad robusta…". |
| 4 | *Market and Business*, Q12 "scale revenue" | Anuncia "**cuatro** palancas" y lista tres, y el texto termina cortado en "márgenes >80%". | Decir "tres palancas" o agregar la cuarta, y cerrar la frase. |
| 5 | *Startup Description*, Q3 "product or service" | "**Triplica** la velocidad de trazado" no tiene un dato base de comparación. | Dar la base (pts/día de una cuadrilla vs >1.000 del rover) o quitar "triplica". |
| 6 | *Project Information*, Q8 "Website URL" | La web es `wrover.cl`, pero la marca es AutoTopo y el correo de la startup es Gmail. | Mantener wrover.cl (ya publicado) y, si es posible, usar un correo `@wrover.cl`. |
