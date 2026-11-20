import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function build() {
  console.log('Building Electron main & preload processes...');
  try {
    await esbuild.build({
      entryPoints: [
        path.join(rootDir, 'src/main/index.ts'),
        path.join(rootDir, 'src/preload/index.ts')
      ],
      outdir: path.join(rootDir, 'out'),
      outbase: path.join(rootDir, 'src'),
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      bundle: true,
      sourcemap: true,
      external: ['electron']
    });
    console.log('Main and Preload build completed successfully.');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();
