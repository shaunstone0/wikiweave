import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: true,
  minify: false,
  noExternal: ['markdown-it', 'dompurify'],
});
