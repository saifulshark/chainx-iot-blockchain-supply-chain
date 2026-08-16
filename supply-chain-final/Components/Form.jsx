import React, { useState } from "react";
import { useTracking } from "../Conetxt";

/**
 * Form component that allows users to create a new shipment. Fields include
 * receiver address, pickup location, destination, distance and price. On
 * submission the form calls the createShipment function from context.
 */
const Form = () => {
  const { createShipment } = useTracking();
  const [form, setForm] = useState({
    receiver: "",
    pickup: "",
    destination: "",
    distance: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      // Validate fields
      if (
        !form.receiver ||
        !form.pickup ||
        !form.destination ||
        !form.distance ||
        !form.price
      ) {
        setMessage("Please fill in all fields");
        setLoading(false);
        return;
      }
      // Create the shipment
      await createShipment({
        receiver: form.receiver,
        pickup: form.pickup,
        destination: form.destination,
        distance: form.distance,
        price: form.price,
      });
      setMessage("Shipment created successfully!");
      // Reset form
      setForm({ receiver: "", pickup: "", destination: "", distance: "", price: "" });
    } catch (error) {
      setMessage(error.message || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Create Shipment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Address</label>
          <input
            type="text"
            name="receiver"
            value={form.receiver}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
          <input
            type="text"
            name="pickup"
            value={form.pickup}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <input
            type="number"
            name="distance"
            value={form.distance}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETH)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            step="0.0001"
            min="0"
          />
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Shipment"}
        </button>
      </form>
    </div>
  );
};

export default Form;
