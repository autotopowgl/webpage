import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.wrover.cl',
  trailingSlash: 'ignore',
  server: { host: '0.0.0.0' },
  build: { format: 'directory', inlineStylesheets: 'always' },
});
