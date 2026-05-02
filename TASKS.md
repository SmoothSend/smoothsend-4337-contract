# SmoothSend AVAX ERC-4337 Tasks

This folder is the fresh Avalanche-specific contract workspace. The goal is to deploy a full ERC-4337 sponsorship stack on Avalanche C-Chain while keeping SmoothSend's shared `core/gateway`, `core/sdk`, and `core/dashboard` model.

## Architecture Decision

Use ERC-4337 v0.7 for the Avalanche launch stack.

- EntryPoint v0.7 is deployed at `0x0000000071727De22E5E9d8BAf0edAc6f37da032`.
- We choose v0.7 because Coinbase/Base `VerifyingPaymaster` is MIT, production-used, and explicitly compatible with EntryPoint v0.7.
- Avalanche does not have EIP-7702 yet, so v0.8/v0.9 7702 support is not needed for the grant MVP.
- We do not deploy EntryPoint.
- We deploy the paymaster first; a v0.7 account factory is optional for demo/default accounts.
- We keep the legacy `chains/evm/relayer` separate because it is for ERC-2612/EIP-712 relay flow, not full ERC-4337.

## Product Modes

SmoothSend AVAX should support both modes using the same Coinbase/Base `VerifyingPaymaster`:

- Developer-sponsored gas:
  - Gateway validates API key, credits, sponsorship rules, and network.
  - SmoothSend signs paymaster data.
  - Paymaster pays AVAX gas; user pays nothing.

- User pays in ERC20/USDC:
  - Gateway/bundler estimates AVAX gas cost.
  - SmoothSend quotes ERC20 amount with markup.
  - SmoothSend signs paymaster data containing token, receiver, exchange rate, validity window, and payment flags.
  - Paymaster pays AVAX gas and collects ERC20 from the user.
  - Launch with USDC first; add other ERC20s later after pricing/risk controls are stable.

## Contract Decisions

Use as-is:

- `resources/verifying-paymaster/src/VerifyingPaymaster.sol`
  - MIT
  - Coinbase/Base paymaster, compatible with EntryPoint v0.7
  - Vendored at `contracts/vendor/coinbase/VerifyingPaymaster.sol`

Optional/TBD:

- v0.7-compatible `SimpleAccountFactory`
  - Needed only if SmoothSend wants to deploy default/demo smart accounts.
  - Do not use local v0.8/v0.9 account-abstraction account files for the v0.7 launch stack without a compatibility check.

Do not use for this launch path:

- `resources/paymaster/src/Paymaster.sol`
  - SPDX GPL-3.0 and older UserOperation format

- `resources/paymaster/src/LimitingPaymaster.sol`
  - SPDX GPL-3.0 and older UserOperation format

## Phase 1: Contract Workspace

- [x] Create fresh Hardhat workspace in `chains/avax/contract`.
- [x] Add deployment env template.
- [x] Add initial deployment script that verifies EntryPoint code exists.
- [x] Vendor Coinbase/Base `VerifyingPaymaster.sol`.
- [x] Install dependencies with `npm install`.
- [x] Resolve dependency/remapping strategy for Coinbase paymaster imports.
  - `@account-abstraction` v0.7 contracts
  - OpenZeppelin Contracts
  - Solady
  - Solmate is not required by the vendored Coinbase paymaster.
- [x] Resolve import paths cleanly for Hardhat.
- [x] Implement deployment script for `VerifyingPaymaster`.
- [x] Compile with `npm run build`.
- [ ] Add unit tests for paymaster signature validation and deposit/withdraw permissions.

## Phase 2: Deployment

- [ ] Deploy on Fuji first.
- [x] Verify EntryPoint v0.7 code on Fuji.
- [x] Verify EntryPoint v0.7 code on Avalanche C-Chain mainnet.
- [ ] Deploy `VerifyingPaymaster`.
- [ ] Optionally deploy a v0.7-compatible `SimpleAccountFactory`.
- [ ] Deposit test AVAX into paymaster through EntryPoint.
- [ ] Run a sponsored UserOperation end-to-end on Fuji.
- [ ] Repeat deployment on Avalanche C-Chain mainnet.

## Phase 3: Bundler

Work in a new/fresh AVAX bundler workspace, not the legacy ERC-2612 relayer.

- [ ] Create or reset `chains/avax/bundler`.
- [ ] Implement ERC-4337 JSON-RPC methods:
  - `eth_chainId`
  - `eth_supportedEntryPoints`
  - `eth_estimateUserOperationGas`
  - `eth_sendUserOperation`
  - `eth_getUserOperationByHash`
  - `eth_getUserOperationReceipt`
- [ ] Target Fuji `43113` and Avalanche C-Chain `43114`.
- [ ] Target EntryPoint v0.7 on both networks.
- [ ] Implement SmoothSend paymaster signature generation.
- [ ] Implement developer-sponsored paymaster data mode.
- [ ] Implement ERC20/USDC paymaster data mode with markup.
- [ ] Add gas estimation + ERC20 quote path.
- [ ] Submit `handleOps` to EntryPoint.
- [ ] Add gateway auth middleware equivalent to Aptos relayer.

## Phase 4: Gateway

Work in `core/gateway`.

- [ ] Add AVAX/4337 route selection without breaking legacy EVM relay routes.
- [ ] Forward `X-Gateway-Secret`, `X-Developer-ID`, `X-API-Key`, tier, network, and sponsorship rules.
- [ ] Keep credit checks in gateway, same control-plane model as Aptos.
- [ ] Add ERC20 quote and markup policy for user-pays mode.
- [ ] Add token allowlist, starting with USDC.
- [ ] Add treasury receiver configuration for collected ERC20 fees.
- [ ] Add env vars:
  - `AVAX_BUNDLER_URL`
  - `AVAX_BUNDLER_URLS`

## Phase 5: SDK

Work in `core/sdk`.

- [ ] Add an AVAX/EVM 4337 client.
- [ ] Build UserOperation payloads.
- [ ] Request paymaster sponsorship through gateway/bundler.
- [ ] Support developer-sponsored mode.
- [ ] Support user-pays-USDC/ERC20 mode.
- [ ] Submit UserOperation.
- [ ] Poll receipt.
- [ ] Keep Aptos SDK behavior untouched.

## Phase 6: Dashboard

Work in `core/dashboard`.

- [ ] Reuse project and API key flows.
- [ ] Add AVAX chain config where needed.
- [ ] Surface paymaster/bundler status.
- [ ] Keep billing and usage charts chain-aware.

## Commands

```bash
cd chains/avax/contract
npm install
npm run build
npm run deploy:fuji
npm run deploy:mainnet
```

## Open Questions

- Should the initial `OWNER` be the deployer wallet or a multisig?
- Should `VERIFYING_SIGNER` be the gateway key, bundler key, or a separate isolated sponsorship key?
- What exact USDC token address do we use on Fuji and Avalanche mainnet?
- What markup formula do we launch with for ERC20 user-pays mode?
- Do we need SmoothSend-owned account factory for launch, or will SDK target existing smart accounts first?
