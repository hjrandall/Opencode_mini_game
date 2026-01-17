import { build } from 'esbuild';

await build({
  entryPoints: ['webview/main.ts'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  outfile: 'dist-webview/main.js',
  sourcemap: true,
  loader: {
    '.glb': 'file',
    '.gltf': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
  },
  logLevel: 'info',
});
