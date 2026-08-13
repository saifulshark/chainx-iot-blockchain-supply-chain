import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import { startGpsAutoCollection } from './services/esp32Service.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
if (process.env.DISABLE_DB === 'true') {
  console.log('MongoDB connection disabled for measurement run');
} else {
  connectDB();
}

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', productRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  
  // Start GPS auto-collection only when the database is available.
  if (process.env.DISABLE_DB === 'true') {
    console.log('GPS auto-collection skipped in measurement mode');
  } else if (process.env.ESP32_URL) {
    console.log('ESP32 URL configured, starting GPS auto-collection...');
    startGpsAutoCollection();
  } else {
    console.log('ESP32_URL not configured, GPS auto-collection disabled');
  }
});