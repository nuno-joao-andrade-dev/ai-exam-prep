import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const slidesDir = path.resolve(__dirname, '../../slides');
const port = Number(process.env.SLIDES_PORT || 3030);

const app = express();
app.use(express.static(slidesDir));

app.listen(port, () => {
  console.log(`\n=============================================================`);
  console.log(`  DevFest Workshop Slides running at http://localhost:${port}`);
  console.log(`=============================================================\n`);
});
