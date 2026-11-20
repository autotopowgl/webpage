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

test.describe('Layout compartido', () => {
  for (const ruta of ['/', '/ignite/']) {
    test(`nav con enlace a Ignite visible sin scroll en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.getByTestId('nav-ignite')).toBeVisible();
      await expect(page.getByTestId('nav-ignite')).toHaveAttribute('href', '/ignite/');
      await dentroDePrimeraPantalla(page, '[data-testid="nav-ignite"]');
      await sinScrollHorizontal(page);
    });
  }
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
    if (!datos.videos.mvp && !datos.media.tecnologia) await expect(page.locator('#tecnologia [data-media-tipo="esquema"]')).toHaveCount(1);
    await expect(page.locator('img')).toHaveCount(datos.media.hero ? 1 : 0);
  });

  test('equipo fundador female-led y enlace a Ignite en la sección de respaldo', async ({ page }) => {
    const equipo = page.locator('#equipo');
    await expect(equipo).toContainText('Loreto Oviedo');
    await expect(equipo).toContainText('Wilson Puentes');
    await expect(equipo).toContainText('Gonzalo Oviedo Lambert');
    await expect(page.getByTestId('female-led')).toBeVisible();
    await expect(page.getByTestId('link-ignite-respaldo')).toHaveAttribute('href', '/ignite/');
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

test.describe('Pitch Ignite (/ignite/)', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/ignite/'); });

  test('tesis y "TRL 6" en la primera pantalla', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(datos.ignite.tesis);
    await expect(page.getByTestId('badge-trl')).toContainText('TRL 6');
    await dentroDePrimeraPantalla(page, 'h1');
    await dentroDePrimeraPantalla(page, '[data-testid="badge-trl"]');
  });

  test('estado actual con inversión I+D y sin ventas', async ({ page }) => {
    const estado = page.locator('[data-seccion="estado"]');
    await expect(estado).toContainText('USD 50.000 – 60.000');
    await expect(estado).toContainText('Pre-venta');
  });

  test('orden de secciones del pitch', async ({ page }) => {
    const orden = await page.locator('[data-seccion]').evaluateAll((els) => els.map((e) => e.getAttribute('data-seccion')));
    expect(orden).toEqual(['estado', 'problema-solucion', 'competencia', 'mercado', 'hoja-ruta', 'programa', 'ecosistema', 'equipo-videos']);
  });

  test('competencia nombra las tres alternativas', async ({ page }) => {
    const comp = page.getByTestId('competencia');
    for (const c of datos.ignite.competencia) await expect(comp).toContainText(c.nombre);
  });

  test('mercado: TAM > SAM > SOM en tamaño visual', async ({ page }) => {
    const anchos = await page.locator('.mercado__barra').evaluateAll((els) => els.map((e) => [e.getAttribute('data-sigla'), e.getBoundingClientRect().width] as const));
    expect(anchos.map((a) => a[0])).toEqual(['TAM', 'SAM', 'SOM']);
    expect(anchos[0][1]).toBeGreaterThan(anchos[1][1]);
    expect(anchos[1][1]).toBeGreaterThan(anchos[2][1]);
    expect(anchos[2][1]).toBeGreaterThan(0);
    for (const m of datos.ignite.mercado) await expect(page.getByTestId('mercado')).toContainText(m.valor);
  });

  test('hoja de ruta TRL 6 → 8 → 9 y KPIs literales del JSON', async ({ page }) => {
    const ruta = page.locator('[data-seccion="hoja-ruta"]');
    for (const h of ['TRL 6', 'TRL 8', 'TRL 9']) await expect(ruta).toContainText(h);
    const kpis = await page.getByTestId('kpi-texto').allTextContents();
    expect(kpis).toEqual(datos.ignite.kpis.map((k) => k.texto));
  });

  test('modelo escalable sin márgenes y ecosistema', async ({ page }) => {
    await expect(page.getByTestId('modelo')).toContainText('1-a-N');
    const texto = await page.locator('main').innerText();
    expect(texto).not.toMatch(/m[aá]rgen/i);
    expect(texto).not.toMatch(/80\s*%/);
    for (const e of datos.ignite.ecosistema) await expect(page.locator('[data-seccion="ecosistema"]')).toContainText(e.titulo);
  });

  test('videos: aviso sin reproductor roto mientras no hay URL', async ({ page }) => {
    const v = page.locator('[data-seccion="equipo-videos"]');
    const pendientes = [datos.videos.pitch, datos.videos.mvp].filter((u) => !u).length;
    await expect(v.getByText('Video próximamente')).toHaveCount(pendientes);
    await expect(v.locator('iframe')).toHaveCount(2 - pendientes);
  });

  test('vuelta a la home y contacto con mensaje Ignite', async ({ page }) => {
    await expect(page.getByTestId('link-home')).toHaveAttribute('href', '/');
    const cta = page.getByTestId('cta-contacto');
    await expect(cta).toHaveText(/Contactar al equipo fundador/);
    esperarWhatsApp(await cta.getAttribute('href'), datos.contacto.mensajeIgnite);
    await sinScrollHorizontal(page);
  });
});

test('sin datos personales ni "3 mm" en ninguna página', async ({ page }) => {
  for (const ruta of ['/', '/ignite/']) {
    await page.goto(ruta);
    const html = await page.content();
    expect(html).not.toMatch(/\b\d{7,8}-[\dkK]\b/);
    expect(html).not.toMatch(/\b3\s*(-|–)?\s*\d*\s*mm\b/);
    expect(html).not.toContain('932523912');
  }
});
