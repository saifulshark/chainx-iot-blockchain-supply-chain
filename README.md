# A Blockchain-Enabled IoT Framework for Secure and Traceable Chain-of-Custody Monitoring in Supply Chains

A full-stack supply-chain monitoring system that integrates Internet of Things (IoT) sensing, RFID-based physical access control, GPS tracking, blockchain verification, QR-code provenance checking, and Telegram-based alerting to provide secure and traceable shipment monitoring.

---

## Project Summary

This project presents a blockchain-enabled IoT framework for secure chain-of-custody monitoring in supply chains. The system combines:

- ESP32-based smart container monitoring
- RFID access control
- temperature and humidity sensing
- GPS tracking
- unauthorized access detection
- image capture and Telegram notifications
- off-chain data storage
- blockchain-based hashing and shipment lifecycle management
- consumer-facing QR verification

The system is designed to improve transparency, authenticity, and accountability across logistics workflows by recording physical events and cryptographically anchoring them on-chain.

---

## Abstract

Supply chain integrity in high-value logistics remains vulnerable to cargo theft, unauthorized access, environmental violations, and data manipulation. Existing systems often fail to provide a unified mechanism that captures physical access evidence, cryptographically anchors it, and offers consumers independently verifiable shipment records.

This project introduces an integrated IoT–blockchain framework built around an ESP32-based smart container equipped with temperature and humidity sensing, GPS tracking, RFID-controlled access control, and camera-based evidence capture. When unauthorized access is detected, the system captures timestamped and GPS-tagged evidence, sends alerts through Telegram, and stores cryptographic hashes on a blockchain for tamper-evident record keeping.

Shipment lifecycle management is enforced through smart contracts that define state transitions such as Pending, InTransit, and Completed. Upon shipment completion, shipment records are hashed and anchored on-chain, enabling consumers to verify provenance through a QR-code interface without requiring blockchain expertise or cryptocurrency wallets.

The framework is validated through real-time monitoring, hash verification, alert generation, and end-to-end project flow involving frontend, backend, IoT hardware, and blockchain layers.

---

## Key Objectives

- Secure physical access to shipment containers
- Detect temperature and environmental anomalies
- Track GPS movement and product route
- Record evidence of intrusion or security breach
- Alert administrators in real time
- Store tamper-resistant evidence on blockchain
- Provide consumer-side provenance verification
- Improve trust, traceability, and accountability in supply chains

---

## System Architecture

The system follows a layered and modular architecture:

```text
+--------------------------------------------------------------+
|                  Application Layer                             |
|  Frontend Dashboard / DApp / Consumer Verification           |
|  - Product creation                                          |
|  - Shipment tracking                                         |
|  - Shipment completion                                      |
|  - QR verification                                           |
+---------------------------+----------------------------------+
                            |
                            v
+---------------------------+----------------------------------+
|                  Blockchain Layer                            |
|  Smart Contracts                                             |
|  - Tracking lifecycle                                         |
|  - SHA-256 hash anchoring                                    |
|  - state transitions (Pending, InTransit, Completed)          |
+---------------------------+----------------------------------+
                            |
                            v
+---------------------------+----------------------------------+
|                 Middleware Layer                              |
|  Backend API (Express / Flask)                                |
|  - Manage shipment logic                                     |
|  - Store data off-chain                                      |
|  - Hash records before blockchain anchoring                  |
|  - Handle alerts and verification                            |
+---------------------------+----------------------------------+
                            |
                            v
+---------------------------+----------------------------------+
|              Connectivity & IoT Layer                        |
|  ESP32 + RFID + GPS + DHT11 + Camera + Buzzer                |
|  - collect sensor data                                       |
|  - read RFID tags                                            |
|  - send alerts                                               |
|  - update GPS and environmental records                      |
+---------------------------+----------------------------------+
                            |
                            v
+---------------------------+----------------------------------+
|              Physical Supply Chain Layer                     |
|  suppliers -> manufacturer -> distributor -> retailer -> end |
|  consumer                                                    |
+--------------------------------------------------------------+
```

