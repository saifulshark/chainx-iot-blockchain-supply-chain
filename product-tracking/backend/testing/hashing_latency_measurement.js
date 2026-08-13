import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { measureHashComputation } from '../services/hashService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, 'data');
const outputPath = path.join(outputDir, 'hashing_latency.csv');

function buildSampleProduct(trial) {
  return {
    productId: 1000 + trial,
    senderCertNo: '12345678',
    receiverCertNo: '87654321',
    gpsHistory: [
      {
        longitude: 90.4125 + trial * 0.0001,
        latitude: 23.8103 + trial * 0.0001,
        datetime: new Date(Date.now() - trial * 1000).toISOString(),
      },
      {
        longitude: 90.413 + trial * 0.0001,
        latitude: 23.811 + trial * 0.0001,
        datetime: new Date().toISOString(),
      },
    ],
    status: trial % 2 === 0 ? 'In Progress' : 'Completed',
  };
}

async function main() {
  const rows = ['trial_number,latency_ms'];

  for (let trial = 1; trial <= 20; trial += 1) {
    const sampleProduct = buildSampleProduct(trial);
    const { latencyMs } = measureHashComputation(sampleProduct);
    rows.push(`${trial},${latencyMs.toFixed(3)}`);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${rows.join('\n')}\n`, 'utf8');
}

await main();