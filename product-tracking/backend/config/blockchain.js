import { ethers } from 'ethers';

/*
 * This module creates a connection to the Ethereum Sepolia testnet and
 * initializes the ProductHash contract instance. The ABI is defined
 * manually to avoid importing build artifacts. Ensure CONTRACT_ADDRESS,
 * SEPOLIA_RPC_URL and PRIVATE_KEY are set in your environment.
 */

const abi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "productId", "type": "uint256" },
      { "internalType": "string", "name": "hash", "type": "string" }
    ],
    "name": "storeHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "productId", "type": "uint256" }
    ],
    "name": "getHash",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Lazy initialized contract
let contractInstance;

export function getContract() {
  if (contractInstance) return contractInstance;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error('Blockchain environment variables are not fully configured');
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  contractInstance = new ethers.Contract(contractAddress, abi, wallet);
  return contractInstance;
}