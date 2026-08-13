import axios from 'axios';
import Product from '../models/Product.js';

/*
 * Service for fetching real-time data from ESP32 device. The ESP32
 * should provide endpoints for GPS, RFID, DHT sensor data, and other
 * sensor readings. Falls back to demo data when ESP32 is unavailable.
 */

// Demo data for fallback when ESP32 is not available
const DEMO_GPS_POINTS = [
  { latitude: 23.8103, longitude: 90.4125 }, // Dhaka, Bangladesh - Starting point
  { latitude: 23.8108, longitude: 90.4130 }, // Moving northeast
  { latitude: 23.8115, longitude: 90.4135 }, // Continuing northeast
  { latitude: 23.8120, longitude: 90.4142 }, // Further northeast
  { latitude: 23.8125, longitude: 90.4148 }, // Moving along route
  { latitude: 23.8130, longitude: 90.4155 }, // Continuing journey
  { latitude: 23.8135, longitude: 90.4162 }, // Further along path
  { latitude: 23.8140, longitude: 90.4168 }, // Approaching destination
];

const DEMO_SENSOR_DATA = {
  temperature: 25.6,
  humidity: 60.2,
  rfid: "1234567890ABCDEF",
  pressure: 1013.25,
  lightIntensity: 350,
  soilMoisture: 45.8
};

let demoIndex = 0;

// Fetch GPS data from ESP32 using your actual API endpoint
export async function fetchGpsData() {
  // Always use demo GPS data for now
  console.log('Using demo GPS data for tracking');
  return getDemoGpsData();
  
  // Commented out ESP32 connection for demo mode
  /*
  const esp32Url = process.env.ESP32_URL || process.env.ESP32_GPS_URL;
  
  if (!esp32Url) {
    console.log('No ESP32 URL configured, using demo GPS data');
    return getDemoGpsData();
  }

  try {
    const response = await axios.get(`${esp32Url}/api/gps`, { timeout: 5000 });
    const data = response.data || {};
    
    // Your ESP32 returns GPS history array, get the latest one
    if (data.history && data.history.length > 0) {
      const latest = data.history[data.history.length - 1];
      return {
        latitude: parseFloat(latest.lat) || 0,
        longitude: parseFloat(latest.lng) || 0,
        datetime: latest.datetime || new Date().toISOString(),
      };
    }
    
    return getDemoGpsData();
  } catch (error) {
    console.error('Failed to fetch GPS data from ESP32:', error.message);
    return getDemoGpsData();
  }
  */
}

