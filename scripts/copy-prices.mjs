import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const source =
  process.env.SOURCE_PRICES_PATH ??
  path.resolve(projectRoot, '..', 'market_sniffer', 'output', 'prices.xlsx');
const target = path.resolve(projectRoot, 'public', 'prices.xlsx');

if (fs.existsSync(source)) {
  fs.copyFileSync(source, target);
  console.log(`[copy-prices] Copied ${source} -> ${target}`);
} else {
  console.log(`[copy-prices] Missing source file: ${source}`);
}

