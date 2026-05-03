import { ethers, network } from "hardhat";

const ENTRYPOINT_V07_DEFAULT =
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

async function main() {
  const entryPoint =
    process.env.ENTRYPOINT_V07?.trim() || ENTRYPOINT_V07_DEFAULT;

  const [deployer] = await ethers.getSigners();

  console.log("SimpleAccountFactory (eth-infinitism @account-abstraction 0.7.x)");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("EntryPoint:", entryPoint);

  if (!ethers.isAddress(entryPoint)) {
    throw new Error(`Invalid ENTRYPOINT_V07: ${entryPoint}`);
  }

  const epCode = await ethers.provider.getCode(entryPoint);
  if (epCode === "0x") {
    throw new Error(`EntryPoint has no code at ${entryPoint} on ${network.name}`);
  }

  const Factory = await ethers.getContractFactory("SimpleAccountFactory");
  const factory = await Factory.deploy(entryPoint);
  await factory.waitForDeployment();

  const factoryAddr = await factory.getAddress();
  const chainId = BigInt((await ethers.provider.getNetwork()).chainId);

  console.log("SimpleAccountFactory deployed:", factoryAddr);
  console.log("");
  console.log("Set on gateway Worker (public AA defaults use Fuji var today):");
  if (chainId === 43113n) {
    console.log(`AVAX_FUJI_SIMPLE_ACCOUNT_FACTORY=${factoryAddr}`);
  } else if (chainId === 43114n) {
    console.log(`AVAX_MAINNET_SIMPLE_ACCOUNT_FACTORY=${factoryAddr} (wire index.ts if not yet)`);
  } else {
    console.log(`AVAX_*_SIMPLE_ACCOUNT_FACTORY=${factoryAddr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
