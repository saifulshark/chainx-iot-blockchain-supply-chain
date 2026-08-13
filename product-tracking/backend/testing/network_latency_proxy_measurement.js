import axios from 'axios';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, 'data');
const outputPath = path.join(outputDir, 'network_latency_PROXY_MEASUREMENT.csv');
const baseUrl = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:5000';

function buildPayload(trial) {
  return {
    productId: 2000 + trial,
    senderCertNo: '12345678',
    receiverCertNo: '87654321',
    gps: {
      latitude: 23.8103 + trial * 0.0001,
      longitude: 90.4125 + trial * 0.0001,
      datetime: new Date().toISOString(),
    },
    dht: {
      temperature: 25.5 + (trial % 3) * 0.2,
      humidity: 60 + (trial % 4) * 0.5,
    },
    rfid: {
      cardId: `CARD-${String(trial).padStart(4, '0')}`,
      authorized: true,
      accessStatus: 'ACCESS GRANTED',
    },
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  const rows = ['trial_number,rtt_ms,estimated_one_way_ms'];

  for (let trial = 1; trial <= 20; trial += 1) {
    const payload = buildPayload(trial);
    const start = performance.now();
    await axios.post(`${baseUrl}/api/sensor-data`, payload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    const end = performance.now();
    const rtt = end - start;
    rows.push(`${trial},${rtt.toFixed(3)},${(rtt / 2).toFixed(3)}`);

    if (trial < 20) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${rows.join('\n')}\n`, 'utf8');
}

await main();