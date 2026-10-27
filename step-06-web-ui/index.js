import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const API_PORT = process.env.PORT || 3000;
const areaArg = process.argv[2] || 'javascript';

async function isApiServerRunning() {
  try {
    const res = await fetch(`http://localhost:${API_PORT}/api/status`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('=============================================================');
  console.log('  STEP 06 (OPTIONAL): IADE-Inspired React Student Web UI');
  console.log(`  Default Study Area : data/${areaArg}/ (?area=${areaArg})`);
  console.log(`  Step 05 API Target : http://localhost:${API_PORT}`);
  console.log('=============================================================');

  let apiProcess = null;
  const apiRunning = await isApiServerRunning();

  if (!apiRunning) {
    console.log(
      `[Step 06] Step 05 API not detected on :${API_PORT}. Starting step-05-grading-complete/server.js...`
    );
    apiProcess = spawn(
      process.execPath,
      [path.join(ROOT_DIR, 'step-05-grading-complete', 'server.js')],
      {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env, PORT: String(API_PORT) },
      }
    );
  } else {
    console.log(
      `[Step 06] Connected to running Step 05 API Server on http://localhost:${API_PORT}`
    );
  }

  console.log(
    `[Step 06] Launching React Vite Web Interface -> http://localhost:5173/?area=${areaArg}\n`
  );

  const viteProcess = spawn('npx', ['vite', '--host'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  const cleanup = () => {
    if (viteProcess && !viteProcess.killed) viteProcess.kill();
    if (apiProcess && !apiProcess.killed) apiProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();
