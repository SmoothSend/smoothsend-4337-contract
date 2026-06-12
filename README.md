# SmoothSend AVAX Contracts

Fresh Avalanche C-Chain ERC-4337 contract workspace.

This folder owns the on-chain AVAX 4337 deployment state (paymaster + references). Runtime API behavior is implemented by `chains/avax/bundler`.

## Upstream Sources

This repository is intended to stay public and clearly attribute upstream contract sources.

- Coinbase/Base Verifying Paymaster: https://github.com/coinbase/verifying-paymaster
  - Vendored at `contracts/vendor/coinbase/VerifyingPaymaster.sol`.
  - Used as the launch paymaster because it is MIT licensed, production-used by Coinbase/Base, and explicitly compatible with EntryPoint v0.7.
- ERC-4337 account-abstraction contracts: https://github.com/eth-infinitism/account-abstraction
  - Used for EntryPoint references and account/factory compatibility.
  - We reuse the deployed EntryPoint v0.7 singleton; we do not deploy or modify EntryPoint.

Vendored upstream source is copied as-is. Preserve SPDX headers, copyright notices, and upstream source references when making any future changes.

The launch paymaster supports two SmoothSend products:

- **Developer-sponsored gas**: developer pays SmoothSend, SmoothSend pays AVAX gas through the paymaster, user pays no gas.
- **User pays in ERC20/USDC**: SmoothSend pays AVAX gas through the paymaster, the paymaster collects USDC or another supported ERC20 from the user, and SmoothSend prices the ERC20 charge with markup.

The first contract deployment path:

