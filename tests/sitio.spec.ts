import { test, expect, type Page } from '@playwright/test';
import datos from '../src/data/autotopo.json' with { type: 'json' };

async function dentroDePrimeraPantalla(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  const vh = page.viewportSize()!.height;
  expect(box, `${selector} debe existir`).not.toBeNull();
  expect(box!.y + box!.height, `${selector} debe verse sin scroll`).toBeLessThanOrEqual(vh);
}

async function sinScrollHorizontal(page: Page) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
}

function esperarWhatsApp(href: string | null, mensaje: string) {
  expect(href).not.toBeNull();
  const url = new URL(href!);
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe(`/${datos.contacto.whatsapp}`);
  expect(url.searchParams.get('text')).toBe(mensaje);
  expect(href).toContain(encodeURIComponent(mensaje));
}

test.describe('Layout', () => {
  test('nav con enlace a contacto visible sin scroll y sin enlaces a postulaciones', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-piloto')).toBeVisible();
    await dentroDePrimeraPantalla(page, '[data-testid="nav-piloto"]');
    await expect(page.locator('a[href*="ignite"]')).toHaveCount(0);
    await sinScrollHorizontal(page);
  });

  test('/ignite/ ya no existe', async ({ page }) => {
    const r = await page.goto('/ignite/');
    expect(r?.status()).toBe(404);
  });
});

test.describe('Home comercial (/)', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('hero: titular, tres cifras y CTA en la primera pantalla', async ({ page }) => {
    await expect(page.getByTestId('hero-titulo')).toHaveText(datos.hero.titulo);
    const cifras = page.getByTestId('hero-cifras');
    await expect(cifras).toContainText(datos.cifras.puntosDia);
    await expect(cifras).toContainText(datos.cifras.precision);
    await expect(cifras).toContainText(datos.cifras.capex);
    await expect(page.getByTestId('cta-hero')).toHaveText(new RegExp(datos.hero.cta));
    await dentroDePrimeraPantalla(page, '[data-testid="hero-titulo"]');
    await dentroDePrimeraPantalla(page, '[data-testid="hero-cifras"]');
    await dentroDePrimeraPantalla(page, '[data-testid="cta-hero"]');
  });

  test('secciones en orden: problema, cómo opera, comparación, tecnología, impacto, equipo', async ({ page }) => {
    const orden = await page.locator('[data-seccion]').evaluateAll((els) => els.map((e) => e.getAttribute('data-seccion')));
    expect(orden).toEqual(['problema', 'como-opera', 'comparacion', 'tecnologia', 'impacto', 'equipo']);
  });

  test('comparación completa y sin scroll horizontal', async ({ page }) => {
    const tabla = page.getByTestId('comparacion');
    for (const f of datos.comparacion.filas) {
      await expect(tabla).toContainText(f.criterio);
      await expect(tabla).toContainText(f.autotopo);
    }
    await tabla.scrollIntoViewIfNeeded();
    await sinScrollHorizontal(page);
    const box = await tabla.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test('tecnología, ODS e imágenes: sin fotos reales se muestran esquemas', async ({ page }) => {
    for (const t of datos.tecnologia.items) await expect(page.locator('#tecnologia')).toContainText(t.titulo);
    for (const o of datos.impacto.ods) await expect(page.locator('#impacto')).toContainText(`ODS ${o.numero}`);
    if (!datos.media.hero) await expect(page.locator('[data-testid="hero"] [data-media-tipo="esquema"]')).toHaveCount(1);
    if (!datos.videos.demo && !datos.media.tecnologia) await expect(page.locator('#tecnologia [data-media-tipo="esquema"]')).toHaveCount(1);
    await expect(page.locator('img')).toHaveCount(datos.media.hero ? 1 : 0);
  });

  test('equipo y empresa en formación', async ({ page }) => {
    const equipo = page.locator('#equipo');
    for (const p of datos.equipo.personas) await expect(equipo).toContainText(p.nombre);
    await expect(equipo).toContainText('empresa chilena en formación');
    await expect(page.locator('footer')).toContainText('Empresa en formación');
  });

  test('CTAs de WhatsApp con mensaje de piloto y correo funcional', async ({ page }) => {
    const ctas = page.locator('[data-cta="whatsapp"]');
    expect(await ctas.count()).toBeGreaterThanOrEqual(2);
    for (const h of await ctas.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) esperarWhatsApp(h, datos.contacto.mensajePiloto);
    await expect(page.getByTestId('cta-correo')).toHaveAttribute('href', new RegExp(`^mailto:${datos.contacto.correo}`));
    await expect(page.getByTestId('cta-contacto')).toBeVisible();
  });

  test('el enlace "Piloto" del nav lleva a la sección de contacto', async ({ page }) => {
    await page.getByTestId('nav-piloto').click();
    await expect(page.locator('#contacto')).toBeInViewport();
  });
});

test('sin datos personales, "3 mm" ni referencias a postulaciones', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html).not.toMatch(/\b\d{7,8}-[\dkK]\b/);
  expect(html).not.toMatch(/\b3\s*(-|–)?\s*\d*\s*mm\b/);
  expect(html).not.toContain('932523912');
  const texto = await page.locator('body').innerText();
  expect(texto).not.toMatch(/start-?up|ignite|corfo|postulaci[oó]n|pitch|female-led/i);
});
