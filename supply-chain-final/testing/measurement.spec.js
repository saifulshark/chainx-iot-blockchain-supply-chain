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

describe('Tracking measurements', function () {
  this.timeout(120000);

  let contract;
  let participants;
  const rows = [];

  before(async function () {
    participants = await ethers.getSigners();
    const factory = await ethers.getContractFactory('Tracking');
    contract = await factory.deploy();
    await contract.deployed();
  });

  after(async function () {
    await fs.mkdir(outputDir, { recursive: true });
    const lines = ['function_name,trial_number,transaction_cost_gas,execution_cost_gas'];
    for (const row of rows) {
      lines.push([row.functionName, row.trialNumber, row.transactionCostGas, row.executionCostGas].join(','));
    }
    await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  });

  it('records shipment lifecycle gas and read-only calls', async function () {
    const eligibleParticipants = participants.slice(1, 8);

    for (let trial = 1; trial <= 10; trial += 1) {
      const sender = eligibleParticipants[trial % eligibleParticipants.length];
      const receiver = eligibleParticipants[(trial + 1) % eligibleParticipants.length];
      const pickup = `Warehouse-${trial % 3}-A`;
      const destination = `Distribution-${trial % 4}-B`;
      const distance = 75 + trial * 11;
      const price = ethers.utils.parseEther((0.01 + trial * 0.001).toFixed(3));
      const shipmentId = trial - 1;

      const createTx = await contract
        .connect(sender)
        .createShipment(receiver.address, pickup, destination, distance, price, { value: price });
      const createReceipt = await createTx.wait();
      const createGasUsed = toBigInt(createReceipt.gasUsed);
      rows.push({
        functionName: 'Tracking.createShipment',
        trialNumber: trial,
        transactionCostGas: createGasUsed.toString(),
        executionCostGas: (createGasUsed - 21000n - calldataGasCost(createTx.data)).toString(),
      });

      await contract.getShipment(shipmentId);
      rows.push({
        functionName: 'Tracking.getShipment',
        trialNumber: trial,
        transactionCostGas: '0',
        executionCostGas: '0',
      });

      const allShipments = await contract.getAllShipments();
      void allShipments;
      rows.push({
        functionName: 'Tracking.getAllShipments',
        trialNumber: trial,
        transactionCostGas: '0',
        executionCostGas: '0',
      });

      const myShipments = await contract.connect(sender).getMyShipments();
      void myShipments;
      rows.push({
        functionName: 'Tracking.getMyShipments',
        trialNumber: trial,
        transactionCostGas: '0',
        executionCostGas: '0',
      });

      const startTx = await contract.connect(sender).startShipment(shipmentId);
      const startReceipt = await startTx.wait();
      const startGasUsed = toBigInt(startReceipt.gasUsed);
      rows.push({
        functionName: 'Tracking.startShipment',
        trialNumber: trial,
        transactionCostGas: startGasUsed.toString(),
        executionCostGas: (startGasUsed - 21000n - calldataGasCost(startTx.data)).toString(),
      });

      const completeTx = await contract.connect(receiver).completeShipment(shipmentId);
      const completeReceipt = await completeTx.wait();
      const completeGasUsed = toBigInt(completeReceipt.gasUsed);
      rows.push({
        functionName: 'Tracking.completeShipment',
        trialNumber: trial,
        transactionCostGas: completeGasUsed.toString(),
        executionCostGas: (completeGasUsed - 21000n - calldataGasCost(completeTx.data)).toString(),
      });
    }
  });
});