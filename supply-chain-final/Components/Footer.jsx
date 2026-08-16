import React from "react";

/**
 * Footer component for the dApp. Displays some copyright and links.
 */
const Footer = () => {
  return (
    <footer className="w-full py-6 mt-8 bg-gray-200 text-center text-sm text-gray-700">
      <p>
        © {new Date().getFullYear()} Supply Chain DApp. Built with love on
        Ethereum. A product of Xchain Int.
      </p>
    </footer>
  );
};

export default Footer;
