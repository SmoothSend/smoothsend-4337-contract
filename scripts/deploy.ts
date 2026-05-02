import { ethers, network } from "hardhat";

const ENTRYPOINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

function requireAddress(name: string, value: string | undefined): string {
  if (!value || !ethers.isAddress(value)) {
    throw new Error(`${name} must be a valid EVM address`);
  }
  return value;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const entryPoint = process.env.ENTRYPOINT_V07 || ENTRYPOINT_V07;
  const verifyingSigner = requireAddress("VERIFYING_SIGNER", process.env.VERIFYING_SIGNER);
  const owner = process.env.OWNER || deployer.address;
  const initialDepositAvax = process.env.INITIAL_PAYMASTER_DEPOSIT_AVAX || "0";
  const bundlerAddresses = (process.env.BUNDLER_ADDRESSES || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  console.log("SmoothSend AVAX ERC-4337 deployment");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("EntryPoint v0.7:", entryPoint);
  console.log("Owner:", owner);
  console.log("Verifying signer:", verifyingSigner);
  console.log("Initial paymaster deposit:", `${initialDepositAvax} AVAX`);

  if (!ethers.isAddress(entryPoint)) {
    throw new Error(`ENTRYPOINT_V07 must be a valid EVM address: ${entryPoint}`);
  }
  if (!ethers.isAddress(owner)) {
    throw new Error(`OWNER must be a valid EVM address: ${owner}`);
  }

  const code = await ethers.provider.getCode(entryPoint);
  if (code === "0x") {
    throw new Error(`EntryPoint not deployed at ${entryPoint} on ${network.name}`);
  }

  const VerifyingPaymaster = await ethers.getContractFactory("VerifyingPaymaster");
  const paymaster = await VerifyingPaymaster.deploy(entryPoint, verifyingSigner, owner);
  await paymaster.waitForDeployment();

  const paymasterAddress = await paymaster.getAddress();
  console.log("VerifyingPaymaster deployed:", paymasterAddress);

  if (bundlerAddresses.length > 0) {
    for (const bundler of bundlerAddresses) {
      if (!ethers.isAddress(bundler)) {
        throw new Error(`Invalid bundler address in BUNDLER_ADDRESSES: ${bundler}`);
      }
    }

    const allowlistTx = await paymaster.updateBundlerAllowlist(bundlerAddresses, true);
    await allowlistTx.wait();
    console.log("Bundler allowlist updated:", bundlerAddresses.join(", "));
  }

  const initialDeposit = ethers.parseEther(initialDepositAvax);
  if (initialDeposit > 0n) {
    const depositTx = await paymaster.deposit({ value: initialDeposit });
    await depositTx.wait();
    console.log("Paymaster EntryPoint deposit funded:", `${initialDepositAvax} AVAX`);
  }

  console.log("Deployment complete");
  console.log("Set this in AVAX bundler/gateway config:");
  console.log(`PAYMASTER_ADDRESS=${paymasterAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
