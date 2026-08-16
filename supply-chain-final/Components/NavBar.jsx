import React from "react";
import { useTracking } from "../Conetxt";

/**
 * Navigation bar component. Displays the dApp name and a wallet connect button.
 */
const NavBar = () => {
  const { currentAccount, connectWallet } = useTracking();

  // Truncates an Ethereum address for display (e.g. 0x1234...5678)
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 bg-gray-800 text-white">
      <h1 className="text-xl font-semibold">ChainX: Supply Chain DApp</h1>
      {currentAccount ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm">Connected:</span>
          <span className="px-3 py-1 bg-green-600 rounded-lg text-sm font-mono">
            {truncateAddress(currentAccount)}
          </span>
        </div>
      ) : (
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
};

export default NavBar;
