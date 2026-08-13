import React, { useState, useEffect } from 'react';
import AddProductForm from './components/AddProductForm.jsx';
import ActiveProduct from './components/ActiveProduct.jsx';
import ProductTable from './components/ProductTable.jsx';
import WalletConnection from './components/WalletConnection.jsx';
import ProductVerification from './components/ProductVerification.jsx';
import ESP32SensorDisplay from './components/ESP32SensorDisplay.jsx';
import api from './api/api.js';

function App() {
  const [products, setProducts] = useState([]);
  const [qrModal, setQrModal] = useState({ visible: false, qrCode: null, productId: null });
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'consumer'
  const [showESP32Data, setShowESP32Data] = useState(false);

  // Fetch all products from backend
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = () => {
    fetchProducts();
    setShowESP32Data(true); // Show ESP32 data when a product is added
  };

  const handleProductCompleted = (productId, qrCode) => {
    fetchProducts();
    if (qrCode) {
      setQrModal({ visible: true, qrCode, productId });
    }
  };

  const handleWalletConnected = (walletInfo) => {
    setWalletConnected(true);
    console.log('Wallet connected:', walletInfo);
  };

  const activeProduct = products.find((p) => p.status === 'In Progress');

  const handleCloseModal = () => {
    setQrModal({ visible: false, qrCode: null, productId: null });
  };

  const downloadQRCode = () => {
    if (qrModal.qrCode) {
      const link = document.createElement('a');
      link.href = qrModal.qrCode;
      link.download = `product-${qrModal.productId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-center text-3xl font-bold mb-6">📦 Product Tracking System: ChainX.</h1>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔧 Admin Dashboard
          </button>
          <button
            onClick={() => setActiveTab('consumer')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'consumer'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔍 Product Verification
          </button>
        </div>
      </div>

      {/* Admin Dashboard */}
      {activeTab === 'admin' && (
        <div>
          <WalletConnection onWalletConnected={handleWalletConnected} />
          
          <AddProductForm onAdded={handleProductAdded} disabled={!!activeProduct} />
          
          {/* Show ESP32 sensor data when there are products */}
          <ESP32SensorDisplay 
            productId={activeProduct?.productId || products[0]?.productId}
            show={showESP32Data && products.length > 0}
          />
          
          {activeProduct && (
            <ActiveProduct product={activeProduct} onCompleted={handleProductCompleted} />
          )}
          <ProductTable products={products} onCompleted={handleProductCompleted} />
        </div>
      )}

      {/* Consumer Verification */}
      {activeTab === 'consumer' && (
        <div>
          <ProductVerification />
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Product {qrModal.productId} QR Code
            </h2>
            <div className="flex justify-center mb-4">
              <img src={qrModal.qrCode} alt="QR Code" className="w-64 h-64 object-contain border border-gray-200" />
            </div>
            <div className="flex justify-between">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                onClick={downloadQRCode}
              >
                Download QR Code
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;