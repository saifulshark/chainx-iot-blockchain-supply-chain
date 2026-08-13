import React, { useState, useEffect } from 'react';
import walletService from '../services/walletService.js';

function WalletConnection({ onWalletConnected }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection();
    
    // Listen for account changes
    if (walletService.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (walletService.isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (walletService.isMetaMaskInstalled()) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      disconnect();
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      walletService.account = accounts[0];
    }
  };

  const handleChainChanged = () => {
    // Reload the page when network changes
    window.location.reload();
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await walletService.connectWallet();
      setIsConnected(result.isConnected);
      setAccount(result.account);
      
      if (onWalletConnected) {
        onWalletConnected(result);
      }
    } catch (error) {
      setError(error.message);
      console.error('Wallet connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    walletService.disconnect();
    setIsConnected(false);
    setAccount(null);
    setError(null);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletService.isMetaMaskInstalled()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              MetaMask Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please install MetaMask to interact with the blockchain features.{' '}
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline text-yellow-700 hover:text-yellow-600"
                >
                  Download MetaMask
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between bg-white shadow rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
            </h3>
            {account && (
              <p className="text-sm text-gray-500">
                {formatAddress(account)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Connection Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletConnection;
