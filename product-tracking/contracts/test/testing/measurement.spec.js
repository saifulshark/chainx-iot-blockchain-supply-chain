const fs = require('fs/promises');
const path = require('path');
const { ethers } = require('hardhat');

const outputDir = path.join(__dirname, 'data');
const outputPath = path.join(outputDir, 'gas_report_raw.csv');

function calldataGasCost(data) {
  const hex = data.startsWith('0x') ? data.slice(2) : data;
  let zeroBytes = 0n;
  let nonZeroBytes = 0n;

  for (let index = 0; index < hex.length; index += 2) {
    if (hex.slice(index, index + 2) === '00') {
      zeroBytes += 1n;
    } else {
      nonZeroBytes += 1n;
    }
  }

  return zeroBytes * 4n + nonZeroBytes * 16n;
}

function toBigInt(value) {
  return BigInt(value.toString());
}

describe('ProductHash measurements', function () {
  this.timeout(120000);

  let contract;
  let owner;
  const rows = [];

  before(async function () {
    [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('ProductHash');
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  after(async function () {
    await fs.mkdir(outputDir, { recursive: true });
    const lines = ['function_name,trial_number,transaction_cost_gas,execution_cost_gas'];
    for (const row of rows) {
      lines.push([row.functionName, row.trialNumber, row.transactionCostGas, row.executionCostGas].join(','));
    }
    await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  });

  it('records storeHash and getHash trials', async function () {
    for (let trial = 1; trial <= 10; trial += 1) {
      const productId = 5000 + trial;
      const hash = ethers.keccak256(
        ethers.toUtf8Bytes(`product-${trial}-${'0'.repeat(trial % 4)}-${owner.address}`)
      );

      const tx = await contract.storeHash(productId, hash);
      const receipt = await tx.wait();
      const gasUsed = toBigInt(receipt.gasUsed);
      const gasData = calldataGasCost(tx.data);

      rows.push({
        functionName: 'ProductHash.storeHash',
        trialNumber: trial,
        transactionCostGas: gasUsed.toString(),
        executionCostGas: (gasUsed - 21000n - gasData).toString(),
      });

      await contract.getHash(productId);
      rows.push({
        functionName: 'ProductHash.getHash',
        trialNumber: trial,
        transactionCostGas: '0',
        executionCostGas: '0',
      });
    }
  });
});