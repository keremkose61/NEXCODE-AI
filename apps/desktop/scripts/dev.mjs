import esbuild from 'esbuild';
import { createServer } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function startDev() {
  console.log('[NEXCODE AI] Starting build and development services...');

  // Build main & preload scripts
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

  // Start Vite dev server for renderer
  const viteServer = await createServer({
    configFile: path.join(rootDir, 'vite.config.ts'),
    server: { port: 5173 }
  });
  await viteServer.listen();
  console.log('[NEXCODE AI] Vite Dev Server running on http://localhost:5173');

  // Launch Electron
  const electronPath = process.platform === 'win32'
    ? path.join(rootDir, 'node_modules', '.bin', 'electron.cmd')
    : path.join(rootDir, 'node_modules', '.bin', 'electron');

  const electronProcess = spawn(electronPath, [rootDir], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://localhost:5173'
    }
  });

  electronProcess.on('close', () => {
    console.log('[NEXCODE AI] Desktop window closed. Shutting down dev server...');
    viteServer.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error('[NEXCODE AI] Error during dev startup:', err);
  process.exit(1);
});
