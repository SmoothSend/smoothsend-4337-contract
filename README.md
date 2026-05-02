# SmoothSend AVAX Contracts

Fresh Avalanche C-Chain ERC-4337 contract workspace.

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

```bash
npm run deploy:fuji
npm run deploy:mainnet
```
