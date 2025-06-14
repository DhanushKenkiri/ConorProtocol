const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Get the ChronosFactory contract address from command line arguments or .env file
  const factoryAddress = process.argv[2] || process.env.FACTORY_ADDRESS;
  
  if (!factoryAddress) {
    console.error("Please provide the factory address as an argument or set FACTORY_ADDRESS in .env file");
    process.exit(1);
  }

  console.log(`Verifying ChronosFactory at: ${factoryAddress}`);
  
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
      contract: "contracts/ChronosFactory.sol:ChronosFactory"
    });
    console.log("Verification successful!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
