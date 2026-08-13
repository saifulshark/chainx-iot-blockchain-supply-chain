import { ethers } from 'ethers';

// Contract ABI - same as in backend
const CONTRACT_ABI = [
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

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.isConnected = false;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask wallet
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];
      this.isConnected = true;

      // Initialize contract
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);

      // Check if we're on the correct network
      await this.checkNetwork();

      return {
        account: this.account,
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Check if we're on the correct network (localhost:8545)
  async checkNetwork() {
    if (!this.provider) return;

    const network = await this.provider.getNetwork();
    const expectedChainId = 31337; // Hardhat local network chain ID

    if (Number(network.chainId) !== expectedChainId) {
      try {
        // Try to switch to the correct network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${expectedChainId.toString(16)}`,
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null,
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.isConnected = false;
  }

  // Store hash on blockchain
  async storeHash(productId, hash) {
    if (!this.contract) {
      throw new Error('Wallet not connected or contract not initialized');
    }

    try {
      const tx = await this.contract.storeHash(productId, hash);
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to store hash on blockchain:', error);
      throw error;
    }
  }

  // Get hash from blockchain
  async getHash(productId) {
    if (!this.contract) {
      throw new Error('Wallet not connected or contract not initialized');
    }

    try {
      const hash = await this.contract.getHash(productId);
      return hash;
    } catch (error) {
      console.error('Failed to get hash from blockchain:', error);
      throw error;
    }
  }

  // Get current account
  getCurrentAccount() {
    return this.account;
  }

  // Check if wallet is connected
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
const walletService = new WalletService();
export default walletService;
