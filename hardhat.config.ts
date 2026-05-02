import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = deployerPrivateKey ? [deployerPrivateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 1_000_000,
      },
      viaIR: true,
    },
  },
  networks: {
    avalancheFuji: {
      url: process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts,
    },
    avalancheMainnet: {
      url: process.env.AVALANCHE_MAINNET_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
    },
  },
};

export default config;
