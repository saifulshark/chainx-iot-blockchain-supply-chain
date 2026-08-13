import React, { useState, useEffect } from 'react';
import api from '../api/api.js';

const ESP32SensorDisplay = ({ productId, show }) => {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [esp32Status, setEsp32Status] = useState('unknown');
  const [gpsCollectionStatus, setGpsCollectionStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState(null);

  // Fetch sensor data from ESP32 via backend
  const fetchSensorData = async () => {
    if (!show) return;
    
    setLoading(true);
    // Don't clear error immediately - keep previous data visible
    
    try {
      const response = await api.get('/esp32/sensors');
      if (response.data) {
        setSensorData(response.data);
        setEsp32Status(response.data.esp32Status || 'connected');
        setLastSuccessfulFetch(new Date().toISOString());
        setRetryCount(0); // Reset retry count on success
        // Clear error only on successful fetch
        setError('');
      }
    } catch (error) {
      console.error('Failed to fetch ESP32 sensor data:', error);
      
      setRetryCount(prev => prev + 1);
      
      // More specific error handling
      if (error.response?.status === 404) {
        setError('ESP32 service not found. Check if backend is running.');
      } else if (error.response?.status === 500) {
        setError('Backend server error. ESP32 might be disconnected.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend server.');
      } else {
        setError(`Connection error: ${error.message}`);
      }
      
      // Only set disconnected if we don't have existing data or too many retries
      if (!sensorData || retryCount > 5) {
        setEsp32Status('disconnected');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch GPS collection status
  const fetchGpsStatus = async () => {
    try {
      const response = await api.get('/esp32/gps/status');
      setGpsCollectionStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch GPS collection status:', error);
      // Don't set error state for GPS status failures
    }
  };

  // Control GPS collection
  const toggleGpsCollection = async (start) => {
    try {
      const endpoint = start ? '/esp32/gps/start' : '/esp32/gps/stop';
      await api.post(endpoint);
      fetchGpsStatus(); // Refresh status
    } catch (error) {
      console.error('Failed to control GPS collection:', error);
    }
  };

  // Auto-refresh sensor data every 5 seconds when component is visible
  useEffect(() => {
    if (!show) return;

    // Initial fetch
    fetchSensorData();
    fetchGpsStatus();
    
    // Set up interval
    const interval = setInterval(() => {
      fetchSensorData();
      // Fetch GPS status less frequently to reduce load
      if (Math.floor(Date.now() / 1000) % 30 === 0) {
        fetchGpsStatus();
      }
    }, 5000);
    
    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [show, retryCount]); // Depend on show and retryCount

  if (!show) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'disabled': return 'text-gray-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'disabled': return '⚪';
      default: return '🟡';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-blue-600">
          📡 ESP32 Real-time Sensor Data - Product {productId}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${getStatusColor(esp32Status)}`}>
            {getStatusIcon(esp32Status)} ESP32 {esp32Status}
          </span>
          <button
            onClick={fetchSensorData}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '⟳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* GPS Collection Status */}
      {gpsCollectionStatus && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-800">GPS Auto-Collection</h4>
              <p className="text-sm text-green-700">
                Status: <strong>{gpsCollectionStatus.gpsCollection.isRunning ? 'Running' : 'Stopped'}</strong>
                {gpsCollectionStatus.gpsCollection.isRunning && (
                  <span> • Next update in 2 minutes • Tracking {gpsCollectionStatus.activeProducts} active products</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              {!gpsCollectionStatus.gpsCollection.isRunning ? (
                <button
                  onClick={() => toggleGpsCollection(true)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  ▶️ Start GPS Collection
                </button>
              ) : (
                <button
                  onClick={() => toggleGpsCollection(false)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  ⏸️ Stop GPS Collection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              {retryCount > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Retry attempts: {retryCount} | 
                  {lastSuccessfulFetch && (
                    <span> Last successful fetch: {Math.floor((Date.now() - new Date(lastSuccessfulFetch).getTime()) / 1000)}s ago</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && !sensorData && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading sensor data...</span>
        </div>
      )}

      {!loading && !sensorData && !error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-500 mb-2">📡</div>
            <p className="text-gray-600">Waiting for sensor data...</p>
            <button
              onClick={fetchSensorData}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {sensorData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* GPS Data */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              🗺️ GPS Location
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Latitude:</strong> {sensorData.gps?.latitude?.toFixed(6) || 'N/A'}</div>
              <div><strong>Longitude:</strong> {sensorData.gps?.longitude?.toFixed(6) || 'N/A'}</div>
              <div><strong>Updated:</strong> {sensorData.gps?.datetime ? new Date(sensorData.gps.datetime).toLocaleString() : 'N/A'}</div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  sensorData.gps?.latitude && sensorData.gps?.longitude ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {sensorData.gps?.latitude && sensorData.gps?.longitude ? '📍 Location Fixed' : '❌ No GPS Signal'}
                </span>
              </div>
            </div>
          </div>

          {/* DHT Sensor Data */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              🌡️ Environmental Conditions
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Temperature:</strong> {
                sensorData.dht?.temperature !== null && sensorData.dht?.temperature !== undefined ? 
                `${sensorData.dht.temperature.toFixed(1)}°C` : 'Waiting for next sample...'
              }</div>
              <div><strong>Humidity:</strong> {
                sensorData.dht?.humidity !== null && sensorData.dht?.humidity !== undefined ? 
                `${sensorData.dht.humidity.toFixed(1)}%` : 'Waiting for next sample...'
              }</div>
              <div className="mt-2">
                <div className="flex items-center space-y-1">
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Temperature</span>
                      <span>{sensorData.dht?.temperature !== null ? `${sensorData.dht.temperature.toFixed(1)}°C` : 'N/A'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (sensorData.dht?.temperature || 0) > 35 ? 'bg-red-500' : 
                          (sensorData.dht?.temperature || 0) > 30 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${sensorData.dht?.temperature ? Math.min(Math.max((sensorData.dht.temperature) / 40 * 100, 5), 100) : 5}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-y-1 mt-2">
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Humidity</span>
                      <span>{sensorData.dht?.humidity !== null ? `${sensorData.dht.humidity.toFixed(1)}%` : 'N/A'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${sensorData.dht?.humidity ? Math.min(sensorData.dht.humidity, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              {sensorData.lastSensorSample && (
                <div className="text-xs text-blue-600 mt-2">
                  <strong>Last sensor reading:</strong> {Math.floor((Date.now() - new Date(sensorData.lastSensorSample).getTime()) / 60000)} minutes ago
                </div>
              )}
            </div>
          </div>

          {/* RFID Data */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              📱 RFID Access Control
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Card UID:</strong> {sensorData.rfid?.cardId || 'No card detected'}</div>
              <div><strong>Last Scan:</strong> {sensorData.rfid?.lastRead ? new Date(sensorData.rfid.lastRead).toLocaleString() : 'N/A'}</div>
              <div><strong>Access Status:</strong> {sensorData.rfid?.accessStatus || 'N/A'}</div>
              <div className="mt-2 space-y-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  sensorData.rfid?.cardId ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {sensorData.rfid?.cardId ? '📱 Card Present' : '❌ No Card'}
                </span>
                {sensorData.rfid?.authorized !== undefined && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                    sensorData.rfid.authorized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {sensorData.rfid.authorized ? '✅ Authorized' : '🚫 Denied'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ESP32 Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              ⚙️ ESP32 Device Status
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Connection:</strong> 
                <span className={`ml-1 ${getStatusColor(esp32Status)}`}>
                  {esp32Status}
                </span>
              </div>
              <div><strong>Device IP:</strong> {sensorData.esp32IP || 'Unknown'}</div>
              <div><strong>Last Update:</strong> {sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleTimeString() : 'N/A'}</div>
              <div><strong>Data Source:</strong> 
                <span className={`ml-1 ${
                  esp32Status === 'connected' ? 'text-green-600' : 
                  esp32Status === 'demo' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {esp32Status === 'connected' ? '📡 Live ESP32' : 
                   esp32Status === 'demo' ? '🧪 Demo Data' : '❌ Disconnected'}
                </span>
              </div>
              <div><strong>Sampling Interval:</strong> 3 minutes</div>
              {sensorData.lastSensorSample && (
                <div><strong>Last Sensor Read:</strong> {Math.floor((Date.now() - new Date(sensorData.lastSensorSample).getTime()) / 60000)} minutes ago</div>
              )}
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
              📈 Sensor Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Active Sensors:</strong> 
                {[
                  sensorData.gps?.latitude ? 'GPS' : null,
                  sensorData.dht?.temperature ? 'DHT11' : null,
                  sensorData.rfid?.cardId ? 'RFID' : null
                ].filter(Boolean).join(', ') || 'None'}
              </div>
              <div><strong>GPS Valid:</strong> 
                <span className={`ml-1 ${sensorData.gps?.latitude ? 'text-green-600' : 'text-red-600'}`}>
                  {sensorData.gps?.latitude ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div><strong>Temperature Alert:</strong> 
                <span className={`ml-1 ${
                  (sensorData.dht?.temperature || 0) > 35 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {(sensorData.dht?.temperature || 0) > 35 ? '🚨 High Temp' : '✅ Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!sensorData && error && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">❌</div>
          <p className="text-gray-600 mb-4">Unable to load sensor data</p>
          <button
            onClick={fetchSensorData}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Retrying...' : 'Retry Connection'}
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Real-time ESP32 Integration:</strong> This data is collected directly from your ESP32 device via HTTP API. 
          GPS coordinates are automatically stored every 2 minutes for active products. DHT sensor data is sampled every 3 minutes 
          to conserve power, while RFID access control operates in real-time for your supply chain tracking.
        </p>
        {sensorData?.esp32IP && (
          <p className="text-xs text-blue-600 mt-1">
            <strong>ESP32 Device:</strong> http://{sensorData.esp32IP} - 
            <a 
              href={`http://${sensorData.esp32IP}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              View ESP32 Dashboard
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ESP32SensorDisplay;