1. Reuse deployed ERC-4337 v0.7 EntryPoint:
   `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
2. Deploy Coinbase/Base `VerifyingPaymaster`.
3. Deploy a v0.7-compatible account factory if we need a SmoothSend-owned demo account factory.
4. Fund the paymaster deposit in EntryPoint.
5. Wire the AVAX bundler to sign and submit UserOperations for both sponsorship modes.

See `TASKS.md` for the full implementation plan and `contracts/CONTRACTS.md` for the contract source decision matrix.

## Setup

```bash
cp .env.example .env
npm install
npm run build
```

Required env vars before deployment:

- `DEPLOYER_PRIVATE_KEY`
- `VERIFYING_SIGNER`
- `OWNER` (optional; defaults to deployer)
- `INITIAL_PAYMASTER_DEPOSIT_AVAX` (optional; defaults to `0`)
- `BUNDLER_ADDRESSES` (optional comma-separated allowlist)

## Deploy

### VerifyingPaymaster

```bash
npm run deploy:fuji
npm run deploy:mainnet
```

### SimpleAccountFactory (eth-infinitism `@account-abstraction/contracts` v0.7 samples)

Vendored unchanged except `SimpleAccount.sol` core imports use `@account-abstraction/core/*` so Hardhat avoids duplicate source paths (`contracts/vendor/eth-infinitism/samples/`).

```bash
npm run deploy:simple-account-factory:fuji
npm run deploy:simple-account-factory:mainnet
```

Uses `DEPLOYER_PRIVATE_KEY`, `ENTRYPOINT_V07` (defaults to canonical v0.7), and pays normal Fuji/mainnet AVAX gas for one transaction (factory constructor deploys `SimpleAccount` impl + factory).

After deploy, set **`AVAX_FUJI_SIMPLE_ACCOUNT_FACTORY`** on the Worker and redeploy gateway so `GET /api/v1/public/avax-aa-defaults` returns the address.

## Deployed Addresses

See **[DEPLOYMENTS.md](./DEPLOYMENTS.md)** for the full deployment record with Snowtrace explorer links and verification status.

### Avalanche Fuji (Testnet)

- EntryPoint v0.7: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- SimpleAccountFactory (samples / `@account-abstraction/contracts` v0.7): `0x55326f005a0959F75496cdd692505fFB520972f5`
- VerifyingPaymaster: `0x3207f577792F9d549acB2A6C97c0f74EAeB166d8`
- Verifying signer used at deploy time: `0x84c2f35807fC555C4A06cC12Dc0aAf9d948FeE1d`
- Bundler EOA (submits `handleOps`): `0x84c2f35807fC555C4A06cC12Dc0aAf9d948FeE1d`

> Note: the bundler is an off-chain service + EOA, not a smart contract.  
> The on-chain contract address is the paymaster (`0x3207...66d8`), while `0x84c2...FeE1d` is the EOA that broadcasts `EntryPoint.handleOps(...)`.

Bundler / gateway references for Fuji:

```bash
AVAX_CHAIN_ID=43113
ENTRYPOINT_V07=0x0000000071727De22E5E9d8BAf0edAc6f37da032
PAYMASTER_ADDRESS=0x3207f577792F9d549acB2A6C97c0f74EAeB166d8
VERIFYING_SIGNER=0x84c2f35807fC555C4A06cC12Dc0aAf9d948FeE1d
# Cloudflare Worker (`wrangler.toml` / dashboard): public AA defaults for SDK frontends
AVAX_FUJI_SIMPLE_ACCOUNT_FACTORY=0x55326f005a0959F75496cdd692505fFB520972f5
```

### Avalanche C-Chain (Mainnet)

- EntryPoint v0.7: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- SimpleAccountFactory: `0x863b8E15D37Abf33d5177108f6a07D541a698D25`
- VerifyingPaymaster: `0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9`
- Verifying signer: `0x28738746aAAFd124F8796d916dc5d9F07D8d7B7b`
- Owner: `0x98f997E1F7033E06aa2b0e33e9E3CA110a3DB34b`
- Deployer: `0x7264bE2A52A9cC9401d76378BCC6C0Be6De3A6d9`

Bundler / gateway references for mainnet:

```bash
AVAX_CHAIN_ID=43114
ENTRYPOINT_V07=0x0000000071727De22E5E9d8BAf0edAc6f37da032
PAYMASTER_ADDRESS=0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9
VERIFYING_SIGNER=0x28738746aAAFd124F8796d916dc5d9F07D8d7B7b
AVAX_MAINNET_SIMPLE_ACCOUNT_FACTORY=0x863b8E15D37Abf33d5177108f6a07D541a698D25
AVAX_MAINNET_PAYMASTER=0x25FF7720cff5E7c479CAd2A8b48F99561F7C8df9
```

`POST …/paymaster/sign` returns **`paymasterAndData`** (paymaster address + encoded **`paymasterData`** + **65-byte ECDSA** from **`VERIFYING_SIGNER`**). Your snippet is a successful **developer-sponsored** quote (`token` and **`receiver`** zero = native sponsor path): **`validUntil` / `validAfter`** bound signature freshness; **`success: true`** means the bundler can attach this blob to the UserOp and submit.

Note: deployment was done with `INITIAL_PAYMASTER_DEPOSIT_AVAX=0`, so fund the paymaster deposit before running sponsored UserOps.

## AVAX Bundler API (for gateway wiring)

Bundler implementation is in `chains/avax/bundler`.

All gateway-facing routes:

- `POST /` — ERC-4337 JSON-RPC
  - `eth_chainId`
  - `eth_supportedEntryPoints`
  - `eth_estimateUserOperationGas`
  - `eth_sendUserOperation`
  - `eth_getUserOperationByHash`
  - `eth_getUserOperationReceipt`
- `POST /api/v1/bundler/paymaster/sign` — sign `paymasterAndData`
- `GET /api/v1/bundler/health` — health + paused status
- `GET /api/v1/bundler/balance` — bundler EOA balance + paymaster EntryPoint deposit
- `GET /api/v1/bundler/safety-check` — run immediate safety check
- `GET /metrics` — Prometheus metrics
- `GET /stats` — service metrics summary
- `GET /ping` — liveness

Security model matches Aptos relayer:

1. Public traffic enters through Cloudflare Worker only.
2. Worker forwards to bundler with `X-Gateway-Secret`.
3. Bundler validates `X-Gateway-Secret` for non-health routes.
4. Infrastructure should also firewall bundler ingress to Cloudflare IP ranges only.