---

## Core Functional Modules

### 1. IoT Smart Container Module
The physical hardware layer is built around an ESP32 microcontroller and includes:

- RFID reader for credential verification
- electromagnetic lock / servo actuation
- DHT11 temperature and humidity sensor
- GPS module for location tracking
- buzzer for event alerts
- camera-based evidence capture
- Wi-Fi connectivity for data transmission

This module forms the physical evidence and monitoring layer of the system.

### 2. Telegram Alert Service
A Python Flask service receives alerts from the hardware and forwards them to Telegram using the Telegram Bot API.

It supports:
- unauthorized access alerts
- temperature threshold alerts
- photo-based evidence delivery
- admin notification in real time

### 3. Backend API Layer
The backend is responsible for:
- receiving IoT data
- validating and storing records
- generating hashes
- managing product lifecycle logic
- interacting with the blockchain
- serving product and verification endpoints

This layer bridges the hardware and the blockchain.

### 4. Blockchain Smart Contracts
The blockchain layer uses Ethereum-compatible smart contracts to manage:
- shipment creation
- shipment starting
- shipment completion
- state validation
- hash anchoring
- provenance evidence storage

This ensures immutability and tamper-evident traceability.

### 5. Frontend / DApp
The user-facing application allows:
- product creation
- shipment status tracking
- shipment lifecycle updates
- wallet integration
- QR-code based verification
- consumer-side product authentication

---

## Workflow of the Full System

### 1. Shipment Creation
A sender creates a shipment with details such as:
- receiver address
- pickup location
- destination
- shipment distance
- product price/deposit

The shipment enters the Pending state.

### 2. Shipment Start
Once goods are in transit, the sender starts the shipment and it is moved to InTransit.

### 3. Sensor and GPS Monitoring
During transit, the ESP32 device:
- reads temperature and humidity
- reads RFID access events
- acquires GPS coordinates
- checks for anomalies and unauthorized access

### 4. Alert Detection
If:
- an invalid RFID credential is used
- temperature exceeds threshold limits
- GPS route deviates or suspicious activity occurs

the system triggers:
- local buzzer
- alert generation
- optional image capture
- Telegram notification

### 5. Evidence Handling
The system stores relevant evidence data off-chain and computes a SHA-256 hash. The hash is then anchored on-chain for auditability.

### 6. Shipment Completion
When the shipment reaches the destination, the receiver completes the shipment. The contract updates the status to Completed and releases the deposit when required.

### 7. Verification
A QR code is generated for the completed product.
Consumers can scan the code and verify:
- product identity
- route history
- transaction details
- blockchain-backed proof of shipment state

---

## Features

### Security and Access Control
- RFID-based authorization
- physical lock/unlock logic
- unauthorized access detection
- time-stamped evidence capture
- Telegram alert notification

### Environmental Monitoring
- DHT11 temperature and humidity monitoring
- threshold-based alerts
- cold-chain anomaly detection

### Location Tracking
- GPS tracking module
- route continuity checks
- location-based monitoring

### Traceability and Provenance
- shipment lifecycle tracking
- blockchain-backed hash storage
- off-chain and on-chain integrity checks
- QR-based product verification

### Consumer Transparency
- product verification without blockchain knowledge
- easy QR scanning interface
- visible supply-chain record checking

---

## Technologies Used

### IoT and Hardware
- ESP32
- RFID MFRC522
- DHT11
- GPS Module
- Servo Motor
- Buzzer
- Camera
- Wi-Fi

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Python Flask
- Telegram Bot API

### Frontend
- React
- Next.js
- Tailwind CSS
- Vite
- Ethers.js

### Blockchain
- Solidity
- Hardhat
- Ethereum-compatible local blockchain
- Smart contract-based lifecycle management and hash anchoring

---

## Repository Structure

