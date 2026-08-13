import crypto from 'crypto';
import { performance } from 'node:perf_hooks';

/*
 * Computes a SHA256 hash of a product object excluding blockchain
 * fields. The data is stringified to ensure a deterministic hash.
 */
export function computeHash(product) {
  const data = {
    productId: product.productId,
    senderCertNo: product.senderCertNo,
    receiverCertNo: product.receiverCertNo,
    gpsHistory: product.gpsHistory.map((gps) => ({
      longitude: gps.longitude,
      latitude: gps.latitude,
      datetime: gps.datetime,
    })),
    status: product.status,
  };
  const jsonString = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

export function measureHashComputation(product) {
  const start = performance.now();
  const hash = computeHash(product);
  const end = performance.now();

  return {
    hash,
    latencyMs: end - start,
  };
}