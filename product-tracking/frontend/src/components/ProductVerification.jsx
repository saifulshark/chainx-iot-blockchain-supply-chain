import React, { useState } from 'react';
import api from '../api/api.js';

const ProductVerification = () => {
  const [searchType, setSearchType] = useState('productId');
  const [searchValue, setSearchValue] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyProduct = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('Please enter a value to search');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      let response;
      
      if (searchType === 'productId') {
        response = await api.get(`/products/verify/${searchValue}`);
      } else if (searchType === 'hash') {
        response = await api.post('/products/verify-hash', { hash: searchValue });
      } else if (searchType === 'txHash') {
        response = await api.post('/products/verify-transaction', { transactionHash: searchValue });
      }

      setVerificationResult(response.data);
    } catch (error) {
      console.error('Verification failed:', error);
      if (error.response?.status === 404) {
        setError('Product not found or not verified on blockchain');
      } else {
        setError(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setVerificationResult(null);
    setError('');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
        🔍 Product Authentication Verification
      </h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>For Consumers:</strong> Verify product authenticity by searching with Product ID, Blockchain Hash, or Transaction Hash.
              This will confirm if the product data is securely stored on the blockchain.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleVerifyProduct} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Method
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="productId">Product ID</option>
            <option value="hash">Blockchain Hash</option>
            <option value="txHash">Transaction Hash</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {searchType === 'productId' ? 'Product ID' : 
             searchType === 'hash' ? 'Blockchain Hash' : 'Transaction Hash'}
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={
              searchType === 'productId' ? 'Enter Product ID (e.g., 12345)' :
              searchType === 'hash' ? 'Enter Blockchain Hash' : 'Enter Transaction Hash'
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              '🔍 Verify Product'
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {verificationResult && (
        <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-green-800">
              ✅ Product Verified Successfully!
            </h3>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Product Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Product ID:</strong> {verificationResult.productId}</div>
                  <div><strong>Sender Cert No:</strong> {verificationResult.senderCertNo}</div>
                  <div><strong>Receiver Cert No:</strong> {verificationResult.receiverCertNo}</div>
                  <div><strong>Status:</strong> 
                    <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {verificationResult.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Blockchain Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Created:</strong> {formatDateTime(verificationResult.createdAt)}</div>
                  <div><strong>Completed:</strong> {formatDateTime(verificationResult.updatedAt)}</div>
                  <div><strong>Blockchain Hash:</strong> 
                    <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded break-all">
                      {verificationResult.blockchainHash?.substring(0, 20)}...
                    </code>
                  </div>
                  <div><strong>Transaction Hash:</strong> 
                    <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded break-all">
                      {verificationResult.blockchainTx?.substring(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {verificationResult.gpsHistory && verificationResult.gpsHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">GPS Tracking History</h4>
                <div className="max-h-32 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Latitude</th>
                        <th className="px-2 py-1 text-left">Longitude</th>
                        <th className="px-2 py-1 text-left">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {verificationResult.gpsHistory.slice(-5).map((gps, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-2 py-1">{gps.latitude.toFixed(6)}</td>
                          <td className="px-2 py-1">{gps.longitude.toFixed(6)}</td>
                          <td className="px-2 py-1">{formatDateTime(gps.datetime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {verificationResult.gpsHistory.length > 5 && (
                    <p className="text-xs text-gray-500 mt-1">Showing last 5 GPS records</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Authentication Status:</strong> This product has been verified against the blockchain. 
                The product data is confirmed as authentic and has been securely stored on the blockchain.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVerification;