```text
supply-chain-iot-blockchain/
├── hardware_arduino_code/
│   ├── firmware.ino
│   ├── README.md
│   └── testing/
├── product-tracking/
│   ├── backend/
│   ├── contracts/
│   ├── frontend/
│   ├── tests/
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── supply-chain-final/
│   ├── Components/
│   ├── Conetxt/
│   ├── contracts/
│   ├── pages/
│   ├── public/
│   ├── styles/
│   ├── package.json
│   └── README.md
├── telegram_Flask_server/
│   ├── server.py
│   └── testing/
├── Data_Test_&_Evaluation/
├── .gitignore
├── README.md
└── package files / config files
```

---

## Smart Contract Role

The blockchain layer is central to trust and provenance. The system uses smart contracts to define:

- shipment states
- sender/receiver responsibilities
- validation rules
- deposit release logic
- on-chain record anchoring

The lifecycle states usually follow:

```text
Pending -> InTransit -> Completed
```

And anomalies can enter an alert state while preserving the main lifecycle path for auditability.

---

## Threat Model and Security Design

The system addresses several supply-chain security concerns:

### Data Tampering
Off-chain records are hashed and anchored on-chain, making tampering detectable.

### Unauthorized Physical Access
RFID access control prevents unauthorized entry and triggers alerts.

### Replay Attacks
The system checks RFID event freshness and prevents repeated reuse of stale credentials.

### Smart Contract Risks
Role-based lifecycle transitions and validation prevent invalid operations.

### GPS Spoofing
Route validation and deviation monitoring reduce the chance of fake location injection.

---

## Performance Notes

The framework was evaluated on a local blockchain environment and with a physical prototype. Important findings include:

- cryptographic hash operations are lightweight
- blockchain anchoring overhead remains low under controlled conditions
- alert delivery via Telegram is fast enough for near-real-time monitoring
- hardware layers dominate latency due to sensor acquisition and GPS fix time

This shows that the approach is practical for prototype and educational deployment while also demonstrating a clear path toward larger-scale deployment.

---

## Why This Project Is Important

This project combines four major trends in modern supply-chain engineering:

- IoT-based physical monitoring
- blockchain-based trust and immutability
- QR-code-based consumer verification
- real-time alerting for anomalies

This combination creates a more secure, transparent, and traceable supply-chain ecosystem.

---

## Use Cases

This system is relevant for:

- high-value cargo tracking
- cold-chain monitoring
- pharmaceutical transportation
- document and asset protection
- logistics and warehouse monitoring
- tamper-sensitive shipment verification
- product provenance tracking

---

## Getting Started

### Prerequisites
Install:
- Node.js
- npm
- Python
- MongoDB
- Hardhat
- Git
- MetaMask or compatible wallet

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd supply-chain-iot-blockchain
```

### 2. Start the Telegram Flask server
```bash
cd telegram_Flask_server
python server.py
```

### 3. Start the backend
```bash
cd product-tracking/backend
npm install
npm run dev
```

### 4. Start the frontend
```bash
cd product-tracking/frontend
npm install
npm run dev
```

### 5. Deploy and run the blockchain app
```bash
cd supply-chain-final
npm install
npm run dev
```

### 6. Compile and deploy smart contracts
```bash
cd product-tracking/contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

### 7. Upload hardware firmware
Open the ESP32 firmware in the hardware module and update:
- Wi-Fi SSID and password
- backend URL
- authorized RFID IDs

Then upload it to the ESP32.

---

## Future Work

Future enhancements can include:

- multi-organization blockchain deployment
- more secure authentication and role management
- cloud deployment
- predictive analytics
- route deviation detection
- more advanced sensor hardware
- stronger production-grade security
- integration with enterprise logistics systems

---

## Project Impact

This project demonstrates a practical and academic approach to secure logistics by combining:
- physical sensing
- digital traceability
- blockchain trust
- consumer visibility

It provides a strong foundation for research and real-world adoption in secure supply-chain operations.

---

## License

This project is intended for academic and demonstration purposes as part of a capstone project.



## Final Note

This repository demonstrates a complete prototype of a blockchain-enabled IoT supply chain framework that integrates sensing, traceability, verification, and alert communication into a single end-to-end system.
