const hre = require('hardhat');

async function main() {
  // Compile if necessary
  await hre.run('compile');
  const ProductHash = await hre.ethers.getContractFactory('ProductHash');
  const productHash = await ProductHash.deploy();
  await productHash.waitForDeployment();
  console.log('ProductHash deployed to:', await productHash.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});