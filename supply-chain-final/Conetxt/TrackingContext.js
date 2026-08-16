import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

// This context provides an interface between the React frontend and the Tracking
// smart contract. It relies on a config.json file written by the Hardhat
// deployment script which contains the deployed contract address and ABI.
import config from "./config.json";

// Create a React context for our tracking DApp
const TrackingContext = createContext();

/**
 * Returns a new ethers.Contract connected to the user's wallet. If the user is not
 * connected, this will throw. Use `connectWallet` first.
 */
const getEthereumContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(config.address, config.abi, signer);
  return contract;
};

export const TrackingProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allShipments, setAllShipments] = useState([]);
  const [myShipments, setMyShipments] = useState([]);

  /**
   * Prompt user to connect their wallet via Web3Modal.
   */
  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const accounts = await provider.listAccounts();
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Wallet connection failed", error);
      throw error;
    }
  };

  /**
   * Check if wallet is already connected and update the account state.
   */
  const checkIfWalletConnected = async () => {
    if (!window.ethereum) return console.warn("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error checking wallet connection", error);
    }
  };

  /**
   * Create a new shipment on the blockchain.
   * @param {Object} shipment Details of the shipment
   * @param {string} shipment.receiver Receiver address
   * @param {string} shipment.pickup Pickup location description
   * @param {string} shipment.destination Destination location description
   * @param {number|string} shipment.distance Distance in arbitrary units (converted to BigNumber)
   * @param {string} shipment.price Price in ETH (string to preserve decimals)
   */
  const createShipment = async ({ receiver, pickup, destination, distance, price }) => {
    try {
      if (!currentAccount) throw new Error("Wallet not connected");
      const contract = await getEthereumContract();
      const parsedPrice = ethers.utils.parseEther(price.toString());
      const tx = await contract.createShipment(
        receiver,
        pickup,
        destination,
        ethers.BigNumber.from(distance),
        parsedPrice,
        { value: parsedPrice }
      );
      await tx.wait();
    } catch (error) {
      console.error("Failed to create shipment", error);
      throw error;
    }
  };

  /**
   * Start an existing shipment. Only the sender can start their shipment.
   * @param {number} id Shipment ID to start
   */
  const startShipment = async (id) => {
    try {
      const contract = await getEthereumContract();
      const tx = await contract.startShipment(id);
      await tx.wait();
    } catch (error) {
      console.error("Failed to start shipment", error);
      throw error;
    }
  };

  /**
   * Complete an in-transit shipment. Only the receiver can complete their shipment.
   * @param {number} id Shipment ID to complete
   */
  const completeShipment = async (id) => {////used gas limit: 300000
    try {
      const contract = await getEthereumContract();
      const tx = await contract.completeShipment(id);
      await tx.wait();
    } catch (error) {
      console.error("Failed to complete shipment", error);
      throw error;
    }
  };

  /**
   * Fetch all shipments from the blockchain and update state.
   */
  const fetchAllShipments = async () => {
    try {
      const contract = await getEthereumContract();
      const shipments = await contract.getAllShipments();
      setAllShipments(shipments);
    } catch (error) {
      console.error("Failed to fetch all shipments", error);
    }
  };

  /**
   * Fetch shipments associated with the current user and update state.
   */
  const fetchMyShipments = async () => {
    try {
      if (!currentAccount) return;
      const contract = await getEthereumContract();
      const shipments = await contract.getMyShipments();
      setMyShipments(shipments);
    } catch (error) {
      console.error("Failed to fetch user shipments", error);
    }
  };

  /**
   * Fetch a single shipment by its ID. Useful for queries.
   * @param {number} id The ID of the shipment to fetch.
   * @returns {Promise<Object>} The shipment record.
   */
  const getShipment = async (id) => {
    try {
      const contract = await getEthereumContract();
      const shipment = await contract.getShipment(id);
      return shipment;
    } catch (error) {
      console.error("Failed to get shipment", error);
      throw error;
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      fetchAllShipments();
      fetchMyShipments();
    }
  }, [currentAccount]);

  return (
    <TrackingContext.Provider
      value={{
        currentAccount,
        connectWallet,
        createShipment,
        startShipment,
        completeShipment,
        allShipments,
        myShipments,
        fetchAllShipments,
        fetchMyShipments,
        getShipment,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

// Export a hook for easy consumption of the context
export const useTracking = () => useContext(TrackingContext);