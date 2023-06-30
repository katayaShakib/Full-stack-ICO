const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const cryptoDevsNFTContract = "0x96B091A0c0235846Daac59301bC16A6f7e43C9bf";

  // Deploy the cryptoDevsToken Contract
  const cryptoDevsTokenContract = await hre.ethers.deployContract(
    "CryptoDevToken",
    [cryptoDevsNFTContract]
  );

  // wait for the contract to deploy
  await cryptoDevsTokenContract.waitForDeployment();

  // print the address of the deployed contract
  console.log(
    "Crypto Devs Token Contract Address:",
    cryptoDevsTokenContract.target
  );

  // Sleep for 30 seconds while Etherscan indexes the new contract deployment
  await sleep(30 * 1000); // 30s = 30 * 1000 milliseconds

  // Verify the contract on etherscan
  await hre.run("verify:verify", {
    address: cryptoDevsTokenContract.target,
    constructorArguments: ["0x96B091A0c0235846Daac59301bC16A6f7e43C9bf"],
  });
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
