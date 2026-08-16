require("@nomicfoundation/hardhat-toolbox");

/**
 * @type {import('hardhat/config').HardhatUserConfig}
 */
const config = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    tests: './testing',
  },
  gasReporter: {
    enabled: true,
  },
  networks: {
    // The built‑in Hardhat network, used when no --network flag is provided
    hardhat: {},
    // Localhost network configuration. This assumes you have a Hardhat node
    // running on http://127.0.0.1:8545 (started with `npx hardhat node`).
    localhost: {
      url: "http://127.0.0.1:8545",
      // Optional: specify accounts if you want to use a custom private key
      // accounts: [process.env.PRIVATE_KEY],
    },
    // Example testnet configuration (uncomment and set your RPC URL and PK to use)
    // goerli: {
    //   url: process.env.GOERLI_RPC_URL || "",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },
};

module.exports = config;
