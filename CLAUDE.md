# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tempo testnet scripts for interacting with Fee AMM pools using Viem's Tempo extension. The project demonstrates minting liquidity, querying pool reserves, and paying transaction fees in custom tokens (SBC stablecoin) instead of the native token.

- **Chain**: Tempo Moderato testnet (`tempoModerato`)
- **RPC**: `https://rpc.moderato.tempo.xyz`
- **ES Modules**: All files use `import`/`export` syntax (`"type": "module"` in package.json)

## Running Scripts

```bash
npm install              # install dependencies (viem, dotenv)
node check-feeamm-pool.js   # query pool reserves
node mint-feeamm.js          # mint 100 pathUSD liquidity into AMM
node test-fee-in-my-token.js # transfer pathUSD paying gas in SBC token
```

No build step, no test runner. Scripts are run directly with Node.js.

## Key Addresses

| Name | Address |
|------|---------|
| pathUSD (fee token default) | `0x20c0000000000000000000000000000000000000` |
| SBC (user stablecoin) | `0x20c000000000000000000000ccbf1e4901196743` |

Both tokens use 6 decimals. Use `parseUnits(value, 6)` and `formatUnits(value, 6)`.

## Architecture

**`viem.config.js`** — Shared client setup. Exports `account`, `chain`, and `client`. The chain is extended with a default `feeToken` (pathUSD). The client is extended with `tempoActions()` which adds namespaced methods:

- `client.amm.*` — Pool operations: `getPool`, `mintSync`, `burnSync`, `rebalanceSwap`
- `client.token.*` — Token operations: `transferSync`, `balanceOf`, `approve`
- `client.dex.*` — DEX swap/liquidity operations
- `client.faucet.*` — Testnet faucet

**Sync vs Async pattern**: Methods ending in `Sync` (e.g., `mintSync`, `transferSync`) wait for the transaction receipt and return `{ receipt, ... }`. Non-sync variants return the transaction hash immediately.

**Fee token override**: The chain config sets a default fee token, but individual transactions can override it via the `feeToken` parameter (see `test-fee-in-my-token.js` for an example of paying gas in SBC).

## Private Key Setup

The private key is loaded from a `.env` file via dotenv. Copy `.env.example` to `.env` and set `PRIVATE_KEY` to your hex key (with `0x` prefix). The `.env` file is gitignored.
