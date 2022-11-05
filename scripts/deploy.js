
const hre = require("hardhat");

async function main() {

  const IMSA = await hre.ethers.getContractFactory("IMSA");
  const imsa = await IMSA.deploy();

  await imsa.deployed();

  console.log("IMSA deployed to:", imsa.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
