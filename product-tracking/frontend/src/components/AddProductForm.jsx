import React, { useState } from 'react';
import api from '../api/api.js';

/*
 * Form component for creating a new product. Collects the sender and
 * receiver certification numbers along with a numeric product ID. When
 * submitted successfully it notifies the parent via the onAdded
 * callback. The button is disabled when an active product is being
 * tracked.
 */
function AddProductForm({ onAdded, disabled }) {
  const [senderCertNo, setSenderCertNo] = useState('');
  const [receiverCertNo, setReceiverCertNo] = useState('');
  const [productId, setProductId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const pid = parseInt(productId, 10);
      await api.post('/products', { productId: pid, senderCertNo, receiverCertNo });
      // Reset fields
      setSenderCertNo('');
      setReceiverCertNo('');
      setProductId('');
      onAdded();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Sender Cert No</label>
          <input
            type="text"
            value={senderCertNo}
            onChange={(e) => setSenderCertNo(e.target.value)}
            disabled={disabled}
            required
            className="border rounded w-full p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Receiver Cert No</label>
          <input
            type="text"
            value={receiverCertNo}
            onChange={(e) => setReceiverCertNo(e.target.value)}
            disabled={disabled}
            required
            className="border rounded w-full p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product ID</label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={disabled}
            required
            className="border rounded w-full p-2"
          />
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={disabled}
            className={`mt-2 px-4 py-2 rounded text-white ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductForm;