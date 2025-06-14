const { ethers } = require("hardhat");
const { deployHelpers } = require("./utils/deployHelpers");

async function main() {
  const { deployer } = await deployHelpers();

  // Deploy ChronosFactory
  console.log("Deploying ChronosFactory...");
  const ChronosFactory = await ethers.getContractFactory("ChronosFactory");
  const factory = await ChronosFactory.deploy();
  await factory.deployed();
  
  console.log(`ChronosFactory deployed to: ${factory.address}`);

  // For verification purposes
  console.log("Contract deployment completed. You can verify on etherscan with:");
  console.log(`npx hardhat verify --network baseSepolia ${factory.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
