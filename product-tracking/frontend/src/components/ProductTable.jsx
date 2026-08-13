import React from 'react';
import api from '../api/api.js';

/*
 * Displays a list of all products stored in the database. Provides an
 * action column where the user can either complete an in-progress
 * product or view the QR code for a completed product. When a QR
 * needs to be displayed the onCompleted callback is re-used to open
 * the modal with the image.
 */
function ProductTable({ products, onCompleted }) {
  const handleComplete = async (productId) => {
    try {
      const res = await api.post(`/products/${productId}/complete`);
      const qrCode = res.data.qrCode;
      onCompleted(productId, qrCode);
    } catch (error) {
      console.error('Failed to complete product:', error);
    }
  };

  const handleViewQr = async (productId) => {
    try {
      // Use the dedicated QR endpoint for completed products
      const res = await api.get(`/products/${productId}/qr`);
      const qrCode = res.data.qrCode;
      onCompleted(productId, qrCode);
    } catch (error) {
      console.error('Failed to get QR code:', error);
    }
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Product History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sender Cert No</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Receiver Cert No</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.productId} className="whitespace-nowrap">
                <td className="px-3 py-2 text-sm text-gray-900">{p.productId}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{p.senderCertNo}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{p.receiverCertNo}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{p.status}</td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {p.status === 'In Progress' ? (
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => handleComplete(p.productId)}
                    >
                      Complete
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => handleViewQr(p.productId)}
                    >
                      View QR
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="px-3 py-2 text-center text-sm text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;