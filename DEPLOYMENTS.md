# SmoothSend AVAX — Deployed Contracts

Canonical record of on-chain deployments for the ERC-4337 stack.

---

## Avalanche C-Chain Mainnet (43114)

Deployed **June 2026**. All SmoothSend-deployed contracts are **verified on Snowtrace** (source code visible on explorer).

| Contract | Address | Explorer | Verified |
|----------|---------|----------|----------|
| EntryPoint v0.7 (canonical singleton) | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | [snowtrace.io](https://snowtrace.io/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032) | Upstream (not deployed by us) |
| **VerifyingPaymaster** | `0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9` | [snowtrace.io](https://snowtrace.io/address/0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9#code) | Yes |
| **SimpleAccountFactory** | `0x863b8E15D37Abf33d5177108f6a07D541a698D25` | [snowtrace.io](https://snowtrace.io/address/0x863b8E15D37Abf33d5177108f6a07D541a698D25#code) | Yes |

### Roles (mainnet)

| Role | Address |
|------|---------|
| Deployer | `0x7264bE2A52A9cC9401d76378BCC6C0Be6De3A6d9` |
| Verifying signer | `0x28738746aAAFd124F8796d916dc5d9F07D8d7B7b` |
| Owner | `0x98f997E1F7033E06aa2b0e33e9E3CA110a3DB34b` |

### Where each address is wired

| Contract | Bundler `.env` | Gateway `wrangler.toml` |
|----------|----------------|-------------------------|
| VerifyingPaymaster | `PAYMASTER_MAINNET` | `AVAX_MAINNET_PAYMASTER` |
| SimpleAccountFactory | *(not used at runtime)* | `AVAX_MAINNET_SIMPLE_ACCOUNT_FACTORY` |

Factory is served to dApps via gateway `GET /api/v1/public/avax-aa-defaults` — the bundler only needs the paymaster.

```bash
# bundler (per-network keys — mainnet wallet ≠ Fuji wallet)
PAYMASTER_MAINNET=0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9
BUNDLER_PRIVATE_KEY_MAINNET=<private key for 0x2873...>
VERIFYING_SIGNER_PRIVATE_KEY_MAINNET=<same key if bundler+verifier combined>
BUNDLER_PRIVATE_KEY_FUJI=<private key for 0x84c2...>
VERIFYING_SIGNER_PRIVATE_KEY_FUJI=<private key for 0x84c2...>
VERIFYING_SIGNER=0x28738746aAAFd124F8796d916dc5d9F07D8d7B7b

# gateway
AVAX_MAINNET_PAYMASTER=0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9
AVAX_MAINNET_SIMPLE_ACCOUNT_FACTORY=0x863b8E15D37Abf33d5177108f6a07D541a698D25
```

> Paymaster EntryPoint deposit at deploy: **0 AVAX** — fund before sponsored UserOps.

---

## Avalanche Fuji Testnet (43113)

| Contract | Address | Explorer | Verified |
|----------|---------|----------|----------|
| EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | [testnet.snowtrace.io](https://testnet.snowtrace.io/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032) | Upstream |
| VerifyingPaymaster | `0x3207f577792F9d549acB2A6C97c0f74EAeB166d8` | [testnet.snowtrace.io](https://testnet.snowtrace.io/address/0x3207f577792F9d549acB2A6C97c0f74EAeB166d8) | — |
| SimpleAccountFactory | `0x55326f005a0959F75496cdd692505fFB520972f5` | [testnet.snowtrace.io](https://testnet.snowtrace.io/address/0x55326f005a0959F75496cdd692505fFB520972f5) | — |

### Roles (Fuji)

| Role | Address |
|------|---------|
| Verifying signer / Bundler EOA | `0x84c2f35807fC555C4A06cC12Dc0aAf9d948FeE1d` |

```bash
PAYMASTER_FUJI=0x3207f577792F9d549acB2A6C97c0f74EAeB166d8
AVAX_FUJI_SIMPLE_ACCOUNT_FACTORY=0x55326f005a0959F75496cdd692505fFB520972f5
```

---

## Verification

Mainnet contracts were verified via Hardhat + Snowtrace API:

```bash
npx hardhat verify --network avalancheMainnet <PAYMASTER> <ENTRYPOINT> <VERIFYING_SIGNER> <OWNER>
npx hardhat verify --network avalancheMainnet <FACTORY> <ENTRYPOINT>
```

On Snowtrace, open the **Contract** tab → you should see verified Solidity source, not just bytecode.