# Supply Chain Management DApp

A decentralized supply chain management application built with Next.js and Ethereum smart contracts. The project allows users to create shipments, start and complete delivery flow, track shipment status, and verify shipment details through blockchain-based records.

This project is designed to demonstrate how blockchain technology can improve transparency, trust, and traceability in supply-chain logistics.

---

## Project Overview

The DApp provides a simple but practical shipping lifecycle:

1. Create a shipment with sender, receiver, pickup, destination, distance, and deposit.
2. Start the shipment when goods are in transit.
3. Complete the shipment when it reaches the destination.
4. Return the deposit to the sender after delivery.
5. View shipment records and ownership details from the frontend.

The blockchain layer stores shipment data and contract logic, while the frontend provides an easy-to-use user interface for interacting with the smart contract.

---

## Features

- Create shipment records
- Store shipment metadata on the blockchain
- Start shipment movement
- Complete shipment delivery
- View all shipments
- View shipments for the current wallet/user
- View shipment details by ID
- Deposit-based shipment flow
- Integration with wallet connection using Ethereum-compatible wallets

---

## System Architecture

```text
+----------------------+
| Next.js Frontend     |
| - Shipment form      |
| - Shipment table     |
| - Start/Complete UI  |
| - Wallet integration |
+----------+-----------+
           |
           v
+----------+-----------+
| Smart Contract       |
| Tracking.sol         |
| - createShipment     |
| - startShipment      |
| - completeShipment   |
| - getShipment        |
| - getAllShipments    |
+----------+-----------+
           |
           v
+----------+-----------+
| Blockchain Network   |
| Ethereum / Hardhat   |
| Transaction history  |
| Contract state       |
+----------------------+
```

---

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Ethers.js
- Web3Modal

### Smart Contract
- Solidity
- Hardhat

### Development Tools
- Node.js
- npm
- Hardhat Toolbox
- PostCSS
- Tailwind CSS

---

## Project Structure

```text
supply-chain-final/
├── Components/
│   ├── CompleteShipment.jsx
│   ├── Footer.jsx
│   ├── Form.jsx
│   ├── GetShipment.jsx
│   ├── NavBar.jsx
│   ├── Profile.jsx
│   ├── Services.jsx
│   ├── StartShipment.jsx
│   ├── Table.jsx
│   └── SVG/
├── Conetxt/
│   ├── config.json
│   ├── index.js
│   └── TrackingContext.js
├── Images/
├── contracts/
│   ├── Tracking.sol
│   └── tests/
├── pages/
│   ├── _app.js
│   └── index.js
├── public/
├── scripts/
│   └── deploy.js
├── styles/
│   └── globals.css
├── .gitignore
├── hardhat.config.js
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── test/
│   └── Lock.js
├── artifacts/
├── cache/
└── node_modules/
```

---

## Smart Contract Overview

The contract file is located at:

```text
contracts/Tracking.sol
```

It defines a `Tracking` smart contract with:

- Shipment creation
- Shipment status transitions
- Deposit handling
- Sender/receiver validation
- Shipment lookup functions

### Shipment status states

```text
Pending -> InTransit -> Completed
```

### Main contract functions

- `createShipment(...)`
- `startShipment(...)`
- `completeShipment(...)`
- `getShipment(...)`
- `getAllShipments()`
- `getMyShipments()`

---

## Prerequisites

Before running this project, install:

- Node.js (v18 or later)
- npm
- Git
- MetaMask or another Ethereum wallet

---

## Installation

### 1. Install dependencies

```bash
cd supply-chain-final
npm install
```

---

## Run the Application

### Start the frontend

```bash
npm run dev
```

This will run the Next.js app in development mode.

---

## Smart Contract Deployment

The project includes Hardhat configuration and deployment script.

### Compile the contract

```bash
npx hardhat compile
```

### Deploy the contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

or for test networks:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Environment Configuration

If your project uses private keys or RPC URLs, create a `.env` file in the project root:

```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://your-rpc-url
```

Then configure the values inside the Hardhat config file if needed.

---

## How the DApp Works

### 1. Create Shipment
The user enters:

- receiver address
- pickup location
- destination
- distance
- price

The app creates a shipment and locks the required deposit.

### 2. Start Shipment
The sender starts the shipment to mark it as in transit.

### 3. Complete Shipment
The receiver completes the shipment and the deposit is released back to the sender.

### 4. View Shipment Records
The UI displays shipment details and allows users to inspect records from the blockchain and the local frontend context.

---

## Usage Flow

1. Connect wallet
2. Create shipment
3. View shipment on the dashboard
4. Start shipment
5. Complete shipment
6. Verify final delivery state

---

## Notes

- This project is a capstone demonstration of a blockchain-enabled supply chain solution.
- The contract logic is intentionally simple and easy to understand for academic and learning purposes.
- For production deployment, additional security checks, frontend validation, and error handling should be added.

---
## Project Visual Frontend Output/View:
![alt text](<img1 (2).png>) ![alt text](<img2 (1).png>) ![alt text](<img3 (2).png>) ![alt text](<img4 (1).png>)![alt text](<img8 (1).png>)
---

## Project Relevance

This project demonstrates how blockchain can be used in supply-chain logistics to improve:

- transparency
- traceability
- accountability
- delivery verification
- trust between sender and receiver

---

## License

This project is intended for academic and demonstration purposes as part of the capstone project.

---

## Contributors

Capstone Project Team
