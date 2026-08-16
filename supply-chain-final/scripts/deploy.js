const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy the Tracking contract
  const Tracking = await hre.ethers.getContractFactory("Tracking");
  const tracking = await Tracking.deploy();
  await tracking.deployed();

  console.log(`Tracking deployed to: ${tracking.address}`);

  // Persist the contract address and ABI to the frontend so it can talk to the contract
  const artifactsPath = path.join(__dirname, "../artifacts/contracts/Tracking.sol/Tracking.json");
  const contractJSON = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));

  const frontendDir = path.join(__dirname, "../Conetxt");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir);
  }

  const config = {
    address: tracking.address,
    abi: contractJSON.abi,
  };
  fs.writeFileSync(
    path.join(frontendDir, "config.json"),
    JSON.stringify(config, null, 2),
    "utf8"
  );
  console.log("Contract address and ABI saved to Conetxt/config.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});