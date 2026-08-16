import React, { useState } from "react";
import { useTracking } from "../Conetxt";

/**
 * Component allowing the receiver to complete a shipment by ID.
 */
const CompleteShipment = () => {
  const { completeShipment } = useTracking();
  const [shipmentId, setShipmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!shipmentId) {
      setMessage("Please enter shipment ID");
      return;
    }
    try {
      setLoading(true);
      await completeShipment(Number(shipmentId));
      setMessage(`Shipment ${shipmentId} completed`);
      setShipmentId("");
    } catch (error) {
      setMessage(error.message || "Failed to complete shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-lg font-semibold mb-4">Complete Shipment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID</label>
          <input
            type="number"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            min="0"
          />
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Completing..." : "Complete Shipment"}
        </button>
      </form>
    </div>
  );
};

export default CompleteShipment;
