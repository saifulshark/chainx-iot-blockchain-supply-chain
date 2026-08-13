import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import walletService from '../services/walletService.js';

/*
 * Displays details for the currently active product (status === 'In Progress').
 * Shows the list of GPS points collected so far and includes a button
 * to complete the product. GPS data is automatically refreshed every
 * five minutes by calling the backend endpoint.
 */
function ActiveProduct({ product, onCompleted }) {
  const [gpsHistory, setGpsHistory] = useState(product.gpsHistory || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update GPS history when product changes
  useEffect(() => {
    setGpsHistory(product.gpsHistory || []);
  }, [product]);

  // Poll new GPS data every 5 minutes
  useEffect(() => {
    const fetchGpsData = async () => {
      if (!product?.productId) return;
      
      console.log('Fetching GPS data for product:', product.productId, 'at', new Date().toLocaleTimeString());
      
      try {
        const response = await api.post(`/products/${product.productId}/gps`);
        const updatedProduct = response.data;
        setGpsHistory(updatedProduct.gpsHistory || []);
        console.log('GPS data updated successfully');
      } catch (error) {
        console.error('Error fetching GPS data:', error);
      }
    };

    if (product?.productId) {
      fetchGpsData();
      // Set up interval to fetch GPS data every 5 minutes
      const interval = setInterval(fetchGpsData, 5 * 60 * 1000);
      
      console.log('GPS auto-fetch started for product:', product.productId);
      
      return () => {
        clearInterval(interval);
        console.log('GPS auto-fetch stopped');
      };
    }
  }, [product?.productId]);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if wallet is connected
      if (!walletService.getConnectionStatus()) {
        throw new Error('Please connect your wallet first to complete the product');
      }

      // First, get the product hash from backend
      const hashResponse = await api.get(`/products/${product.productId}/hash`);
      const hash = hashResponse.data.hash;

      // Store hash on blockchain using user's wallet
      const blockchainResult = await walletService.storeHash(product.productId, hash);
      
      // Then complete the product on backend with the transaction hash
      const completeResponse = await api.post(`/products/${product.productId}/complete`, {
        transactionHash: blockchainResult.transactionHash
      });
      
      const qrCode = completeResponse.data.qrCode;
      onCompleted(product.productId, qrCode);
      
    } catch (error) {
      console.error('Failed to complete product:', error);
      setError(error.message || 'Failed to complete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Active Product Tracking</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div><strong>Product ID:</strong> {product.productId}</div>
        <div><strong>Sender:</strong> {product.senderCertNo}</div>
        <div><strong>Receiver:</strong> {product.receiverCertNo}</div>
        <div><strong>Status:</strong> {product.status}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Latitude</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Longitude</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gpsHistory.map((entry, idx) => (
              <tr key={idx} className="whitespace-nowrap">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {new Date(entry.datetime).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{entry.latitude}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{entry.longitude}</td>
              </tr>
            ))}
            {gpsHistory.length === 0 && (
              <tr>
                <td colSpan="3" className="px-3 py-2 text-center text-sm text-gray-500">No GPS data yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleComplete}
        disabled={loading || !walletService.getConnectionStatus()}
        className={`mt-4 px-4 py-2 rounded text-white ${
          loading || !walletService.getConnectionStatus()
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Completing...' : !walletService.getConnectionStatus() ? 'Connect Wallet to Complete' : 'Complete Product'}
      </button>
    </div>
  );
}

export default ActiveProduct;