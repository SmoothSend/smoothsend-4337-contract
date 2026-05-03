# Contract Set

SmoothSend AVAX launch uses ERC-4337 v0.7. We reuse the deployed EntryPoint singleton and deploy the Coinbase/Base VerifyingPaymaster first.

Vendored upstream contract source is copied as-is. Preserve SPDX headers, copyright notices, and upstream source references.

## Upstream Repositories

- ERC-4337 account-abstraction: https://github.com/eth-infinitism/account-abstraction
- Coinbase Verifying Paymaster: https://github.com/coinbase/verifying-paymaster
- Base Paymaster mirror/lineage: https://github.com/base-org/paymaster

## Reused Singleton

- `EntryPoint v0.7`
  - Address: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
  - Status: verified deployed on Fuji (`43113`) and Avalanche C-Chain mainnet (`43114`)
  - Source: upstream `eth-infinitism/account-abstraction` v0.7
  - License: GPL-3.0, but we do not redeploy or modify it.

## Deploy From This Project

- `VerifyingPaymaster`
  - Source: `contracts/vendor/coinbase/VerifyingPaymaster.sol`
  - Upstream local source: `resources/verifying-paymaster/src/VerifyingPaymaster.sol`
  - License: MIT
  - Purpose: verifies SmoothSend's off-chain paymaster signature, then pays gas via EntryPoint deposit.
  - Compatibility: explicitly EntryPoint v0.7.

## Supported Paymaster Modes

The vendored Coinbase/Base paymaster supports both SmoothSend launch modes.

- Developer-sponsored gas:
  - SmoothSend signs paymaster approval after gateway checks API key, credits, rules, and network.
  - Paymaster pays AVAX gas from its EntryPoint deposit.
  - User pays no AVAX and no ERC20.

- User pays in ERC20/USDC:
  - SmoothSend quotes an ERC20 amount for the estimated AVAX gas plus markup.
  - Paymaster data includes token, receiver, exchange rate, precheck/prepayment flags, and expiry.
  - Paymaster pays AVAX gas from its EntryPoint deposit and collects the configured ERC20 from the user.
  - Launch target should be USDC first, then more tokens after pricing/risk controls are stable.

Optional later:

- `SimpleAccountFactory` (+ sample `SimpleAccount`)
  - Needed for counterfactual SCW deploy via UserOp (`factory` / `factoryData`).
  - Vendored from **`@account-abstraction/contracts@0.7.0`** samples at `contracts/vendor/eth-infinitism/samples/` (same logic; import paths adjusted for Hardhat remappings).
  - Deploy: `npm run deploy:simple-account-factory:fuji` (see repo `README.md`).

## Do Not Use For This v0.7 Launch Path

- `resources/account-abstraction/contracts/accounts/SimpleAccount.sol`
  - This local checkout is v0.8/v0.9-era. Do not use it with v0.7 EntryPoint without checking compatibility.

- `resources/paymaster/src/Paymaster.sol`
  - SPDX is GPL-3.0 and uses older UserOperation format.

- `resources/paymaster/src/LimitingPaymaster.sol`
  - Same issue as above.

## Vendored Files

- `contracts/vendor/coinbase/VerifyingPaymaster.sol`
- `contracts/vendor/coinbase/LICENSE.md`
- `contracts/vendor/coinbase/README.md`

## Next Source Step

Resolve dependencies/remappings for Coinbase `VerifyingPaymaster.sol`:

- `@account-abstraction` v0.7 contracts
- OpenZeppelin Contracts
- Solady
- Solmate

Keep the vendored paymaster unchanged. If dependency import paths need project-level remappings, prefer config/remapping changes over editing upstream source.
