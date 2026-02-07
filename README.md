# Pay Gas in Your Own Stablecoin on Tempo

This repo shows how to use Tempo's Fee AMM to pay transaction fees in your own stablecoin instead of the native token. It walks through seeding an AMM liquidity pool, verifying pool reserves, and executing a transaction that pays gas in your custom token — all on the Tempo Moderato testnet.

## How It Works

Tempo lets any TIP-20 token be used to pay gas fees through its **Fee AMM** system. The Fee AMM is an on-chain liquidity pool that pairs your token with **pathUSD** (Tempo's canonical fee token). When a user submits a transaction with a custom `feeToken`, the protocol swaps that token for pathUSD through the AMM pool to cover the gas cost.

For this to work, someone needs to seed the AMM pool with initial liquidity — that's what these scripts do.

## Prerequisites

- Node.js (v18+)
- A Tempo Moderato testnet account with a private key
- A deployed TIP-20 stablecoin on Moderato (this example uses "SBC")
- Some pathUSD in your account (available from the testnet faucet)

## Setup

Clone the repo and install dependencies:

```bash
git clone <this-repo>
cd tempo-testnet-feeamm-SBC-pathUSD
npm install
```

Copy `.env` and add your private key:

```bash
cp .env.example .env
```

Then edit `.env` with your actual key:

```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

Then update the token address constants in the scripts to match your own stablecoin. In each script, replace the `USER_TOKEN` / `userToken` / `MY_TOKEN` address with your token's address:

```js
// replace this with your stablecoin's address
const USER_TOKEN = '0x20c000000000000000000000ccbf1e4901196743'
```

## Key Addresses

| Token | Address | Decimals |
|-------|---------|----------|
| pathUSD | `0x20c0000000000000000000000000000000000000` | 6 |
| SBC (example) | `0x20c000000000000000000000ccbf1e4901196743` | 6 |

## Step 1: Seed the Fee AMM Pool

Mint initial liquidity into the AMM pool that pairs your stablecoin with pathUSD. This script deposits 100 pathUSD (and the corresponding amount of your token) into the pool:

```bash
node mint-feeamm.js
```

Expected output:

```
Liquidity minted: <LP token amount>
Tx hash: 0x...
```

This creates the pool if it doesn't exist yet, or adds liquidity to an existing one. The pool needs liquidity for the protocol to be able to swap your token into pathUSD when it's used as a fee token.

## Step 2: Check the Pool Reserves

Verify that the pool has been funded and see the current reserve balances:

```bash
node check-feeamm-pool.js
```

Expected output:

```
Fee AMM pool reserves (raw):
  reserveUserToken     : 0
  reserveValidatorToken: 100000000

Fee AMM pool reserves (formatted, 6 decimals):
  user token     : 0.0
  validator token: 100.0
```

## Step 3: Test a Transaction Paying Gas in Your Token

Now that the pool has liquidity, you can submit transactions that pay gas in your stablecoin. This script does a small self-transfer of pathUSD while paying the gas fee in SBC:

```bash
node test-fee-in-my-token.js
```

Expected output:

```
Success. Tx hash: 0x...
```

The key part is the `feeToken` parameter — it tells the protocol to deduct gas from your token balance instead of pathUSD:

```js
await client.token.transferSync({
  token: PATH_USD,
  to: account.address,
  amount: parseUnits('0.01', 6),
  feeToken: MY_TOKEN,  // pay gas in your stablecoin
})
```

## Step 4: Query Current Pool Reserves

After transactions have flowed through the pool, check the updated reserves to see how the AMM balances have shifted:

```bash
node check-feeamm-pool.js
```

Example output (your numbers will vary):

```
Fee AMM pool reserves (raw):
  reserveUserToken     : 16012
  reserveValidatorToken: 99984045

Fee AMM pool reserves (formatted, 6 decimals):
  user token     : 0.016012
  validator token: 99.984045
```

The user token reserve is no longer zero — the protocol swapped SBC into the pool to cover gas fees from the Step 3 transaction.

## Project Structure

```
viem.config.js           — Shared client setup (account, chain, RPC)
mint-feeamm.js           — Seed the Fee AMM pool with liquidity
check-feeamm-pool.js     — Query current pool reserves
test-fee-in-my-token.js  — Transfer tokens paying gas in your stablecoin
```

## Viem Tempo API Reference

The client is extended with `tempoActions()` which exposes these namespaces:

- **`client.amm`** — `getPool`, `mintSync`, `burnSync`, `rebalanceSwap`
- **`client.token`** — `transferSync`, `balanceOf`, `approve`
- **`client.dex`** — Swap and liquidity operations
- **`client.faucet`** — Testnet faucet

Methods ending in `Sync` wait for the transaction to be included in a block and return `{ receipt, ... }`. Non-sync variants return the transaction hash immediately.

## Chain Configuration

The chain is configured with a default fee token so you don't have to specify `feeToken` on every transaction:

```js
export const chain = tempoModerato.extend({
  feeToken: '0x20c0000000000000000000000000000000000000', // pathUSD
})
```

Individual transactions can override this by passing their own `feeToken` parameter, which is exactly what `test-fee-in-my-token.js` demonstrates.
