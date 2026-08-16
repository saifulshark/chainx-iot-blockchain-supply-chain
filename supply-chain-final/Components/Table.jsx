import React from "react";
import { ethers } from "ethers";
import { useTracking } from "../Conetxt";

/**
 * Table component to display a list of shipments. It provides controls to start
 * or complete shipments depending on the current user and shipment status.
 * @param {Array} props.shipments List of shipment objects returned from the contract
 */
const Table = ({ shipments }) => {
  const {
    currentAccount,
    startShipment,
    completeShipment,
    fetchAllShipments,
    fetchMyShipments,
  } = useTracking();

  const handleStart = async (id) => {
    await startShipment(id);
    await fetchAllShipments();
    await fetchMyShipments();
  };

  const handleComplete = async (id) => {
    await completeShipment(id);
    await fetchAllShipments();
    await fetchMyShipments();
  };

  const getStatusLabel = (status) => {
    // Status is stored as a number (0 = Pending, 1 = InTransit, 2 = Completed)
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

  const formatTimestamp = (timestamp) => {
    const timeNum = Number(timestamp);
    if (!timeNum) return "N/A";
    const date = new Date(timeNum * 1000);
    return date.toLocaleString();
  };

  const formatEther = (value) => {
    try {
      return ethers.utils.formatEther(value);
    } catch {
      return value;
    }
  };

  return (
    <div className="overflow-x-auto mt-8">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Sender</th>
            <th className="px-4 py-2 text-left">Receiver</th>
            <th className="px-4 py-2 text-left">Pickup</th>
            <th className="px-4 py-2 text-left">Destination</th>
            <th className="px-4 py-2 text-left">Distance</th>
            <th className="px-4 py-2 text-left">Price (ETH)</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Created</th>
            <th className="px-4 py-2 text-left">Completed</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {shipments && shipments.length > 0 ? (
            shipments.map((s, index) => {
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{index}</td>
                  <td className="px-4 py-2 font-mono">{s.sender?.slice(0, 6)}...{s.sender?.slice(-4)}</td>
                  <td className="px-4 py-2 font-mono">{s.receiver?.slice(0, 6)}...{s.receiver?.slice(-4)}</td>
                  <td className="px-4 py-2">{s.pickup}</td>
                  <td className="px-4 py-2">{s.destination}</td>
                  <td className="px-4 py-2">{s.distance?.toString()}</td>
                  <td className="px-4 py-2">{formatEther(s.price)}</td>
                  <td className="px-4 py-2">{getStatusLabel(s.status)}</td>
                  <td className="px-4 py-2">{formatTimestamp(s.pickupTime)}</td>
                  <td className="px-4 py-2">{formatTimestamp(s.arrivalTime)}</td>
                  <td className="px-4 py-2">
                    {Number(s.status) === 0 && currentAccount && currentAccount.toLowerCase() === s.sender?.toLowerCase() && (
                      <button
                        onClick={() => handleStart(index)}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-md text-white"
                      >
                        Start
                      </button>
                    )}
                    {Number(s.status) === 1 && currentAccount && currentAccount.toLowerCase() === s.receiver?.toLowerCase() && (
                      <button
                        onClick={() => handleComplete(index)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-white"
                      >
                        Complete
                      </button>
                    )}
                    {Number(s.status) === 2 && <span className="text-gray-500">--</span>}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" className="px-4 py-6 text-center text-gray-500">
                No shipments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
