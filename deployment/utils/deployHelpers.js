const { ethers } = require("hardhat");

async function deployHelpers() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  return { deployer };
}

module.exports = {
  deployHelpers
};
