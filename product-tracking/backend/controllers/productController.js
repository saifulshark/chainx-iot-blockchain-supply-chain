import Product from '../models/Product.js';
import { 
  fetchGpsData, 
  fetchSensorData, 
  checkEsp32Status,
  startGpsAutoCollection,
  stopGpsAutoCollection,
  getGpsCollectionStatus
} from '../services/esp32Service.js';
import { computeHash } from '../services/hashService.js';
import { generateQRCode } from '../services/qrService.js';
import { getContract } from '../config/blockchain.js';
import { validateAddProductInput } from '../utils/inputValidation.js';

/*
 * Controller for managing products. Implements CRUD-like operations
 * tailored to the tracking workflow: adding a product, updating GPS
 * information, completing the tracking (which stores a hash on the
 * blockchain) and retrieving all products.
 */

export async function addProduct(req, res) {
  try {
    if (!validateAddProductInput(req.body)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    const { productId, senderCertNo, receiverCertNo } = req.body;
    const existing = await Product.findOne({ productId });
    if (existing) {
      return res.status(400).json({ message: 'Product ID already exists' });
    }
    const product = new Product({ productId, senderCertNo, receiverCertNo });
    await product.save();
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function acceptSensorData(req, res) {
  try {
    const payload = req.body || {};
    const payloadSizeBytes = Buffer.byteLength(JSON.stringify(payload));

    return res.status(201).json({
      received: true,
      receivedAt: new Date().toISOString(),
      payloadSizeBytes,
      payload,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function appendGpsData(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot update GPS for completed product' });
    }
    const gps = await fetchGpsData();
    product.gpsHistory.push(gps);
    await product.save();
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function completeProduct(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    let txHash;
    // If product already completed, return stored QR code if available
    if (product.status === 'Completed' && product.qrCode) {
      return res.json({ qrCode: product.qrCode, txHash: product.blockchainTx });
    }
    
    if (product.status !== 'Completed') {
      // Compute hash of the product data (excluding blockchain fields)
      const hash = computeHash(product);
      // Store hash on blockchain
      const contract = getContract();
      const tx = await contract.storeHash(productId, hash);
      const receipt = await tx.wait();
      txHash = receipt.transactionHash;
      // Persist blockchain data in database
      product.blockchainHash = hash;
      product.blockchainTx = txHash;
      product.status = 'Completed';
    } else {
      // Already completed: reuse stored transaction hash
      txHash = product.blockchainTx;
    }
    // Create QR code with full data (except hash) for offline verification
    const qrPayload = {
      productId: product.productId,
      senderCertNo: product.senderCertNo,
      receiverCertNo: product.receiverCertNo,
      gpsHistory: product.gpsHistory,
      blockchainTx: product.blockchainTx || txHash,
    };
    const qrCode = await generateQRCode(qrPayload);
    
    // Store QR code in database
    product.qrCode = qrCode;
    await product.save();
    
    return res.json({ qrCode, txHash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Get product hash for frontend blockchain interaction
export async function getProductHash(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Compute hash of the product data
    const hash = computeHash(product);
    return res.json({ hash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Complete product with transaction hash from frontend
export async function completeProductWithTx(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const { transactionHash } = req.body;
    if (!transactionHash) {
      return res.status(400).json({ message: 'Transaction hash is required' });
    }
    
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If product is already completed and has QR code, return it
    if (product.status === 'Completed' && product.qrCode) {
      return res.json({ qrCode: product.qrCode, txHash: product.blockchainTx });
    }
    
    // Compute hash and update product status
    const hash = computeHash(product);
    product.blockchainHash = hash;
    product.blockchainTx = transactionHash;
    product.status = 'Completed';
    
    // Create QR code with full data for offline verification
    const qrPayload = {
      productId: product.productId,
      senderCertNo: product.senderCertNo,
      receiverCertNo: product.receiverCertNo,
      gpsHistory: product.gpsHistory,
      blockchainTx: transactionHash,
    };
    const qrCode = await generateQRCode(qrPayload);
    
    // Store QR code in database
    product.qrCode = qrCode;
    await product.save();
    
    return res.json({ qrCode, txHash: transactionHash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Get QR code for a specific product
export async function getProductQRCode(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.status !== 'Completed') {
      return res.status(400).json({ message: 'Product is not completed yet' });
    }
    
    // If QR code exists in database, return it
    if (product.qrCode) {
      return res.json({ qrCode: product.qrCode });
    }
    
    // If QR code doesn't exist, regenerate it
    const qrPayload = {
      productId: product.productId,
      senderCertNo: product.senderCertNo,
      receiverCertNo: product.receiverCertNo,
      gpsHistory: product.gpsHistory,
      blockchainTx: product.blockchainTx,
    };
    const qrCode = await generateQRCode(qrPayload);
    
    // Store the regenerated QR code
    product.qrCode = qrCode;
    await product.save();
    
    return res.json({ qrCode });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Verify product by product ID - Consumer endpoint
export async function verifyProductById(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.status !== 'Completed' || !product.blockchainHash) {
      return res.status(404).json({ message: 'Product not verified on blockchain' });
    }
    
    // Compute current hash and compare with stored hash
    const currentHash = computeHash(product);
    const hashMatches = currentHash === product.blockchainHash;
    
    // Return verification result with sanitized data
    const verificationResult = {
      productId: product.productId,
      senderCertNo: product.senderCertNo,
      receiverCertNo: product.receiverCertNo,
      gpsHistory: product.gpsHistory,
      status: product.status,
      blockchainHash: product.blockchainHash,
      blockchainTx: product.blockchainTx,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      hashMatches,
      verified: hashMatches && product.status === 'Completed'
    };
    
    return res.json(verificationResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Verify product by blockchain hash - Consumer endpoint
export async function verifyProductByHash(req, res) {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ message: 'Hash is required' });
    }
    
    const product = await Product.findOne({ blockchainHash: hash });
    if (!product) {
      return res.status(404).json({ message: 'Product with this hash not found' });
    }
    
    if (product.status !== 'Completed') {
      return res.status(404).json({ message: 'Product not completed on blockchain' });
    }
    
    // Compute current hash and compare
    const currentHash = computeHash(product);
    const hashMatches = currentHash === product.blockchainHash;
    
    const verificationResult = {
      productId: product.productId,
      senderCertNo: product.senderCertNo,
      receiverCertNo: product.receiverCertNo,
      gpsHistory: product.gpsHistory,
      status: product.status,
      blockchainHash: product.blockchainHash,
      blockchainTx: product.blockchainTx,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      hashMatches,
      verified: hashMatches && product.status === 'Completed'
    };
    
    return res.json(verificationResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Verify product by transaction hash - Consumer endpoint
export async function verifyProductByTransaction(req, res) {
  try {
    const { transactionHash } = req.body;
    if (!transactionHash) {
      return res.status(400).json({ message: 'Transaction hash is required' });
    }
    
    const product = await Product.findOne({ blockchainTx: transactionHash });
    if (!product) {
      return res.status(404).json({ message: 'Product with this transaction hash not found' });
    }
    
    if (product.status !== 'Completed') {
      return res.status(404).json({ message: 'Product not completed on blockchain' });
    }
    
    // Compute current hash and compare
    const currentHash = computeHash(product);
    const hashMatches = currentHash === product.blockchainHash;
    
    const verificationResult = {
      productId: product.productId,
      senderCertNo: product.senderCertNo,
      receiverCertNo: product.receiverCertNo,
      gpsHistory: product.gpsHistory,
      status: product.status,
      blockchainHash: product.blockchainHash,
      blockchainTx: product.blockchainTx,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      hashMatches,
      verified: hashMatches && product.status === 'Completed'
    };
    
    return res.json(verificationResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Get current ESP32 sensor data
export async function getEsp32SensorData(req, res) {
  try {
    const sensorData = await fetchSensorData();
    const esp32Status = await checkEsp32Status();
    
    return res.json({
      ...sensorData,
      esp32Status: esp32Status.status,
      esp32Message: esp32Status.message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Get ESP32 connection status
export async function getEsp32Status(req, res) {
  try {
    const status = await checkEsp32Status();
    const gpsStatus = getGpsCollectionStatus();
    return res.json({
      ...status,
      gpsCollection: gpsStatus
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Start GPS auto-collection service
export async function startGpsCollection(req, res) {
  try {
    startGpsAutoCollection();
    const status = getGpsCollectionStatus();
    return res.json({
      message: 'GPS auto-collection started',
      status: status
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Stop GPS auto-collection service
export async function stopGpsCollection(req, res) {
  try {
    stopGpsAutoCollection();
    const status = getGpsCollectionStatus();
    return res.json({
      message: 'GPS auto-collection stopped',
      status: status
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Get GPS collection status
export async function getGpsCollectionInfo(req, res) {
  try {
    const status = getGpsCollectionStatus();
    const activeProducts = await Product.find({ isCompleted: false }).select('productId createdAt');
    return res.json({
      gpsCollection: status,
      activeProducts: activeProducts.length,
      activeProductIds: activeProducts.map(p => p.productId)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}