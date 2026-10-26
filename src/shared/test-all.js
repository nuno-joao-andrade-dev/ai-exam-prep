import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const area = process.argv[2] || 'javascript';

const steps = [
  'step-01-setup',
  'step-02-rag',
  'step-03-exam-gen',
  'step-04-socratic-agent',
  'step-05-grading-complete',
];

console.log(`=============================================================`);
console.log(`  Running All 5 Workshop Steps (area="${area}")`);
console.log(`=============================================================\n`);

for (const step of steps) {
  console.log(`\n>>> [Running ${step} with area="${area}"]`);
  const stepDir = path.join(rootDir, step);
  const res = spawnSync('node', ['index.js', area], {
    cwd: stepDir,
    stdio: 'inherit',
  });
  if (res.status !== 0) {
    console.error(`\n❌ ${step} failed with exit code ${res.status}`);
    process.exit(res.status || 1);
  }
}

console.log(`\n✅ All 5 steps completed successfully for data/${area}/!`);
