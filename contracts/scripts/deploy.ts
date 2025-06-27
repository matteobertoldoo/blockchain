import { ethers } from "hardhat";

async function main() {
  // Deploy BetzToken
  const BetzToken = await ethers.getContractFactory("BetzToken");
  const betzToken = await BetzToken.deploy();
  await betzToken.waitForDeployment();
  console.log("BetzToken deployed to:", await betzToken.getAddress());

  // Deploy BetZilla
  const BetZilla = await ethers.getContractFactory("BetZilla");
  const betZilla = await BetZilla.deploy();
  await betZilla.waitForDeployment();
  console.log("BetZilla deployed to:", await betZilla.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 