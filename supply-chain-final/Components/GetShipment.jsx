import React, { useState } from "react";
import { ethers } from "ethers";
import { useTracking } from "../Conetxt";

/**
 * Component to fetch and display details of a shipment by ID.
 */
const GetShipment = () => {
  const { getShipment } = useTracking();
  const [shipmentId, setShipmentId] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchShipment = async () => {
    setMessage("");
    if (shipmentId === "") {
      setMessage("Please enter an ID");
      return;
    }
    try {
      setLoading(true);
      const s = await getShipment(Number(shipmentId));
      setShipment(s);
    } catch (error) {
      setMessage(error.message || "Failed to fetch shipment");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const formatEther = (val) => {
    try {
      return ethers.utils.formatEther(val);
    } catch {
      return val;
    }
  };

  const formatTimestamp = (t) => {
    const n = Number(t);
    if (!n) return "N/A";
    return new Date(n * 1000).toLocaleString();
  };

  const getStatusLabel = (status) => {
    switch (Number(status)) {
      case 0:
        return "Pending";
      case 1:
        return "In Transit";
      case 2:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-lg font-semibold mb-4">Get Shipment</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="number"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          placeholder="Enter shipment ID"
        />
        <button
          onClick={fetchShipment}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Get"}
        </button>
      </div>
      {message && <p className="text-sm text-red-600 mb-2">{message}</p>}
      {shipment && (
        <div className="text-sm space-y-2">
          <p>
            <strong>Sender:</strong> {shipment.sender}
          </p>
          <p>
            <strong>Receiver:</strong> {shipment.receiver}
          </p>
          <p>
            <strong>Pickup:</strong> {shipment.pickup}
          </p>
          <p>
            <strong>Destination:</strong> {shipment.destination}
          </p>
          <p>
            <strong>Distance:</strong> {shipment.distance?.toString()}
          </p>
          <p>
            <strong>Price:</strong> {formatEther(shipment.price)} ETH
          </p>
          <p>
            <strong>Status:</strong> {getStatusLabel(shipment.status)}
          </p>
          <p>
            <strong>Created:</strong> {formatTimestamp(shipment.pickupTime)}
          </p>
          <p>
            <strong>Completed:</strong> {formatTimestamp(shipment.arrivalTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default GetShipment;