// Fetch all sensor data from ESP32 using your actual API endpoints
export async function fetchSensorData() {
  const esp32Url = process.env.ESP32_URL;
  
  if (!esp32Url) {
    console.log('No ESP32 URL configured, using demo sensor data');
    return getDemoSensorData();
  }

  try {
    const response = await axios.get(`${esp32Url}/api/all`, { timeout: 5000 });
    const data = response.data || {};
    
    // Extract latest GPS data
    let gpsData = { latitude: 0, longitude: 0, datetime: new Date().toISOString() };
    if (data.gps && data.gps.history && data.gps.history.length > 0) {
      const latest = data.gps.history[data.gps.history.length - 1];
      gpsData = {
        latitude: parseFloat(latest.lat) || 0,
        longitude: parseFloat(latest.lng) || 0,
        datetime: latest.datetime || new Date().toISOString(),
      };
    }
    
    // Extract RFID data
    let rfidData = { cardId: null, lastRead: null, authorized: false, accessStatus: 'No card scanned' };
    if (data.status) {
      rfidData = {
        cardId: data.status.lastCardUID || null,
        lastRead: data.status.lastScanSecondsAgo !== null ? 
                  new Date(Date.now() - (data.status.lastScanSecondsAgo * 1000)).toISOString() : null,
        authorized: data.status.authorized || false,
        accessStatus: data.status.accessStatus || 'No card scanned'
      };
    }
    
    // Extract DHT sensor data with proper null handling
    let dhtData = { temperature: null, humidity: null };
    if (data.status) {
      dhtData = {
        temperature: data.status.temperature !== null && data.status.temperature !== undefined ? 
                    parseFloat(data.status.temperature) : null,
        humidity: data.status.humidity !== null && data.status.humidity !== undefined ? 
                 parseFloat(data.status.humidity) : null,
      };
    }
    
    // Calculate last sensor sample time
    let lastSensorSample = null;
    if (data.status && data.status.lastSensorSampleSecondsAgo !== null && data.status.lastSensorSampleSecondsAgo !== undefined) {
      lastSensorSample = new Date(Date.now() - (data.status.lastSensorSampleSecondsAgo * 1000)).toISOString();
    }
    
    return {
      gps: gpsData,
      dht: dhtData,
      rfid: rfidData,
      sensors: {
        // Removed additional sensors as per request
        samplingInterval: '3 minutes',
        lastSensorSample: lastSensorSample
      },
      esp32Status: 'connected',
      esp32IP: data.status?.ip || 'Unknown',
      lastSensorSample: lastSensorSample,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch sensor data from ESP32:', error.message);
    return getDemoSensorData();
  }
}

// Check if ESP32 is available using your actual API endpoint
export async function checkEsp32Status() {
  const esp32Url = process.env.ESP32_URL;
  
  if (!esp32Url) {
    return { status: 'disabled', message: 'ESP32 URL not configured' };
  }

  try {
    const response = await axios.get(`${esp32Url}/api/status`, { timeout: 3000 });
    const data = response.data || {};
    return { 
      status: 'connected', 
      message: 'ESP32 connected successfully',
      data: data,
      ip: data.ip || 'Unknown',
      temperature: data.temperature || 0,
      humidity: data.humidity || 0,
      lastCardUID: data.lastCardUID || null
    };
  } catch (error) {
    return { 
      status: 'disconnected', 
      message: `ESP32 connection failed: ${error.message}` 
    };
  }
}

// Helper functions for demo data
function getDemoGpsData() {
  const point = DEMO_GPS_POINTS[demoIndex % DEMO_GPS_POINTS.length];
  demoIndex++;
  return {
    ...point,
    datetime: new Date().toISOString(),
  };
}

function getDemoSensorData() {
  const point = DEMO_GPS_POINTS[demoIndex % DEMO_GPS_POINTS.length];
  demoIndex++;
  
  return {
    gps: {
      ...point,
      datetime: new Date().toISOString(),
    },
    dht: {
      temperature: DEMO_SENSOR_DATA.temperature + (Math.random() - 0.5) * 2,
      humidity: DEMO_SENSOR_DATA.humidity + (Math.random() - 0.5) * 5,
    },
    rfid: {
      cardId: DEMO_SENSOR_DATA.rfid,
      lastRead: new Date().toISOString(),
      authorized: true,
      accessStatus: 'ACCESS GRANTED'
    },
    sensors: {
      pressure: DEMO_SENSOR_DATA.pressure + (Math.random() - 0.5) * 2,
      lightIntensity: DEMO_SENSOR_DATA.lightIntensity + Math.random() * 50,
      soilMoisture: DEMO_SENSOR_DATA.soilMoisture + (Math.random() - 0.5) * 10,
    },
    esp32Status: 'demo',
    timestamp: new Date().toISOString()
  };
}

// GPS Auto-collection service - runs every 2 minutes
let gpsCollectionInterval = null;

export function startGpsAutoCollection() {
  if (gpsCollectionInterval) {
    console.log('GPS auto-collection already running');
    return;
  }

  console.log('Starting GPS auto-collection (1-minute intervals with demo data)...');
  
  // Run immediately, then every 1 minute
  collectGpsForActiveProducts();
  
  gpsCollectionInterval = setInterval(async () => {
    await collectGpsForActiveProducts();
  }, 1 * 60 * 1000); // 1 minute
}

export function stopGpsAutoCollection() {
  if (gpsCollectionInterval) {
    clearInterval(gpsCollectionInterval);
    gpsCollectionInterval = null;
    console.log('GPS auto-collection stopped');
  }
}

// Collect GPS data for all active (non-completed) products
async function collectGpsForActiveProducts() {
  try {
    // Find all active products (status is 'In Progress', not completed)
    const activeProducts = await Product.find({ status: 'In Progress' });
    
    if (activeProducts.length === 0) {
      console.log('No active products found for GPS collection');
      return;
    }

    // Fetch current GPS data (using demo data)
    const gpsData = await fetchGpsData();
    
    if (!gpsData.latitude || !gpsData.longitude) {
      console.log('No valid GPS data received');
      return;
    }

    console.log(`Updating GPS for ${activeProducts.length} active products:`, {
      lat: gpsData.latitude,
      lng: gpsData.longitude,
      datetime: gpsData.datetime
    });

    // Update GPS for all active products
    const updatePromises = activeProducts.map(async (product) => {
      product.gpsHistory.push(gpsData);
      await product.save();
      return product.productId;
    });

    const updatedProductIds = await Promise.all(updatePromises);
    console.log(`GPS updated for products: ${updatedProductIds.join(', ')}`);

  } catch (error) {
    console.error('Error in GPS auto-collection:', error.message);
  }
}

// Get GPS collection status
export function getGpsCollectionStatus() {
  return {
    isRunning: gpsCollectionInterval !== null,
    intervalMinutes: 1,
    nextCollection: gpsCollectionInterval ? new Date(Date.now() + (1 * 60 * 1000)).toISOString() : null
  };
}