import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Media from '../../src/components/Media.astro';
import { enlaceWhatsApp, idYouTube } from '../../src/lib/enlaces';

describe('Media', () => {
  it('sin src muestra el esquema ilustrado', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Media, { props: { alt: 'Rover', esquema: 'rover' } });
    expect(html).toContain('data-media-tipo="esquema"');
    expect(html).toContain('<svg');
    expect(html).not.toContain('<iframe');
  });

  it('con URL de YouTube renderiza iframe youtube-nocookie diferido', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Media, { props: { alt: 'Demo', src: 'https://www.youtube.com/watch?v=abc123XYZ_-' } });
    expect(html).toContain('data-media-tipo="video"');
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/abc123XYZ_-"');
    expect(html).toContain('loading="lazy"');
  });

  it('con ruta de imagen renderiza una foto', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Media, { props: { alt: 'Rover en faena', src: '/img/rover.jpg' } });
    expect(html).toContain('<img src="/img/rover.jpg" alt="Rover en faena"');
  });

  it('sin video y sin esquema muestra el aviso "Video próximamente"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Media, { props: { alt: 'Pitch', esquema: 'ninguno', avisoVideo: 'Pronto.' } });
    expect(html).toContain('Video próximamente');
    expect(html).not.toContain('<iframe');
  });
});

describe('enlaces', () => {
  it('genera wa.me con texto URL-encoded', () => {
    expect(enlaceWhatsApp('56912345678', 'Hola, piloto?')).toBe('https://wa.me/56912345678?text=Hola%2C%20piloto%3F');
  });
  it('extrae ids de YouTube en sus formatos', () => {
    expect(idYouTube('https://youtu.be/abc123XYZ')).toBe('abc123XYZ');
    expect(idYouTube('https://www.youtube.com/embed/abc123XYZ')).toBe('abc123XYZ');
    expect(idYouTube('https://vimeo.com/123')).toBeNull();
  });
});
