import { Router } from 'express';
import {
  acceptSensorData,
  addProduct,
  getProducts,
  appendGpsData,
  getProductHash,
  getProductQRCode,
  completeProduct,
  completeProductWithTx,
  verifyProductById,
  verifyProductByHash,
  verifyProductByTransaction,
  getEsp32SensorData,
  getEsp32Status,
  startGpsCollection,
  stopGpsCollection,
  getGpsCollectionInfo
} from '../controllers/productController.js';

const router = Router();

// Add a new product (manual data)
router.post('/products', addProduct);

// Lightweight sensor proxy endpoint for latency measurements
router.post('/sensor-data', acceptSensorData);

// Get all products
router.get('/products', getProducts);

// Append GPS data for a given product ID
router.post('/products/:productId/gps', appendGpsData);

// Get product hash for blockchain storage
router.get('/products/:productId/hash', getProductHash);

// Get QR code for a specific product
router.get('/products/:productId/qr', getProductQRCode);

// Complete a product workflow: store hash on blockchain and generate QR (backend-managed)
router.post('/products/:productId/complete-backend', completeProduct);

// Complete product with frontend-provided transaction hash
router.post('/products/:productId/complete', completeProductWithTx);

// Consumer verification endpoints
router.get('/products/verify/:productId', verifyProductById);
router.post('/products/verify-hash', verifyProductByHash);
router.post('/products/verify-transaction', verifyProductByTransaction);

// ESP32 sensor data endpoints
router.get('/esp32/sensors', getEsp32SensorData);
router.get('/esp32/status', getEsp32Status);

// ESP32 GPS collection control endpoints
router.post('/esp32/gps/start', startGpsCollection);
router.post('/esp32/gps/stop', stopGpsCollection);
router.get('/esp32/gps/status', getGpsCollectionInfo);

export default router;