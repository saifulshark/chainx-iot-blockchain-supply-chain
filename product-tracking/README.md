# Product Tracking System

A blockchain-based supply chain product tracking application that combines IoT sensor data, QR code verification, GPS updates, and smart contract verification to monitor product movement and authenticity from origin to destination.

This project is designed to provide end-to-end tracking for goods in a supply chain environment, with product information stored in a database and verified on-chain through a blockchain smart contract.

---

## Overview

The system is built around a product lifecycle flow:

1. A product is created with sender and receiver information.
2. GPS and sensor information are collected during transit.
3. Product data is hashed and stored in a blockchain smart contract.
4. A QR code is generated for product verification.
5. Consumers or stakeholders can verify product authenticity using the QR code or blockchain transaction.

This project integrates:

- Frontend UI for product management and verification
- Backend API with Express
- MongoDB for product data storage
- Blockchain smart contracts for hash verification
- IoT sensor/GPS data collection from ESP32 devices
- QR generation and verification

---

## Core Features

- Add new product records
- Track GPS history over time
- Capture sensor and environmental data
- Generate blockchain hash for each product
- Store blockchain transaction details
- Generate QR code per completed product
- Verify product data by ID, hash, or transaction
- Provide ESP32/GPS data collection endpoints
- Display real-time status via frontend dashboard

---

## System Architecture

```text
+--------------------+
|   Frontend (React) |
|   - Product form   |
|   - Tracking UI    |
|   - Verification  |
+----------+---------+
           |
           v
+----------+---------+
|   Backend (Express)|
|   - REST APIs      |
|   - Business logic |
|   - Hash + QR      |
+----------+---------+
           |
           +--------------------+
           |                    |
           v                    v
+----------------+    +----------------------+
| MongoDB        |    | Smart Contract       |
| Product data   |    | storeHash()          |
| GPS history    |    | verify product hash  |
+----------------+    +----------------------+
           |
           v
+--------------------+
| ESP32 / Sensor Data|
| GPS / Temp / Alert |
+--------------------+
```

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Ethers

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- QR Code generation
- Ethers
- CORS / dotenv

### Blockchain
- Hardhat
- Solidity
- Ethers

---

## Project Structure

```text
product-tracking/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── contracts/
│   ├── contracts/
│   ├── scripts/
│   ├── tests/
│   ├── hardhat.config.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.cjs
├── package.json
├── .gitignore
├── README.md
└── tests/
```

---

## Prerequisites

Before running the project, make sure the following tools are installed:

- Node.js (v18 or newer)
- npm
- MongoDB
- Hardhat
- Git

---

## Environment Setup

### Frontend
No custom env file is required in the frontend for basic local use unless the app is configured for your own API base URL.

### Backend
Create a `.env` file inside the backend folder with values similar to:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/product-tracking
ESP32_URL=http://your-esp32-ip
DISABLE_DB=false
```

### Smart Contracts
Create a `.env` file inside the contracts folder if deploying to a test network:

```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=your_rpc_url
```

---

## Installation

### 1. Install root project dependencies
```bash
cd product-tracking
npm install
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Install contract dependencies
```bash
cd ../contracts
npm install
```

---

## Run the Project

### Start backend
```bash
cd product-tracking/backend
npm run dev
```

### Start frontend
```bash
cd product-tracking/frontend
npm run dev
```

### Compile smart contracts
```bash
cd product-tracking/contracts
npx hardhat compile
```

### Deploy smart contracts
```bash
cd product-tracking/contracts
npx hardhat run scripts/deploy.js --network localhost
```

---

## API Endpoints

The backend exposes product and verification APIs through the `/api` route.

### Product management
- `POST /api/products`
- `GET /api/products`

### GPS tracking
- `POST /api/products/:productId/gps`

### Completion and QR output
- `POST /api/products/:productId/complete-backend`
- `POST /api/products/:productId/complete`
- `GET /api/products/:productId/qr`

### Verification
- `GET /api/products/verify/:productId`
- `POST /api/products/verify-hash`
- `POST /api/products/verify-transaction`

### ESP32 monitoring
- `GET /api/esp32/sensors`
- `GET /api/esp32/status`
- `POST /api/esp32/gps/start`
- `POST /api/esp32/gps/stop`
- `GET /api/esp32/gps/status`

---

## Product Workflow

1. Product is added with sender and receiver certificate information.
2. Product can be monitored during transport.
3. Sensor and GPS data are appended to the product record.
4. Product status is completed and stored on blockchain.
5. A QR code is created for verification.
6. Consumers verify the product using the QR code or transaction hash.

---

## Project Output View
![alt text](img5.png) ![alt text](img6.png) ![alt text](img7.png)

## Verification Model

The project uses blockchain verification to confirm product integrity:

- product data is hashed
- hash is sent to the smart contract
- transaction hash is stored with the product
- later verification compares the current record with blockchain evidence

This protects against tampering and makes product origin traceable.

---

## Notes

- The backend is designed to work with ESP32 GPS/sensor inputs.
- The frontend is intended for demonstration and product tracking admin workflows.
- Smart contract deployment requires a valid blockchain network configuration.
- Some modules may be updated depending on the local development environment and hardware setup.

---

## Project Relevance

This project demonstrates a real-world blockchain-based supply chain solution where:

- product authenticity can be verified
- route and environmental data are tracked
- trust is improved using blockchain-backed records
- QR-based verification supports consumer accessibility

---

## Future Improvements

- User authentication for admin and consumer roles
- More advanced analytics dashboard
- Product history timeline
- Real-time maps integration
- Better notification system for temperature and GPS anomalies
- Deploy to cloud infrastructure

---

## License

This project is intended for academic and demonstration purposes as part of the capstone project.

---

## Contributors

Capstone Project Team
