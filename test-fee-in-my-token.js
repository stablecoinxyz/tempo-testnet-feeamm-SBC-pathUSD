import { parseUnits } from 'viem'
import { client, account } from './viem.config.js'

const MY_TOKEN = '0x20c000000000000000000000ccbf1e4901196743' // SBC (testnet)
const PATH_USD = '0x20c0000000000000000000000000000000000000' // pathUSD (testnet)

async function main() {
  const result = await client.token.transferSync({
    token: PATH_USD,
    to: account.address,           // self-transfer is fine
    amount: parseUnits('0.01', 6), // small amount
    feeToken: MY_TOKEN,            // pay gas in SBC
  })

  // IMPORTANT: transferSync returns the tx hash directly (string)
  console.log('Success. Tx hash:', result.receipt.transactionHash)
}
main().catch(console.error)
